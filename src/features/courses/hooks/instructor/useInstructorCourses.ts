'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { InstructorCoursesResponseSchema } from '@/features/courses/lib/manage.dto';

const withAuth = () => {
  let headers: Record<string, string> | undefined;
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) headers = { Authorization: `Bearer ${token}` };
  }
  return { headers } as const;
};

export const useInstructorCourses = () => {
  return useQuery({
    queryKey: ['instructor', 'courses'],
    queryFn: async () => {
      try {
        const { headers } = withAuth();
        const { data } = await apiClient.get('/api/instructor/courses', { headers });
        return InstructorCoursesResponseSchema.parse(data);
      } catch (error) {
        throw new Error(extractApiErrorMessage(error, '코스 목록을 불러오지 못했습니다.'));
      }
    },
  });
};

