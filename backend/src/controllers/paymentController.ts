import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { handleWebhook } from '../services/payments';

export const tapWebhook = catchAsync(async (req: Request, res: Response) => {
  await handleWebhook('tap', req.body);
  res.status(200).json({ success: true });
});

export const talyWebhook = catchAsync(async (req: Request, res: Response) => {
  await handleWebhook('taly', req.body);
  res.status(200).json({ success: true });
});

export const paymentRedirect = catchAsync(async (req: Request, res: Response) => {
  const storefrontUrl = process.env.CLIENT_STOREFRONT_URL || 'http://localhost:5173';
  const orderNumber = req.query.order;
  res.redirect(`${storefrontUrl}/orders/confirmation?order=${orderNumber}`);
});
