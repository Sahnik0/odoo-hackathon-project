'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addMonths, buildMonthGrid, isSameDay, keyToDate, toDateKey, WEEKDAY_LABELS, MONTH_NAMES_FULL } from '@/lib/date';

export type CalendarMarkerTone = 'present' | 'absent' | 'half' | 'leave' | 'pending';

const MARKER_DOT: Record<CalendarMarkerTone, string> = {
  present: 'bg-[#1f9d57]',
  absent: 'bg-coral',
  half: 'bg-crimson',
  leave: 'bg-lake-blue',
  pending: 'bg-gold',
};

export interface CalendarProps {
  /** Controlled month (first day). Defaults to today's month, uncontrolled. */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  /** Day-key (YYYY-MM-DD) -> marker tone, for display mode. */
  markers?: Record<string, CalendarMarkerTone>;
  /** Range selection: current [start, end] as day-keys, or nulls. */
  selectedRange?: { start: string | null; end: string | null };
  /** Called with a new range when a day is clicked (range mode). */
  onSelectRange?: (range: { start: string | null; end: string | null }) => void;
  /** Disable days before/after (day-key comparison). */
  minDate?: string;
  className?: string;
}

export function Calendar({
  month: monthProp,
  onMonthChange,
  markers,
  selectedRange,
  onSelectRange,
  minDate,
  className,
}: CalendarProps) {
  const today = new Date();
  const [internalMonth, setInternalMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const month = monthProp ?? internalMonth;

  const setMonth = (m: Date) => {
    if (onMonthChange) onMonthChange(m);
    else setInternalMonth(m);
  };

  const grid = useMemo(() => buildMonthGrid(month.getFullYear(), month.getMonth()), [month]);
  const rangeMode = !!onSelectRange;

  function handleClick(day: Date) {
    if (!onSelectRange) return;
    const key = toDateKey(day);
    if (minDate && key < minDate) return;
    const { start, end } = selectedRange ?? { start: null, end: null };
    // Fresh selection or restart after a complete range.
    if (!start || (start && end)) {
      onSelectRange({ start: key, end: null });
    } else {
      // Second click completes the range (order-normalized).
      onSelectRange(key < start ? { start: key, end: start } : { start, end: key });
    }
  }

  function inRange(key: string) {
    const { start, end } = selectedRange ?? { start: null, end: null };
    if (!start) return false;
    if (start && !end) return key === start;
    return key >= start && key <= (end as string);
  }

  return (
    <div className={cn('select-none', className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-serif text-[18px] tracking-tight text-off-black">
          {MONTH_NAMES_FULL[month.getMonth()]} {month.getFullYear()}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setMonth(addMonths(month, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ash text-off-black transition-colors hover:bg-off-black/5"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setMonth(addMonths(month, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ash text-off-black transition-colors hover:bg-off-black/5"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="py-1 text-center text-[11px] font-medium uppercase tracking-tight text-smoke">
            {w}
          </div>
        ))}

        {grid.map((day) => {
          const key = toDateKey(day);
          const isCurrentMonth = day.getMonth() === month.getMonth();
          const isToday = isSameDay(day, today);
          const marker = markers?.[key];
          const disabled = !!minDate && key < minDate;
          const selected = inRange(key);
          const { start, end } = selectedRange ?? { start: null, end: null };
          const isEndpoint = key === start || key === end;

          return (
            <button
              key={key}
              type="button"
              disabled={disabled || (!rangeMode && !marker)}
              onClick={() => handleClick(day)}
              className={cn(
                'relative flex aspect-square flex-col items-center justify-center rounded-[12px] text-[13px] transition-colors',
                rangeMode && !disabled && 'cursor-pointer hover:bg-off-black/[0.06]',
                !rangeMode && 'cursor-default',
                isCurrentMonth ? 'text-off-black' : 'text-smoke/50',
                disabled && 'cursor-not-allowed opacity-40',
                selected && !isEndpoint && 'bg-lake-blue/12',
                isEndpoint && 'bg-lake-blue text-white',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full',
                  isToday && !isEndpoint && 'ring-1 ring-inset ring-off-black',
                )}
              >
                {day.getDate()}
              </span>
              {marker && (
                <span
                  className={cn(
                    'absolute bottom-1 h-1.5 w-1.5 rounded-full',
                    isEndpoint ? 'bg-white' : MARKER_DOT[marker],
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Small legend row for marker meanings.
export function CalendarLegend({ items }: { items: { tone: CalendarMarkerTone; label: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5 text-[12px] text-graphite">
          <span className={cn('h-2 w-2 rounded-full', MARKER_DOT[it.tone])} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

export { keyToDate };
