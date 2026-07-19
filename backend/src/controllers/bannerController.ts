import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { Banner } from '../models';

export const listActiveBanners = catchAsync(async (_req: Request, res: Response) => {
  const banners = await Banner.findAll({
    where: { is_active: true },
    order: [
      ['sort_order', 'ASC'],
      ['created_at', 'DESC']
    ]
  });
  res.json({ success: true, data: banners });
});

export const adminListBanners = catchAsync(async (_req: Request, res: Response) => {
  const banners = await Banner.findAll({
    order: [
      ['sort_order', 'ASC'],
      ['created_at', 'DESC']
    ]
  });
  res.json({ success: true, data: banners });
});

export const createBanner = catchAsync(async (req: Request, res: Response) => {
  const { title, title_ar, subtitle, subtitle_ar, image_url, link_url, is_active, sort_order } = req.body;
  const banner = await Banner.create({
    title: title ?? null,
    title_ar: title_ar ?? null,
    subtitle: subtitle ?? null,
    subtitle_ar: subtitle_ar ?? null,
    image_url,
    link_url: link_url ?? null,
    is_active: is_active ?? true,
    sort_order: sort_order ?? 0
  });
  res.status(201).json({ success: true, data: banner });
});

export const uploadBannerImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No image file uploaded');
  res.status(201).json({ success: true, data: { url: `/uploads/${req.file.filename}` } });
});

export const updateBanner = catchAsync(async (req: Request, res: Response) => {
  const banner = await Banner.findByPk(req.params.id);
  if (!banner) throw ApiError.notFound('Banner not found');

  const { title, title_ar, subtitle, subtitle_ar, image_url, link_url, is_active, sort_order } = req.body;
  if (title !== undefined) banner.title = title;
  if (title_ar !== undefined) banner.title_ar = title_ar;
  if (subtitle !== undefined) banner.subtitle = subtitle;
  if (subtitle_ar !== undefined) banner.subtitle_ar = subtitle_ar;
  if (image_url !== undefined) banner.image_url = image_url;
  if (link_url !== undefined) banner.link_url = link_url;
  if (is_active !== undefined) banner.is_active = is_active;
  if (sort_order !== undefined) banner.sort_order = sort_order;

  await banner.save();
  res.json({ success: true, data: banner });
});

export const deleteBanner = catchAsync(async (req: Request, res: Response) => {
  const banner = await Banner.findByPk(req.params.id);
  if (!banner) throw ApiError.notFound('Banner not found');
  await banner.destroy();
  res.status(204).send();
});
