'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AssignmentDetail } from '@/features/assignments/lib/dto';
import { formatDueDate, getTimeUntilDue } from '@/lib/date-utils';
import { calculateSubmissionState } from '@/lib/submission-state';
import { SubmissionStatus } from './submission-status';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSubmitAssignment, useUpdateSubmission } from '@/features/submissions/hooks/useSubmitAssignment';

type AssignmentDetailProps = {
  assignment: AssignmentDetail;
};

export const AssignmentDetailComponent = ({ assignment }: AssignmentDetailProps) => {
  const timeUntil = getTimeUntilDue(assignment.dueDate);

  const submissionState = calculateSubmissionState(
    assignment.status,
    assignment.dueDate,
    assignment.allowLate,
    !!assignment.submission,
    assignment.submission?.status,
    assignment.allowResubmission
  );

  const getButtonVariant = () => {
    if (submissionState.variant === 'disabled') return 'secondary';
    if (submissionState.variant === 'warning') return 'destructive';
    return 'default';
  };

  const FormSchema = z.object({
    content: z.string().min(1, 'Content is required'),
    link: z
      .union([z.string().url('Invalid URL'), z.literal('')])
      .optional()
      .transform((v) => (v === '' ? undefined : v)),
  });

  const defaultValues = {
    content: assignment.submission?.content ?? '',
    link: assignment.submission?.link ?? '',
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const submitMutation = useSubmitAssignment(assignment.id);
  const updateMutation = useUpdateSubmission(assignment.id);
  const isMutating = submitMutation.isPending || updateMutation.isPending;

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (assignment.submission) {
        await updateMutation.mutateAsync(values);
      } else {
        await submitMutation.mutateAsync(values);
      }
      reset({
        content: values.content,
        link: values.link ?? '',
      });
    } catch {
      // handled by error state
    }
  });

  return (
    <div className="space-y-6">
      {/* Assignment Info */}
      <Card>
        <CardHeader>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="outline">{assignment.status}</Badge>
            {timeUntil.isPast && (
              <Badge variant="destructive">Past Due</Badge>
            )}
          </div>
          <CardTitle className="text-2xl">{assignment.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {assignment.description && (
            <div>
              <h4 className="mb-2 font-medium">Description</h4>
              <p className="whitespace-pre-wrap text-sm text-slate-700">
                {assignment.description}
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium">Due Date</h4>
              <p className="text-sm text-slate-700">
                {formatDueDate(assignment.dueDate)}
              </p>
              {!timeUntil.isPast && (
                <p className="mt-1 text-xs text-slate-500">
                  {timeUntil.days > 0 && `${timeUntil.days} days, `}
                  {timeUntil.hours > 0 && `${timeUntil.hours} hours, `}
                  {timeUntil.minutes} minutes remaining
                </p>
              )}
            </div>

            <div>
              <h4 className="mb-2 font-medium">Score Weight</h4>
              <p className="text-sm text-slate-700">{assignment.weight}%</p>
            </div>

            <div>
              <h4 className="mb-2 font-medium">Late Submission</h4>
              <p className="text-sm text-slate-700">
                {assignment.allowLate ? 'Allowed' : 'Not Allowed'}
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-medium">Resubmission</h4>
              <p className="text-sm text-slate-700">
                {assignment.allowResubmission ? 'Allowed' : 'Not Allowed'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Status */}
      <SubmissionStatus assignment={assignment} />

      {/* Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {assignment.submission ? 'Update Submission' : 'Submit Assignment'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {submissionState.message && (
            <Alert
              variant={
                submissionState.variant === 'warning' ? 'default' : 'destructive'
              }
            >
              <AlertDescription>{submissionState.message}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Enter your assignment submission here..."
                disabled={!submissionState.canSubmit || isMutating}
                rows={8}
                {...register('content')}
              />
              {errors.content && (
                <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="link">Link (optional)</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://..."
                disabled={!submissionState.canSubmit || isMutating}
                {...register('link')}
              />
              {errors.link && (
                <p className="mt-1 text-xs text-red-600">{errors.link.message as string}</p>
              )}
            </div>

            {(submitMutation.isError || updateMutation.isError) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {(submitMutation.error?.message || updateMutation.error?.message) ?? '제출에 실패했습니다.'}
                </AlertDescription>
              </Alert>
            )}

            {(submitMutation.isSuccess || updateMutation.isSuccess) && (
              <Alert>
                <AlertDescription>저장이 완료되었습니다.</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              variant={getButtonVariant()}
              disabled={!submissionState.canSubmit || isMutating}
              className="w-full"
            >
              {isMutating
                ? 'Processing...'
                : assignment.submission
                ? 'Update Submission'
                : 'Submit Assignment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
