'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  EnrollResponseSchema,
  type EnrollResponse,
} from '@/features/enrollments/lib/dto';

const enroll = async (courseId: number): Promise<EnrollResponse> => {
  try {
    const { data } = await apiClient.post('/api/enrollments', { courseId });
    return EnrollResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(error, 'Failed to enroll in course');
    throw new Error(message);
  }
};

export const useEnroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enroll,
    onSuccess: (_, courseId) => {
      // Invalidate course detail query to update isEnrolled
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      // Invalidate user's enrolled courses
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
      // Invalidate courses list
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};
