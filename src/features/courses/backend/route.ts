import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { CourseListQuerySchema } from './schema';
import { getCourses, getCourseById } from './service';
import { courseErrorCodes } from './error';

export const registerCourseRoutes = (app: Hono<AppEnv>) => {
  // GET /api/courses - List courses
  app.get('/api/courses', async (c) => {
    const queryParams = c.req.query();
    const parsedQuery = CourseListQuerySchema.safeParse(queryParams);

    if (!parsedQuery.success) {
      return respond(
        c,
        failure(
          400,
          courseErrorCodes.invalidQuery,
          'Invalid query parameters',
          parsedQuery.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Try to get userId from auth context (optional)
    const authHeader = c.req.header('Authorization');
    let userId: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    const result = await getCourses(supabase, parsedQuery.data, userId);

    if (!result.ok) {
      logger.error('Failed to fetch courses', JSON.stringify(result));
    }

    return respond(c, result);
  });

  // GET /api/courses/:id - Course detail
  app.get('/api/courses/:id', async (c) => {
    const courseIdParam = c.req.param('id');
    const courseId = parseInt(courseIdParam, 10);

    if (isNaN(courseId)) {
      return respond(
        c,
        failure(400, courseErrorCodes.invalidQuery, 'Invalid course ID'),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Try to get userId from auth context (optional)
    const authHeader = c.req.header('Authorization');
    let userId: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    const result = await getCourseById(supabase, courseId, userId);

    if (!result.ok) {
      logger.error('Failed to fetch course detail', JSON.stringify(result));
    }

    return respond(c, result);
  });
};
