'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  InstructorDashboardResponseSchema,
  type InstructorDashboardResponse,
} from '@/features/instructor-dashboard/lib/dto';

export const useInstructorDashboard = (options?: { limit?: number }) => {
  const limit = options?.limit ?? 10;
  return useQuery<InstructorDashboardResponse>({
    queryKey: ['instructor', 'dashboard', limit],
    queryFn: async () => {
      let headers: Record<string, string> | undefined;
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) headers = { Authorization: `Bearer ${token}` };
      }
      try {
        const { data } = await apiClient.get('/api/instructor/dashboard', {
          params: { limit },
          headers,
        });
        return InstructorDashboardResponseSchema.parse(data);
      } catch (error) {
        throw new Error(
          extractApiErrorMessage(error, '대시보드 데이터를 불러오지 못했습니다.'),
        );
      }
    },
  });
};

