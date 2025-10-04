import { z } from 'zod';

export const SubmitRequestSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  link: z
    .union([z.string().url(), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

export const SubmissionSchema = z.object({
  id: z.number(),
  assignmentId: z.number(),
  userId: z.string(),
  status: z.enum(['submitted', 'graded', 'resubmission_required']),
  isLate: z.boolean(),
  score: z.number().nullable(),
  feedback: z.string().nullable(),
  submittedAt: z.string(),
  gradedAt: z.string().nullable(),
});

export type SubmitRequest = z.infer<typeof SubmitRequestSchema>;
export type Submission = z.infer<typeof SubmissionSchema>;

