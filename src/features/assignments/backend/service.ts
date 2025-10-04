import type { SupabaseClient } from '@supabase/supabase-js';
import { success, failure, type HandlerResult } from '@/backend/http/response';
import { assignmentErrorCodes, type AssignmentServiceError } from './error';
import type { AssignmentDetail, AssignmentListResponse } from './schema';

/**
 * Get assignments for a course (learner view)
 * BR-001: Only published assignments visible
 * BR-002: Must be enrolled in course
 */
export const getCourseAssignments = async (
  client: SupabaseClient,
  courseId: number,
  userId: string,
): Promise<HandlerResult<AssignmentListResponse, AssignmentServiceError, unknown>> => {
  // 1. Verify enrollment
  const { data: enrollment, error: enrollmentError } = await client
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (enrollmentError || !enrollment) {
    return failure(
      403,
      assignmentErrorCodes.notEnrolled,
      'You must be enrolled in this course',
      enrollmentError,
    );
  }

  // 2. Fetch published assignments for course
  const { data: assignments, error: assignmentsError } = await client
    .from('assignments')
    .select('id, title, due_date, weight, status')
    .eq('course_id', courseId)
    .eq('status', 'published')
    .order('due_date', { ascending: true });

  if (assignmentsError) {
    return failure(
      500,
      assignmentErrorCodes.databaseError,
      'Failed to fetch assignments',
      assignmentsError,
    );
  }

  if (!assignments) {
    return success({ assignments: [] });
  }

  // 3. Check if user has submissions for each assignment
  const assignmentIds = assignments.map((a) => a.id);
  const { data: submissions, error: submissionsError } = await client
    .from('submissions')
    .select('assignment_id, status')
    .in('assignment_id', assignmentIds)
    .eq('user_id', userId);

  if (submissionsError) {
    return failure(
      500,
      assignmentErrorCodes.databaseError,
      'Failed to fetch submissions',
      submissionsError,
    );
  }

  // 4. Create submission map
  const submissionMap = new Map(
    (submissions || []).map((s) => [s.assignment_id, s.status])
  );

  // 5. Return assignment list with submission status
  const assignmentList = assignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    dueDate: assignment.due_date,
    weight: assignment.weight,
    status: assignment.status as 'draft' | 'published' | 'closed',
    hasSubmission: submissionMap.has(assignment.id),
    submissionStatus: submissionMap.get(assignment.id) as 'submitted' | 'graded' | 'resubmission_required' | null || null,
  }));

  return success({ assignments: assignmentList });
};

/**
 * Get assignment detail with submission
 * BR-001: Only published assignments
 * BR-002: Must be enrolled in course
 */
export const getAssignmentDetail = async (
  client: SupabaseClient,
  assignmentId: number,
  userId: string,
): Promise<HandlerResult<AssignmentDetail, AssignmentServiceError, unknown>> => {
  // 1. Fetch assignment
  const { data: assignment, error: assignmentError } = await client
    .from('assignments')
    .select('*')
    .eq('id', assignmentId)
    .single();

  if (assignmentError || !assignment) {
    return {
      success: false,
      error: assignmentErrorCodes.notFound,
      details: assignmentError,
    };
  }

  // 2. Verify assignment is published
  if (assignment.status !== 'published') {
    return {
      success: false,
      error: assignmentErrorCodes.notPublished,
      details: null,
    };
  }

  // 3. Verify user is enrolled in course
  const { data: enrollment, error: enrollmentError } = await client
    .from('enrollments')
    .select('id')
    .eq('course_id', assignment.course_id)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (enrollmentError || !enrollment) {
    return {
      success: false,
      error: assignmentErrorCodes.notEnrolled,
      details: enrollmentError,
    };
  }

  // 4. Fetch user's submission (if exists)
  const { data: submission, error: submissionError } = await client
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('user_id', userId)
    .single();

  // Ignore error if submission doesn't exist
  const submissionData = submissionError ? null : submission;

  // 5. Return assignment with submission data
  return {
    success: true,
    data: {
      id: assignment.id,
      courseId: assignment.course_id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.due_date,
      weight: assignment.weight,
      allowLate: assignment.allow_late,
      allowResubmission: assignment.allow_resubmission,
      status: assignment.status as 'draft' | 'published' | 'closed',
      createdAt: assignment.created_at,
      updatedAt: assignment.updated_at,
      submission: submissionData ? {
        id: submissionData.id,
        content: submissionData.content,
        link: submissionData.link,
        status: submissionData.status as 'submitted' | 'graded' | 'resubmission_required',
        isLate: submissionData.is_late,
        score: submissionData.score,
        feedback: submissionData.feedback,
        submittedAt: submissionData.submitted_at,
        gradedAt: submissionData.graded_at,
      } : null,
    },
  };
};
