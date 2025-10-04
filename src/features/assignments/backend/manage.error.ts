export const assignmentManageErrorCodes = {
  unauthorized: 'UNAUTHORIZED',
  forbidden: 'FORBIDDEN',
  validationError: 'VALIDATION_ERROR',
  databaseError: 'DATABASE_ERROR',
  notFound: 'ASSIGNMENT_NOT_FOUND',
  invalidStatusTransition: 'INVALID_STATUS_TRANSITION',
} as const;

export type AssignmentManageError =
  (typeof assignmentManageErrorCodes)[keyof typeof assignmentManageErrorCodes];

