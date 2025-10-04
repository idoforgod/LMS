export const enrollmentErrorCodes = {
  courseNotFound: 'COURSE_NOT_FOUND',
  courseNotPublished: 'COURSE_NOT_PUBLISHED',
  alreadyEnrolled: 'ALREADY_ENROLLED',
  notEnrolled: 'NOT_ENROLLED',
  unauthorized: 'UNAUTHORIZED',
  validationError: 'VALIDATION_ERROR',
  databaseError: 'DATABASE_ERROR',
} as const;

type EnrollmentErrorValue =
  (typeof enrollmentErrorCodes)[keyof typeof enrollmentErrorCodes];

export type EnrollmentServiceError = EnrollmentErrorValue;
