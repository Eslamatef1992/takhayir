import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { Cart, CartItem, Product, ProductVariant } from '../models';

async function getOrCreateCart(userId: number) {
  const [cart] = await Cart.findOrCreate({ where: { user_id: userId }, defaults: { user_id: userId } });
  return cart;
}

export const getMyCart = catchAsync(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  const items = await CartItem.findAll({
    where: { cart_id: cart.id },
    include: [{ model: Product, as: 'product' }, { model: ProductVariant, as: 'variant' }]
  });
  res.json({ success: true, data: { cart_id: cart.id, items } });
});

export const addToCart = catchAsync(async (req: Request, res: Response) => {
  const { product_id, variant_id, quantity } = req.body;
  const product = await Product.findByPk(product_id);
  if (!product || product.status !== 'active') throw ApiError.notFound('Product not available');

  let price = Number(product.price);
  if (variant_id) {
    const variant = await ProductVariant.findOne({ where: { id: variant_id, product_id } });
    if (!variant) throw ApiError.notFound('Variant not found');
    if (variant.price !== null) price = Number(variant.price);
  }

  const cart = await getOrCreateCart(req.user!.id);
  const existing = await CartItem.findOne({ where: { cart_id: cart.id, product_id, variant_id: variant_id ?? null } });

  if (existing) {
    existing.quantity += quantity ?? 1;
    await existing.save();
    return res.status(200).json({ success: true, data: existing });
  }

  const item = await CartItem.create({
    cart_id: cart.id,
    product_id,
    variant_id: variant_id ?? null,
    quantity: quantity ?? 1,
    price_snapshot: price
  });

  res.status(201).json({ success: true, data: item });
});

export const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  const item = await CartItem.findOne({ where: { id: req.params.itemId, cart_id: cart.id } });
  if (!item) throw ApiError.notFound('Cart item not found');

  item.quantity = req.body.quantity;
  await item.save();
  res.json({ success: true, data: item });
});

export const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  const item = await CartItem.findOne({ where: { id: req.params.itemId, cart_id: cart.id } });
  if (!item) throw ApiError.notFound('Cart item not found');
  await item.destroy();
  res.status(204).send();
});

export const clearCart = catchAsync(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  await CartItem.destroy({ where: { cart_id: cart.id } });
  res.status(204).send();
});
