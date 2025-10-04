import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { courseErrorCodes, type CourseServiceError } from './error';
import type {
  ChangeCourseStatusRequest,
  CreateCourseRequest,
  InstructorCourse,
  UpdateCourseRequest,
} from './manage.schema';

export const listInstructorCourses = async (
  client: SupabaseClient,
  instructorId: string,
): Promise<HandlerResult<{ courses: InstructorCourse[] }, CourseServiceError>> => {
  const { data, error } = await client
    .from('courses')
    .select('id, title, status, updated_at')
    .eq('instructor_id', instructorId)
    .order('updated_at', { ascending: false });

  if (error) {
    return failure(500, courseErrorCodes.databaseError, 'Failed to fetch courses', error);
  }

  const courses: InstructorCourse[] = (data ?? []).map((c) => ({
    id: c.id as number,
    title: c.title as string,
    status: c.status as 'draft' | 'published' | 'archived',
    updatedAt: c.updated_at as string,
  }));

  return success({ courses }, 200);
};

export const createCourse = async (
  client: SupabaseClient,
  instructorId: string,
  payload: CreateCourseRequest,
): Promise<HandlerResult<InstructorCourse, CourseServiceError>> => {
  if (!payload.title || payload.title.trim().length === 0) {
    return failure(400, courseErrorCodes.validationError, 'Title is required');
  }

  const { data, error } = await client
    .from('courses')
    .insert({
      instructor_id: instructorId,
      title: payload.title,
      description: payload.description ?? null,
      category_id: payload.categoryId ?? null,
      difficulty_id: payload.difficultyId ?? null,
      curriculum: payload.curriculum ?? null,
      status: 'draft',
    })
    .select('id, title, status, updated_at')
    .single();

  if (error || !data) {
    return failure(500, courseErrorCodes.databaseError, 'Failed to create course', error);
  }

  return success(
    {
      id: data.id as number,
      title: data.title as string,
      status: data.status as 'draft' | 'published' | 'archived',
      updatedAt: data.updated_at as string,
    },
    201,
  );
};

export const updateCourse = async (
  client: SupabaseClient,
  instructorId: string,
  courseId: number,
  payload: UpdateCourseRequest,
): Promise<HandlerResult<InstructorCourse, CourseServiceError>> => {
  // Ensure ownership
  const { data: owned, error: ownErr } = await client
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('instructor_id', instructorId)
    .single();

  if (ownErr || !owned) {
    return failure(404, courseErrorCodes.notFound, 'Course not found', ownErr);
  }

  const { data, error } = await client
    .from('courses')
    .update({
      title: payload.title,
      description: payload.description ?? null,
      category_id: payload.categoryId ?? null,
      difficulty_id: payload.difficultyId ?? null,
      curriculum: payload.curriculum ?? null,
    })
    .eq('id', courseId)
    .eq('instructor_id', instructorId)
    .select('id, title, status, updated_at')
    .single();

  if (error || !data) {
    return failure(500, courseErrorCodes.databaseError, 'Failed to update course', error);
  }

  return success(
    {
      id: data.id as number,
      title: data.title as string,
      status: data.status as 'draft' | 'published' | 'archived',
      updatedAt: data.updated_at as string,
    },
    200,
  );
};

const isValidTransition = (
  from: 'draft' | 'published' | 'archived',
  to: 'draft' | 'published' | 'archived',
) => {
  return (
    (from === 'draft' && to === 'published') ||
    (from === 'published' && to === 'archived')
  );
};

export const changeCourseStatus = async (
  client: SupabaseClient,
  instructorId: string,
  courseId: number,
  payload: ChangeCourseStatusRequest,
): Promise<HandlerResult<InstructorCourse, CourseServiceError>> => {
  const { to } = payload;

  const { data: course, error: cErr } = await client
    .from('courses')
    .select('id, status, title, updated_at')
    .eq('id', courseId)
    .eq('instructor_id', instructorId)
    .single();

  if (cErr || !course) {
    return failure(404, courseErrorCodes.notFound, 'Course not found', cErr);
  }

  const from = course.status as 'draft' | 'published' | 'archived';
  if (!isValidTransition(from, to)) {
    return failure(400, courseErrorCodes.invalidStatusTransition, 'Invalid status transition');
  }

  const { data, error } = await client
    .from('courses')
    .update({ status: to })
    .eq('id', courseId)
    .eq('instructor_id', instructorId)
    .select('id, title, status, updated_at')
    .single();

  if (error || !data) {
    return failure(500, courseErrorCodes.databaseError, 'Failed to change status', error);
  }

  return success(
    {
      id: data.id as number,
      title: data.title as string,
      status: data.status as 'draft' | 'published' | 'archived',
      updatedAt: data.updated_at as string,
    },
    200,
  );
};

