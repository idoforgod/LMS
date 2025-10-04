import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { assignmentManageErrorCodes, type AssignmentManageError } from './manage.error';
import type {
  ChangeAssignmentStatusRequest,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
} from './manage.schema';

const ensureCourseOwnership = async (
  client: SupabaseClient,
  instructorId: string,
  courseId: number,
) => {
  const { data, error } = await client
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('instructor_id', instructorId)
    .single();
  return { ok: !!data && !error, error } as const;
};

export const listInstructorAssignments = async (
  client: SupabaseClient,
  instructorId: string,
  courseId: number,
): Promise<HandlerResult<{ assignments: any[] }, AssignmentManageError, unknown>> => {
  const own = await ensureCourseOwnership(client, instructorId, courseId);
  if (!own.ok) {
    return failure(403, assignmentManageErrorCodes.forbidden, 'Forbidden', own.error);
  }

  const { data, error } = await client
    .from('assignments')
    .select('id, title, status, due_date, weight, updated_at')
    .eq('course_id', courseId)
    .order('updated_at', { ascending: false });

  if (error) {
    return failure(500, assignmentManageErrorCodes.databaseError, 'Failed to fetch assignments', error);
  }

  const assignments = (data ?? []).map((a) => ({
    id: a.id as number,
    title: a.title as string,
    status: a.status as 'draft' | 'published' | 'closed',
    dueDate: new Date(a.due_date as string).toISOString(),
    weight: Number(a.weight),
    updatedAt: new Date(a.updated_at as string).toISOString(),
  }));

  return success({ assignments }, 200);
};

export const createAssignment = async (
  client: SupabaseClient,
  instructorId: string,
  courseId: number,
  payload: CreateAssignmentRequest,
): Promise<HandlerResult<any, AssignmentManageError, unknown>> => {
  const own = await ensureCourseOwnership(client, instructorId, courseId);
  if (!own.ok) {
    return failure(403, assignmentManageErrorCodes.forbidden, 'Forbidden', own.error);
  }

  if (!payload.title || payload.title.trim().length === 0) {
    return failure(400, assignmentManageErrorCodes.validationError, 'Title is required');
  }

  const { data, error } = await client
    .from('assignments')
    .insert({
      course_id: courseId,
      title: payload.title,
      description: payload.description ?? null,
      due_date: payload.dueDate,
      weight: payload.weight,
      allow_late: payload.allowLate,
      allow_resubmission: payload.allowResubmission,
      status: 'draft',
    })
    .select('id, title, status, due_date, weight, updated_at')
    .single();

  if (error || !data) {
    return failure(500, assignmentManageErrorCodes.databaseError, 'Failed to create assignment', error);
  }

  return success(
    {
      id: data.id as number,
      title: data.title as string,
      status: data.status as 'draft' | 'published' | 'closed',
      dueDate: new Date(data.due_date as string).toISOString(),
      weight: Number(data.weight),
      updatedAt: new Date(data.updated_at as string).toISOString(),
    },
    201,
  );
};

const ensureAssignmentOwnership = async (
  client: SupabaseClient,
  instructorId: string,
  assignmentId: number,
) => {
  const { data, error } = await client
    .from('assignments')
    .select('id, course_id')
    .eq('id', assignmentId)
    .single();
  if (error || !data) return { ok: false, error } as const;
  const { data: course, error: cErr } = await client
    .from('courses')
    .select('id')
    .eq('id', data.course_id)
    .eq('instructor_id', instructorId)
    .single();
  return { ok: !!course && !cErr, error: cErr } as const;
};

export const updateAssignment = async (
  client: SupabaseClient,
  instructorId: string,
  assignmentId: number,
  payload: UpdateAssignmentRequest,
): Promise<HandlerResult<any, AssignmentManageError, unknown>> => {
  const own = await ensureAssignmentOwnership(client, instructorId, assignmentId);
  if (!own.ok) {
    return failure(404, assignmentManageErrorCodes.notFound, 'Assignment not found', own.error);
  }

  const { data, error } = await client
    .from('assignments')
    .update({
      description: payload.description ?? null,
      due_date: payload.dueDate,
      weight: payload.weight,
      allow_late: payload.allowLate,
      allow_resubmission: payload.allowResubmission,
    })
    .eq('id', assignmentId)
    .select('id, title, status, due_date, weight, updated_at')
    .single();

  if (error || !data) {
    return failure(500, assignmentManageErrorCodes.databaseError, 'Failed to update assignment', error);
  }

  return success(
    {
      id: data.id as number,
      title: data.title as string,
      status: data.status as 'draft' | 'published' | 'closed',
      dueDate: new Date(data.due_date as string).toISOString(),
      weight: Number(data.weight),
      updatedAt: new Date(data.updated_at as string).toISOString(),
    },
    200,
  );
};

const validTransition = (
  from: 'draft' | 'published' | 'closed',
  to: 'draft' | 'published' | 'closed',
) => (from === 'draft' && to === 'published') || (from === 'published' && to === 'closed');

export const changeAssignmentStatus = async (
  client: SupabaseClient,
  instructorId: string,
  assignmentId: number,
  payload: ChangeAssignmentStatusRequest,
): Promise<HandlerResult<any, AssignmentManageError, unknown>> => {
  const own = await ensureAssignmentOwnership(client, instructorId, assignmentId);
  if (!own.ok) {
    return failure(404, assignmentManageErrorCodes.notFound, 'Assignment not found', own.error);
  }

  const { data: current, error: cErr } = await client
    .from('assignments')
    .select('status')
    .eq('id', assignmentId)
    .single();
  if (cErr || !current) {
    return failure(500, assignmentManageErrorCodes.databaseError, 'Failed to load assignment', cErr);
  }

  const from = current.status as 'draft' | 'published' | 'closed';
  if (!validTransition(from, payload.to)) {
    return failure(400, assignmentManageErrorCodes.invalidStatusTransition, 'Invalid status transition');
  }

  const { data, error } = await client
    .from('assignments')
    .update({ status: payload.to })
    .eq('id', assignmentId)
    .select('id, title, status, due_date, weight, updated_at')
    .single();

  if (error || !data) {
    return failure(500, assignmentManageErrorCodes.databaseError, 'Failed to change status', error);
  }

  return success(
    {
      id: data.id as number,
      title: data.title as string,
      status: data.status as 'draft' | 'published' | 'closed',
      dueDate: new Date(data.due_date as string).toISOString(),
      weight: Number(data.weight),
      updatedAt: new Date(data.updated_at as string).toISOString(),
    },
    200,
  );
};
