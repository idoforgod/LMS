"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CourseDetail } from '@/features/courses/lib/dto';

type CourseCardProps = {
  course: CourseDetail;
};

export const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Link href={`/courses/${course.id}`} className="block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
          <Image
            alt={`${course.title} thumbnail`}
            src={`https://picsum.photos/seed/lms-course-${course.id}/640/360`}
            width={640}
            height={360}
            className="h-full w-full object-cover"
          />
        </div>
        <CardHeader>
          <div className="mb-2 flex flex-wrap gap-2">
            {course.category && (
              <Badge variant="secondary">{course.category.name}</Badge>
            )}
            {course.difficulty && (
              <Badge variant="outline">{course.difficulty.name}</Badge>
            )}
          </div>
          <CardTitle className="line-clamp-2 text-xl">
            {course.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 line-clamp-3 text-sm text-slate-600">
            {course.description || '코스 설명이 없습니다.'}
          </p>
          <p className="text-xs text-slate-500">
            강사: {course.instructor.name}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};
