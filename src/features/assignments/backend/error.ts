export const assignmentErrorCodes = {
  notFound: 'ASSIGNMENT_NOT_FOUND',
  notPublished: 'ASSIGNMENT_NOT_PUBLISHED',
  notEnrolled: 'NOT_ENROLLED_IN_COURSE',
  unauthorized: 'UNAUTHORIZED',
  databaseError: 'DATABASE_ERROR',
  validationError: 'VALIDATION_ERROR',
} as const;

export type AssignmentServiceError =
  (typeof assignmentErrorCodes)[keyof typeof assignmentErrorCodes];
