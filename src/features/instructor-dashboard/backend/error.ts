export const instructorDashboardErrorCodes = {
  unauthorized: 'UNAUTHORIZED',
  validationError: 'VALIDATION_ERROR',
  databaseError: 'DATABASE_ERROR',
  forbidden: 'FORBIDDEN',
} as const;

export type InstructorDashboardError =
  (typeof instructorDashboardErrorCodes)[keyof typeof instructorDashboardErrorCodes];

