'use client';

import { use } from 'react';
import { CourseForm } from '@/features/courses/components/instructor/course-form';
import { CourseList } from '@/features/courses/components/instructor/course-list';

type InstructorCoursesPageProps = {
  params: Promise<Record<string, never>>;
};

export default function InstructorCoursesPage({ params }: InstructorCoursesPageProps) {
  void use(params);
  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold">코스 관리</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-xl font-semibold">새 코스 생성</h2>
          <CourseForm />
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold">내 코스</h2>
          <CourseList />
        </section>
      </div>
    </div>
  );
}

