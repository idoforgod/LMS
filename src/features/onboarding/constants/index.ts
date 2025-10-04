/**
 * Onboarding constants (roles and redirect paths)
 */

export const USER_ROLE = {
  LEARNER: 'learner',
  INSTRUCTOR: 'instructor',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const REDIRECT_PATH_BY_ROLE: Record<UserRole, string> = {
  [USER_ROLE.LEARNER]: '/courses',
  [USER_ROLE.INSTRUCTOR]: '/instructor/dashboard',
};
