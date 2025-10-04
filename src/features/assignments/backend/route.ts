import type { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { getCourseAssignments, getAssignmentDetail } from './service';
import { assignmentErrorCodes } from './error';
import { AssignmentListResponseSchema, AssignmentDetailSchema } from './schema';

export const registerAssignmentRoutes = (app: Hono<AppEnv>) => {
  // GET /api/courses/:courseId/assignments - List assignments
  app.get('/api/courses/:courseId/assignments', async (c) => {
    const userId = c.get('userId');
    if (!userId) {
      return c.json({ error: assignmentErrorCodes.unauthorized }, 401);
    }

    const courseId = parseInt(c.req.param('courseId'), 10);
    if (isNaN(courseId)) {
      return c.json({ error: 'Invalid course ID' }, 400);
    }

    const client = c.get('supabaseClient');
    const result = await getCourseAssignments(client, courseId, userId);

    if (!result.success) {
      if (result.error === assignmentErrorCodes.notEnrolled) {
        return c.json({ error: result.error }, 403);
      }
      return c.json({ error: result.error }, 500);
    }

    const validated = AssignmentListResponseSchema.parse(result.data);
    return c.json(validated);
  });

  // GET /api/assignments/:id - Assignment detail
  app.get('/api/assignments/:id', async (c) => {
    const userId = c.get('userId');
    if (!userId) {
      return c.json({ error: assignmentErrorCodes.unauthorized }, 401);
    }

    const assignmentId = parseInt(c.req.param('id'), 10);
    if (isNaN(assignmentId)) {
      return c.json({ error: 'Invalid assignment ID' }, 400);
    }

    const client = c.get('supabaseClient');
    const result = await getAssignmentDetail(client, assignmentId, userId);

    if (!result.success) {
      if (result.error === assignmentErrorCodes.notFound) {
        return c.json({ error: result.error }, 404);
      }
      if (result.error === assignmentErrorCodes.notPublished || result.error === assignmentErrorCodes.notEnrolled) {
        return c.json({ error: result.error }, 403);
      }
      return c.json({ error: result.error }, 500);
    }

    const validated = AssignmentDetailSchema.parse(result.data);
    return c.json(validated);
  });
};
