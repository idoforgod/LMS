"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useEnroll } from '@/features/enrollments/hooks/useEnroll';
import { useCancelEnrollment } from '@/features/enrollments/hooks/useCancelEnrollment';
import type { CourseDetail as CourseDetailType } from '@/features/courses/lib/dto';

type CourseDetailProps = {
  course: CourseDetailType;
  isAuthenticated: boolean;
  isLearner: boolean;
};

export const CourseDetail = ({
  course,
  isAuthenticated,
  isLearner,
}: CourseDetailProps) => {
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { mutate: enroll, isPending: isEnrolling } = useEnroll();
  const { mutate: cancelEnrollment, isPending: isCancelling } =
    useCancelEnrollment();

  const handleEnroll = () => {
    enroll(course.id, {
      onSuccess: () => {
        toast({
          title: '수강신청 완료',
          description: '코스에 성공적으로 등록되었습니다.',
        });
      },
      onError: (error) => {
        toast({
          title: '수강신청 실패',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const handleCancelEnrollment = () => {
    cancelEnrollment(course.id, {
      onSuccess: () => {
        toast({
          title: '수강취소 완료',
          description: '코스 수강이 취소되었습니다.',
        });
        setShowCancelDialog(false);
      },
      onError: (error) => {
        toast({
          title: '수강취소 실패',
          description: error.message,
          variant: 'destructive',
        });
        setShowCancelDialog(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="relative h-56 w-full overflow-hidden rounded-t-lg">
          <Image
            alt={`${course.title} cover`}
            src={`https://picsum.photos/seed/lms-course-cover-${course.id}/1200/480`}
            width={1200}
            height={480}
            className="h-full w-full object-cover"
          />
        </div>
        <CardHeader>
          <div className="mb-3 flex flex-wrap gap-2">
            {course.category && (
              <Badge variant="secondary">{course.category.name}</Badge>
            )}
            {course.difficulty && (
              <Badge variant="outline">{course.difficulty.name}</Badge>
            )}
            <Badge
              variant={
                course.status === 'published'
                  ? 'default'
                  : course.status === 'archived'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {course.status === 'published'
                ? '게시됨'
                : course.status === 'archived'
                  ? '보관됨'
                  : '초안'}
            </Badge>
          </div>
          <CardTitle className="text-3xl">{course.title}</CardTitle>
          <CardDescription className="text-base">
            강사: {course.instructor.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">코스 소개</h3>
            <p className="whitespace-pre-wrap text-slate-600">
              {course.description || '코스 설명이 없습니다.'}
            </p>
          </div>

          {course.curriculum && (
            <div>
              <h3 className="mb-2 font-semibold">커리큘럼</h3>
              <p className="whitespace-pre-wrap text-slate-600">
                {course.curriculum}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {!isAuthenticated ? (
              <Button disabled>로그인이 필요합니다</Button>
            ) : !isLearner ? (
              <Button disabled>학습자만 수강신청 가능합니다</Button>
            ) : course.isEnrolled ? (
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                disabled={isCancelling}
              >
                {isCancelling ? '처리 중...' : '수강취소'}
              </Button>
            ) : (
              <Button onClick={handleEnroll} disabled={isEnrolling}>
                {isEnrolling ? '처리 중...' : '수강신청'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>수강취소 확인</DialogTitle>
            <DialogDescription>
              정말로 이 코스의 수강을 취소하시겠습니까? 제출한 과제와 성적
              기록은 유지되지만 대시보드에서 제거됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelEnrollment}
              disabled={isCancelling}
            >
              {isCancelling ? '처리 중...' : '수강취소'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
