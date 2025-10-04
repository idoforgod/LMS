import type { SupabaseClient } from '@supabase/supabase-js';
import { success, failure, type HandlerResult } from '@/backend/http/response';
import { submissionErrorCodes, type SubmissionErrorCode } from './error';
import type { Submission, SubmitRequest } from './schema';
import { canSubmit, canResubmit } from './policy';

type ServiceResult<T> = HandlerResult<T, SubmissionErrorCode, unknown>;

export const createSubmission = async (
  client: SupabaseClient,
  userId: string,
  assignmentId: number,
  payload: SubmitRequest,
): Promise<ServiceResult<Submission>> => {
  // 1) Fetch assignment
  const { data: assignment, error: aErr } = await client
    .from('assignments')
    .select('*')
    .eq('id', assignmentId)
    .single();

  if (aErr || !assignment) {
    return failure(404, submissionErrorCodes.assignmentNotFound, 'Assignment not found', aErr);
  }

  // 2) Verify enrollment
  const { data: enrollment, error: eErr } = await client
    .from('enrollments')
    .select('id')
    .eq('course_id', assignment.course_id)
    .eq('user_id', userId)
    .single();

  if (eErr || !enrollment) {
    return failure(403, submissionErrorCodes.notEnrolled, 'You must be enrolled in this course', eErr);
  }

  // 3) Check existing submission
  const { data: existing, error: sErr } = await client
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (sErr) {
    return failure(500, submissionErrorCodes.databaseError, 'Failed to check existing submission', sErr);
  }
  if (existing) {
    return failure(409, submissionErrorCodes.alreadySubmitted, 'Submission already exists');
  }

  // 4) Policy checks
  const submitCheck = canSubmit({
    assignmentStatus: assignment.status,
    dueDate: assignment.due_date,
    allowLate: assignment.allow_late,
  });
  if (!submitCheck.allowed) {
    if (submitCheck.reason === 'NOT_PUBLISHED') {
      return failure(403, submissionErrorCodes.notPublished, 'Assignment is not published');
    }
    if (submitCheck.reason === 'CLOSED') {
      return failure(403, submissionErrorCodes.deadlinePassed, 'Assignment is closed');
    }
    return failure(403, submissionErrorCodes.deadlinePassed, 'Deadline has passed');
  }

  const isLate = new Date() > new Date(assignment.due_date) && assignment.allow_late;

  // 5) Insert submission
  const { data: inserted, error: iErr } = await client
    .from('submissions')
    .insert({
      assignment_id: assignmentId,
      user_id: userId,
      content: payload.content,
      link: payload.link ?? null,
      status: 'submitted',
      is_late: isLate,
    })
    .select('*')
    .single();

  if (iErr || !inserted) {
    return failure(500, submissionErrorCodes.databaseError, 'Failed to create submission', iErr);
  }

  return success(
    {
      id: inserted.id,
      assignmentId: inserted.assignment_id,
      userId: inserted.user_id,
      status: inserted.status,
      isLate: inserted.is_late,
      score: inserted.score,
      feedback: inserted.feedback,
      submittedAt: inserted.submitted_at,
      gradedAt: inserted.graded_at,
    },
    200,
  );
};

export const updateSubmission = async (
  client: SupabaseClient,
  userId: string,
  assignmentId: number,
  payload: SubmitRequest,
): Promise<ServiceResult<Submission>> => {
  // 1) Fetch assignment
  const { data: assignment, error: aErr } = await client
    .from('assignments')
    .select('*')
    .eq('id', assignmentId)
    .single();

  if (aErr || !assignment) {
    return failure(404, submissionErrorCodes.assignmentNotFound, 'Assignment not found', aErr);
  }

  // 2) Verify enrollment
  const { data: enrollment, error: eErr } = await client
    .from('enrollments')
    .select('id')
    .eq('course_id', assignment.course_id)
    .eq('user_id', userId)
    .single();

  if (eErr || !enrollment) {
    return failure(403, submissionErrorCodes.notEnrolled, 'You must be enrolled in this course', eErr);
  }

  // 3) Fetch existing submission
  const { data: existing, error: sErr } = await client
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('user_id', userId)
    .single();

  if (sErr || !existing) {
    return failure(404, submissionErrorCodes.notFound, 'Submission not found', sErr);
  }

  // 4) Policy checks (resubmit + submit window)
  const resCheck = canResubmit({
    submissionStatus: existing.status,
    allowResubmission: assignment.allow_resubmission,
  });
  if (!resCheck.allowed) {
    if (resCheck.reason === 'GRADED_LOCKED') {
      return failure(403, submissionErrorCodes.gradedLocked, 'Submission has been graded');
    }
    return failure(403, submissionErrorCodes.resubmissionNotAllowed, 'Resubmission is not allowed');
  }

  const submitCheck = canSubmit({
    assignmentStatus: assignment.status,
    dueDate: assignment.due_date,
    allowLate: assignment.allow_late,
  });
  if (!submitCheck.allowed) {
    if (submitCheck.reason === 'NOT_PUBLISHED') {
      return failure(403, submissionErrorCodes.notPublished, 'Assignment is not published');
    }
    if (submitCheck.reason === 'CLOSED') {
      return failure(403, submissionErrorCodes.deadlinePassed, 'Assignment is closed');
    }
    return failure(403, submissionErrorCodes.deadlinePassed, 'Deadline has passed');
  }

  const isLate = new Date() > new Date(assignment.due_date) && assignment.allow_late;

  // 5) Update submission
  const { data: updated, error: uErr } = await client
    .from('submissions')
    .update({
      content: payload.content,
      link: payload.link ?? null,
      is_late: isLate,
      status: 'submitted',
    })
    .eq('id', existing.id)
    .select('*')
    .single();

  if (uErr || !updated) {
    return failure(500, submissionErrorCodes.databaseError, 'Failed to update submission', uErr);
  }

  return success(
    {
      id: updated.id,
      assignmentId: updated.assignment_id,
      userId: updated.user_id,
      status: updated.status,
      isLate: updated.is_late,
      score: updated.score,
      feedback: updated.feedback,
      submittedAt: updated.submitted_at,
      gradedAt: updated.graded_at,
    },
    200,
  );
};
