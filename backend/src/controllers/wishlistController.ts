import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { Product, ProductImage, Wishlist } from '../models';

export const listMyWishlist = catchAsync(async (req: Request, res: Response) => {
  const items = await Wishlist.findAll({
    where: { user_id: req.user!.id },
    include: [{ model: Product, as: 'product', include: [{ model: ProductImage, as: 'images' }] }],
    order: [['created_at', 'DESC']]
  });
  res.json({ success: true, data: items });
});

export const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const { product_id } = req.body;
  const product = await Product.findByPk(product_id);
  if (!product) throw ApiError.notFound('Product not found');

  const [item] = await Wishlist.findOrCreate({
    where: { user_id: req.user!.id, product_id },
    defaults: { user_id: req.user!.id, product_id }
  });
  res.status(201).json({ success: true, data: item });
});

export const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const item = await Wishlist.findOne({ where: { id: req.params.id, user_id: req.user!.id } });
  if (!item) throw ApiError.notFound('Wishlist item not found');
  await item.destroy();
  res.status(204).send();
});
