export const submissionErrorCodes = {
  validationError: 'VALIDATION_ERROR',
  unauthorized: 'UNAUTHORIZED',
  notFound: 'SUBMISSION_NOT_FOUND',
  assignmentNotFound: 'ASSIGNMENT_NOT_FOUND',
  notPublished: 'ASSIGNMENT_NOT_PUBLISHED',
  notEnrolled: 'NOT_ENROLLED_IN_COURSE',
  deadlinePassed: 'DEADLINE_PASSED',
  resubmissionNotAllowed: 'RESUBMISSION_NOT_ALLOWED',
  gradedLocked: 'GRADED_LOCKED',
  alreadySubmitted: 'ALREADY_SUBMITTED',
  databaseError: 'DATABASE_ERROR',
} as const;

export type SubmissionErrorCode =
  (typeof submissionErrorCodes)[keyof typeof submissionErrorCodes];

