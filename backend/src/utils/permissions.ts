import { AdminRole } from '../models/User';

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

// Fixed role presets. super_admin is handled separately (always has every area).
// Each of these lists the areas that role may create/edit/delete in.
// Areas not listed here are still readable by any authenticated admin —
// this only gates mutating actions (and, for 'admins', all access).
export const ROLE_AREAS: Record<Exclude<AdminRole, 'super_admin'>, PermissionArea[]> = {
  orders_manager: ['orders'],
  product_manager: ['products', 'categories', 'banners', 'variants', 'cms'],
  support: []
};

export function adminRoleHasArea(adminRole: AdminRole | null | undefined, area: PermissionArea): boolean {
  if (!adminRole || adminRole === 'super_admin') return true;
  return ROLE_AREAS[adminRole]?.includes(area) ?? false;
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  orders_manager: 'Orders Manager',
  product_manager: 'Product Manager',
  support: 'Support'
};
