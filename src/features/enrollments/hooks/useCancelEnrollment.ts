'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  CancelEnrollmentResponseSchema,
  type CancelEnrollmentResponse,
} from '@/features/enrollments/lib/dto';

const cancelEnrollment = async (
  courseId: number,
): Promise<CancelEnrollmentResponse> => {
  try {
    const { data } = await apiClient.delete(`/api/enrollments/${courseId}`);
    return CancelEnrollmentResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(
      error,
      'Failed to cancel enrollment',
    );
    throw new Error(message);
  }
};

export const useCancelEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelEnrollment,
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
