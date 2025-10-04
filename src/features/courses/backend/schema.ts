import { z } from 'zod';

export const CourseListQuerySchema = z.object({
  search: z.string().optional(),
  category: z.coerce.number().optional(),
  difficulty: z.coerce.number().optional(),
  sort: z.enum(['latest', 'popular']).default('latest'),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type CourseListQuery = z.infer<typeof CourseListQuerySchema>;

export const CourseDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  category: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .nullable(),
  difficulty: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .nullable(),
  instructor: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  curriculum: z.string().nullable(),
  status: z.enum(['draft', 'published', 'archived']),
  isEnrolled: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CourseDetail = z.infer<typeof CourseDetailSchema>;

export const CourseListResponseSchema = z.object({
  courses: z.array(CourseDetailSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  }),
});

export type CourseListResponse = z.infer<typeof CourseListResponseSchema>;
