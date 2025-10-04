'use client';

import { use } from 'react';
import { InstructorOverview } from '@/features/instructor-dashboard/components/overview';

type InstructorDashboardPageProps = {
  params: Promise<Record<string, never>>;
};

export default function InstructorDashboardPage({ params }: InstructorDashboardPageProps) {
  void use(params);
  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold">Instructor Dashboard</h1>
      <InstructorOverview />
    </div>
  );
}

