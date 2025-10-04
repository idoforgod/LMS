export const gradesErrorCodes = {
  unauthorized: 'UNAUTHORIZED',
  notEnrolled: 'NOT_ENROLLED_IN_COURSE',
  validationError: 'VALIDATION_ERROR',
  databaseError: 'DATABASE_ERROR',
} as const;

export type GradesServiceError =
  (typeof gradesErrorCodes)[keyof typeof gradesErrorCodes];
