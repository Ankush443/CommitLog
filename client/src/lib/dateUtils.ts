import { format, parseISO, startOfWeek, endOfWeek, addWeeks, isValid } from 'date-fns';

/**
 * Format a date string (YYYY-MM-DD) to a readable format
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
};

/**
 * Format a date string to a long format
 */
export const formatDateLong = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'EEEE, MMMM d, yyyy');
  } catch {
    return dateString;
  }
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Convert a Date object to YYYY-MM-DD string
 */
export const toDateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Parse YYYY-MM-DD string to Date object
 */
export const parseDate = (dateString: string): Date => {
  return parseISO(dateString);
};

/**
 * Validate if a string is a valid YYYY-MM-DD date
 */
export const isValidDateString = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch {
    return false;
  }
};

/**
 * Get the Monday of the week for a given date
 */
export const getWeekStart = (date: Date): string => {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return toDateString(monday);
};

/**
 * Get the Sunday of the week for a given date
 */
export const getWeekEnd = (date: Date): string => {
  const sunday = endOfWeek(date, { weekStartsOn: 1 });
  return toDateString(sunday);
};

/**
 * Get the current week's start (Monday)
 */
export const getCurrentWeekStart = (): string => {
  return getWeekStart(new Date());
};

/**
 * Add weeks to a date string
 */
export const addWeeksToDateString = (dateString: string, weeks: number): string => {
  const date = parseISO(dateString);
  const newDate = addWeeks(date, weeks);
  return toDateString(newDate);
};

/**
 * Format week range for display
 */
export const formatWeekRange = (weekStart: string, weekEnd: string): string => {
  try {
    const start = parseISO(weekStart);
    const end = parseISO(weekEnd);
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  } catch {
    return `${weekStart} - ${weekEnd}`;
  }
};
