import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { EnrollRequestSchema } from './schema';
import { enrollInCourse, cancelEnrollment } from './service';
import { enrollmentErrorCodes } from './error';

export const registerEnrollmentRoutes = (app: Hono<AppEnv>) => {
  // POST /api/enrollments - Enroll in course
  app.post('/api/enrollments', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Extract userId from auth context
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return respond(
        c,
        failure(401, enrollmentErrorCodes.unauthorized, 'Unauthorized'),
      );
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return respond(
        c,
        failure(401, enrollmentErrorCodes.unauthorized, 'Unauthorized'),
      );
    }

    // Check user role is 'learner' (BR-006)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'learner') {
      return respond(
        c,
        failure(
          403,
          enrollmentErrorCodes.unauthorized,
          'This feature is only available for learners',
        ),
      );
    }

    // Parse request body
    const body = await c.req.json();
    const parsedBody = EnrollRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          enrollmentErrorCodes.validationError,
          'Invalid request body',
          parsedBody.error.format(),
        ),
      );
    }

    const result = await enrollInCourse(
      supabase,
      user.id,
      parsedBody.data.courseId,
    );

    if (!result.ok) {
      logger.error('Enrollment failed', JSON.stringify(result));
    } else {
      logger.info('User enrolled successfully', {
        userId: user.id,
        courseId: parsedBody.data.courseId,
      });
    }

    return respond(c, result);
  });

  // DELETE /api/enrollments/:courseId - Cancel enrollment
  app.delete('/api/enrollments/:courseId', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Extract userId from auth context
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return respond(
        c,
        failure(401, enrollmentErrorCodes.unauthorized, 'Unauthorized'),
      );
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return respond(
        c,
        failure(401, enrollmentErrorCodes.unauthorized, 'Unauthorized'),
      );
    }

    // Parse courseId from params
    const courseIdParam = c.req.param('courseId');
    const courseId = parseInt(courseIdParam, 10);

    if (isNaN(courseId)) {
      return respond(
        c,
        failure(
          400,
          enrollmentErrorCodes.validationError,
          'Invalid course ID',
        ),
      );
    }

    const result = await cancelEnrollment(supabase, user.id, courseId);

    if (!result.ok) {
      logger.error('Enrollment cancellation failed', JSON.stringify(result));
    } else {
      logger.info('Enrollment cancelled successfully', {
        userId: user.id,
        courseId,
      });
    }

    return respond(c, result);
  });
};
