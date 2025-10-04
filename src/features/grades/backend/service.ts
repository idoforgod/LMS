import type { SupabaseClient } from '@supabase/supabase-js';
import { success, failure, type HandlerResult } from '@/backend/http/response';
import { gradesErrorCodes, type GradesServiceError } from './error';
import type { GradesResponse } from './schema';

export const getGrades = async (
  client: SupabaseClient,
  userId: string,
  courseId: number,
): Promise<HandlerResult<GradesResponse, GradesServiceError, unknown>> => {
  // 1) Verify enrollment
  const { data: enrollment, error: enrollErr } = await client
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (enrollErr) {
    return failure(500, gradesErrorCodes.databaseError, 'Failed to verify enrollment', enrollErr);
  }
  if (!enrollment) {
    return failure(403, gradesErrorCodes.notEnrolled, 'You must be enrolled in this course');
  }

  // 2) Fetch assignments for course (any status, 포함: graded 대상 파악용)
  const { data: assignments, error: asgErr } = await client
    .from('assignments')
    .select('id, title, weight, due_date')
    .eq('course_id', courseId);

  if (asgErr) {
    return failure(500, gradesErrorCodes.databaseError, 'Failed to fetch assignments', asgErr);
  }

  const assignmentIds = (assignments ?? []).map((a) => a.id);

  // 3) Fetch submissions for user for those assignments
  const { data: submissions, error: subErr } = await client
    .from('submissions')
    .select('assignment_id, status, is_late, score, feedback, submitted_at, graded_at')
    .eq('user_id', userId)
    .in('assignment_id', assignmentIds.length > 0 ? assignmentIds : [-1]);

  if (subErr) {
    return failure(500, gradesErrorCodes.databaseError, 'Failed to fetch submissions', subErr);
  }

  const subByAssignment = new Map<number, {
    status: 'submitted'|'graded'|'resubmission_required';
    is_late: boolean;
    score: number | null;
    feedback: string | null;
    submitted_at: string;
    graded_at: string | null;
  }>();
  for (const s of submissions ?? []) {
    subByAssignment.set(s.assignment_id as number, {
      status: s.status as 'submitted'|'graded'|'resubmission_required',
      is_late: (s.is_late as unknown as boolean) ?? false,
      score: (s.score as unknown as number) ?? null,
      feedback: (s.feedback as unknown as string) ?? null,
      submitted_at: (s.submitted_at as unknown as string) ?? null as unknown as string,
      graded_at: (s.graded_at as unknown as string | null) ?? null,
    });
  }

  // 4) Build items and compute total
  let total = 0;
  const items = (assignments ?? []).map((a) => {
    const sub = subByAssignment.get(a.id);
    const weightNum = Number(a.weight);
    const scoreNum = sub?.score ?? 0;
    // sum only numeric
    if (!Number.isNaN(weightNum) && !Number.isNaN(Number(scoreNum))) {
      total += (Number(scoreNum) * weightNum) / 100;
    }
    return {
      assignmentId: a.id as number,
      title: a.title as string,
      weight: weightNum,
      status: sub?.status ?? null,
      isLate: sub?.is_late ?? null,
      score: sub?.score ?? null,
      feedback: sub?.feedback ?? null,
      submittedAt: sub?.submitted_at ?? null,
      gradedAt: sub?.graded_at ?? null,
    };
  });

  return success({ courseId, total, items }, 200);
};

