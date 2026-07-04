import { formatInTimeZone } from 'date-fns-tz';
import { env } from '../config/env';

// All timestamps stored UTC; calendar-day buckets computed in the org timezone
// (Section 2, default Asia/Kolkata). @db.Date columns hold UTC-midnight of the
// org-local date.

const DAY_MS = 86_400_000;
const TZ = env.ORG_TIMEZONE;

/** The org-local calendar date of an instant, as a UTC-midnight Date (@db.Date). */
export function orgDateOnly(instant: Date = new Date()): Date {
  const ymd = formatInTimeZone(instant, TZ, 'yyyy-MM-dd');
  return new Date(`${ymd}T00:00:00.000Z`);
}

export type AttendanceView = 'daily' | 'weekly' | 'monthly';

/** Inclusive [gte, lte] date-only bounds for a view, around a reference instant.
 *  Week starts Monday. Pure UTC arithmetic → no runtime-tz drift. */
export function viewRange(
  view: AttendanceView,
  ref: Date = new Date(),
): { gte: Date; lte: Date } {
  const base = orgDateOnly(ref);
  if (view === 'daily') return { gte: base, lte: base };

  if (view === 'weekly') {
    const dow = (base.getUTCDay() + 6) % 7; // 0 = Monday
    const gte = new Date(base.getTime() - dow * DAY_MS);
    const lte = new Date(gte.getTime() + 6 * DAY_MS);
    return { gte, lte };
  }

  // monthly
  const y = base.getUTCFullYear();
  const m = base.getUTCMonth();
  return {
    gte: new Date(Date.UTC(y, m, 1)),
    lte: new Date(Date.UTC(y, m + 1, 0)),
  };
}

/** Inclusive calendar-day count between two @db.Date values (Section 2: leave
 *  duration = inclusive days, no weekend/holiday exclusion). */
export function inclusiveDayCount(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
}

/** Every UTC-midnight date-only Date from start to end, inclusive. Used to sync
 *  attendance LEAVE markers across an approved leave's date range. */
export function eachDateInclusive(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS) {
    dates.push(new Date(t));
  }
  return dates;
}
