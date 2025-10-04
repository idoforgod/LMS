'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  AssignmentDetailSchema,
  type AssignmentDetail,
} from '@/features/assignments/lib/dto';

const fetchAssignmentDetail = async (
  assignmentId: number,
): Promise<AssignmentDetail> => {
  try {
    let headers: Record<string, string> | undefined;
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) headers = { Authorization: `Bearer ${token}` };
    }
    const { data } = await apiClient.get(`/api/assignments/${assignmentId}`, { headers });
    return AssignmentDetailSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(error, 'Failed to fetch assignment detail');
    throw new Error(message);
  }
};

export const useAssignmentDetail = (assignmentId: number) => {
  return useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => fetchAssignmentDetail(assignmentId),
    enabled: !!assignmentId,
  });
};
