'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const categories = [
  { id: 1, name: '개발' },
  { id: 2, name: '디자인' },
];
const difficulties = [
  { id: 1, name: '입문' },
  { id: 2, name: '중급' },
  { id: 3, name: '고급' },
];

export const CategoryFilterBar = () => {
  const router = useRouter();
  const goto = (p: Record<string, string | number>) => {
    const query = new URLSearchParams(
      Object.entries(p).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {} as Record<string, string>),
    ).toString();
    router.push(`/courses?${query}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <Button key={c.id} size="sm" variant="outline" onClick={() => goto({ category: c.id })}>
            #{c.name}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {difficulties.map((d) => (
          <Button key={d.id} size="sm" variant="secondary" onClick={() => goto({ difficulty: d.id })}>
            {d.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

