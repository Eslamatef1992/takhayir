import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { getPagination, buildMeta } from '../utils/pagination';
import { Product, Review, User } from '../models';

export const listProductReviews = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, offset } = getPagination(req);
  const { rows, count } = await Review.findAndCountAll({
    where: { product_id: req.params.productId, status: 'approved' },
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [{ model: User, as: 'author', attributes: ['id', 'first_name', 'last_name', 'avatar_url'] }]
  });
  res.json({ success: true, data: rows, meta: buildMeta(count, page, limit) });
});

async function recalcProductRating(productId: number) {
  const reviews = await Review.findAll({ where: { product_id: productId, status: 'approved' } });
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  await Product.update({ rating_avg: avg, rating_count: count }, { where: { id: productId } });
}

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const { product_id, rating, comment, order_item_id } = req.body;
  const product = await Product.findByPk(product_id);
  if (!product) throw ApiError.notFound('Product not found');

  const review = await Review.create({
    product_id,
    user_id: req.user!.id,
    vendor_id: product.vendor_id,
    order_item_id: order_item_id ?? null,
    rating,
    comment: comment ?? null,
    status: 'approved'
  });

  await recalcProductRating(product_id);
  res.status(201).json({ success: true, data: review });
});

export const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const review = await Review.findOne({ where: { id: req.params.id, user_id: req.user!.id } });
  if (!review) throw ApiError.notFound('Review not found');
  const productId = review.product_id;
  await review.destroy();
  await recalcProductRating(productId);
  res.status(204).send();
});
