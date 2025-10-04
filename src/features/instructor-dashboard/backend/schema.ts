import { z } from 'zod';

export const InstructorDashboardQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const InstructorCourseSchema = z.object({
  id: z.number(),
  title: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
});

export const PendingCountSchema = z.object({
  courseId: z.number(),
  pending: z.number(),
});

export const RecentSubmissionSchema = z.object({
  assignmentId: z.number(),
  courseId: z.number(),
  title: z.string(),
  status: z.enum(['submitted', 'graded', 'resubmission_required']),
  submittedAt: z.string(),
  gradedAt: z.string().nullable(),
});

export const InstructorDashboardResponseSchema = z.object({
  courses: z.array(InstructorCourseSchema),
  pendingCounts: z.array(PendingCountSchema),
  recent: z.array(RecentSubmissionSchema),
});

export type InstructorDashboardResponse = z.infer<
  typeof InstructorDashboardResponseSchema
>;

