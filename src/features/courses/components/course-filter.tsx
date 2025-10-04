'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CourseListQuery } from '@/features/courses/lib/dto';

type CourseFilterProps = {
  initialFilters: CourseListQuery;
  onFilterChange: (filters: CourseListQuery) => void;
  categories: Array<{ id: number; name: string }>;
  difficulties: Array<{ id: number; name: string }>;
};

export const CourseFilter = ({
  initialFilters,
  onFilterChange,
  categories,
  difficulties,
}: CourseFilterProps) => {
  const [search, setSearch] = useState(initialFilters.search || '');
  const [category, setCategory] = useState<number | undefined>(
    initialFilters.category,
  );
  const [difficulty, setDifficulty] = useState<number | undefined>(
    initialFilters.difficulty,
  );
  const [sort, setSort] = useState<'latest' | 'popular'>(
    initialFilters.sort || 'latest',
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        ...initialFilters,
        search: search || undefined,
        category,
        difficulty,
        sort,
        page: 1, // Reset to page 1 on filter change
      });
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, difficulty, sort]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory(undefined);
    setDifficulty(undefined);
    setSort('latest');
    onFilterChange({
      page: 1,
      pageSize: initialFilters.pageSize,
      sort: 'latest',
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="코스 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-2 md:flex-row">
          <Select
            value={category?.toString() || 'all'}
            onValueChange={(value) =>
              setCategory(value === 'all' ? undefined : parseInt(value, 10))
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 카테고리</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={difficulty?.toString() || 'all'}
            onValueChange={(value) =>
              setDifficulty(value === 'all' ? undefined : parseInt(value, 10))
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="난이도" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 난이도</SelectItem>
              {difficulties.map((diff) => (
                <SelectItem key={diff.id} value={diff.id.toString()}>
                  {diff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(value) => setSort(value as 'latest' | 'popular')}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="popular">인기순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
          className="text-sm"
        >
          필터 초기화
        </Button>
      </div>
    </div>
  );
};
