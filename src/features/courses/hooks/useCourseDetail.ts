'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  CourseDetailSchema,
  type CourseDetail,
} from '@/features/courses/lib/dto';

const fetchCourseDetail = async (courseId: number): Promise<CourseDetail> => {
  try {
    const { data } = await apiClient.get(`/api/courses/${courseId}`);
    return CourseDetailSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(
      error,
      'Failed to fetch course detail',
    );
    throw new Error(message);
  }
};

export const useCourseDetail = (courseId: number) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourseDetail(courseId),
    enabled: !!courseId,
  });
};
