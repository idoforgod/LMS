'use client';

import { use } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseDetail } from '@/features/courses/components/course-detail';
import { useCourseDetail } from '@/features/courses/hooks/useCourseDetail';
import { recordCourseVisit } from '@/features/home/hooks/useLastActivity';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

type CourseDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const courseId = parseInt(resolvedParams.id, 10);

  const { data: course, isLoading, error } = useCourseDetail(courseId);

  useEffect(() => {
    if (course) {
      recordCourseVisit(course.id, course.title);
    }
  }, [course]);
  const { isAuthenticated } = useCurrentUser();

  // TODO: Get user role from profile
  const isLearner = true; // Temporary: assume all authenticated users are learners

  if (isLoading) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-4xl px-6 py-8">
        <div className="space-y-6">
          <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-64 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-4xl px-6 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-red-900">
            코스를 찾을 수 없습니다
          </h2>
          <p className="mb-4 text-sm text-red-600">
            {error?.message || '요청하신 코스가 존재하지 않습니다.'}
          </p>
          <Button variant="outline" onClick={() => router.push('/courses')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            코스 목록으로
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-4xl px-6 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/courses')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          코스 목록으로
        </Button>
      </div>

      <CourseDetail
        course={course}
        isAuthenticated={isAuthenticated}
        isLearner={isLearner}
      />
    </div>
  );
}
