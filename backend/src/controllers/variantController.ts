import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { VariantType, VariantValue } from '../models';

// Readable by any authenticated admin or vendor (needed to build product
// variant pickers); only product_manager/super_admin can mutate (route-gated).
export const listVariantTypes = catchAsync(async (_req: Request, res: Response) => {
  const types = await VariantType.findAll({
    include: [{ model: VariantValue, as: 'values' }],
    order: [['name', 'ASC'], [{ model: VariantValue, as: 'values' }, 'value', 'ASC']]
  });
  res.json({ success: true, data: types });
});

export const createVariantType = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.body;
  const existing = await VariantType.findOne({ where: { name } });
  if (existing) throw ApiError.conflict('A variant type with this name already exists');
  const type = await VariantType.create({ name });
  res.status(201).json({ success: true, data: { ...type.toJSON(), values: [] } });
});

export const updateVariantType = catchAsync(async (req: Request, res: Response) => {
  const type = await VariantType.findByPk(req.params.id);
  if (!type) throw ApiError.notFound('Variant type not found');
  if (req.body.name !== undefined) type.name = req.body.name;
  await type.save();
  res.json({ success: true, data: type });
});

export const deleteVariantType = catchAsync(async (req: Request, res: Response) => {
  const type = await VariantType.findByPk(req.params.id);
  if (!type) throw ApiError.notFound('Variant type not found');
  await type.destroy();
  res.status(204).send();
});

export const createVariantValue = catchAsync(async (req: Request, res: Response) => {
  const type = await VariantType.findByPk(req.params.typeId);
  if (!type) throw ApiError.notFound('Variant type not found');
  const value = await VariantValue.create({ variant_type_id: type.id, value: req.body.value });
  res.status(201).json({ success: true, data: value });
});

export const updateVariantValue = catchAsync(async (req: Request, res: Response) => {
  const value = await VariantValue.findByPk(req.params.id);
  if (!value) throw ApiError.notFound('Variant value not found');
  if (req.body.value !== undefined) value.value = req.body.value;
  await value.save();
  res.json({ success: true, data: value });
});

export const deleteVariantValue = catchAsync(async (req: Request, res: Response) => {
  const value = await VariantValue.findByPk(req.params.id);
  if (!value) throw ApiError.notFound('Variant value not found');
  await value.destroy();
  res.status(204).send();
});
