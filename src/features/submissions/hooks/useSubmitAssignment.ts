'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  SubmitRequestSchema,
  type SubmitRequest,
  SubmissionSchema,
  type Submission,
} from '@/features/submissions/lib/dto';

const withAuth = () => {
  let headers: Record<string, string> | undefined;
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) headers = { Authorization: `Bearer ${token}` };
  }
  return { headers } as const;
};

export const useSubmitAssignment = (assignmentId: number) => {
  const qc = useQueryClient();
  return useMutation<Submission, Error, SubmitRequest>({
    mutationFn: async (payload: SubmitRequest) => {
      const parsed = SubmitRequestSchema.parse(payload);
      const { headers } = withAuth();
      const { data } = await apiClient.post(
        `/api/assignments/${assignmentId}/submissions`,
        parsed,
        { headers },
      );
      return SubmissionSchema.parse(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      qc.invalidateQueries({ queryKey: ['assignment', assignmentId] });
    },
    onError: (e) => {
      throw new Error(extractApiErrorMessage(e, '제출에 실패했습니다.'));
    },
  });
};

export const useUpdateSubmission = (assignmentId: number) => {
  const qc = useQueryClient();
  return useMutation<Submission, Error, SubmitRequest>({
    mutationFn: async (payload: SubmitRequest) => {
      const parsed = SubmitRequestSchema.parse(payload);
      const { headers } = withAuth();
      const { data } = await apiClient.put(
        `/api/assignments/${assignmentId}/submissions`,
        parsed,
        { headers },
      );
      return SubmissionSchema.parse(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignment', assignmentId] });
    },
    onError: (e) => {
      throw new Error(extractApiErrorMessage(e, '재제출에 실패했습니다.'));
    },
  });
};

