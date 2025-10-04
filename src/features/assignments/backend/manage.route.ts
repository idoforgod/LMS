import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import {
  CreateAssignmentRequestSchema,
  UpdateAssignmentRequestSchema,
  ChangeAssignmentStatusSchema,
  InstructorAssignmentsResponseSchema,
} from './manage.schema';
import {
  listInstructorAssignments,
  createAssignment,
  updateAssignment,
  changeAssignmentStatus,
} from './manage.service';
import { assignmentManageErrorCodes } from './manage.error';

const requireInstructor = async (c: import('@/backend/hono/context').AppContext) => {
  const supabase = getSupabase(c);
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: failure(401, assignmentManageErrorCodes.unauthorized, 'Unauthorized') } as const;
  }
  const token = authHeader.substring(7);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return { error: failure(401, assignmentManageErrorCodes.unauthorized, 'Unauthorized') } as const;
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();
  if (!profile || profile.role !== 'instructor') {
    return { error: failure(403, assignmentManageErrorCodes.forbidden, 'Forbidden') } as const;
  }
  return { userId: data.user.id } as const;
};

export const registerAssignmentManageRoutes = (app: Hono<AppEnv>) => {
  // GET /api/instructor/courses/:courseId/assignments
  app.get('/api/instructor/courses/:courseId/assignments', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const guard = await requireInstructor(c);
    if ('error' in guard) return respond(c, guard.error);
    const courseId = parseInt(c.req.param('courseId'), 10);
    if (isNaN(courseId)) {
      return respond(c, failure(400, assignmentManageErrorCodes.validationError, 'Invalid course ID'));
    }
    const result = await listInstructorAssignments(supabase, guard.userId, courseId);
    if (!result.ok) logger.error('List instructor assignments failed', JSON.stringify(result));
    if (result.ok) {
      InstructorAssignmentsResponseSchema.parse(result.data);
    }
    return respond(c, result);
  });

  // POST /api/instructor/courses/:courseId/assignments
  app.post('/api/instructor/courses/:courseId/assignments', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const guard = await requireInstructor(c);
    if ('error' in guard) return respond(c, guard.error);
    const courseId = parseInt(c.req.param('courseId'), 10);
    if (isNaN(courseId)) {
      return respond(c, failure(400, assignmentManageErrorCodes.validationError, 'Invalid course ID'));
    }
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return respond(c, failure(400, assignmentManageErrorCodes.validationError, 'Invalid JSON body'));
    }
    const parsed = CreateAssignmentRequestSchema.safeParse(body);
    if (!parsed.success) {
      return respond(c, failure(400, assignmentManageErrorCodes.validationError, 'Invalid request body', parsed.error.format()));
    }
    const result = await createAssignment(supabase, guard.userId, courseId, parsed.data);
    if (!result.ok) logger.error('Create assignment failed', JSON.stringify(result));
    return respond(c, result);
  });

  // PUT /api/instructor/assignments/:id
  app.put('/api/instructor/assignments/:id', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const guard = await requireInstructor(c);
    if ('error' in guard) return respond(c, guard.error);
    const assignmentId = parseInt(c.req.param('id'), 10);
    if (isNaN(assignmentId)) {
      return respond(c, failure(400, assignmentManageErrorCodes.validationError, 'Invalid assignment ID'));
    }
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return respond(c, failure(400, assignmentManageErrorCodes.validationError, 'Invalid JSON body'));
    }
    const parsed = UpdateAssignmentRequestSchema.safeParse(body);
    if (!parsed.success) {
      return respond(c, failure(400, assignmentManageErrorCodes.validationError, 'Invalid request body', parsed.error.format()));
    }
    const result = await updateAssignment(supabase, guard.userId, assignmentId, parsed.data);
    if (!result.ok) logger.error('Update assignment failed', JSON.stringify(result));
    return respond(c, result);
  });

  // PATCH /api/instructor/assignments/:id/status
  app.patch('/api/instructor/assignments/:id/status', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const guard = await requireInstructor(c);
    if ('error' in guard) return respond(c, guard.error);
    const assignmentId = parseInt(c.req.param('id'), 10);
    if (isNaN(assignmentId)) {
      return respond(c, failure(400, assignmentManageErrorCodes.validationError, 'Invalid assignment ID'));
    }
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return respond(c, failure(400, assignmentManageErrorCodes.validationError, 'Invalid JSON body'));
    }
    const parsed = ChangeAssignmentStatusSchema.safeParse(body);
    if (!parsed.success) {
      return respond(c, failure(400, assignmentManageErrorCodes.validationError, 'Invalid request body', parsed.error.format()));
    }
    const result = await changeAssignmentStatus(supabase, guard.userId, assignmentId, parsed.data);
    if (!result.ok) logger.error('Change assignment status failed', JSON.stringify(result));
    return respond(c, result);
  });
};

