import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { getCourseAssignments, getAssignmentDetail } from './service';
import { assignmentErrorCodes } from './error';

export const registerAssignmentRoutes = (app: Hono<AppEnv>) => {
  // GET /api/courses/:courseId/assignments - List assignments (auth required)
  app.get('/api/courses/:courseId/assignments', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const courseIdParam = c.req.param('courseId');
    const courseId = parseInt(courseIdParam, 10);
    if (isNaN(courseId)) {
      return respond(
        c,
        failure(400, assignmentErrorCodes.validationError ?? 'VALIDATION_ERROR', 'Invalid course ID'),
      );
    }

    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return respond(c, failure(401, assignmentErrorCodes.unauthorized, 'Unauthorized'));
    }
    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return respond(c, failure(401, assignmentErrorCodes.unauthorized, 'Unauthorized'));
    }

    const result = await getCourseAssignments(supabase, courseId, user.id);
    if (!result.ok) {
      logger.error('Failed to fetch assignments', JSON.stringify(result));
    }
    return respond(c, result);
  });

  // GET /api/assignments/:id - Assignment detail (auth required)
  app.get('/api/assignments/:id', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const assignmentIdParam = c.req.param('id');
    const assignmentId = parseInt(assignmentIdParam, 10);
    if (isNaN(assignmentId)) {
      return respond(
        c,
        failure(400, assignmentErrorCodes.validationError ?? 'VALIDATION_ERROR', 'Invalid assignment ID'),
      );
    }

    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return respond(c, failure(401, assignmentErrorCodes.unauthorized, 'Unauthorized'));
    }
    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return respond(c, failure(401, assignmentErrorCodes.unauthorized, 'Unauthorized'));
    }

    const result = await getAssignmentDetail(supabase, assignmentId, user.id);
    if (!result.ok) {
      logger.error('Failed to fetch assignment detail', JSON.stringify(result));
    }
    return respond(c, result);
  });
};
