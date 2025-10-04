export const courseErrorCodes = {
  notFound: 'COURSE_NOT_FOUND',
  notPublished: 'COURSE_NOT_PUBLISHED',
  invalidQuery: 'INVALID_QUERY_PARAMS',
  databaseError: 'DATABASE_ERROR',
  unauthorized: 'UNAUTHORIZED',
  forbidden: 'FORBIDDEN',
  validationError: 'VALIDATION_ERROR',
  invalidStatusTransition: 'INVALID_STATUS_TRANSITION',
} as const;

type CourseErrorValue =
  (typeof courseErrorCodes)[keyof typeof courseErrorCodes];

export type CourseServiceError = CourseErrorValue;
