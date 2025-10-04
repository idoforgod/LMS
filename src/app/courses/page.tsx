'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CourseFilter } from '@/features/courses/components/course-filter';
import { CourseList } from '@/features/courses/components/course-list';
import { useCourses } from '@/features/courses/hooks/useCourses';
import type { CourseListQuery } from '@/features/courses/lib/dto';

// Mock data for categories and difficulties
// In production, these should be fetched from the API
const CATEGORIES = [
  { id: 1, name: '프로그래밍' },
  { id: 2, name: '디자인' },
  { id: 3, name: '비즈니스' },
];

const DIFFICULTIES = [
  { id: 1, name: '초급' },
  { id: 2, name: '중급' },
  { id: 3, name: '고급' },
];

export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<CourseListQuery>(() => {
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category')
      ? parseInt(searchParams.get('category')!, 10)
      : undefined;
    const difficulty = searchParams.get('difficulty')
      ? parseInt(searchParams.get('difficulty')!, 10)
      : undefined;
    const sort = (searchParams.get('sort') as 'latest' | 'popular') || 'latest';
    const page = searchParams.get('page')
      ? parseInt(searchParams.get('page')!, 10)
      : 1;

    return {
      search,
      category,
      difficulty,
      sort,
      page,
      pageSize: 20,
    };
  });

  const { data, isLoading, error } = useCourses(filters);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category.toString());
    if (filters.difficulty)
      params.set('difficulty', filters.difficulty.toString());
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.page > 1) params.set('page', filters.page.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `/courses?${queryString}` : '/courses';

    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  const handleFilterChange = (newFilters: CourseListQuery) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">코스 카탈로그</h1>
        <p className="mt-2 text-slate-600">
          관심 있는 코스를 찾아보고 수강신청하세요.
        </p>
      </header>

      <div className="space-y-6">
        <CourseFilter
          initialFilters={filters}
          onFilterChange={handleFilterChange}
          categories={CATEGORIES}
          difficulties={DIFFICULTIES}
        />

        <CourseList
          data={data || { courses: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 } }}
          isLoading={isLoading}
          error={error}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
