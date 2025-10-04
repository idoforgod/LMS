import type { Hono } from 'hono';
import {
  failure,
  respond,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { SignupRequestSchema } from './schema';
import { createUserAccount } from './service';
import {
  onboardingErrorCodes,
  type OnboardingServiceError,
} from './error';

export const registerOnboardingRoutes = (app: Hono<AppEnv>) => {
  app.post('/auth/signup', async (c) => {
    const body = await c.req.json();
    const parsedBody = SignupRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          onboardingErrorCodes.validationError,
          '입력값이 올바르지 않습니다.',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await createUserAccount(supabase, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<
        OnboardingServiceError,
        unknown
      >;

      if (errorResult.error.code === onboardingErrorCodes.emailDuplicate) {
        logger.warn('Email duplicate attempt', {
          email: parsedBody.data.email,
        });
      } else {
        logger.error('Signup failed', errorResult.error.message);
      }

      return respond(c, result);
    }

    logger.info('User created successfully', { userId: result.data.user.id });
    return respond(c, result);
  });
};
