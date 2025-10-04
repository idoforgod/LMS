'use client';

import { CourseCard } from './course-card';
import { Button } from '@/components/ui/button';
import type { CourseListResponse } from '@/features/courses/lib/dto';

type CourseListProps = {
  data: CourseListResponse;
  isLoading: boolean;
  error: Error | null;
  onPageChange: (page: number) => void;
};

export const CourseList = ({
  data,
  isLoading,
  error,
  onPageChange,
}: CourseListProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-lg border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">
          코스를 불러오는 중 오류가 발생했습니다.
        </p>
        <p className="mt-2 text-xs text-red-500">{error.message}</p>
      </div>
    );
  }

  if (!data.courses || data.courses.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
        <p className="text-slate-600">검색 결과가 없습니다.</p>
        <p className="mt-2 text-sm text-slate-500">
          다른 검색어나 필터를 시도해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(data.pagination.page - 1)}
            disabled={data.pagination.page === 1}
          >
            이전
          </Button>

          <span className="text-sm text-slate-600">
            {data.pagination.page} / {data.pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(data.pagination.page + 1)}
            disabled={data.pagination.page >= data.pagination.totalPages}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
};
