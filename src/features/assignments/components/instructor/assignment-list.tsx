'use client';

import { useInstructorAssignments } from '@/features/assignments/hooks/instructor/useInstructorAssignments';
type Row = { id: number; title: string; status: 'draft'|'published'|'closed'; dueDate: string; weight: number };
import { AssignmentStatusBadge } from '@/features/assignments/components/instructor/status-badge';
import { useChangeAssignmentStatus } from '@/features/assignments/hooks/instructor/useChangeAssignmentStatus';
import { useUpdateAssignment } from '@/features/assignments/hooks/instructor/useUpdateAssignment';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

export const AssignmentList = ({ courseId }: { courseId: number }) => {
  const { data, isLoading, error } = useInstructorAssignments(courseId);

  if (isLoading) return <div className="h-24 animate-pulse rounded bg-slate-100" />;
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {(error as Error).message || '과제 목록을 불러오지 못했습니다.'}
        </AlertDescription>
      </Alert>
    );
  }

  const items = (data?.assignments ?? []) as Row[];
  if (items.length === 0) {
    return (
      <div className="rounded border border-dashed p-6 text-center text-slate-600">
        과제가 없습니다.
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-lg border">
      {items.map((a) => (
        <AssignmentListItem key={a.id} courseId={courseId} {...a} />
      ))}
    </ul>
  );
};

const AssignmentListItem = ({ id, title, status, dueDate, weight, courseId }: { id: number; title: string; status: 'draft'|'published'|'closed'; dueDate: string; weight: number; courseId: number }) => {
  const statusMutation = useChangeAssignmentStatus(id, courseId);
  const updateMutation = useUpdateAssignment(id, courseId);

  const canPublish = status === 'draft';
  const canClose = status === 'published';

  // minimal inline update: dueDate/weight only (핵심 필드)
  const onQuickUpdate = async (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const newDue = String(fd.get('dueDate') || dueDate);
    const newWeight = Number(fd.get('weight') || weight);
    try {
      await updateMutation.mutateAsync({ description: undefined, dueDate: newDue, weight: newWeight, allowLate: false, allowResubmission: false });
    } catch {}
  };

  return (
    <li className="grid grid-cols-5 items-center gap-4 p-3 text-sm">
      <div className="col-span-2">
        <div className="font-medium text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">비중 {weight}% · 마감 {new Date(dueDate).toLocaleString()}</div>
      </div>
      <div>
        <AssignmentStatusBadge status={status} />
      </div>
      <form
        className="col-span-2 flex items-center justify-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void onQuickUpdate(e.currentTarget);
        }}
      >
        <Input name="dueDate" defaultValue={dueDate} className="h-8 w-48" />
        <Input name="weight" type="number" step="0.01" defaultValue={weight} className="h-8 w-24" />
        <Button type="submit" variant="outline" size="sm" disabled={updateMutation.isPending}>
          수정
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canPublish || statusMutation.isPending}
          onClick={() => statusMutation.mutate({ to: 'published' })}
        >
          공개
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canClose || statusMutation.isPending}
          onClick={() => statusMutation.mutate({ to: 'closed' })}
        >
          마감
        </Button>
      </form>
    </li>
  );
};
