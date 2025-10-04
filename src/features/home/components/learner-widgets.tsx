'use client';

import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';

export const LearnerWidgets = () => {
  const { data, isLoading, error } = useDashboardSummary();

  if (isLoading) return <Skeleton className="h-28" />;
  if (error || !data) return null; // 비로그인/에러 시 표시하지 않음

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">마감 임박 과제</h3>
        {data.imminentAssignments.length === 0 ? (
          <p className="text-sm text-slate-500">마감 임박 과제가 없습니다.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {data.imminentAssignments.slice(0, 5).map((a) => (
              <li key={a.assignmentId} className="flex items-center justify-between">
                <span>{a.title}</span>
                <Link className="text-blue-600 hover:underline" href={`/my-courses/${a.courseId}/assignments/${a.assignmentId}`}>
                  이동
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">최근 피드백</h3>
        {data.recentFeedback.length === 0 ? (
          <p className="text-sm text-slate-500">최근 피드백이 없습니다.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {data.recentFeedback.slice(0, 5).map((f) => (
              <li key={`${f.assignmentId}-${f.gradedAt}`} className="flex items-center justify-between">
                <span>{f.score ?? '-'} 점</span>
                <Link className="text-blue-600 hover:underline" href={`/my-courses/${f.courseId}/assignments/${f.assignmentId}`}>
                  상세
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

