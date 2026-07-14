import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { loginUser, registerUser } from '../services/authService';
import { User, Vendor } from '../models';
import { ApiError } from '../utils/ApiError';

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  res.status(201).json({ success: true, data: result });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  res.status(200).json({ success: true, data: result });
});

export const me = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password_hash'] },
    include: [{ model: Vendor, as: 'vendorProfile' }]
  });
  if (!user) throw ApiError.notFound('User not found');
  res.status(200).json({ success: true, data: user });
});
