'use client';

import { useGrades } from '@/features/grades/hooks/useGrades';
import { formatDueDate } from '@/lib/date-utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

type GradesViewProps = {
  courseId: number;
};

export const GradesView = ({ courseId }: GradesViewProps) => {
  const { data, isLoading, error } = useGrades(courseId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error.message || '성적 정보를 불러오지 못했습니다.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  const items = data.items;

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-slate-600">
        아직 제출한 과제가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">코스 총점</h2>
        <div className="text-2xl font-bold">{Math.round(data.total * 100) / 100}%</div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="p-3">과제</th>
              <th className="p-3">비중</th>
              <th className="p-3">상태</th>
              <th className="p-3">지각</th>
              <th className="p-3">점수</th>
              <th className="p-3">피드백</th>
              <th className="p-3">제출</th>
              <th className="p-3">채점</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.assignmentId} className="border-t">
                <td className="p-3 font-medium text-slate-900">{it.title}</td>
                <td className="p-3">{it.weight}%</td>
                <td className="p-3">{it.status ?? '-'}</td>
                <td className="p-3">{it.isLate === null ? '-' : it.isLate ? 'Yes' : 'No'}</td>
                <td className="p-3">{it.score ?? '-'}</td>
                <td className="p-3 whitespace-pre-wrap">{it.feedback ?? '-'}</td>
                <td className="p-3">{it.submittedAt ? formatDueDate(it.submittedAt) : '-'}</td>
                <td className="p-3">{it.gradedAt ? formatDueDate(it.gradedAt) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

