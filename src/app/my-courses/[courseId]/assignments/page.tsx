'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssignmentList } from '@/features/assignments/components/assignment-list';
import { useAssignments } from '@/features/assignments/hooks/useAssignments';
import { useCourseDetail } from '@/features/courses/hooks/useCourseDetail';

type AssignmentListPageProps = {
  params: Promise<{ courseId: string }>;
};

export default function AssignmentListPage({ params }: AssignmentListPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const courseId = parseInt(resolvedParams.courseId, 10);

  const { data: course, isLoading: courseLoading } = useCourseDetail(courseId);
  const { data: assignmentsData, isLoading: assignmentsLoading, error } = useAssignments(courseId);

  const isLoading = courseLoading || assignmentsLoading;

  if (error) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-red-900">
            Failed to load assignments
          </h2>
          <p className="mb-4 text-sm text-red-600">
            {error.message || 'An error occurred while loading assignments'}
          </p>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          {course && (
            <h1 className="mt-4 text-3xl font-bold">{course.title} - Assignments</h1>
          )}
        </div>
      </div>

      <AssignmentList
        assignments={assignmentsData?.assignments || []}
        courseId={courseId}
        isLoading={isLoading}
      />
    </div>
  );
}
