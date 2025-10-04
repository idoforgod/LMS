"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { LogOut } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';

export const SiteHeader = () => {
  const { user, isAuthenticated, isLoading, refresh } = useCurrentUser();
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
          <Link href="/dashboard" className="text-slate-700 hover:text-slate-900">
            대시보드
          </Link>
        )}
        {isLoading ? (
          <span className="text-slate-500">세션 확인 중…</span>
        ) : isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="hidden truncate text-slate-600 md:inline-block">
              {user?.email ?? '사용자'}
            </span>
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

