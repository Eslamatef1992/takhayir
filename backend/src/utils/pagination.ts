import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function getPagination(req: Request, defaultLimit = 20, maxLimit = 100): PaginationParams {
  const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
  const rawLimit = parseInt(String(req.query.limit ?? String(defaultLimit)), 10) || defaultLimit;
  const limit = Math.min(Math.max(rawLimit, 1), maxLimit);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function buildMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1)
  };
}
