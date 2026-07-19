import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { toSlug, uniqueSlug } from '../utils/slugify';
import { Category } from '../models';

export const listCategories = catchAsync(async (req: Request, res: Response) => {
  const flat = req.query.flat === 'true';
  const includeInactive = req.query.includeInactive === 'true';
  const where = includeInactive ? {} : { is_active: true };

  const categories = await Category.findAll({
    where,
    order: [
      ['sort_order', 'ASC'],
      ['name', 'ASC']
    ]
  });

  if (flat) {
    return res.json({ success: true, data: categories });
  }

  // build tree
  const byId = new Map<number, any>();
  categories.forEach((c) => byId.set(c.id, { ...c.toJSON(), children: [] }));
  const roots: any[] = [];
  byId.forEach((cat) => {
    if (cat.parent_id && byId.has(cat.parent_id)) {
      byId.get(cat.parent_id).children.push(cat);
    } else {
      roots.push(cat);
    }
  });

  res.json({ success: true, data: roots });
});

export const getCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await Category.findOne({
    where: { slug: req.params.slug },
    include: [{ model: Category, as: 'children' }]
  });
  if (!category) throw ApiError.notFound('Category not found');
  res.json({ success: true, data: category });
});

export const uploadCategoryImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No image file uploaded');
  res.status(201).json({ success: true, data: { url: `/uploads/${req.file.filename}` } });
});

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const { name, name_ar, parent_id, description, description_ar, icon, image, is_active, sort_order } = req.body;
  const slug = await uniqueSlug(name, (s) => Category.findOne({ where: { slug: s } }));

  const category = await Category.create({
    name,
    name_ar: name_ar ?? null,
    slug,
    parent_id: parent_id ?? null,
    description: description ?? null,
    description_ar: description_ar ?? null,
    icon: icon ?? null,
    image: image ?? null,
    is_active: is_active ?? true,
    sort_order: sort_order ?? 0
  });

  res.status(201).json({ success: true, data: category });
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  const { name, name_ar, parent_id, description, description_ar, icon, image, is_active, sort_order } = req.body;

  if (name && name !== category.name) {
    category.slug = await uniqueSlug(name, (s) =>
      Category.findOne({ where: { slug: s, id: { [Op.ne]: category.id } } })
    );
    category.name = name;
  }
  if (name_ar !== undefined) category.name_ar = name_ar;
  if (parent_id !== undefined) category.parent_id = parent_id;
  if (description !== undefined) category.description = description;
  if (description_ar !== undefined) category.description_ar = description_ar;
  if (icon !== undefined) category.icon = icon;
  if (image !== undefined) category.image = image;
  if (is_active !== undefined) category.is_active = is_active;
  if (sort_order !== undefined) category.sort_order = sort_order;

  await category.save();
  res.json({ success: true, data: category });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  await category.destroy();
  res.status(204).send();
});
