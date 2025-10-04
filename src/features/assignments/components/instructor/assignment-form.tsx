'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateAssignmentRequestSchema } from '@/features/assignments/lib/manage.dto';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateAssignment } from '@/features/assignments/hooks/instructor/useCreateAssignment';

type FormValues = z.infer<typeof CreateAssignmentRequestSchema>;

export const AssignmentForm = ({ courseId }: { courseId: number }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(CreateAssignmentRequestSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: new Date().toISOString(),
      weight: 0,
      allowLate: false,
      allowResubmission: false,
    },
  });

  const mutation = useCreateAssignment(courseId);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values);
      reset({ ...values, title: '' });
    } catch {}
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <Label htmlFor="title">제목 *</Label>
        <Input id="title" placeholder="Title" {...register('title')} />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="description">설명</Label>
        <Textarea id="description" rows={3} placeholder="Description" {...register('description')} />
      </div>

      <div>
        <Label htmlFor="dueDate">마감일 (ISO)</Label>
        <Input id="dueDate" placeholder="YYYY-MM-DDTHH:mm:ssZ" {...register('dueDate')} />
        {errors.dueDate && <p className="mt-1 text-xs text-red-600">{errors.dueDate.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="weight">비중 (0~100)</Label>
        <Input id="weight" type="number" step="0.01" {...register('weight', { valueAsNumber: true })} />
        {errors.weight && <p className="mt-1 text-xs text-red-600">{errors.weight.message as string}</p>}
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('allowLate')} /> 지각 허용
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('allowResubmission')} /> 재제출 허용
        </label>
      </div>

      {mutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>{(mutation.error as Error)?.message ?? '저장에 실패했습니다.'}</AlertDescription>
        </Alert>
      )}

      {mutation.isSuccess && (
        <Alert>
          <AlertDescription>과제가 생성되었습니다.</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? '처리중…' : '과제 생성'}
      </Button>
    </form>
  );
};

