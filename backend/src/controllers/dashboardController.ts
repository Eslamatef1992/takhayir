import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { Order, Product, User, Vendor } from '../models';

export const adminDashboard = catchAsync(async (_req: Request, res: Response) => {
  const [totalVendors, pendingVendors, totalProducts, pendingProducts, totalOrders, totalCustomers] = await Promise.all([
    Vendor.count({ where: { status: 'approved' } }),
    Vendor.count({ where: { status: 'pending' } }),
    Product.count({ where: { status: 'active' } }),
    Product.count({ where: { status: 'pending' } }),
    Order.count(),
    User.count({ where: { role: 'customer' } })
  ]);

  const revenueResult = (await Order.sum('grand_total', { where: { payment_status: 'paid' } })) || 0;

  res.json({
    success: true,
    data: {
      totalVendors,
      pendingVendors,
      totalProducts,
      pendingProducts,
      totalOrders,
      totalCustomers,
      totalRevenue: revenueResult
    }
  });
});

export const vendorDashboard = catchAsync(async (req: Request, res: Response) => {
  const vendor = await Vendor.findOne({ where: { user_id: req.user!.id } });
  if (!vendor) {
    return res.json({ success: true, data: null });
  }

  const [totalProducts, activeProducts, pendingProducts] = await Promise.all([
    Product.count({ where: { vendor_id: vendor.id } }),
    Product.count({ where: { vendor_id: vendor.id, status: 'active' } }),
    Product.count({ where: { vendor_id: vendor.id, status: 'pending' } })
  ]);

  res.json({
    success: true,
    data: {
      storeStatus: vendor.status,
      totalProducts,
      activeProducts,
      pendingProducts,
      commissionRate: vendor.commission_rate,
      ratingAvg: vendor.rating_avg
    }
  });
});
