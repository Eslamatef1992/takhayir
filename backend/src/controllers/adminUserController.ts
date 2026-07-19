import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { getPagination, buildMeta } from '../utils/pagination';
import { User } from '../models';

const SAFE_ATTRIBUTES = ['id', 'first_name', 'last_name', 'email', 'phone', 'admin_role', 'status', 'created_at'];

// List every admin account (super_admin only — gated at the route level).
export const listAdmins = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, offset } = getPagination(req);
  const { rows, count } = await User.findAndCountAll({
    where: { role: 'admin' },
    attributes: SAFE_ATTRIBUTES,
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });
  res.json({ success: true, data: rows, meta: buildMeta(count, page, limit) });
});

export const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const { first_name, last_name, email, phone, password, admin_role } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const password_hash = await bcrypt.hash(password, 10);
  const admin = await User.create({
    first_name,
    last_name: last_name ?? null,
    email,
    phone: phone ?? null,
    password_hash,
    role: 'admin',
    admin_role,
    status: 'active'
  });

  const safe = await User.findByPk(admin.id, { attributes: SAFE_ATTRIBUTES });
  res.status(201).json({ success: true, data: safe });
});

export const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const admin = await User.findOne({ where: { id: req.params.id, role: 'admin' } });
  if (!admin) throw ApiError.notFound('Admin account not found');

  const { first_name, last_name, phone, admin_role, status, password } = req.body;

  if (admin_role !== undefined && admin.admin_role === 'super_admin' && admin_role !== 'super_admin') {
    const otherSuperAdmins = await User.count({ where: { role: 'admin', admin_role: 'super_admin' } });
    if (otherSuperAdmins <= 1) {
      throw ApiError.badRequest('At least one Super Admin must remain. Promote another admin first.');
    }
  }

  if (first_name !== undefined) admin.first_name = first_name;
  if (last_name !== undefined) admin.last_name = last_name;
  if (phone !== undefined) admin.phone = phone;
  if (admin_role !== undefined) admin.admin_role = admin_role;
  if (status !== undefined) admin.status = status;
  if (password) admin.password_hash = await bcrypt.hash(password, 10);

  await admin.save();
  const safe = await User.findByPk(admin.id, { attributes: SAFE_ATTRIBUTES });
  res.json({ success: true, data: safe });
});

export const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const admin = await User.findOne({ where: { id: req.params.id, role: 'admin' } });
  if (!admin) throw ApiError.notFound('Admin account not found');

  if (Number(req.params.id) === req.user!.id) {
    throw ApiError.badRequest('You cannot remove your own admin account');
  }

  if (admin.admin_role === 'super_admin') {
    const otherSuperAdmins = await User.count({ where: { role: 'admin', admin_role: 'super_admin' } });
    if (otherSuperAdmins <= 1) {
      throw ApiError.badRequest('At least one Super Admin must remain');
    }
  }

  await admin.destroy();
  res.status(204).send();
});
