'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AssignmentDetail } from '@/features/assignments/lib/dto';
import { formatDueDate } from '@/lib/date-utils';

type SubmissionStatusProps = {
  assignment: AssignmentDetail;
};

export const SubmissionStatus = ({ assignment }: SubmissionStatusProps) => {
  const { submission } = assignment;

  if (!submission) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Submission Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">No submission yet</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    switch (submission.status) {
      case 'graded':
        return <Badge variant="default">Graded</Badge>;
      case 'submitted':
        return <Badge variant="secondary">Submitted</Badge>;
      case 'resubmission_required':
        return <Badge variant="destructive">Resubmission Required</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Submission Status</CardTitle>
          <div className="flex gap-2">
            {getStatusBadge()}
            {submission.isLate && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                Late
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="mb-2 font-medium">Content</h4>
          <p className="whitespace-pre-wrap text-sm text-slate-700">
            {submission.content}
          </p>
        </div>

        {submission.link && (
          <div>
            <h4 className="mb-2 font-medium">Link</h4>
            <a
              href={submission.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {submission.link}
            </a>
          </div>
        )}

        <div>
          <h4 className="mb-2 font-medium">Submitted</h4>
          <p className="text-sm text-slate-600">
            {formatDueDate(submission.submittedAt)}
          </p>
        </div>

        {submission.status === 'graded' && (
          <>
            {submission.score !== null && (
              <div>
                <h4 className="mb-2 font-medium">Score</h4>
                <p className="text-2xl font-bold text-slate-900">
                  {submission.score}%
                </p>
              </div>
            )}

            {submission.feedback && (
              <div>
                <h4 className="mb-2 font-medium">Feedback</h4>
                <Alert>
                  <AlertDescription className="whitespace-pre-wrap">
                    {submission.feedback}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {submission.gradedAt && (
              <div>
                <p className="text-xs text-slate-500">
                  Graded on {formatDueDate(submission.gradedAt)}
                </p>
              </div>
            )}
          </>
        )}

        {submission.status === 'resubmission_required' && (
          <Alert variant="destructive">
            <AlertDescription>
              Your instructor has requested a resubmission. Please review the
              feedback and submit again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
