'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { InstructorAssignmentsResponseSchema, type InstructorAssignmentsResponse } from '@/features/assignments/lib/manage.dto';

const withAuth = () => {
  let headers: Record<string, string> | undefined;
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) headers = { Authorization: `Bearer ${token}` };
  }
  return { headers } as const;
};

export const useInstructorAssignments = (courseId: number) => {
  return useQuery<InstructorAssignmentsResponse>({
    queryKey: ['instructor', 'assignments', courseId],
    queryFn: async () => {
      try {
        const { headers } = withAuth();
        const { data } = await apiClient.get(`/api/instructor/courses/${courseId}/assignments`, { headers });
        return InstructorAssignmentsResponseSchema.parse(data);
      } catch (error) {
        throw new Error(extractApiErrorMessage(error, '과제 목록을 불러오지 못했습니다.'));
      }
    },
    enabled: !!courseId,
  });
};
