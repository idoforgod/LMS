"use client";

import Link from 'next/link';

export const SiteFooter = () => {
  return (
    <footer className="mt-12 border-t pt-6 text-sm text-slate-600">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} SuperNext LMS</p>
          <div className="flex flex-wrap gap-3">
            <Link className="hover:underline" href="/courses">코스</Link>
            <Link className="hover:underline" href="/docs">문서</Link>
            <Link className="hover:underline" href="/login">로그인</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
