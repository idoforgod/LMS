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

          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Enter your assignment submission here..."
                disabled={!submissionState.canSubmit}
                defaultValue={assignment.submission?.content || ''}
                rows={8}
              />
            </div>

            <div>
              <Label htmlFor="link">Link (optional)</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://..."
                disabled={!submissionState.canSubmit}
                defaultValue={assignment.submission?.link || ''}
              />
            </div>

            <Button
              type="button"
              variant={getButtonVariant()}
              disabled={!submissionState.canSubmit}
              className="w-full"
            >
              {assignment.submission ? 'Update Submission' : 'Submit Assignment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
