import { z } from 'zod';

export const GradesQuerySchema = z.object({ courseId: z.coerce.number() });

export const GradeItemSchema = z.object({
  assignmentId: z.number(),
  title: z.string(),
  weight: z.number(),
  status: z.enum(['submitted', 'graded', 'resubmission_required']).nullable(),
  isLate: z.boolean().nullable(),
  score: z.number().nullable(),
  feedback: z.string().nullable(),
  submittedAt: z.string().nullable(),
  gradedAt: z.string().nullable(),
});

export const GradesResponseSchema = z.object({
  courseId: z.number(),
  total: z.number(),
  items: z.array(GradeItemSchema),
});

export type GradesQuery = z.infer<typeof GradesQuerySchema>;
export type GradesResponse = z.infer<typeof GradesResponseSchema>;

