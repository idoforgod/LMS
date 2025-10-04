"use client";

import { Card } from "@/components/ui/card";
import { format, differenceInHours } from "date-fns";
import type { DashboardSummary } from "@/features/dashboard/lib/dto";

export function ImminentAssignments({ items }: { items: DashboardSummary["imminentAssignments"] }) {
  const empty = items.length === 0;
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold">마감 임박</h2>
      {empty ? (
        <p className="mt-2 text-sm text-slate-500">임박한 과제가 없습니다.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((a) => {
            const due = new Date(a.dueDate);
            const hours = Math.max(0, differenceInHours(due, new Date()));
            return (
              <li key={a.assignmentId} className="rounded border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{a.title}</div>
                    <div className="truncate text-xs text-slate-500">
                      마감: {format(due, "yyyy-MM-dd HH:mm")} · D-{hours}h
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
