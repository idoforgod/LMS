"use client";

import { Card } from "@/components/ui/card";
import type { DashboardSummary } from "@/features/dashboard/lib/dto";

export function RecentFeedback({ items }: { items: DashboardSummary["recentFeedback"] }) {
  const empty = items.length === 0;
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold">최근 피드백</h2>
      {empty ? (
        <p className="mt-2 text-sm text-slate-500">최근 피드백이 없습니다.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((f) => (
            <li key={`${f.assignmentId}-${f.gradedAt}`} className="rounded border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <div className="truncate text-sm text-slate-600">과제 #{f.assignmentId}</div>
                <div className="text-sm font-medium">{f.score ?? '-'} 점</div>
              </div>
              {f.feedback && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-700">{f.feedback}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
