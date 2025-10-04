import { isAfterDeadline } from './date-utils';

export type SubmissionButtonState = {
  canSubmit: boolean;
  message: string | null;
  variant: 'default' | 'warning' | 'disabled';
};

/**
 * Calculate submission button state based on assignment status, due date, and policies
 * Implements BR-003 (Submission Window) and BR-004 (Resubmission Policy)
 */
export const calculateSubmissionState = (
  assignmentStatus: 'draft' | 'published' | 'closed',
  dueDate: string,
  allowLate: boolean,
  hasSubmission: boolean,
  submissionStatus?: 'submitted' | 'graded' | 'resubmission_required',
  allowResubmission?: boolean,
): SubmissionButtonState => {
  // BR-003: Assignment status 'closed' blocks submission
  if (assignmentStatus === 'closed') {
    return {
      canSubmit: false,
      message: 'This assignment is closed',
      variant: 'disabled',
    };
  }

  // BR-003: Draft assignments are not available for submission
  if (assignmentStatus === 'draft') {
    return {
      canSubmit: false,
      message: 'This assignment is not available yet',
      variant: 'disabled',
    };
  }

  const isPastDeadline = isAfterDeadline(dueDate);

  // BR-003: After deadline with allow_late=false blocks submission
  if (isPastDeadline && !allowLate) {
    return {
      canSubmit: false,
      message: 'Deadline has passed',
      variant: 'disabled',
    };
  }

  // BR-004: Resubmission_required status allows submission regardless of policy
  if (submissionStatus === 'resubmission_required') {
    return {
      canSubmit: true,
      message: 'Resubmission required by instructor',
      variant: 'warning',
    };
  }

  // BR-004: Graded submission cannot be resubmitted
  if (submissionStatus === 'graded') {
    return {
      canSubmit: false,
      message: 'Assignment has been graded',
      variant: 'disabled',
    };
  }

  // BR-004: Existing submission with allow_resubmission=false blocks resubmission
  if (hasSubmission && !allowResubmission) {
    return {
      canSubmit: false,
      message: 'Resubmission not allowed',
      variant: 'disabled',
    };
  }

  // BR-003: After deadline with allow_late=true allows late submission
  if (isPastDeadline && allowLate) {
    return {
      canSubmit: true,
      message: 'Late submission - will be marked as late',
      variant: 'warning',
    };
  }

  // BR-004: Can resubmit if allowed
  if (hasSubmission && allowResubmission) {
    return {
      canSubmit: true,
      message: 'You can update your submission',
      variant: 'default',
    };
  }

  // Default: Before deadline, no existing submission or resubmission allowed
  return {
    canSubmit: true,
    message: null,
    variant: 'default',
  };
};
