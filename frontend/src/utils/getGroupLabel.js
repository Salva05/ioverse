import {
  format,
  isToday,
  isYesterday,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  subWeeks,
} from "date-fns";

/**
 * Checks if a date is within the current week.
 * @param {Date} date
 * @returns {boolean}
 */
export const isThisWeek = (date) => {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });
  return isWithinInterval(date, { start, end });
};

/**
 * Checks if a date is within the last week.
 * @param {Date} date
 * @returns {boolean}
 */
export const isLastWeek = (date) => {
  const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), {
    weekStartsOn: 1,
  });
  const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
  return isWithinInterval(date, { start: lastWeekStart, end: lastWeekEnd });
};

/**
 * Determines the group label for a given date.
 * @param {Date} date - The date to group.
 * @returns {string} - The group label.
 */
export const getGroupLabel = (date) => {
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else if (isThisWeek(date)) {
    return "This Week";
  } else if (isLastWeek(date)) {
    return "Last Week";
  } else {
    return format(date, "MMMM dd, yyyy");
  }
};

