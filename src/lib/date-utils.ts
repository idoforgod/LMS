import { differenceInDays, differenceInHours, differenceInMinutes, isAfter, parseISO, format } from 'date-fns';

/**
 * Check if current time is after due date
 */
export const isAfterDeadline = (dueDate: string): boolean => {
  const now = new Date();
  const deadline = parseISO(dueDate);
  return isAfter(now, deadline);
};

/**
 * Check if due date is within threshold hours
 */
export const isDueSoon = (dueDate: string, hoursThreshold: number = 24): boolean => {
  const now = new Date();
  const deadline = parseISO(dueDate);

  if (isAfter(now, deadline)) {
    return false; // Already past deadline
  }

  const hoursUntilDue = differenceInHours(deadline, now);
  return hoursUntilDue <= hoursThreshold && hoursUntilDue >= 0;
};

/**
 * Format due date in user's timezone
 */
export const formatDueDate = (dueDate: string): string => {
  const deadline = parseISO(dueDate);
  return format(deadline, 'PPpp'); // e.g., "Apr 29, 2023, 9:00:00 AM"
};

/**
 * Calculate time remaining until due date
 */
export const getTimeUntilDue = (dueDate: string): {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
} => {
  const now = new Date();
  const deadline = parseISO(dueDate);
  const isPast = isAfter(now, deadline);

  if (isPast) {
    return { days: 0, hours: 0, minutes: 0, isPast: true };
  }

  const days = differenceInDays(deadline, now);
  const hours = differenceInHours(deadline, now) % 24;
  const minutes = differenceInMinutes(deadline, now) % 60;

  return { days, hours, minutes, isPast: false };
};
