import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import type { EnrollResponse, CancelEnrollmentResponse } from './schema';
import {
  enrollmentErrorCodes,
  type EnrollmentServiceError,
} from './error';

/**
 * Enroll user in a course
 * BR-001: Only published courses
 * BR-002: Prevent duplicate enrollment
 */
export const enrollInCourse = async (
  client: SupabaseClient,
  userId: string,
  courseId: number,
): Promise<
  HandlerResult<EnrollResponse, EnrollmentServiceError, unknown>
> => {
  try {
    // 1. Check if course exists and is published
    const { data: course, error: courseError } = await client
      .from('courses')
      .select('id, status')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return failure(
        404,
        enrollmentErrorCodes.courseNotFound,
        'Course not found',
      );
    }

    if (course.status !== 'published') {
      return failure(
        400,
        enrollmentErrorCodes.courseNotPublished,
        'This course is not available for enrollment',
      );
    }

    // 2. Check if already enrolled
    const { data: existingEnrollment } = await client
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      return failure(
        409,
        enrollmentErrorCodes.alreadyEnrolled,
        'You are already enrolled in this course',
      );
    }

    // 3. Insert enrollment record
    const { data: enrollment, error: enrollError } = await client
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
      })
      .select('id, user_id, course_id, enrolled_at')
      .single();

    if (enrollError || !enrollment) {
      return failure(
        500,
        enrollmentErrorCodes.databaseError,
        'Failed to create enrollment',
        enrollError,
      );
    }

    // 4. Return enrollment data
    const response: EnrollResponse = {
      id: enrollment.id,
      courseId: enrollment.course_id,
      userId: enrollment.user_id,
      enrolledAt: enrollment.enrolled_at,
    };

    return success(response, 201);
  } catch (err) {
    return failure(
      500,
      enrollmentErrorCodes.databaseError,
      'Internal server error',
      err,
    );
  }
};

/**
 * Cancel enrollment (delete record)
 * BR-004: Maintain audit trail, exclude from grade calculation
 */
export const cancelEnrollment = async (
  client: SupabaseClient,
  userId: string,
  courseId: number,
): Promise<
  HandlerResult<CancelEnrollmentResponse, EnrollmentServiceError, unknown>
> => {
  try {
    // 1. Check if enrollment exists
    const { data: enrollment, error: fetchError } = await client
      .from('enrollments')
      .select('id, user_id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (fetchError || !enrollment) {
      return failure(
        404,
        enrollmentErrorCodes.notEnrolled,
        'You are not enrolled in this course',
      );
    }

    // 2. Verify ownership (user can only cancel their own enrollment)
    if (enrollment.user_id !== userId) {
      return failure(
        403,
        enrollmentErrorCodes.unauthorized,
        'Unauthorized to cancel this enrollment',
      );
    }

    // 3. Delete enrollment record
    const { error: deleteError } = await client
      .from('enrollments')
      .delete()
      .eq('id', enrollment.id);

    if (deleteError) {
      return failure(
        500,
        enrollmentErrorCodes.databaseError,
        'Failed to cancel enrollment',
        deleteError,
      );
    }

    // 4. Return success response
    const response: CancelEnrollmentResponse = {
      success: true,
      message: 'Enrollment cancelled successfully',
    };

    return success(response, 200);
  } catch (err) {
    return failure(
      500,
      enrollmentErrorCodes.databaseError,
      'Internal server error',
      err,
    );
  }
};
