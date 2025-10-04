import type { SupabaseClient } from '@supabase/supabase-js';
import { success, failure, type HandlerResult } from '@/backend/http/response';
import { instructorDashboardErrorCodes, type InstructorDashboardError } from './error';
import type { InstructorDashboardResponse } from './schema';

export const getInstructorDashboard = async (
  client: SupabaseClient,
  userId: string,
  limit: number,
): Promise<
  HandlerResult<InstructorDashboardResponse, InstructorDashboardError, unknown>
> => {
  // 1) Fetch courses owned by instructor
  const { data: courses, error: cErr } = await client
    .from('courses')
    .select('id, title, status')
    .eq('instructor_id', userId);

  if (cErr) {
    return failure(
      500,
      instructorDashboardErrorCodes.databaseError,
      'Failed to fetch courses',
      cErr,
    );
  }

  const courseIds = (courses ?? []).map((c) => c.id);

  if (courseIds.length === 0) {
    return success({ courses: [], pendingCounts: [], recent: [] }, 200);
  }

  // 2) Fetch assignments for these courses
  const { data: assignments, error: aErr } = await client
    .from('assignments')
    .select('id, course_id, title')
    .in('course_id', courseIds);

  if (aErr) {
    return failure(
      500,
      instructorDashboardErrorCodes.databaseError,
      'Failed to fetch assignments',
      aErr,
    );
  }

  const assignmentIds = (assignments ?? []).map((a) => a.id);
  const assignmentToCourse = new Map<number, number>();
  const assignmentTitle = new Map<number, string>();
  for (const a of assignments ?? []) {
    assignmentToCourse.set(a.id as number, a.course_id as number);
    assignmentTitle.set(a.id as number, a.title as string);
  }

  // 3) Pending submissions count per course (status='submitted')
  let pendingCounts: { courseId: number; pending: number }[] = [];
  if (assignmentIds.length > 0) {
    const { data: pendings, error: pErr } = await client
      .from('submissions')
      .select('assignment_id')
      .in('assignment_id', assignmentIds)
      .eq('status', 'submitted');

    if (pErr) {
      return failure(
        500,
        instructorDashboardErrorCodes.databaseError,
        'Failed to aggregate pending submissions',
        pErr,
      );
    }

    const countByCourse = new Map<number, number>();
    for (const s of pendings ?? []) {
      const courseId = assignmentToCourse.get(s.assignment_id as number);
      if (typeof courseId === 'number') {
        countByCourse.set(courseId, (countByCourse.get(courseId) ?? 0) + 1);
      }
    }

    pendingCounts = courseIds.map((cid) => ({
      courseId: cid as number,
      pending: countByCourse.get(cid as number) ?? 0,
    }));
  }

  // 4) Recent submissions (ordered by graded_at or submitted_at desc)
  let recent: { assignmentId: number; courseId: number; title: string; status: 'submitted'|'graded'|'resubmission_required'; submittedAt: string; gradedAt: string | null }[] = [];
  if (assignmentIds.length > 0) {
    const { data: recents, error: rErr } = await client
      .from('submissions')
      .select('assignment_id, status, submitted_at, graded_at')
      .in('assignment_id', assignmentIds)
      .order('graded_at', { ascending: false, nullsFirst: false })
      .order('submitted_at', { ascending: false })
      .limit(limit);

    if (rErr) {
      return failure(
        500,
        instructorDashboardErrorCodes.databaseError,
        'Failed to fetch recent submissions',
        rErr,
      );
    }

    recent = (recents ?? []).map((s) => ({
      assignmentId: s.assignment_id as number,
      courseId: assignmentToCourse.get(s.assignment_id as number) ?? 0,
      title: assignmentTitle.get(s.assignment_id as number) ?? '',
      status: s.status as 'submitted' | 'graded' | 'resubmission_required',
      submittedAt: new Date(s.submitted_at as string).toISOString(),
      gradedAt: s.graded_at ? new Date(s.graded_at as string).toISOString() : null,
    }));
  }

  return success(
    {
      courses: (courses ?? []).map((c) => ({
        id: c.id as number,
        title: c.title as string,
        status: c.status as 'draft' | 'published' | 'archived',
      })),
      pendingCounts,
      recent,
    },
    200,
  );
};

