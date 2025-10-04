import { z } from 'zod';

export const CreateAssignmentRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  dueDate: z.string(),
  weight: z.number().min(0).max(100),
  allowLate: z.boolean(),
  allowResubmission: z.boolean(),
});

export const UpdateAssignmentRequestSchema = z.object({
  description: z.string().optional().nullable(),
  dueDate: z.string(),
  weight: z.number().min(0).max(100),
  allowLate: z.boolean(),
  allowResubmission: z.boolean(),
});

export const ChangeAssignmentStatusSchema = z.object({
  to: z.enum(['draft', 'published', 'closed']),
});

export const InstructorAssignmentSchema = z.object({
  id: z.number(),
  title: z.string(),
  status: z.enum(['draft', 'published', 'closed']),
  dueDate: z.string(),
  weight: z.number(),
  updatedAt: z.string(),
});

export const InstructorAssignmentsResponseSchema = z.object({
  assignments: z.array(InstructorAssignmentSchema),
});

export type CreateAssignmentRequest = z.infer<typeof CreateAssignmentRequestSchema>;
export type UpdateAssignmentRequest = z.infer<typeof UpdateAssignmentRequestSchema>;
export type ChangeAssignmentStatusRequest = z.infer<typeof ChangeAssignmentStatusSchema>;
export type InstructorAssignmentsResponse = z.infer<typeof InstructorAssignmentsResponseSchema>;
