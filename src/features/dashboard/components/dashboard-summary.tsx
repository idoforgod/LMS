"use client";

import { Card } from "@/components/ui/card";

type Props = {
  totalCourses: number;
  averageProgress: number; // 0..1
};

export function DashboardSummary({ totalCourses, averageProgress }: Props) {
  const percent = Math.round(averageProgress * 100);
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">요약</h2>
          <p className="text-sm text-slate-500">내 코스와 진행 현황</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{totalCourses}</div>
          <div className="text-xs text-slate-500">총 코스 수</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-slate-600">평균 진행률</span>
          <span className="font-medium">{percent}%</span>
        </div>
        <div className="h-2 w-full rounded bg-slate-200">
          <div
            className="h-2 rounded bg-slate-800 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

