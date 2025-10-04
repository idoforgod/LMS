'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { ChangeCourseStatusSchema, InstructorCourseSchema, type ChangeCourseStatusRequest } from '@/features/courses/lib/manage.dto';

const withAuth = () => {
  let headers: Record<string, string> | undefined;
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) headers = { Authorization: `Bearer ${token}` };
  }
  return { headers } as const;
};

export const useChangeCourseStatus = (courseId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ChangeCourseStatusRequest) => {
      const payload = ChangeCourseStatusSchema.parse(body);
      const { headers } = withAuth();
      const { data } = await apiClient.patch(`/api/courses/${courseId}/status`, payload, { headers });
      return InstructorCourseSchema.parse(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instructor', 'courses'] });
    },
    onError: (e) => {
      throw new Error(extractApiErrorMessage(e, '코스 상태 변경에 실패했습니다.'));
    },
  });
};

