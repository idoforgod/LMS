'use client';

import { useState, useMemo } from 'react';
import { CourseList } from '@/features/courses/components/course-list';
import { useCourses } from '@/features/courses/hooks/useCourses';
import type { CourseListQuery } from '@/features/courses/lib/dto';

export const HomeCourseSection = ({ title, query }: { title: string; query: CourseListQuery }) => {
  const [page, setPage] = useState(query.page ?? 1);
  const mergedQuery = useMemo(() => ({ ...query, page }), [query, page]);
  const { data, isLoading, error } = useCourses(mergedQuery);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {data && (
        <CourseList data={data} isLoading={isLoading} error={error as Error | null} onPageChange={setPage} />
      )}
    </section>
  );
};
