import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { SubmitRequestSchema, SubmissionSchema } from './schema';
import { createSubmission, updateSubmission } from './service';
import { submissionErrorCodes } from './error';

export const registerSubmissionRoutes = (app: Hono<AppEnv>) => {
  // POST /api/assignments/:id/submissions - create submission
  app.post('/api/assignments/:id/submissions', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const idParam = c.req.param('id');
    const assignmentId = parseInt(idParam, 10);
    if (isNaN(assignmentId)) {
      return respond(
        c,
        failure(400, submissionErrorCodes.validationError, 'Invalid assignment ID'),
      );
    }

    // Auth
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return respond(c, failure(401, submissionErrorCodes.unauthorized, 'Unauthorized'));
    }
    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return respond(c, failure(401, submissionErrorCodes.unauthorized, 'Unauthorized'));
    }

    // Body
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return respond(
        c,
        failure(400, submissionErrorCodes.validationError, 'Invalid JSON body'),
      );
    }
    let payload: import('./schema').SubmitRequest;
    try {
      payload = SubmitRequestSchema.parse(body);
    } catch (err: any) {
      return respond(
        c,
        failure(400, submissionErrorCodes.validationError, 'Invalid request body', err?.format?.() ?? undefined),
      );
    }
    const result = await createSubmission(supabase, user.id, assignmentId, payload);
    if (!result.ok) {
      logger.error('Create submission failed', JSON.stringify(result));
    }
    return respond(c, result);
  });

  // PUT /api/assignments/:id/submissions - update submission (resubmit)
  app.put('/api/assignments/:id/submissions', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const idParam = c.req.param('id');
    const assignmentId = parseInt(idParam, 10);
    if (isNaN(assignmentId)) {
      return respond(
        c,
        failure(400, submissionErrorCodes.validationError, 'Invalid assignment ID'),
      );
    }

    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return respond(c, failure(401, submissionErrorCodes.unauthorized, 'Unauthorized'));
    }
    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return respond(c, failure(401, submissionErrorCodes.unauthorized, 'Unauthorized'));
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return respond(
        c,
        failure(400, submissionErrorCodes.validationError, 'Invalid JSON body'),
      );
    }
    let payload: import('./schema').SubmitRequest;
    try {
      payload = SubmitRequestSchema.parse(body);
    } catch (err: any) {
      return respond(
        c,
        failure(400, submissionErrorCodes.validationError, 'Invalid request body', err?.format?.() ?? undefined),
      );
    }
    const result = await updateSubmission(supabase, user.id, assignmentId, payload);
    if (!result.ok) {
      logger.error('Update submission failed', JSON.stringify(result));
    }
    return respond(c, result);
  });
};
