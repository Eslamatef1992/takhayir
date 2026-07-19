import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { Page } from '../models';

export const adminListPages = catchAsync(async (_req: Request, res: Response) => {
  const pages = await Page.findAll({ order: [['title', 'ASC']] });
  res.json({ success: true, data: pages });
});

export const adminGetPage = catchAsync(async (req: Request, res: Response) => {
  const page = await Page.findOne({ where: { slug: req.params.slug } });
  if (!page) throw ApiError.notFound('Page not found');
  res.json({ success: true, data: page });
});

export const adminUpdatePage = catchAsync(async (req: Request, res: Response) => {
  const page = await Page.findOne({ where: { slug: req.params.slug } });
  if (!page) throw ApiError.notFound('Page not found');

  const { title, title_ar, body, body_ar, meta_description } = req.body;
  if (title !== undefined) page.title = title;
  if (title_ar !== undefined) page.title_ar = title_ar;
  if (body !== undefined) page.body = body;
  if (body_ar !== undefined) page.body_ar = body_ar;
  if (meta_description !== undefined) page.meta_description = meta_description;
  await page.save();

  res.json({ success: true, data: page });
});

// Public: storefront reads a page by slug.
export const getPublicPage = catchAsync(async (req: Request, res: Response) => {
  const page = await Page.findOne({ where: { slug: req.params.slug } });
  if (!page) throw ApiError.notFound('Page not found');
  res.json({ success: true, data: page });
});
