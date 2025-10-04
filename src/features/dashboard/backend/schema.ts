import { z } from 'zod';

export const DashboardQuerySchema = z.object({
  hours: z.coerce.number().min(1).max(24 * 14).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;

export const MyCourseSchema = z.object({
  courseId: z.number(),
  title: z.string(),
  progress: z.number().min(0).max(1),
});

export type MyCourse = z.infer<typeof MyCourseSchema>;

export const ImminentAssignmentSchema = z.object({
  assignmentId: z.number(),
  courseId: z.number(),
  title: z.string(),
  dueDate: z.string(),
});

export type ImminentAssignment = z.infer<typeof ImminentAssignmentSchema>;

export const FeedbackSummarySchema = z.object({
  assignmentId: z.number(),
  courseId: z.number(),
  score: z.number().nullable(),
  feedback: z.string().nullable(),
  gradedAt: z.string(),
});

export type FeedbackSummary = z.infer<typeof FeedbackSummarySchema>;

export const DashboardSummarySchema = z.object({
  myCourses: z.array(MyCourseSchema),
  imminentAssignments: z.array(ImminentAssignmentSchema),
  recentFeedback: z.array(FeedbackSummarySchema),
});

export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;

