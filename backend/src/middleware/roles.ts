import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '../models/User';
import { adminRoleHasArea, PermissionArea } from '../utils/permissions';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    return next();
  };
}

// Extra gate layered on top of requireRole('admin', ...). If the caller isn't
// an admin (e.g. a vendor hitting a shared route), this is a no-op — the
// earlier requireRole already decided whether they're allowed in at all.
// If the caller IS an admin, their fixed admin_role preset must include this
// area, unless they're a super_admin (unrestricted).
export function gateAdminRole(area: PermissionArea) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (req.user.role !== 'admin') return next();
    if (adminRoleHasArea(req.user.admin_role, area)) return next();
    return next(ApiError.forbidden('Your admin role does not have permission to perform this action'));
  };
}
