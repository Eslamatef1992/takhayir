import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { loginUser, registerUser, requestPasswordReset, resetPassword, changePassword } from '../services/authService';
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

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await requestPasswordReset(req.body.email);
  // Same response regardless of whether the email exists, to avoid leaking which emails are registered.
  res.status(200).json({
    success: true,
    message: 'If an account exists for that email, a password reset link has been sent.'
  });
});

export const resetPasswordHandler = catchAsync(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  await resetPassword(token, password);
  res.status(200).json({ success: true, message: 'Your password has been reset. You can now log in.' });
});

export const changePasswordHandler = catchAsync(async (req: Request, res: Response) => {
  const { current_password, new_password } = req.body;
  await changePassword(req.user!.id, current_password, new_password);
  res.status(200).json({ success: true, message: 'Your password has been updated.' });
});
