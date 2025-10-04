'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { DashboardSummarySchema, type DashboardSummary } from '@/features/dashboard/lib/dto';
import { DEFAULT_FEEDBACK_LIMIT, DEFAULT_IMMINENT_HOURS } from '@/features/dashboard/constants';

const fetchDashboard = async (hours?: number, limit?: number): Promise<DashboardSummary> => {
  try {
    const params: Record<string, number> = {};
    if (typeof hours === 'number') params.hours = hours;
    if (typeof limit === 'number') params.limit = limit;

    // attach token per-request (no global interceptor by design)
    let headers: Record<string, string> | undefined;
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) headers = { Authorization: `Bearer ${token}` };
    }

    const { data } = await apiClient.get('/api/dashboard/summary', { params, headers });
    return DashboardSummarySchema.parse(data);
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, '대시보드 데이터를 불러오지 못했습니다.'));
  }
};

export const useDashboardSummary = (options?: { hours?: number; limit?: number }) => {
  const hours = options?.hours ?? DEFAULT_IMMINENT_HOURS;
  const limit = options?.limit ?? DEFAULT_FEEDBACK_LIMIT;

  return useQuery({
    queryKey: ['dashboard', 'summary', hours, limit],
    queryFn: () => fetchDashboard(hours, limit),
    staleTime: 60 * 1000,
  });
};

