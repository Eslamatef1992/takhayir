import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { getPagination, buildMeta } from '../utils/pagination';
import { uniqueSlug } from '../utils/slugify';
import { Vendor, User } from '../models';

export const listVendors = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, offset } = getPagination(req);
  const status = req.query.status as string | undefined;
  const where: any = {};
  if (status) where.status = status;
  else where.status = 'approved'; // public listing defaults to approved-only

  const { rows, count } = await Vendor.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });

  res.json({ success: true, data: rows, meta: buildMeta(count, page, limit) });
});

export const getVendorBySlug = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findOne({ where: { store_slug: req.params.slug } });
  if (!vendor) throw ApiError.notFound('Store not found');
  res.json({ success: true, data: vendor });
});

export const getMyVendorProfile = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findOne({ where: { user_id: req.user!.id }, include: [{ model: User, as: 'user', attributes: { exclude: ['password_hash'] } }] });
  if (!vendor) throw ApiError.notFound('Vendor profile not found');
  res.json({ success: true, data: vendor });
});

export const updateMyVendorProfile = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findOne({ where: { user_id: req.user!.id } });
  if (!vendor) throw ApiError.notFound('Vendor profile not found');

  const { store_name, description, business_type, tax_number, registration_number, iban, store_logo, store_banner } = req.body;

  if (store_name && store_name !== vendor.store_name) {
    vendor.store_slug = await uniqueSlug(store_name, (s) =>
      Vendor.findOne({ where: { store_slug: s, id: { [Op.ne]: vendor.id } } })
    );
    vendor.store_name = store_name;
  }
  if (description !== undefined) vendor.description = description;
  if (business_type !== undefined) vendor.business_type = business_type;
  if (tax_number !== undefined) vendor.tax_number = tax_number;
  if (registration_number !== undefined) vendor.registration_number = registration_number;
  if (iban !== undefined) vendor.iban = iban;
  if (store_logo !== undefined) vendor.store_logo = store_logo;
  if (store_banner !== undefined) vendor.store_banner = store_banner;

  await vendor.save();
  res.json({ success: true, data: vendor });
});

// --- Admin moderation ---

export const adminListVendors = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, offset } = getPagination(req);
  const status = req.query.status as string | undefined;
  const where: any = status ? { status } : {};

  const { rows, count } = await Vendor.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [{ model: User, as: 'user', attributes: { exclude: ['password_hash'] } }]
  });

  res.json({ success: true, data: rows, meta: buildMeta(count, page, limit) });
});

export const updateVendorStatus = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findByPk(req.params.id);
  if (!vendor) throw ApiError.notFound('Vendor not found');

  const { status, rejection_reason } = req.body;
  vendor.status = status;
  vendor.rejection_reason = status === 'rejected' ? rejection_reason ?? null : null;
  await vendor.save();

  res.json({ success: true, data: vendor });
});

export const updateVendorCommission = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findByPk(req.params.id);
  if (!vendor) throw ApiError.notFound('Vendor not found');

  vendor.commission_rate = req.body.commission_rate;
  await vendor.save();

  res.json({ success: true, data: vendor });
});
