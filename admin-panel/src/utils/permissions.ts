import { AdminRole } from '../context/AuthContext';

export type PermissionArea =
  | 'vendors'
  | 'products'
  | 'categories'
  | 'orders'
  | 'coupons'
  | 'banners'
  | 'admins'
  | 'cms'
  | 'variants';

// Mirrors backend/src/utils/permissions.ts. Used only to hide nav items /
// disable buttons for a nicer UX — the backend is the real enforcement point.
const ROLE_AREAS: Record<Exclude<AdminRole, 'super_admin'>, PermissionArea[]> = {
  orders_manager: ['orders'],
  product_manager: ['products', 'categories', 'banners', 'variants', 'cms'],
  support: []
};

// Whether this role can create/edit/delete in this area (mirrors the backend gate).
export function canWrite(adminRole: AdminRole | null | undefined, area: PermissionArea): boolean {
  if (!adminRole || adminRole === 'super_admin') return true;
  return ROLE_AREAS[adminRole]?.includes(area) ?? false;
}

// Which nav sections a role should even see. Broader than canWrite — most
// areas are readable by any admin for cross-referencing (e.g. an orders
// manager still needs to see which vendor/product an order refers to),
// but a handful of sections are hidden entirely when a role has no reason
// to open them, to keep each role's sidebar focused.
const NAV_AREAS: Record<Exclude<AdminRole, 'super_admin'>, PermissionArea[]> = {
  orders_manager: ['orders', 'vendors', 'products'],
  product_manager: ['products', 'categories', 'banners', 'variants', 'cms', 'vendors'],
  support: ['vendors', 'products', 'orders', 'categories', 'banners']
};

export function canView(adminRole: AdminRole | null | undefined, area: PermissionArea): boolean {
  if (!adminRole || adminRole === 'super_admin') return true;
  return NAV_AREAS[adminRole]?.includes(area) ?? false;
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  orders_manager: 'Orders Manager',
  product_manager: 'Product Manager',
  support: 'Support'
};

export const ADMIN_ROLE_OPTIONS: AdminRole[] = ['super_admin', 'orders_manager', 'product_manager', 'support'];
