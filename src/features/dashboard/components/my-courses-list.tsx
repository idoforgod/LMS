"use client";

import { Card } from "@/components/ui/card";
import type { DashboardSummary } from "@/features/dashboard/lib/dto";

export function MyCoursesList({ items }: { items: DashboardSummary["myCourses"] }) {
  const empty = items.length === 0;
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold">내 코스</h2>
      {empty ? (
        <p className="mt-2 text-sm text-slate-500">등록된 코스가 없습니다. 코스를 탐색해 시작해보세요.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((c) => {
            const percent = Math.round(c.progress * 100);
            return (
              <li key={c.courseId} className="rounded border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{c.title}</div>
                  <div className="text-sm text-slate-500">{percent}%</div>
                </div>
                <div className="mt-2 h-2 w-full rounded bg-slate-200">
                  <div
                    className="h-2 rounded bg-slate-800 transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
