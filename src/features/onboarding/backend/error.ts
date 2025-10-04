export const onboardingErrorCodes = {
  emailDuplicate: 'EMAIL_DUPLICATE',
  authCreationFailed: 'AUTH_CREATION_FAILED',
  profileCreationFailed: 'PROFILE_CREATION_FAILED',
  termsAgreementFailed: 'TERMS_AGREEMENT_FAILED',
  validationError: 'VALIDATION_ERROR',
  tokenIssueFailed: 'TOKEN_ISSUE_FAILED',
} as const;

type OnboardingErrorValue =
  (typeof onboardingErrorCodes)[keyof typeof onboardingErrorCodes];

export type OnboardingServiceError = OnboardingErrorValue;
