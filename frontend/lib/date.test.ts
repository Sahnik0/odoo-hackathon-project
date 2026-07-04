import { toDateKey, isoToDateKey, keyToDate, buildMonthGrid, addMonths, isSameDay } from './date';

describe('date helpers', () => {
  test('toDateKey formats a local date as YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  test('isoToDateKey passes plain date strings through untouched', () => {
    // Plain date keys must NOT be re-parsed through Date() (that would shift
    // them a day in negative-offset timezones).
    expect(isoToDateKey('2026-03-14')).toBe('2026-03-14');
  });

  test('keyToDate round-trips with toDateKey', () => {
    const key = '2026-07-04';
    expect(toDateKey(keyToDate(key))).toBe(key);
  });

  test('buildMonthGrid returns 42 cells starting on a Sunday', () => {
    const grid = buildMonthGrid(2026, 0); // January 2026
    expect(grid).toHaveLength(42);
    expect(grid[0].getDay()).toBe(0); // Sunday
    // The 1st of the month must appear somewhere in the first week.
    const firstOfMonth = grid.findIndex((d) => d.getDate() === 1 && d.getMonth() === 0);
    expect(firstOfMonth).toBeGreaterThanOrEqual(0);
    expect(firstOfMonth).toBeLessThan(7);
  });

  test('addMonths wraps across year boundaries', () => {
    expect(toDateKey(addMonths(new Date(2026, 11, 1), 1))).toBe('2027-01-01');
    expect(toDateKey(addMonths(new Date(2026, 0, 1), -1))).toBe('2025-12-01');
  });

  test('isSameDay ignores time-of-day', () => {
    expect(isSameDay(new Date(2026, 5, 1, 9), new Date(2026, 5, 1, 23))).toBe(true);
    expect(isSameDay(new Date(2026, 5, 1), new Date(2026, 5, 2))).toBe(false);
  });
});
