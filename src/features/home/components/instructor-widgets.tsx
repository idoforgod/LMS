'use client';

import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useInstructorDashboard } from '@/features/instructor-dashboard/hooks/useInstructorDashboard';

export const InstructorWidgets = () => {
  const { data, isLoading, error } = useInstructorDashboard({ limit: 5 });

  if (isLoading) return <Skeleton className="h-28" />;
  if (error || !data) return null; // 강사 아님/에러 시 숨김

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">강사용 빠른 액션</h3>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link className="text-blue-600 hover:underline" href="/instructor/courses">코스 관리</Link>
          <Link className="text-blue-600 hover:underline" href="/instructor/dashboard">대시보드</Link>
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">최근 제출물</h3>
        {data.recent.length === 0 ? (
          <p className="text-sm text-slate-500">최근 제출물이 없습니다.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {data.recent.map((r) => (
              <li key={`${r.assignmentId}-${r.submittedAt}`} className="flex items-center justify-between">
                <span>{r.title}</span>
                <span className="text-slate-500">{new Date(r.submittedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

