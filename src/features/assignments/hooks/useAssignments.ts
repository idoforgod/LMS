'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  AssignmentListResponseSchema,
  type AssignmentListResponse,
} from '@/features/assignments/lib/dto';

const fetchAssignments = async (
  courseId: number,
): Promise<AssignmentListResponse> => {
  try {
    let headers: Record<string, string> | undefined;
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) headers = { Authorization: `Bearer ${token}` };
    }
    const { data } = await apiClient.get(`/api/courses/${courseId}/assignments`, { headers });
    return AssignmentListResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(error, 'Failed to fetch assignments');
    throw new Error(message);
  }
};

export const useAssignments = (courseId: number) => {
  return useQuery({
    queryKey: ['assignments', courseId],
    queryFn: () => fetchAssignments(courseId),
    enabled: !!courseId,
  });
};
