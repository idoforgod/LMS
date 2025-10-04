"use client";

import Image from "next/image";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardSummary";
import type { DashboardSummary } from "@/features/dashboard/lib/dto";
import { DashboardSummary as SummaryCard } from "@/features/dashboard/components/dashboard-summary";
import { MyCoursesList } from "@/features/dashboard/components/my-courses-list";
import { ImminentAssignments } from "@/features/dashboard/components/imminent-assignments";
import { RecentFeedback } from "@/features/dashboard/components/recent-feedback";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

type DashboardPageProps = {
  params: Promise<Record<string, never>>;
};

export default function DashboardPage({ params }: DashboardPageProps) {
  void params;
  const { user } = useCurrentUser();
  const { toast } = useToast();

  const { data, isLoading, error } = useDashboardSummary();

  useEffect(() => {
    if (error) {
      toast({ title: "대시보드 오류", description: (error as Error).message });
    }
  }, [error, toast]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">대시보드</h1>
        <p className="text-slate-500">
          {user?.email ?? "알 수 없는 사용자"} 님, 환영합니다.
        </p>
      </header>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <Image
          alt="대시보드"
          src="https://picsum.photos/seed/dashboard/960/420"
          width={960}
          height={420}
          className="h-auto w-full object-cover"
        />
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <article className="rounded-lg border border-slate-200 p-4">
            <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-2 w-full animate-pulse rounded bg-slate-200" />
          </article>
        ) : (
          <SummaryCard
            totalCourses={data ? data.myCourses.length : 0}
            averageProgress={
              data && data.myCourses.length > 0
                ? data.myCourses.reduce((acc, c) => acc + c.progress, 0) / data.myCourses.length
                : 0
            }
          />
        )}
        {isLoading ? (
          <article className="rounded-lg border border-slate-200 p-4">
            <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-24 w-full animate-pulse rounded bg-slate-200" />
          </article>
        ) : (
          (() => {
            const items: DashboardSummary['imminentAssignments'] = data?.imminentAssignments ?? [];
            return <ImminentAssignments items={items} />;
          })()
        )}
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <article className="rounded-lg border border-slate-200 p-4">
            <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-24 w-full animate-pulse rounded bg-slate-200" />
          </article>
        ) : (
          (() => {
            const items: DashboardSummary['myCourses'] = data?.myCourses ?? [];
            return <MyCoursesList items={items} />;
          })()
        )}
        {isLoading ? (
          <article className="rounded-lg border border-slate-200 p-4">
            <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-24 w-full animate-pulse rounded bg-slate-200" />
          </article>
        ) : (
          (() => {
            const items: DashboardSummary['recentFeedback'] = data?.recentFeedback ?? [];
            return <RecentFeedback items={items} />;
          })()
        )}
      </section>
    </div>
  );
}
