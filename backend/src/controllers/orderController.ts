import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { getPagination, buildMeta } from '../utils/pagination';
import { checkout, guestCheckout, getFullOrder } from '../services/orderService';
import { Order, OrderVendorGroup, OrderItem, Vendor } from '../models';

export const checkoutOrder = catchAsync(async (req: Request, res: Response) => {
  const { shipping_address_id, payment_method, coupon_code } = req.body;
  const result = await checkout({ userId: req.user!.id, shipping_address_id, payment_method, coupon_code });
  res.status(201).json({ success: true, data: result });
});

export const guestCheckoutOrder = catchAsync(async (req: Request, res: Response) => {
  const { items, guest, shipping, payment_method, coupon_code } = req.body;
  const result = await guestCheckout({ items, guest, shipping, payment_method, coupon_code });
  res.status(201).json({ success: true, data: result });
});

export const listMyOrders = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, offset } = getPagination(req);
  const { rows, count } = await Order.findAndCountAll({
    where: { user_id: req.user!.id },
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [{ model: OrderVendorGroup, as: 'vendorGroups', include: [{ model: OrderItem, as: 'items' }] }]
  });
  res.json({ success: true, data: rows, meta: buildMeta(count, page, limit) });
});

export const getMyOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await getFullOrder(Number(req.params.id), req.user!.id, 'customer');
  res.json({ success: true, data: order });
});

export const listVendorOrders = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findOne({ where: { user_id: req.user!.id } });
  if (!vendor) throw ApiError.notFound('Vendor profile not found');

  const { page, limit, offset } = getPagination(req);
  const status = req.query.status as string | undefined;
  const where: any = { vendor_id: vendor.id };
  if (status) where.status = status;

  const { rows, count } = await OrderVendorGroup.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [{ model: OrderItem, as: 'items' }, { model: Order, as: 'order' }]
  });

  res.json({ success: true, data: rows, meta: buildMeta(count, page, limit) });
});

export const updateVendorOrderGroupStatus = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findOne({ where: { user_id: req.user!.id } });
  if (!vendor) throw ApiError.notFound('Vendor profile not found');

  const group = await OrderVendorGroup.findOne({ where: { id: req.params.groupId, vendor_id: vendor.id } });
  if (!group) throw ApiError.notFound('Order not found');

  const { status, tracking_number } = req.body;
  group.status = status;
  if (tracking_number !== undefined) group.tracking_number = tracking_number;
  if (status === 'shipped') group.shipped_at = new Date();
  if (status === 'delivered') group.delivered_at = new Date();
  await group.save();

  res.json({ success: true, data: group });
});

export const adminListOrders = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, offset } = getPagination(req);
  const status = req.query.status as string | undefined;
  const where: any = status ? { status } : {};

  const { rows, count } = await Order.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [{ model: OrderVendorGroup, as: 'vendorGroups', include: [{ model: OrderItem, as: 'items' }] }]
  });

  res.json({ success: true, data: rows, meta: buildMeta(count, page, limit) });
});

export const adminGetOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await getFullOrder(Number(req.params.id));
  res.json({ success: true, data: order });
});
