import { Request, Response } from 'express';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { getPagination, buildMeta } from '../utils/pagination';
import { uniqueSlug } from '../utils/slugify';
import { Vendor, User, Category, VendorCategory } from '../models';

const categoriesInclude = () => ({ model: Category, as: 'categories' as const, attributes: ['id', 'name', 'slug'], through: { attributes: [] } });

async function setVendorCategories(vendorId: number, categoryIds: number[]) {
  await VendorCategory.destroy({ where: { vendor_id: vendorId } });
  if (categoryIds.length) {
    await VendorCategory.bulkCreate(categoryIds.map((category_id) => ({ vendor_id: vendorId, category_id })));
  }
}

export const listVendors = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, offset } = getPagination(req);
  const status = req.query.status as string | undefined;
  const where: any = {};
  if (status) where.status = status;
  else where.status = 'approved'; // public listing defaults to approved-only

  if (req.query.featured === 'true') where.is_featured = true;

  const { rows, count } = await Vendor.findAndCountAll({
    where,
    limit,
    offset,
    order: [
      ['is_featured', 'DESC'],
      ['created_at', 'DESC']
    ]
  });

  res.json({ success: true, data: rows, meta: buildMeta(count, page, limit) });
});

export const getVendorBySlug = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findOne({ where: { store_slug: req.params.slug } });
  if (!vendor) throw ApiError.notFound('Store not found');
  res.json({ success: true, data: vendor });
});

export const getMyVendorProfile = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findOne({
    where: { user_id: req.user!.id },
    include: [{ model: User, as: 'user', attributes: { exclude: ['password_hash'] } }, categoriesInclude()]
  });
  if (!vendor) throw ApiError.notFound('Vendor profile not found');
  res.json({ success: true, data: vendor });
});

export const updateMyVendorProfile = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findOne({ where: { user_id: req.user!.id } });
  if (!vendor) throw ApiError.notFound('Vendor profile not found');

  const { store_name, store_name_ar, description, description_ar, business_type, tax_number, registration_number, iban, store_logo, store_banner } = req.body;

  if (store_name && store_name !== vendor.store_name) {
    vendor.store_slug = await uniqueSlug(store_name, (s) =>
      Vendor.findOne({ where: { store_slug: s, id: { [Op.ne]: vendor.id } } })
    );
    vendor.store_name = store_name;
  }
  if (store_name_ar !== undefined) vendor.store_name_ar = store_name_ar;
  if (description !== undefined) vendor.description = description;
  if (description_ar !== undefined) vendor.description_ar = description_ar;
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
    distinct: true,
    include: [{ model: User, as: 'user', attributes: { exclude: ['password_hash'] } }, categoriesInclude()]
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

export const toggleVendorFeatured = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findByPk(req.params.id);
  if (!vendor) throw ApiError.notFound('Vendor not found');

  vendor.is_featured = !vendor.is_featured;
  await vendor.save();

  res.json({ success: true, data: vendor });
});

// Admin uploads a vendor logo or business license document, gets back its URL
export const uploadVendorFile = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');
  res.status(201).json({ success: true, data: { url: `/uploads/${req.file.filename}` } });
});

// Admin creates a vendor store + its login account in one step
export const adminCreateVendor = catchAsync(async (req: Request, res: Response) => {
  const {
    owner_name,
    email,
    password,
    store_name,
    store_name_ar,
    iban,
    category_id,
    category_ids,
    business_license_url,
    store_logo,
    is_featured,
    commission_rate
  } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    first_name: owner_name,
    last_name: null,
    email,
    phone: null,
    password_hash,
    role: 'vendor',
    status: 'active',
    avatar_url: null,
    email_verified_at: new Date()
  });

  const store_slug = await uniqueSlug(store_name, (slug) => Vendor.findOne({ where: { store_slug: slug } }));

  const vendor = await Vendor.create({
    user_id: user.id,
    store_name,
    store_name_ar: store_name_ar ?? null,
    store_slug,
    store_logo: store_logo ?? null,
    store_banner: null,
    description: null,
    business_type: null,
    tax_number: null,
    registration_number: null,
    business_license_url: business_license_url ?? null,
    category_id: category_id ?? (Array.isArray(category_ids) && category_ids[0]) ?? null,
    iban: iban ?? null,
    commission_rate: commission_rate ?? 10.0,
    status: 'approved',
    rejection_reason: null,
    rating_avg: 0,
    is_featured: is_featured ?? false
  });

  if (Array.isArray(category_ids)) {
    await setVendorCategories(vendor.id, category_ids.map(Number));
  }

  const created = await Vendor.findByPk(vendor.id, { include: [categoriesInclude()] });

  res.status(201).json({
    success: true,
    data: {
      ...created!.toJSON(),
      user: { id: user.id, first_name: user.first_name, email: user.email }
    }
  });
});

// Admin edits any vendor's store details
export const adminUpdateVendor = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findByPk(req.params.id);
  if (!vendor) throw ApiError.notFound('Vendor not found');

  const {
    owner_name,
    store_name,
    store_name_ar,
    description,
    description_ar,
    business_type,
    tax_number,
    registration_number,
    iban,
    category_id,
    category_ids,
    business_license_url,
    store_logo,
    is_featured,
    commission_rate
  } = req.body;

  if (store_name && store_name !== vendor.store_name) {
    vendor.store_slug = await uniqueSlug(store_name, (s) =>
      Vendor.findOne({ where: { store_slug: s, id: { [Op.ne]: vendor.id } } })
    );
    vendor.store_name = store_name;
  }
  if (store_name_ar !== undefined) vendor.store_name_ar = store_name_ar;
  if (description !== undefined) vendor.description = description;
  if (description_ar !== undefined) vendor.description_ar = description_ar;
  if (business_type !== undefined) vendor.business_type = business_type;
  if (tax_number !== undefined) vendor.tax_number = tax_number;
  if (registration_number !== undefined) vendor.registration_number = registration_number;
  if (iban !== undefined) vendor.iban = iban;
  if (category_id !== undefined) vendor.category_id = category_id;
  if (business_license_url !== undefined) vendor.business_license_url = business_license_url;
  if (store_logo !== undefined) vendor.store_logo = store_logo;
  if (is_featured !== undefined) vendor.is_featured = is_featured;
  if (commission_rate !== undefined) vendor.commission_rate = commission_rate;

  await vendor.save();

  if (owner_name) {
    await User.update({ first_name: owner_name }, { where: { id: vendor.user_id } });
  }

  if (Array.isArray(category_ids)) {
    await setVendorCategories(vendor.id, category_ids.map(Number));
  }

  const updated = await Vendor.findByPk(vendor.id, {
    include: [{ model: User, as: 'user', attributes: { exclude: ['password_hash'] } }, categoriesInclude()]
  });
  res.json({ success: true, data: updated });
});
