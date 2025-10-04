import { isAfter, parseISO } from 'date-fns';

export const canSubmit = (opts: {
  assignmentStatus: 'draft' | 'published' | 'closed';
  dueDate: string; // ISO
  allowLate: boolean;
}): { allowed: boolean; reason?: 'NOT_PUBLISHED' | 'CLOSED' | 'DEADLINE_PASSED' } => {
  if (opts.assignmentStatus === 'draft') return { allowed: false, reason: 'NOT_PUBLISHED' };
  if (opts.assignmentStatus === 'closed') return { allowed: false, reason: 'CLOSED' };
  const past = isAfter(new Date(), parseISO(opts.dueDate));
  if (past && !opts.allowLate) return { allowed: false, reason: 'DEADLINE_PASSED' };
  return { allowed: true };
};

export const canResubmit = (opts: {
  submissionStatus?: 'submitted' | 'graded' | 'resubmission_required';
  allowResubmission: boolean;
}): { allowed: boolean; reason?: 'GRADED_LOCKED' | 'RESUBMISSION_NOT_ALLOWED' } => {
  if (opts.submissionStatus === 'graded') return { allowed: false, reason: 'GRADED_LOCKED' };
  if (opts.submissionStatus === 'resubmission_required') return { allowed: true };
  if (!opts.allowResubmission) return { allowed: false, reason: 'RESUBMISSION_NOT_ALLOWED' };
  return { allowed: true };
};

