'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { CreateCourseRequestSchema, InstructorCourseSchema, type CreateCourseRequest } from '@/features/courses/lib/manage.dto';

const withAuth = () => {
  let headers: Record<string, string> | undefined;
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) headers = { Authorization: `Bearer ${token}` };
  }
  return { headers } as const;
};

export const useCreateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateCourseRequest) => {
      const payload = CreateCourseRequestSchema.parse(body);
      const { headers } = withAuth();
      const { data } = await apiClient.post('/api/courses', payload, { headers });
      return InstructorCourseSchema.parse(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instructor', 'courses'] });
    },
    onError: (e) => {
      throw new Error(extractApiErrorMessage(e, '코스 생성에 실패했습니다.'));
    },
  });
};

