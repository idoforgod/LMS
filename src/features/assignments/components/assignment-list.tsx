'use client';

import { AssignmentCard } from './assignment-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AssignmentListItem } from '@/features/assignments/lib/dto';
import { getTimeUntilDue } from '@/lib/date-utils';

type AssignmentListProps = {
  assignments: AssignmentListItem[];
  courseId: number;
  isLoading?: boolean;
};

export const AssignmentList = ({
  assignments,
  courseId,
  isLoading = false,
}: AssignmentListProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-900">No assignments yet</p>
          <p className="text-sm text-slate-500">
            Check back later for new assignments
          </p>
        </div>
      </div>
    );
  }

  // Group assignments by status
  const upcoming = assignments.filter((a) => {
    const timeUntil = getTimeUntilDue(a.dueDate);
    return !timeUntil.isPast && !a.hasSubmission;
  });

  const overdue = assignments.filter((a) => {
    const timeUntil = getTimeUntilDue(a.dueDate);
    return timeUntil.isPast && !a.hasSubmission;
  });

  const completed = assignments.filter((a) => a.hasSubmission);

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Upcoming</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcoming
              .sort(
                (a, b) =>
                  new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
              )
              .map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  courseId={courseId}
                />
              ))}
          </div>
        </div>
      )}

      {overdue.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-red-600">Overdue</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {overdue
              .sort(
                (a, b) =>
                  new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
              )
              .map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  courseId={courseId}
                />
              ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Completed</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completed
              .sort(
                (a, b) =>
                  new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
              )
              .map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  courseId={courseId}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
