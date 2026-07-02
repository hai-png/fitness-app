/**
 * Shared date utilities.
 *
 * Q-14: previously `todayStr()` was duplicated in `useLogsStore.ts` and
 * `useIntakeStore.ts`. It is now a single function imported by both stores
 * (and available to any component that needs a local-date string).
 */

/**
 * Returns the current date as a `YYYY-MM-DD` string in the LOCAL timezone
 * (not UTC). Using local time is important because users log their weight,
 * water, workouts, and intake based on their local clock — a UTC "today"
 * would shift dates for users in negative-offset timezones (e.g. PST users
 * would see yesterday's logs appear under "today" after 4pm local).
 */
export function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Returns a date `n` days ago as a `YYYY-MM-DD` string in local time.
 * Useful for rolling-window queries (e.g. "logs from the last 7 days").
 */
export function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Returns true if the given `YYYY-MM-DD` string is today (local time).
 */
export function isToday(dateStr: string): boolean {
  return dateStr === todayStr();
}
