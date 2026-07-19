import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { Coupon, Vendor } from '../models';

// Customer-facing: browse currently usable coupons (platform-wide or vendor-specific)
export const listAvailableCoupons = catchAsync(async (_req: Request, res: Response) => {
  const now = new Date();
  const coupons = await Coupon.findAll({
    where: {
      is_active: true,
      [Op.and]: [
        { [Op.or]: [{ starts_at: null }, { starts_at: { [Op.lte]: now } }] },
        { [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gte]: now } }] }
      ]
    },
    include: [{ model: Vendor, as: 'vendor', attributes: ['id', 'store_name', 'store_slug'] }],
    order: [['created_at', 'DESC']]
  });

  const usable = coupons.filter((c) => !c.usage_limit || c.used_count < c.usage_limit);
  res.json({ success: true, data: usable });
});

export const listMyCoupons = catchAsync(async (req: Request, res: Response) => {
  let vendorId: number | null = null;
  if (req.user!.role === 'vendor') {
    const vendor = await Vendor.findOne({ where: { user_id: req.user!.id } });
    if (!vendor) throw ApiError.notFound('Vendor profile not found');
    vendorId = vendor.id;
  }
  const where = req.user!.role === 'admin' ? {} : { vendor_id: vendorId };
  const coupons = await Coupon.findAll({ where, order: [['created_at', 'DESC']] });
  res.json({ success: true, data: coupons });
});

export const createCoupon = catchAsync(async (req: Request, res: Response) => {
  let vendor_id: number | null = null;
  if (req.user!.role === 'vendor') {
    const vendor = await Vendor.findOne({ where: { user_id: req.user!.id } });
    if (!vendor) throw ApiError.notFound('Vendor profile not found');
    vendor_id = vendor.id;
  }

  const existing = await Coupon.findOne({ where: { code: req.body.code } });
  if (existing) throw ApiError.conflict('A coupon with this code already exists');

  const coupon = await Coupon.create({ ...req.body, vendor_id });
  res.status(201).json({ success: true, data: coupon });
});

export const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) throw ApiError.notFound('Coupon not found');

  if (req.user!.role === 'vendor') {
    const vendor = await Vendor.findOne({ where: { user_id: req.user!.id } });
    if (!vendor || coupon.vendor_id !== vendor.id) throw ApiError.forbidden();
  }

  await coupon.destroy();
  res.status(204).send();
});

export const validateCoupon = catchAsync(async (req: Request, res: Response) => {
  const { code, subtotal } = req.body as { code: string; subtotal: number };
  const coupon = await Coupon.findOne({ where: { code, is_active: true } });
  if (!coupon) throw ApiError.notFound('Invalid coupon code');

  const now = new Date();
  if (coupon.starts_at && coupon.starts_at > now) throw ApiError.badRequest('Coupon is not active yet');
  if (coupon.expires_at && coupon.expires_at < now) throw ApiError.badRequest('Coupon has expired');
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) throw ApiError.badRequest('Coupon usage limit reached');
  if (subtotal < Number(coupon.min_order_amount)) {
    throw ApiError.badRequest(`Minimum order amount for this coupon is ${coupon.min_order_amount}`);
  }

  const discount = coupon.type === 'percent' ? (Number(coupon.value) / 100) * subtotal : Number(coupon.value);
  res.json({ success: true, data: { coupon, discount: Math.min(discount, subtotal) } });
});
