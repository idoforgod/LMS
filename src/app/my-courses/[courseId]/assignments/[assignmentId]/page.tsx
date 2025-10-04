'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssignmentDetailComponent } from '@/features/assignments/components/assignment-detail';
import { useAssignmentDetail } from '@/features/assignments/hooks/useAssignmentDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { recordCourseVisit } from '@/features/home/hooks/useLastActivity';

type AssignmentDetailPageProps = {
  params: Promise<{ courseId: string; assignmentId: string }>;
};

export default function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const courseId = parseInt(resolvedParams.courseId, 10);
  const assignmentId = parseInt(resolvedParams.assignmentId, 10);

  const { data: assignment, isLoading, error } = useAssignmentDetail(assignmentId);

  useEffect(() => {
    if (courseId) {
      // 제목은 과제 제목으로 대체(옵션)
      recordCourseVisit(courseId, assignment?.title ?? undefined);
    }
  }, [courseId, assignment?.title]);

  if (isLoading) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-4xl px-6 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-4xl px-6 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-red-900">
            Assignment not found
          </h2>
          <p className="mb-4 text-sm text-red-600">
            {error?.message || 'The requested assignment does not exist or you do not have access to it.'}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push(`/my-courses/${courseId}/assignments`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assignments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-4xl px-6 py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-600">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
        >
          Dashboard
        </Button>
        <span>/</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/my-courses/${courseId}/assignments`)}
        >
          Assignments
        </Button>
        <span>/</span>
        <span className="font-medium text-slate-900">{assignment.title}</span>
      </nav>

      <AssignmentDetailComponent assignment={assignment} />
    </div>
  );
}
