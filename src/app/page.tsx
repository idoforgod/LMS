"use client";

import { HeroSearch } from '@/features/home/components/hero-search';
import { CategoryFilterBar } from '@/features/home/components/category-filter-bar';
import { HomeCourseSection } from '@/features/home/components/home-course-section';
import { LearnerWidgets } from '@/features/home/components/learner-widgets';
import { InstructorWidgets } from '@/features/home/components/instructor-widgets';

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-6 py-8 space-y-10">
        <HeroSearch />
        <CategoryFilterBar />
        <HomeCourseSection title="인기 코스" query={{ sort: 'popular', page: 1, pageSize: 6 }} />
        <HomeCourseSection title="최신 코스" query={{ sort: 'latest', page: 1, pageSize: 6 }} />
        <LearnerWidgets />
        <InstructorWidgets />
      </div>
    </main>
  );
}

