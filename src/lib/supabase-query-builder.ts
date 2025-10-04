export type FilterOptions = {
  search?: string;
  searchFields?: string[];
  filters?: Record<string, unknown>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    pageSize: number;
  };
};

/**
 * Build Supabase query with filters, search, sorting, and pagination
 */
export const buildQuery = <T>(
  query: T,
  options: FilterOptions,
): T => {
  let builtQuery = query as any;

  // Apply search filter
  if (options.search && options.searchFields && options.searchFields.length > 0) {
    const searchConditions = options.searchFields
      .map((field) => `${field}.ilike.%${options.search}%`)
      .join(',');
    builtQuery = builtQuery.or(searchConditions);
  }

  // Apply field filters
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        builtQuery = builtQuery.eq(key, value);
      }
    });
  }

  // Apply sorting
  if (options.sort) {
    builtQuery = builtQuery.order(options.sort.field, {
      ascending: options.sort.order === 'asc',
    });
  }

  // Apply pagination
  if (options.pagination) {
    const offset = (options.pagination.page - 1) * options.pagination.pageSize;
    builtQuery = builtQuery.range(
      offset,
      offset + options.pagination.pageSize - 1,
    );
  }

  return builtQuery;
};
