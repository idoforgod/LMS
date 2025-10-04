'use client';

import { StatusBadge } from './status-badge';
import { useInstructorCourses } from '@/features/courses/hooks/instructor/useInstructorCourses';
import { useChangeCourseStatus } from '@/features/courses/hooks/instructor/useChangeCourseStatus';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const CourseList = () => {
  const { data, isLoading, error } = useInstructorCourses();

  if (isLoading) {
    return <div className="h-24 animate-pulse rounded bg-slate-100" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {(error as Error).message || '코스 목록을 불러오지 못했습니다.'}
        </AlertDescription>
      </Alert>
    );
  }

  const items = data?.courses ?? [];
  if (items.length === 0) {
    return (
      <div className="rounded border border-dashed p-6 text-center text-slate-600">
        아직 생성한 코스가 없습니다.
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-lg border">
      {items.map((c) => (
        <CourseListItem key={c.id} id={c.id} title={c.title} status={c.status} />
      ))}
    </ul>
  );
};

const CourseListItem = ({ id, title, status }: { id: number; title: string; status: 'draft'|'published'|'archived' }) => {
  const mutation = useChangeCourseStatus(id);
  const canPublish = status === 'draft';
  const canArchive = status === 'published';

  return (
    <li className="grid grid-cols-4 items-center gap-4 p-3 text-sm">
      <div className="col-span-2">
        <div className="font-medium text-slate-900">{title}</div>
      </div>
      <div>
        <StatusBadge status={status} />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!canPublish || mutation.isPending}
          onClick={() => mutation.mutate({ to: 'published' })}
        >
          공개
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!canArchive || mutation.isPending}
          onClick={() => mutation.mutate({ to: 'archived' })}
        >
          보관
        </Button>
      </div>
    </li>
  );
};

