import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getSupabase, getLogger, type AppEnv } from '@/backend/hono/context';
import { InstructorDashboardQuerySchema } from './schema';
import { instructorDashboardErrorCodes } from './error';
import { getInstructorDashboard } from './service';

export const registerInstructorDashboardRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/instructor/dashboard', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return respond(c, failure(401, instructorDashboardErrorCodes.unauthorized, 'Unauthorized'));
    }
    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return respond(c, failure(401, instructorDashboardErrorCodes.unauthorized, 'Unauthorized'));
    }

    // Role guard: instructor only
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!profile || profile.role !== 'instructor') {
      return respond(c, failure(403, instructorDashboardErrorCodes.forbidden, 'Forbidden'));
    }

    const parsed = InstructorDashboardQuerySchema.safeParse(c.req.query());
    if (!parsed.success) {
      return respond(
        c,
        failure(400, instructorDashboardErrorCodes.validationError, 'Invalid query', parsed.error.format()),
      );
    }

    const result = await getInstructorDashboard(supabase, user.id, parsed.data.limit);
    if (!result.ok) {
      logger.error('Failed to fetch instructor dashboard', JSON.stringify(result));
    }
    return respond(c, result);
  });
};
