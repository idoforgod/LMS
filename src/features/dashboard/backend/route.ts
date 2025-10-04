import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { DashboardQuerySchema } from './schema';
import { getDashboardSummary } from './service';
import { dashboardErrorCodes } from './error';

export const registerDashboardRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/dashboard/summary', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Auth
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return respond(c, failure(401, dashboardErrorCodes.unauthorized, 'Unauthorized'));
    }

    const token = authHeader.substring(7);
    const { data: auth, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !auth.user) {
      return respond(c, failure(401, dashboardErrorCodes.unauthorized, 'Unauthorized'));
    }

    // Role check: learner only
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', auth.user.id)
      .single();

    if (profErr) {
      logger.error('Profile fetch error', profErr);
      return respond(c, failure(500, dashboardErrorCodes.database_error, 'Database error', profErr));
    }

    if (!profile || profile.role !== 'learner') {
      return respond(c, failure(403, dashboardErrorCodes.forbidden_role, 'This feature is only available for learners'));
    }

    // Query params
    const parsed = DashboardQuerySchema.safeParse(c.req.query());
    if (!parsed.success) {
      return respond(c, failure(400, dashboardErrorCodes.invalid_query, 'Invalid query parameters', parsed.error.format()));
    }

    const result = await getDashboardSummary(supabase, auth.user.id, parsed.data);

    if (!result.ok) {
      logger.error('Failed to load dashboard', JSON.stringify(result));
    }

    return respond(c, result);
  });
};

