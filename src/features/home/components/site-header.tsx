"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { LogOut, Plus } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useInstructorDashboard } from '@/features/instructor-dashboard/hooks/useInstructorDashboard';
import { useInstructorCourses } from '@/features/courses/hooks/instructor/useInstructorCourses';
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCourse } from '@/features/courses/hooks/instructor/useCreateCourse';
import { useCreateAssignment } from '@/features/assignments/hooks/instructor/useCreateAssignment';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';

export const SiteHeader = () => {
  const { user, isAuthenticated, isLoading, refresh } = useCurrentUser();
  const { data: instructorData, error: instructorError } = useInstructorDashboard({ limit: 1 });
  const isInstructor = !!instructorData && !instructorError;
  const { data: learnerData, error: learnerError } = useDashboardSummary();
  const isLearner = !!learnerData && !learnerError;
  const { data: instructorCourses } = useInstructorCourses();
  const router = useRouter();
  const { toast } = useToast();
  // Dialog & form state
  const [openCreateCourse, setOpenCreateCourse] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const courseMut = useCreateCourse();

  const courseOptions = useMemo(() => instructorCourses?.courses ?? [], [instructorCourses]);
  const [openCreateAssignment, setOpenCreateAssignment] = useState(false);
  const defaultCourseId = courseOptions[0]?.id;
  const [assignCourseId, setAssignCourseId] = useState<number | undefined>(defaultCourseId);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDue, setAssignDue] = useState<string>(new Date().toISOString());
  const [assignWeight, setAssignWeight] = useState<number>(0);
  const [assignAllowLate, setAssignAllowLate] = useState(false);
  const [assignAllowResub, setAssignAllowResub] = useState(false);
  const assignMut = useCreateAssignment(assignCourseId ?? 0);
  const [assignPublishNow, setAssignPublishNow] = useState(false);

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await refresh();
    router.replace('/');
  }, [refresh, router]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white/80 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <Link href="/" className="text-lg font-semibold">
        SuperNext LMS
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/courses" className="text-slate-700 hover:text-slate-900">
          코스 카탈로그
        </Link>
        {isAuthenticated && (
          <>
            <Link href="/dashboard" className="text-slate-700 hover:text-slate-900">
              대시보드
            </Link>
            {isLearner && (
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-md border px-2 py-1 text-slate-700 hover:bg-slate-50">
                  내 코스
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>최근 코스</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {learnerData?.myCourses?.length ? (
                    learnerData.myCourses.slice(0, 6).map((c) => (
                      <DropdownMenuItem key={c.courseId} asChild>
                        <Link href={`/my-courses/${c.courseId}/assignments`}>
                          {c.title} <span className="ml-2 text-xs text-slate-500">{Math.round(c.progress * 100)}%</span>
                        </Link>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>등록된 코스가 없습니다</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {isInstructor && (
              <div className="flex items-center gap-2">
                <Link href="/instructor/dashboard" className="text-slate-700 hover:text-slate-900">
                  강사 대시보드
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-md border px-2 py-1 text-slate-700 hover:bg-slate-50">
                    관리
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>강사 메뉴</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/instructor/courses">코스 관리</Link>
                    </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpenCreateCourse(true); }}>
              <Plus className="mr-2 h-3.5 w-3.5" /> 새 코스 만들기
            </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>과제 관리</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpenCreateAssignment(true); }}>
                      <Plus className="mr-2 h-3.5 w-3.5" /> 새 과제 만들기
                    </DropdownMenuItem>
                    {instructorCourses?.courses?.length ? (
                      instructorCourses.courses.slice(0, 6).map((c) => (
                        <DropdownMenuItem key={c.id} asChild>
                          <Link href={`/instructor/courses/${c.id}/assignments`}>
                            과제 관리: {c.title}
                          </Link>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>등록된 코스가 없습니다</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </>
        )}
        {isLoading ? (
          <span className="text-slate-500">세션 확인 중…</span>
        ) : isAuthenticated ? (
          <div className="flex items-center gap-3">
            {isInstructor ? (
              <Badge>instructor</Badge>
            ) : isLearner ? (
              <Badge variant="secondary">learner</Badge>
            ) : null}
            <div className="hidden items-center gap-2 md:flex">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {(user?.email?.[0] ?? 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-slate-600">{user?.email ?? '사용자'}</span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1 rounded-md border px-2 py-1 text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" /> 로그아웃
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-md border px-3 py-1 text-slate-700 hover:bg-slate-50">
              로그인
            </Link>
            <Link href="/signup" className="rounded-md bg-slate-900 px-3 py-1 text-white hover:bg-slate-800">
              회원가입
            </Link>
          </div>
        )}
      </nav>
      {/* 새 코스 만들기 다이얼로그 */}
      <Dialog open={openCreateCourse} onOpenChange={setOpenCreateCourse}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 코스 만들기</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="course-title">제목 *</Label>
              <Input id="course-title" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="course-desc">소개</Label>
              <Textarea id="course-desc" rows={3} value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreateCourse(false)}>취소</Button>
            <Button
              onClick={async () => {
                if (!courseTitle.trim()) return;
                try {
                  await courseMut.mutateAsync({ title: courseTitle.trim(), description: courseDesc || undefined });
                  toast({ title: '코스 생성 완료', description: courseTitle.trim() });
                  setCourseTitle('');
                  setCourseDesc('');
                  setOpenCreateCourse(false);
                } catch (e: any) {
                  toast({ title: '코스 생성 실패', description: e?.message ?? '오류가 발생했습니다.', variant: 'destructive' });
                }
              }}
              disabled={courseMut.isPending || !courseTitle.trim()}
            >
              {courseMut.isPending ? '처리 중…' : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 새 과제 만들기 다이얼로그 */}
      <Dialog open={openCreateAssignment} onOpenChange={setOpenCreateAssignment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 과제 만들기</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>코스 선택 *</Label>
              <Select
                value={assignCourseId ? String(assignCourseId) : undefined}
                onValueChange={(val) => setAssignCourseId(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="코스를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {courseOptions.length ? (
                    courseOptions.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="-1" disabled>
                      등록된 코스가 없습니다
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assign-title">제목 *</Label>
              <Input id="assign-title" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="assign-due">마감일(ISO)</Label>
              <Input id="assign-due" value={assignDue} onChange={(e) => setAssignDue(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="assign-weight">비중(0~100)</Label>
              <Input id="assign-weight" type="number" step="0.01" value={assignWeight} onChange={(e) => setAssignWeight(Number(e.target.value))} />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={assignAllowLate} onChange={(e) => setAssignAllowLate(e.target.checked)} /> 지각 허용
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={assignAllowResub} onChange={(e) => setAssignAllowResub(e.target.checked)} /> 재제출 허용
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={assignPublishNow} onChange={(e) => setAssignPublishNow(e.target.checked)} /> 생성 후 게시
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreateAssignment(false)}>취소</Button>
            <Button
              onClick={async () => {
                if (!assignCourseId || !assignTitle.trim()) return;
                try {
                  const created = await assignMut.mutateAsync({
                    title: assignTitle.trim(),
                    description: undefined,
                    dueDate: assignDue,
                    weight: assignWeight,
                    allowLate: assignAllowLate,
                    allowResubmission: assignAllowResub,
                  });
                  toast({ title: '과제 생성 완료', description: assignTitle.trim() });
                  if (assignPublishNow && assignCourseId && created?.id) {
                    try {
                      let headers: Record<string, string> | undefined;
                      if (typeof window !== 'undefined') {
                        const token = localStorage.getItem('auth_token');
                        if (token) headers = { Authorization: `Bearer ${token}` };
                      }
                      await apiClient.patch(`/api/instructor/assignments/${created.id}/status`, { to: 'published' }, { headers });
                      toast({ title: '과제 게시 완료', description: assignTitle.trim() });
                    } catch (e: any) {
                      toast({ title: '과제 게시 실패', description: extractApiErrorMessage(e, '오류가 발생했습니다.'), variant: 'destructive' });
                    }
                  }
                  setAssignTitle('');
                  setAssignDue(new Date().toISOString());
                  setAssignWeight(0);
                  setAssignAllowLate(false);
                  setAssignAllowResub(false);
                  setOpenCreateAssignment(false);
                } catch (e: any) {
                  toast({ title: '과제 생성 실패', description: e?.message ?? '오류가 발생했습니다.', variant: 'destructive' });
                }
              }}
              disabled={assignMut.isPending || !assignCourseId || !assignTitle.trim()}
            >
              {assignMut.isPending ? '처리 중…' : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};
