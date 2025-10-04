'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const HeroSearch = () => {
  const router = useRouter();
  const [q, setQ] = useState('');

  const onSubmit = () => {
    const keyword = q.trim();
    if (!keyword) return;
    router.push(`/courses?search=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      <Image
        alt="hero"
        src="https://picsum.photos/seed/home-hero/1600/600"
        width={1600}
        height={600}
        className="h-64 w-full object-cover md:h-80"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 px-6">
        <div className="w-full max-w-3xl text-center text-white">
          <h1 className="text-2xl font-bold md:text-4xl">배우고, 만들고, 성장하세요</h1>
          <p className="mt-2 text-sm text-slate-200 md:text-base">코스를 검색하고 지금 바로 시작하세요.</p>
          <div className="mt-5 flex items-center gap-2">
            <Input
              placeholder="코스를 검색하세요"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
              className="bg-white text-slate-900"
            />
            <Button onClick={onSubmit}>검색</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

