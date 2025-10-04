'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { UpdateAssignmentRequestSchema, InstructorAssignmentSchema, type UpdateAssignmentRequest } from '@/features/assignments/lib/manage.dto';

const withAuth = () => {
  let headers: Record<string, string> | undefined;
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) headers = { Authorization: `Bearer ${token}` };
  }
  return { headers } as const;
};

export const useUpdateAssignment = (assignmentId: number, courseId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateAssignmentRequest) => {
      const payload = UpdateAssignmentRequestSchema.parse(body);
      const { headers } = withAuth();
      const { data } = await apiClient.put(`/api/instructor/assignments/${assignmentId}`, payload, { headers });
      return InstructorAssignmentSchema.parse(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instructor', 'assignments', courseId] });
    },
    onError: (e) => {
      throw new Error(extractApiErrorMessage(e, '과제 수정에 실패했습니다.'));
    },
  });
};

