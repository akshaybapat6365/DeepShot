import { DAY_MS, addDays, startOfDay } from "@/lib/date";

export const alignToRangeStart = (
  start: Date,
  interval: number,
  rangeStart: Date
) => {
  if (rangeStart <= start) return start;
  const diffDays = Math.floor(
    (startOfDay(rangeStart).getTime() - start.getTime()) / DAY_MS
  );
  const remainder = diffDays % interval;
  const offset = remainder === 0 ? 0 : interval - remainder;
  return addDays(start, diffDays + offset);
};

export const generateScheduleInRange = (
  startDate: Date,
  intervalDays: number,
  rangeStart: Date,
  rangeEnd: Date,
  endLimit?: Date | null
) => {
  if (intervalDays <= 0) return [];

  const safeStart = startOfDay(startDate);
  const safeRangeStart = startOfDay(rangeStart);
  const safeRangeEnd = startOfDay(rangeEnd);
  const safeEnd = endLimit ? startOfDay(endLimit) : safeRangeEnd;

  if (safeEnd < safeRangeStart) return [];

  let current = alignToRangeStart(safeStart, intervalDays, safeRangeStart);
  if (current < safeStart) current = safeStart;

  const dates: Date[] = [];
  while (current <= safeRangeEnd && current <= safeEnd) {
    dates.push(current);
    current = addDays(current, intervalDays);
  }

  return dates;
};

export const buildMonthGrid = (baseDate: Date) => {
  const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const startWeekday = firstDay.getDay();
  const gridStart = addDays(firstDay, -startWeekday);

  const grid = Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return {
      date,
      isCurrentMonth: date.getMonth() === baseDate.getMonth(),
    };
  });

  return {
    grid,
    rangeStart: grid[0].date,
    rangeEnd: grid[grid.length - 1].date,
  };
};
