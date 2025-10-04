'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCourseRequestSchema } from '@/features/courses/lib/manage.dto';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateCourse } from '@/features/courses/hooks/instructor/useCreateCourse';

type FormValues = z.infer<typeof CreateCourseRequestSchema>;

export const CourseForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(CreateCourseRequestSchema),
    defaultValues: { title: '', description: '', curriculum: '' },
  });

  const mutation = useCreateCourse();

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values);
      reset({ title: '', description: '', curriculum: '' });
    } catch {}
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <Label htmlFor="title">제목 *</Label>
        <Input id="title" placeholder="Course title" {...register('title')} />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">소개</Label>
        <Textarea id="description" rows={4} placeholder="Description" {...register('description')} />
      </div>

      <div>
        <Label htmlFor="curriculum">커리큘럼</Label>
        <Textarea id="curriculum" rows={6} placeholder="Curriculum" {...register('curriculum')} />
      </div>

      {mutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>{(mutation.error as Error)?.message ?? '저장에 실패했습니다.'}</AlertDescription>
        </Alert>
      )}

      {mutation.isSuccess && (
        <Alert>
          <AlertDescription>코스가 생성되었습니다.</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? '처리중…' : '코스 생성'}
      </Button>
    </form>
  );
};

