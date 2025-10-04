export const dashboardErrorCodes = {
  unauthorized: 'unauthorized',
  forbidden_role: 'forbidden_role',
  invalid_query: 'invalid_query',
  database_error: 'database_error',
} as const;

export type DashboardServiceError = keyof typeof dashboardErrorCodes;

