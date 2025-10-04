'use client';

import { use } from 'react';
import { AssignmentForm } from '@/features/assignments/components/instructor/assignment-form';
import { AssignmentList } from '@/features/assignments/components/instructor/assignment-list';

type InstructorAssignmentsPageProps = {
  params: Promise<{ courseId: string }>;
};

export default function InstructorAssignmentsPage({ params }: InstructorAssignmentsPageProps) {
  const resolved = use(params);
  const courseId = parseInt(resolved.courseId, 10);

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold">과제 관리</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-xl font-semibold">새 과제 생성</h2>
          <AssignmentForm courseId={courseId} />
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold">과제 목록</h2>
          <AssignmentList courseId={courseId} />
        </section>
      </div>
    </div>
  );
}

