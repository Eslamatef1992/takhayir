import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { Address } from '../models';

export const listMyAddresses = catchAsync(async (req: Request, res: Response) => {
  const addresses = await Address.findAll({ where: { user_id: req.user!.id }, order: [['is_default', 'DESC'], ['created_at', 'DESC']] });
  res.json({ success: true, data: addresses });
});

export const createAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  if (req.body.is_default) {
    await Address.update({ is_default: false }, { where: { user_id: userId } });
  }
  const address = await Address.create({ ...req.body, user_id: userId });
  res.status(201).json({ success: true, data: address });
});

export const updateAddress = catchAsync(async (req: Request, res: Response) => {
  const address = await Address.findOne({ where: { id: req.params.id, user_id: req.user!.id } });
  if (!address) throw ApiError.notFound('Address not found');

  if (req.body.is_default) {
    await Address.update({ is_default: false }, { where: { user_id: req.user!.id } });
  }
  await address.update(req.body);
  res.json({ success: true, data: address });
});

export const deleteAddress = catchAsync(async (req: Request, res: Response) => {
  const address = await Address.findOne({ where: { id: req.params.id, user_id: req.user!.id } });
  if (!address) throw ApiError.notFound('Address not found');
  await address.destroy();
  res.status(204).send();
});
