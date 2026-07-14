import { sequelize, Cart, CartItem, Product, ProductVariant, Vendor, Address, Coupon, Order, OrderVendorGroup, OrderItem, Payment } from '../models';
import { ApiError } from '../utils/ApiError';
import { generateOrderNumber } from '../utils/orderNumber';
import { initiatePayment } from './payments';

interface CheckoutInput {
  userId: number;
  shipping_address_id: number;
  payment_method: 'tap' | 'deema' | 'taly' | 'cod';
  coupon_code?: string;
}

export async function checkout(input: CheckoutInput) {
  const { userId, shipping_address_id, payment_method, coupon_code } = input;

  const address = await Address.findOne({ where: { id: shipping_address_id, user_id: userId } });
  if (!address) throw ApiError.badRequest('Shipping address not found');

  const cart = await Cart.findOne({ where: { user_id: userId } });
  if (!cart) throw ApiError.badRequest('Your cart is empty');

  const items = await CartItem.findAll({
    where: { cart_id: cart.id },
    include: [{ model: Product, as: 'product' }, { model: ProductVariant, as: 'variant' }]
  });
  if (!items.length) throw ApiError.badRequest('Your cart is empty');

  // Validate stock & group by vendor
  const vendorCache = new Map<number, InstanceType<typeof Vendor>>();
  const groups = new Map<number, { vendor: InstanceType<typeof Vendor>; items: typeof items; subtotal: number }>();

  for (const item of items) {
    const product = (item as any).product as InstanceType<typeof Product>;
    if (!product || product.status !== 'active') {
      throw ApiError.badRequest(`Product in your cart is no longer available`);
    }
    const availableStock = (item as any).variant?.stock_quantity ?? product.stock_quantity;
    if (availableStock < item.quantity) {
      throw ApiError.badRequest(`Insufficient stock for "${product.name}"`);
    }

    if (!vendorCache.has(product.vendor_id)) {
      const vendor = await Vendor.findByPk(product.vendor_id);
      if (!vendor) throw ApiError.badRequest('Vendor not found for a product in your cart');
      vendorCache.set(product.vendor_id, vendor);
    }
    const vendor = vendorCache.get(product.vendor_id)!;

    if (!groups.has(vendor.id)) {
      groups.set(vendor.id, { vendor, items: [], subtotal: 0 });
    }
    const group = groups.get(vendor.id)!;
    (group.items as any[]).push(item);
    group.subtotal += Number(item.price_snapshot) * item.quantity;
  }

  const subtotal = Array.from(groups.values()).reduce((sum, g) => sum + g.subtotal, 0);

  // Coupon
  let discount_total = 0;
  let coupon: InstanceType<typeof Coupon> | null = null;
  if (coupon_code) {
    coupon = await Coupon.findOne({ where: { code: coupon_code, is_active: true } });
    if (!coupon) throw ApiError.badRequest('Invalid coupon code');
    const now = new Date();
    if (coupon.starts_at && coupon.starts_at > now) throw ApiError.badRequest('Coupon is not active yet');
    if (coupon.expires_at && coupon.expires_at < now) throw ApiError.badRequest('Coupon has expired');
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) throw ApiError.badRequest('Coupon usage limit reached');
    if (subtotal < Number(coupon.min_order_amount)) {
      throw ApiError.badRequest(`Minimum order amount for this coupon is ${coupon.min_order_amount}`);
    }
    discount_total = coupon.type === 'percent' ? (Number(coupon.value) / 100) * subtotal : Number(coupon.value);
    discount_total = Math.min(discount_total, subtotal);
  }

  const shipping_total = 0; // shipping calculation is store/zone specific — wire up in a follow-up
  const tax_total = 0; // tax calculation depends on jurisdiction — wire up in a follow-up
  const grand_total = subtotal - discount_total + shipping_total + tax_total;

  const result = await sequelize.transaction(async (t) => {
    const order = await Order.create(
      {
        order_number: generateOrderNumber(),
        user_id: userId,
        shipping_address_id,
        coupon_id: coupon?.id ?? null,
        subtotal,
        shipping_total,
        discount_total,
        tax_total,
        grand_total,
        currency: 'SAR',
        status: 'pending',
        payment_status: 'unpaid',
        payment_method
      },
      { transaction: t }
    );

    for (const [, group] of groups) {
      const discountShare = subtotal > 0 ? (group.subtotal / subtotal) * discount_total : 0;
      const commission_rate = Number(group.vendor.commission_rate);
      const commission_amount = (group.subtotal * commission_rate) / 100;

      const vendorGroup = await OrderVendorGroup.create(
        {
          order_id: order.id,
          vendor_id: group.vendor.id,
          status: 'pending',
          subtotal: group.subtotal,
          commission_rate,
          commission_amount,
          payout_amount: group.subtotal - commission_amount - discountShare
        },
        { transaction: t }
      );

      for (const item of group.items as any[]) {
        await OrderItem.create(
          {
            order_id: order.id,
            order_vendor_group_id: vendorGroup.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            vendor_id: group.vendor.id,
            product_name_snapshot: item.product.name,
            sku_snapshot: item.variant?.sku ?? item.product.sku,
            price: item.price_snapshot,
            quantity: item.quantity,
            total: Number(item.price_snapshot) * item.quantity
          },
          { transaction: t }
        );

        // decrement stock
        if (item.variant_id) {
          await ProductVariant.decrement('stock_quantity', { by: item.quantity, where: { id: item.variant_id }, transaction: t });
        } else {
          await Product.decrement('stock_quantity', { by: item.quantity, where: { id: item.product_id }, transaction: t });
        }
      }
    }

    if (coupon) {
      await coupon.increment('used_count', { by: 1, transaction: t });
    }

    await CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });

    return order;
  });

  // Initiate payment (stubbed adapters — see /docs/PAYMENTS.md)
  const payment = await initiatePayment({
    gateway: payment_method,
    order: result,
    customerEmail: undefined
  });

  return { order: result, payment };
}

export async function getFullOrder(orderId: number, userId?: number, role?: string) {
  const where: any = { id: orderId };
  if (role === 'customer') where.user_id = userId;

  const order = await Order.findOne({
    where,
    include: [
      {
        model: OrderVendorGroup,
        as: 'vendorGroups',
        include: [{ model: OrderItem, as: 'items' }, { model: Vendor, as: 'vendor', attributes: ['id', 'store_name', 'store_slug'] }]
      },
      { model: Payment, as: 'payments' },
      { model: Address, as: 'shippingAddress' }
    ]
  });

  if (!order) throw ApiError.notFound('Order not found');

  if (role === 'vendor') {
    const vendor = await Vendor.findOne({ where: { user_id: userId } });
    const belongsToVendor = (order.get('vendorGroups') as any[]).some((g) => g.vendor_id === vendor?.id);
    if (!belongsToVendor) throw ApiError.notFound('Order not found');
  }

  return order;
}
