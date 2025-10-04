'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GradesView } from '@/features/grades/components/grades-view';
import { useCourseDetail } from '@/features/courses/hooks/useCourseDetail';

type GradesPageProps = {
  params: Promise<{ courseId: string }>;
};

export default function GradesPage({ params }: GradesPageProps) {
  const router = useRouter();
  const resolved = use(params);
  const courseId = parseInt(resolved.courseId, 10);

  const { data: course } = useCourseDetail(courseId);

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="mt-4 text-3xl font-bold">
            {course ? `${course.title} - Grades` : 'Grades'}
          </h1>
        </div>
      </div>

      <GradesView courseId={courseId} />
    </div>
  );
}

