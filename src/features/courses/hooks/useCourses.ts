'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  CourseListResponseSchema,
  type CourseListQuery,
  type CourseListResponse,
} from '@/features/courses/lib/dto';

const fetchCourses = async (
  query: CourseListQuery,
): Promise<CourseListResponse> => {
  try {
    const { data } = await apiClient.get('/api/courses', { params: query });
    return CourseListResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(error, 'Failed to fetch courses');
    throw new Error(message);
  }
};

export const useCourses = (query: CourseListQuery) => {
  return useQuery({
    queryKey: ['courses', query],
    queryFn: () => fetchCourses(query),
  });
};
