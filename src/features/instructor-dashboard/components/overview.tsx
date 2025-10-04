'use client';

import { useInstructorDashboard } from '@/features/instructor-dashboard/hooks/useInstructorDashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export const InstructorOverview = () => {
  const { data, isLoading, error } = useInstructorDashboard({ limit: 10 });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error.message || '대시보드 데이터를 불러오지 못했습니다.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  const { courses, pendingCounts, recent } = data;
  const byStatus = {
    draft: courses.filter((c) => c.status === 'draft'),
    published: courses.filter((c) => c.status === 'published'),
    archived: courses.filter((c) => c.status === 'archived'),
  } as const;

  const pendingByCourse = new Map<number, number>(
    pendingCounts.map((p) => [p.courseId, p.pending]),
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-xl font-semibold">내 코스</h2>
        {courses.length === 0 ? (
          <div className="rounded border border-dashed p-6 text-center text-slate-600">
            아직 생성한 코스가 없습니다. 첫 코스를 만들어보세요.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {(['draft', 'published', 'archived'] as const).map((s) => (
              <div key={s} className="rounded-lg border p-4">
                <div className="mb-2 text-sm font-medium uppercase text-slate-500">
                  {s}
                </div>
                <ul className="space-y-2">
                  {byStatus[s].length === 0 && (
                    <li className="text-sm text-slate-500">없음</li>
                  )}
                  {byStatus[s].map((c) => (
                    <li key={c.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-900">{c.title}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        대기 {pendingByCourse.get(c.id) ?? 0}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">최근 제출물</h2>
        {recent.length === 0 ? (
          <div className="rounded border border-dashed p-6 text-center text-slate-600">
            최근 제출물이 없습니다.
          </div>
        ) : (
          <ul className="divide-y rounded-lg border">
            {recent.map((r) => (
              <li key={`${r.assignmentId}-${r.submittedAt}`} className="grid grid-cols-4 gap-4 p-3 text-sm">
                <div className="col-span-2">
                  <div className="font-medium text-slate-900">{r.title}</div>
                  <div className="text-slate-500">코스 ID: {r.courseId}</div>
                </div>
                <div className="text-slate-700">상태: {r.status}</div>
                <div className="text-right text-slate-700">
                  제출: {new Date(r.submittedAt).toLocaleString()}
                  {r.gradedAt && (
                    <>
                      <br />채점: {new Date(r.gradedAt).toLocaleString()}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

