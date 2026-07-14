import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { getPagination, buildMeta } from '../utils/pagination';
import { uniqueSlug } from '../utils/slugify';
import { Product, ProductImage, ProductVariant, Vendor, Category } from '../models';

const publicIncludes = [
  { model: ProductImage, as: 'images' },
  { model: ProductVariant, as: 'variants' },
  { model: Vendor, as: 'vendor', attributes: ['id', 'store_name', 'store_slug', 'store_logo', 'status'] },
  { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }
];

// Public: browse/search active products
export const listProducts = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, offset } = getPagination(req);
  const { category, vendor, q, minPrice, maxPrice, featured, sort } = req.query as Record<string, string>;

  const where: any = { status: 'active' };
  if (q) where.name = { [Op.like]: `%${q}%` };
  if (featured === 'true') where.is_featured = true;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = Number(minPrice);
    if (maxPrice) where.price[Op.lte] = Number(maxPrice);
  }

  const include = [...publicIncludes];
  if (category) {
    (include[3] as any).where = { slug: category };
  }
  if (vendor) {
    (include[2] as any).where = { store_slug: vendor };
  }

  let order: any = [['created_at', 'DESC']];
  if (sort === 'price_asc') order = [['price', 'ASC']];
  if (sort === 'price_desc') order = [['price', 'DESC']];
  if (sort === 'rating') order = [['rating_avg', 'DESC']];

  const { rows, count } = await Product.findAndCountAll({
    where,
    include,
    limit,
    offset,
    order,
    distinct: true
  });

  res.json({ success: true, data: rows, meta: buildMeta(count, page, limit) });
});

export const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
  const product = await Product.findOne({ where: { slug: req.params.slug }, include: publicIncludes });
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ success: true, data: product });
});

// Vendor: manage own products
export const listMyProducts = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findOne({ where: { user_id: req.user!.id } });
  if (!vendor) throw ApiError.notFound('Vendor profile not found');

  const { page, limit, offset } = getPagination(req);
  const status = req.query.status as string | undefined;
  const where: any = { vendor_id: vendor.id };
  if (status) where.status = status;

  const { rows, count } = await Product.findAndCountAll({
    where,
    include: [{ model: ProductImage, as: 'images' }, { model: ProductVariant, as: 'variants' }, { model: Category, as: 'category' }],
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });

  res.json({ success: true, data: rows, meta: buildMeta(count, page, limit) });
});

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findOne({ where: { user_id: req.user!.id } });
  if (!vendor) throw ApiError.notFound('Vendor profile not found');
  if (vendor.status !== 'approved') {
    throw ApiError.forbidden('Your store must be approved by an admin before you can add products');
  }

  const { name, description, sku, category_id, price, compare_at_price, stock_quantity, weight_kg, images, variants } = req.body;

  const slug = await uniqueSlug(name, (s) => Product.findOne({ where: { slug: s } }));

  const product = await Product.create({
    vendor_id: vendor.id,
    category_id: category_id ?? null,
    name,
    slug,
    description: description ?? null,
    sku: sku ?? null,
    price,
    compare_at_price: compare_at_price ?? null,
    stock_quantity: stock_quantity ?? 0,
    weight_kg: weight_kg ?? null,
    status: 'pending'
  });

  if (Array.isArray(images) && images.length) {
    await ProductImage.bulkCreate(
      images.map((url: string, idx: number) => ({
        product_id: product.id,
        url,
        sort_order: idx,
        is_primary: idx === 0
      }))
    );
  }

  if (Array.isArray(variants) && variants.length) {
    await ProductVariant.bulkCreate(
      variants.map((v: any) => ({
        product_id: product.id,
        name: v.name,
        sku: v.sku ?? null,
        price: v.price ?? null,
        stock_quantity: v.stock_quantity ?? 0,
        attributes: v.attributes ?? null
      }))
    );
  }

  const created = await Product.findByPk(product.id, { include: publicIncludes });
  res.status(201).json({ success: true, data: created });
});

async function assertOwnedProduct(productId: number, userId: number) {
  const vendor = await Vendor.findOne({ where: { user_id: userId } });
  if (!vendor) throw ApiError.notFound('Vendor profile not found');
  const product = await Product.findOne({ where: { id: productId, vendor_id: vendor.id } });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

export const updateMyProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await assertOwnedProduct(Number(req.params.id), req.user!.id);

  const { name, description, sku, category_id, price, compare_at_price, stock_quantity, weight_kg } = req.body;

  if (name && name !== product.name) {
    product.slug = await uniqueSlug(name, (s) => Product.findOne({ where: { slug: s, id: { [Op.ne]: product.id } } }));
    product.name = name;
    product.status = 'pending'; // re-review after material edits
  }
  if (description !== undefined) product.description = description;
  if (sku !== undefined) product.sku = sku;
  if (category_id !== undefined) product.category_id = category_id;
  if (price !== undefined) product.price = price;
  if (compare_at_price !== undefined) product.compare_at_price = compare_at_price;
  if (stock_quantity !== undefined) product.stock_quantity = stock_quantity;
  if (weight_kg !== undefined) product.weight_kg = weight_kg;

  await product.save();
  const updated = await Product.findByPk(product.id, { include: publicIncludes });
  res.json({ success: true, data: updated });
});

export const deleteMyProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await assertOwnedProduct(Number(req.params.id), req.user!.id);
  await product.destroy();
  res.status(204).send();
});

export const addProductImage = catchAsync(async (req: Request, res: Response) => {
  const product = await assertOwnedProduct(Number(req.params.id), req.user!.id);
  if (!req.file) throw ApiError.badRequest('No image file uploaded');

  const url = `/uploads/${req.file.filename}`;
  const count = await ProductImage.count({ where: { product_id: product.id } });
  const image = await ProductImage.create({
    product_id: product.id,
    url,
    sort_order: count,
    is_primary: count === 0
  });

  res.status(201).json({ success: true, data: image });
});

// Admin moderation
export const adminListProducts = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, offset } = getPagination(req);
  const status = req.query.status as string | undefined;
  const where: any = status ? { status } : {};

  const { rows, count } = await Product.findAndCountAll({
    where,
    include: publicIncludes,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    distinct: true
  });

  res.json({ success: true, data: rows, meta: buildMeta(count, page, limit) });
});

export const updateProductStatus = catchAsync(async (req: Request, res: Response) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  const { status, rejection_reason } = req.body;
  product.status = status;
  product.rejection_reason = status === 'rejected' ? rejection_reason ?? null : null;
  await product.save();

  res.json({ success: true, data: product });
});
