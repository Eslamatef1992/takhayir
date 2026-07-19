import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { getPagination, buildMeta } from '../utils/pagination';
import { checkout, guestCheckout, getFullOrder } from '../services/orderService';
import { Order, OrderVendorGroup, OrderItem, Vendor, User } from '../models';

export const checkoutOrder = catchAsync(async (req: Request, res: Response) => {
  const { shipping_address_id, payment_method, coupon_code } = req.body;
  const result = await checkout({ userId: req.user!.id, shipping_address_id, payment_method, coupon_code });
  res.status(201).json({ success: true, data: result });
});

export const guestCheckoutOrder = catchAsync(async (req: Request, res: Response) => {
  const { items, guest, shipping, payment_method, coupon_code } = req.body;
  const result = await guestCheckout({ items, guest, shipping, payment_method, coupon_code });
  res.status(201).json({ success: true, data: result });
});

export const listMyOrders = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, offset } = getPagination(req);
  const { rows, count } = await Order.findAndCountAll({
    where: { user_id: req.user!.id },
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [{ model: OrderVendorGroup, as: 'vendorGroups', include: [{ model: OrderItem, as: 'items' }] }]
  });
  res.json({ success: true, data: rows, meta: buildMeta(count, page, limit) });
});

export const getMyOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await getFullOrder(Number(req.params.id), req.user!.id, 'customer');
  res.json({ success: true, data: order });
});

export const listVendorOrders = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findOne({ where: { user_id: req.user!.id } });
  if (!vendor) throw ApiError.notFound('Vendor profile not found');

  const { page, limit, offset } = getPagination(req);
  const status = req.query.status as string | undefined;
  const where: any = { vendor_id: vendor.id };
  if (status) where.status = status;

  const { rows, count } = await OrderVendorGroup.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [{ model: OrderItem, as: 'items' }, { model: Order, as: 'order' }]
  });

  res.json({ success: true, data: rows, meta: buildMeta(count, page, limit) });
});

export const updateVendorOrderGroupStatus = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findOne({ where: { user_id: req.user!.id } });
  if (!vendor) throw ApiError.notFound('Vendor profile not found');

  const group = await OrderVendorGroup.findOne({ where: { id: req.params.groupId, vendor_id: vendor.id } });
  if (!group) throw ApiError.notFound('Order not found');

  const { status, tracking_number } = req.body;
  group.status = status;
  if (tracking_number !== undefined) group.tracking_number = tracking_number;
  if (status === 'shipped') group.shipped_at = new Date();
  if (status === 'delivered') group.delivered_at = new Date();
  await group.save();

  res.json({ success: true, data: group });
});

export const adminListOrders = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, offset } = getPagination(req);
  const { status, payment_status, vendor_id, date_from, date_to, q } = req.query as Record<string, string>;

  const where: any = {};
  if (status) where.status = status;
  if (payment_status) where.payment_status = payment_status;
  if (date_from || date_to) {
    where.created_at = {};
    if (date_from) where.created_at[Op.gte] = new Date(`${date_from}T00:00:00`);
    if (date_to) where.created_at[Op.lte] = new Date(`${date_to}T23:59:59`);
  }

  // Resolve the vendor filter to a plain list of order ids first, rather than
  // a required hasMany include + limit (that combination can truncate an
  // order's nested items when the page boundary falls mid-join).
  if (vendor_id) {
    const groups = await OrderVendorGroup.findAll({ where: { vendor_id: Number(vendor_id) }, attributes: ['order_id'] });
    const orderIds = groups.map((g) => g.order_id);
    where.id = { [Op.in]: orderIds.length ? orderIds : [-1] };
  }

  if (q) {
    const matchingUsers = await User.findAll({
      where: {
        [Op.or]: [
          { first_name: { [Op.like]: `%${q}%` } },
          { last_name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } }
        ]
      },
      attributes: ['id']
    });
    const userIds = matchingUsers.map((u) => u.id);

    where[Op.or] = [
      { order_number: { [Op.like]: `%${q}%` } },
      { guest_name: { [Op.like]: `%${q}%` } },
      { guest_email: { [Op.like]: `%${q}%` } },
      { shipping_full_name: { [Op.like]: `%${q}%` } },
      ...(userIds.length ? [{ user_id: { [Op.in]: userIds } }] : [])
    ];
  }

  const { rows, count } = await Order.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    distinct: true,
    include: [
      {
        model: OrderVendorGroup,
        as: 'vendorGroups',
        include: [
          { model: OrderItem, as: 'items' },
          { model: Vendor, as: 'vendor', attributes: ['id', 'store_name', 'store_slug'] }
        ]
      },
      { model: User, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] }
    ]
  });

  res.json({ success: true, data: rows, meta: buildMeta(count, page, limit) });
});

export const adminGetOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await getFullOrder(Number(req.params.id));
  res.json({ success: true, data: order });
});

export const adminUpdateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  const { status, payment_status } = req.body;
  if (status !== undefined) order.status = status;
  if (payment_status !== undefined) order.payment_status = payment_status;
  await order.save();

  const updated = await getFullOrder(order.id);
  res.json({ success: true, data: updated });
});
