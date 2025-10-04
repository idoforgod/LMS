'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AssignmentListItem } from '@/features/assignments/lib/dto';
import { formatDueDate, getTimeUntilDue, isDueSoon } from '@/lib/date-utils';

type AssignmentCardProps = {
  assignment: AssignmentListItem;
  courseId: number;
};

export const AssignmentCard = ({ assignment, courseId }: AssignmentCardProps) => {
  const timeUntil = getTimeUntilDue(assignment.dueDate);
  const dueSoon = isDueSoon(assignment.dueDate);
  const overdue = timeUntil.isPast;

  const getStatusBadge = () => {
    if (assignment.submissionStatus === 'graded') {
      return <Badge variant="default">Graded</Badge>;
    }
    if (assignment.submissionStatus === 'submitted') {
      return <Badge variant="secondary">Submitted</Badge>;
    }
    if (assignment.hasSubmission === false) {
      return <Badge variant="outline">Not Submitted</Badge>;
    }
    return null;
  };

  const getTimeIndicator = () => {
    if (overdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (dueSoon) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Due Soon</Badge>;
    }
    return null;
  };

  return (
    <Link
      href={`/my-courses/${courseId}/assignments/${assignment.id}`}
      className="block"
    >
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="mb-2 flex flex-wrap gap-2">
            {getStatusBadge()}
            {getTimeIndicator()}
          </div>
          <CardTitle className="line-clamp-2 text-xl">
            {assignment.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-slate-600">
              Due: {formatDueDate(assignment.dueDate)}
            </p>
            {!timeUntil.isPast && (
              <p className="text-slate-500">
                {timeUntil.days > 0 && `${timeUntil.days}d `}
                {timeUntil.hours > 0 && `${timeUntil.hours}h `}
                {timeUntil.minutes > 0 && `${timeUntil.minutes}m `}
                remaining
              </p>
            )}
            <p className="text-slate-500">Weight: {assignment.weight}%</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
