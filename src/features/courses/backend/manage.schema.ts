import { z } from 'zod';

export const CreateCourseRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  categoryId: z.number().optional().nullable(),
  difficultyId: z.number().optional().nullable(),
  curriculum: z.string().optional().nullable(),
});

export const UpdateCourseRequestSchema = CreateCourseRequestSchema;

export const ChangeCourseStatusSchema = z.object({
  to: z.enum(['draft', 'published', 'archived']),
});

export const InstructorCourseSchema = z.object({
  id: z.number(),
  title: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  updatedAt: z.string(),
});

export const InstructorCoursesResponseSchema = z.object({
  courses: z.array(InstructorCourseSchema),
});

export type CreateCourseRequest = z.infer<typeof CreateCourseRequestSchema>;
export type UpdateCourseRequest = z.infer<typeof UpdateCourseRequestSchema>;
export type ChangeCourseStatusRequest = z.infer<typeof ChangeCourseStatusSchema>;
export type InstructorCourse = z.infer<typeof InstructorCourseSchema>;

