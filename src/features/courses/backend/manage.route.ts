import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { courseErrorCodes } from './error';
import {
  ChangeCourseStatusSchema,
  CreateCourseRequestSchema,
  InstructorCoursesResponseSchema,
  UpdateCourseRequestSchema,
} from './manage.schema';
import {
  changeCourseStatus,
  createCourse,
  listInstructorCourses,
  updateCourse,
} from './manage.service';

const requireInstructor = async (c: import('@/backend/hono/context').AppContext) => {
  const supabase = getSupabase(c);
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: failure(401, courseErrorCodes.unauthorized, 'Unauthorized') } as const;
  }
  const token = authHeader.substring(7);
  const { data: auth, error } = await supabase.auth.getUser(token);
  if (error || !auth.user) {
    return { error: failure(401, courseErrorCodes.unauthorized, 'Unauthorized') } as const;
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single();
  if (!profile || profile.role !== 'instructor') {
    return { error: failure(403, courseErrorCodes.forbidden, 'Forbidden') } as const;
  }
  return { userId: auth.user.id } as const;
};

export const registerCourseManageRoutes = (app: Hono<AppEnv>) => {
  // GET /api/instructor/courses
  app.get('/api/instructor/courses', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const guard = await requireInstructor(c);
    if ('error' in guard) return respond(c, guard.error);

    const result = await listInstructorCourses(supabase, guard.userId);
    if (!result.ok) logger.error('List instructor courses failed', JSON.stringify(result));
    // optional validate
    if (result.ok) {
      InstructorCoursesResponseSchema.parse(result.data);
    }
    return respond(c, result);
  });

  // POST /api/courses
  app.post('/api/courses', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const guard = await requireInstructor(c);
    if ('error' in guard) return respond(c, guard.error);

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return respond(c, failure(400, courseErrorCodes.validationError, 'Invalid JSON body'));
    }
    const parsed = CreateCourseRequestSchema.safeParse(body);
    if (!parsed.success) {
      return respond(c, failure(400, courseErrorCodes.validationError, 'Invalid request', parsed.error.format()));
    }

    const result = await createCourse(supabase, guard.userId, parsed.data);
    if (!result.ok) logger.error('Create course failed', JSON.stringify(result));
    return respond(c, result);
  });

  // PUT /api/courses/:id
  app.put('/api/courses/:id', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const guard = await requireInstructor(c);
    if ('error' in guard) return respond(c, guard.error);

    const idParam = c.req.param('id');
    const courseId = parseInt(idParam, 10);
    if (isNaN(courseId)) {
      return respond(c, failure(400, courseErrorCodes.validationError, 'Invalid course ID'));
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return respond(c, failure(400, courseErrorCodes.validationError, 'Invalid JSON body'));
    }
    const parsed = UpdateCourseRequestSchema.safeParse(body);
    if (!parsed.success) {
      return respond(c, failure(400, courseErrorCodes.validationError, 'Invalid request', parsed.error.format()));
    }

    const result = await updateCourse(supabase, guard.userId, courseId, parsed.data);
    if (!result.ok) logger.error('Update course failed', JSON.stringify(result));
    return respond(c, result);
  });

  // PATCH /api/courses/:id/status
  app.patch('/api/courses/:id/status', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const guard = await requireInstructor(c);
    if ('error' in guard) return respond(c, guard.error);

    const idParam = c.req.param('id');
    const courseId = parseInt(idParam, 10);
    if (isNaN(courseId)) {
      return respond(c, failure(400, courseErrorCodes.validationError, 'Invalid course ID'));
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return respond(c, failure(400, courseErrorCodes.validationError, 'Invalid JSON body'));
    }
    const parsed = ChangeCourseStatusSchema.safeParse(body);
    if (!parsed.success) {
      return respond(c, failure(400, courseErrorCodes.validationError, 'Invalid request', parsed.error.format()));
    }

    const result = await changeCourseStatus(supabase, guard.userId, courseId, parsed.data);
    if (!result.ok) logger.error('Change course status failed', JSON.stringify(result));
    return respond(c, result);
  });
};

