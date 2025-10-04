import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getSupabase, getLogger, type AppEnv } from '@/backend/hono/context';
import { GradesQuerySchema } from './schema';
import { gradesErrorCodes } from './error';
import { getGrades } from './service';

export const registerGradesRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/grades', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return respond(c, failure(401, gradesErrorCodes.unauthorized, 'Unauthorized'));
    }
    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return respond(c, failure(401, gradesErrorCodes.unauthorized, 'Unauthorized'));
    }

    const parsed = GradesQuerySchema.safeParse(c.req.query());
    if (!parsed.success) {
      return respond(
        c,
        failure(400, gradesErrorCodes.validationError, 'Invalid query', parsed.error.format()),
      );
    }

    const result = await getGrades(supabase, user.id, parsed.data.courseId);
    if (!result.ok) {
      logger.error('Failed to fetch grades', JSON.stringify(result));
    }
    return respond(c, result);
  });
};

