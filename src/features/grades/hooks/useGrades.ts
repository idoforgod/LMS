'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { GradesResponseSchema, type GradesResponse } from '@/features/grades/lib/dto';

const withAuth = () => {
  let headers: Record<string, string> | undefined;
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) headers = { Authorization: `Bearer ${token}` };
  }
  return { headers } as const;
};

export const useGrades = (courseId: number) => {
  return useQuery<GradesResponse>({
    queryKey: ['grades', courseId],
    queryFn: async () => {
      try {
        const { headers } = withAuth();
        const { data } = await apiClient.get('/api/grades', {
          params: { courseId },
          headers,
        });
        return GradesResponseSchema.parse(data);
      } catch (error) {
        throw new Error(
          extractApiErrorMessage(error, '성적 정보를 불러오지 못했습니다.'),
        );
      }
    },
    enabled: !!courseId,
  });
};

