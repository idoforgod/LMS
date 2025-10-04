'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { UpdateCourseRequestSchema, InstructorCourseSchema, type UpdateCourseRequest } from '@/features/courses/lib/manage.dto';

const withAuth = () => {
  let headers: Record<string, string> | undefined;
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) headers = { Authorization: `Bearer ${token}` };
  }
  return { headers } as const;
};

export const useUpdateCourse = (courseId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateCourseRequest) => {
      const payload = UpdateCourseRequestSchema.parse(body);
      const { headers } = withAuth();
      const { data } = await apiClient.put(`/api/courses/${courseId}`, payload, { headers });
      return InstructorCourseSchema.parse(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instructor', 'courses'] });
    },
    onError: (e) => {
      throw new Error(extractApiErrorMessage(e, '코스 수정에 실패했습니다.'));
    },
  });
};

