import type { SupabaseClient } from '@supabase/supabase-js';
import { addHours } from 'date-fns';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { DEFAULT_FEEDBACK_LIMIT, DEFAULT_IMMINENT_HOURS } from '@/features/dashboard/constants';
import {
  DashboardSummarySchema,
  type DashboardSummary,
} from './schema';
import { dashboardErrorCodes, type DashboardServiceError } from './error';

type ServiceOptions = {
  hours?: number;
  limit?: number;
};

export const getDashboardSummary = async (
  client: SupabaseClient,
  userId: string,
  options: ServiceOptions = {},
): Promise<HandlerResult<DashboardSummary, DashboardServiceError, unknown>> => {
  try {
    const hours = options.hours ?? DEFAULT_IMMINENT_HOURS;
    const limit = options.limit ?? DEFAULT_FEEDBACK_LIMIT;

    // 1) Find user enrollments → course ids
    const { data: enrollments, error: enrollErr } = await client
      .from('enrollments')
      .select('course_id')
      .eq('user_id', userId);

    if (enrollErr) {
      return failure(500, dashboardErrorCodes.database_error, enrollErr.message, enrollErr);
    }

    const courseIds = (enrollments ?? []).map((e) => e.course_id);

    if (courseIds.length === 0) {
      const empty = DashboardSummarySchema.parse({
        myCourses: [],
        imminentAssignments: [],
        recentFeedback: [],
      });
      return success(empty, 200);
    }

    // 2) Courses basic info
    const { data: courses, error: coursesErr } = await client
      .from('courses')
      .select('id, title')
      .in('id', courseIds);

    if (coursesErr) {
      return failure(500, dashboardErrorCodes.database_error, coursesErr.message, coursesErr);
    }

    // 3) Published assignments for these courses
    const { data: assignments, error: asgErr } = await client
      .from('assignments')
      .select('id, course_id, title, due_date, status')
      .in('course_id', courseIds)
      .eq('status', 'published');

    if (asgErr) {
      return failure(500, dashboardErrorCodes.database_error, asgErr.message, asgErr);
    }

    const assignmentIds = (assignments ?? []).map((a) => a.id);

    // 4) User submissions for those assignments
    const { data: submissions, error: subErr } = await client
      .from('submissions')
      .select('id, assignment_id, status, score, feedback, graded_at')
      .eq('user_id', userId)
      .in('assignment_id', assignmentIds.length > 0 ? assignmentIds : [-1]);

    if (subErr) {
      return failure(500, dashboardErrorCodes.database_error, subErr.message, subErr);
    }

    // Helper maps
    const assignmentsByCourse = new Map<number, { id: number; course_id: number; title: string; due_date: string }[]>();
    for (const a of assignments ?? []) {
      if (Array.isArray(assignmentsByCourse.get(a.course_id))) {
        assignmentsByCourse.get(a.course_id)!.push({ id: a.id, course_id: a.course_id, title: a.title, due_date: a.due_date });
      } else {
        assignmentsByCourse.set(a.course_id, [{ id: a.id, course_id: a.course_id, title: a.title, due_date: a.due_date }]);
      }
    }

    const submissionByAssignment = new Map<number, { status: string; score: number | null; feedback: string | null; graded_at: string | null }>();
    for (const s of submissions ?? []) {
      submissionByAssignment.set(s.assignment_id, {
        status: s.status as string,
        score: (s.score as unknown as number) ?? null,
        feedback: (s.feedback as unknown as string) ?? null,
        graded_at: (s.graded_at as unknown as string) ?? null,
      });
    }

    // 5) Progress per course
    const myCourses = (courses ?? []).map((c) => {
      const asgs = assignmentsByCourse.get(c.id) ?? [];
      const total = asgs.length;
      const completed = asgs.filter((a) => {
        const sub = submissionByAssignment.get(a.id);
        return sub && (sub.status === 'graded' || sub.status === 'submitted');
      }).length;
      const progress = total === 0 ? 0 : completed / total;
      return { courseId: c.id as number, title: c.title as string, progress };
    });

    // 6) Imminent assignments within window and not completed
    const now = new Date();
    const windowEnd = addHours(now, hours);
    const imminentAssignments = (assignments ?? [])
      .filter((a) => {
        const due = new Date(a.due_date);
        const sub = submissionByAssignment.get(a.id);
        const notCompleted = !(sub && (sub.status === 'graded' || sub.status === 'submitted'));
        return due.getTime() >= now.getTime() && due.getTime() <= windowEnd.getTime() && notCompleted;
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .map((a) => ({ assignmentId: a.id as number, courseId: a.course_id as number, title: a.title as string, dueDate: new Date(a.due_date).toISOString() }));

    // 7) Recent feedback (graded submissions)
    const graded = (submissions ?? [])
      .filter((s) => s.status === 'graded' && s.graded_at)
      .sort((a, b) => new Date(b.graded_at as string).getTime() - new Date(a.graded_at as string).getTime())
      .slice(0, limit);

    const assignmentCourseMap = new Map<number, number>();
    for (const a of assignments ?? []) assignmentCourseMap.set(a.id, a.course_id);

    const recentFeedback = graded.map((s) => ({
      assignmentId: s.assignment_id as number,
      courseId: assignmentCourseMap.get(s.assignment_id) ?? 0,
      score: (s.score as unknown as number) ?? null,
      feedback: (s.feedback as unknown as string) ?? null,
      gradedAt: new Date(s.graded_at as string).toISOString(),
    }));

    const data = DashboardSummarySchema.parse({
      myCourses,
      imminentAssignments,
      recentFeedback,
    });

    return success(data, 200);
  } catch (err) {
    return failure(500, dashboardErrorCodes.database_error, 'Internal server error', err);
  }
};
