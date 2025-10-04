import { z } from 'zod';

export const EnrollRequestSchema = z.object({
  courseId: z.number(),
});

export type EnrollRequest = z.infer<typeof EnrollRequestSchema>;

export const EnrollResponseSchema = z.object({
  id: z.number(),
  courseId: z.number(),
  userId: z.string().uuid(),
  enrolledAt: z.string(),
});

export type EnrollResponse = z.infer<typeof EnrollResponseSchema>;

export const CancelEnrollmentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type CancelEnrollmentResponse = z.infer<
  typeof CancelEnrollmentResponseSchema
>;
