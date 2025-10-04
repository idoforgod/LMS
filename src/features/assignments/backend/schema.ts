import { z } from 'zod';

// Course assignments list query
export const CourseAssignmentsQuerySchema = z.object({
  courseId: z.coerce.number(),
});

// Assignment detail response
export const AssignmentDetailSchema = z.object({
  id: z.number(),
  courseId: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  dueDate: z.string(),
  weight: z.number(),
  allowLate: z.boolean(),
  allowResubmission: z.boolean(),
  status: z.enum(['draft', 'published', 'closed']),
  createdAt: z.string(),
  updatedAt: z.string(),
  submission: z.object({
    id: z.number(),
    content: z.string(),
    link: z.string().nullable(),
    status: z.enum(['submitted', 'graded', 'resubmission_required']),
    isLate: z.boolean(),
    score: z.number().nullable(),
    feedback: z.string().nullable(),
    submittedAt: z.string(),
    gradedAt: z.string().nullable(),
  }).nullable(),
});

// Assignment list item
export const AssignmentListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  dueDate: z.string(),
  weight: z.number(),
  status: z.enum(['draft', 'published', 'closed']),
  hasSubmission: z.boolean(),
  submissionStatus: z.enum(['submitted', 'graded', 'resubmission_required']).nullable(),
});

export const AssignmentListResponseSchema = z.object({
  assignments: z.array(AssignmentListItemSchema),
});

export type AssignmentDetail = z.infer<typeof AssignmentDetailSchema>;
export type AssignmentListItem = z.infer<typeof AssignmentListItemSchema>;
export type AssignmentListResponse = z.infer<typeof AssignmentListResponseSchema>;
