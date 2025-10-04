import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import type {
  CourseListQuery,
  CourseListResponse,
  CourseDetail,
} from './schema';
import { courseErrorCodes, type CourseServiceError } from './error';
import { calculatePagination, createPaginationMeta } from '@/lib/pagination';

/**
 * Get published courses with filters, search, and pagination
 */
export const getCourses = async (
  client: SupabaseClient,
  query: CourseListQuery,
  userId?: string,
): Promise<HandlerResult<CourseListResponse, CourseServiceError, unknown>> => {
  try {
    const pagination = calculatePagination({
      page: query.page,
      pageSize: query.pageSize,
    });

    // Build base query with published filter
    let baseQuery = client
      .from('courses')
      .select(
        `
        id,
        title,
        description,
        curriculum,
        status,
        created_at,
        updated_at,
        category:categories(id, name),
        difficulty:difficulties(id, name),
        instructor:profiles!courses_instructor_id_fkey(id, name)
      `,
        { count: 'exact' },
      )
      .eq('status', 'published');

    // Apply search filter
    if (query.search) {
      baseQuery = baseQuery.or(
        `title.ilike.%${query.search}%,description.ilike.%${query.search}%`,
      );
    }

    // Apply category filter
    if (query.category) {
      baseQuery = baseQuery.eq('category_id', query.category);
    }

    // Apply difficulty filter
    if (query.difficulty) {
      baseQuery = baseQuery.eq('difficulty_id', query.difficulty);
    }

    // Apply sorting
    if (query.sort === 'latest') {
      baseQuery = baseQuery.order('created_at', { ascending: false });
    } else if (query.sort === 'popular') {
      // For popularity, we'll use created_at for now
      // In a real system, you'd join with enrollments and count
      baseQuery = baseQuery.order('created_at', { ascending: false });
    }

    // Apply pagination
    baseQuery = baseQuery.range(
      pagination.offset,
      pagination.offset + pagination.limit - 1,
    );

    const { data: courses, error, count } = await baseQuery;

    if (error) {
      return failure(
        500,
        courseErrorCodes.databaseError,
        error.message,
        error,
      );
    }

    if (!courses) {
      return failure(500, courseErrorCodes.databaseError, 'No data returned');
    }

    // Check enrollment status for each course if userId provided
    let enrollmentMap: Record<number, boolean> = {};
    if (userId && courses.length > 0) {
      const courseIds = courses.map((c) => c.id);
      const { data: enrollments } = await client
        .from('enrollments')
        .select('course_id')
        .eq('user_id', userId)
        .in('course_id', courseIds);

      if (enrollments) {
        enrollmentMap = enrollments.reduce(
          (acc, e) => {
            acc[e.course_id] = true;
            return acc;
          },
          {} as Record<number, boolean>,
        );
      }
    }

    // Transform data
    const transformedCourses: CourseDetail[] = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      category: Array.isArray(course.category) ? null : (course.category as { id: number; name: string } | null),
      difficulty: Array.isArray(course.difficulty) ? null : (course.difficulty as { id: number; name: string } | null),
      instructor: Array.isArray(course.instructor) ? { id: '', name: '' } : (course.instructor as { id: string; name: string }),
      curriculum: course.curriculum,
      status: course.status as 'draft' | 'published' | 'archived',
      isEnrolled: enrollmentMap[course.id] || false,
      created_at: course.created_at,
      updated_at: course.updated_at,
    }));

    const response: CourseListResponse = {
      courses: transformedCourses,
      pagination: createPaginationMeta(count || 0, pagination),
    };

    return success(response, 200);
  } catch (err) {
    return failure(
      500,
      courseErrorCodes.databaseError,
      'Internal server error',
      err,
    );
  }
};

/**
 * Get course detail by ID with enrollment status for user
 */
export const getCourseById = async (
  client: SupabaseClient,
  courseId: number,
  userId?: string,
): Promise<HandlerResult<CourseDetail, CourseServiceError, unknown>> => {
  try {
    const { data: course, error } = await client
      .from('courses')
      .select(
        `
        id,
        title,
        description,
        curriculum,
        status,
        created_at,
        updated_at,
        category:categories(id, name),
        difficulty:difficulties(id, name),
        instructor:profiles!courses_instructor_id_fkey(id, name)
      `,
      )
      .eq('id', courseId)
      .single();

    if (error || !course) {
      return failure(404, courseErrorCodes.notFound, 'Course not found');
    }

    // Check if user is enrolled
    let isEnrolled = false;
    if (userId) {
      const { data: enrollment } = await client
        .from('enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      isEnrolled = !!enrollment;
    }

    const detail: CourseDetail = {
      id: course.id,
      title: course.title,
      description: course.description,
      category: Array.isArray(course.category) ? null : (course.category as { id: number; name: string } | null),
      difficulty: Array.isArray(course.difficulty) ? null : (course.difficulty as { id: number; name: string } | null),
      instructor: Array.isArray(course.instructor) ? { id: '', name: '' } : (course.instructor as { id: string; name: string }),
      curriculum: course.curriculum,
      status: course.status as 'draft' | 'published' | 'archived',
      isEnrolled,
      created_at: course.created_at,
      updated_at: course.updated_at,
    };

    return success(detail, 200);
  } catch (err) {
    return failure(
      500,
      courseErrorCodes.databaseError,
      'Internal server error',
      err,
    );
  }
};
