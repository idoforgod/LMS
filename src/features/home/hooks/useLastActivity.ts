"use client";

type LastActivityEntry = {
  courseId: number;
  title?: string;
  lastActiveAt: string; // ISO
};

const STORAGE_KEY = 'last_activity_courses';

const readAll = (): Record<number, LastActivityEntry> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LastActivityEntry[];
    const map: Record<number, LastActivityEntry> = {};
    for (const e of parsed) {
      map[e.courseId] = e;
    }
    return map;
  } catch {
    return {};
  }
};

const writeAll = (entries: Record<number, LastActivityEntry>) => {
  if (typeof window === 'undefined') return;
  const list = Object.values(entries)
    .sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime())
    .slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const recordCourseVisit = (courseId: number, title?: string) => {
  const all = readAll();
  all[courseId] = { courseId, title, lastActiveAt: new Date().toISOString() };
  writeAll(all);
};

export const getLastActivity = (courseId: number): LastActivityEntry | undefined => {
  const all = readAll();
  return all[courseId];
};

export const listLastActivities = (): LastActivityEntry[] => Object.values(readAll());

