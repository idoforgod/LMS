import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerOnboardingRoutes } from '@/features/onboarding/backend/route';
import { registerCourseRoutes } from '@/features/courses/backend/route';
import { registerEnrollmentRoutes } from '@/features/enrollments/backend/route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  if (singletonApp) {
    return singletonApp;
  }

  const app = new Hono<AppEnv>();

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());

  registerExampleRoutes(app);
  registerOnboardingRoutes(app);
  registerCourseRoutes(app);
  registerEnrollmentRoutes(app);

  singletonApp = app;

  return app;
};
