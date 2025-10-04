export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PaginationResult = {
  offset: number;
  limit: number;
  page: number;
  pageSize: number;
};

export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/**
 * Calculate pagination offset and limit
 */
export const calculatePagination = (
  params: PaginationParams,
): PaginationResult => {
  const page = Math.max(1, params.page);
  const pageSize = Math.max(1, Math.min(100, params.pageSize));
  const offset = (page - 1) * pageSize;

  return {
    offset,
    limit: pageSize,
    page,
    pageSize,
  };
};

/**
 * Create pagination metadata
 */
export const createPaginationMeta = (
  total: number,
  current: PaginationResult,
): PaginationMeta => {
  const totalPages = Math.ceil(total / current.pageSize);

  return {
    total,
    page: current.page,
    pageSize: current.pageSize,
    totalPages,
  };
};
