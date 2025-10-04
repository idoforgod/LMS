"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { LogOut } from 'lucide-react';
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

export const SiteHeader = () => {
  const { user, isAuthenticated, isLoading, refresh } = useCurrentUser();
  const { data: instructorData, error: instructorError } = useInstructorDashboard({ limit: 1 });
  const isInstructor = !!instructorData && !instructorError;
  const { data: learnerData, error: learnerError } = useDashboardSummary();
  const isLearner = !!learnerData && !learnerError;
  const { data: instructorCourses } = useInstructorCourses();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await refresh();
    router.replace('/');
  }, [refresh, router]);

  return (
    <header className="flex items-center justify-between py-4">
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
              <>
                <Link href="/dashboard" className="text-slate-700 hover:text-slate-900">
                  내 학습
                </Link>
                <Link href="/dashboard" className="text-slate-700 hover:text-slate-900">
                  성적/피드백
                </Link>
              </>
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
                    <DropdownMenuSeparator />
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
    </header>
  );
};
