import { useMemo } from "react";

import type { Injection } from "@/hooks/useInjections";
import { addDays, dateKey, startOfDay } from "@/lib/date";

type InsightsArgs = {
  injections: Array<Injection & { isOptimistic?: boolean }>;
  monthStats: { scheduledDays: number; loggedDays: number };
};

const formatShortDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const formatMonthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

export function useInsightsData({ injections, monthStats }: InsightsArgs) {
  const today = startOfDay(new Date());

  const injectionByDay = useMemo(() => {
    const map = new Map<number, { totalMg: number; count: number }>();
    injections.forEach((log) => {
      const key = dateKey(log.date);
      const entry = map.get(key) ?? { totalMg: 0, count: 0 };
      entry.totalMg += log.doseMg;
      entry.count += 1;
      map.set(key, entry);
    });
    return map;
  }, [injections]);

  const streakData = useMemo(() => {
    if (injections.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalInjections: 0 };
    }

    const sortedDates = [...new Set(injections.map((i) => dateKey(i.date)))].sort(
      (a, b) => b - a
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let prevKey: number | null = null;

    for (const key of sortedDates) {
      if (prevKey === null) {
        tempStreak = 1;
      } else {
        const daysDiff = (prevKey - key) / (1000 * 60 * 60 * 24);
        if (daysDiff <= 7) {
          tempStreak += 1;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      prevKey = key;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    const todayKey = dateKey(today);
    const recentKeys = sortedDates.slice(0, 10);
    currentStreak = 0;
    for (const key of recentKeys) {
      const daysDiff = (todayKey - key) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 7 * (currentStreak + 1)) {
        currentStreak += 1;
      } else {
        break;
      }
    }

    return {
      currentStreak,
      longestStreak,
      totalInjections: injections.length,
    };
  }, [injections, today]);

  const trendData = useMemo(() => {
    const start = addDays(today, -29);
    return Array.from({ length: 30 }, (_, index) => {
      const date = addDays(start, index);
      const entry = injectionByDay.get(dateKey(date));
      return {
        date: formatShortDate(date),
        mg: entry ? Number(entry.totalMg.toFixed(1)) : 0,
      };
    });
  }, [injectionByDay, today]);

  const weeklyData = useMemo(() => {
    const weeks = Array.from({ length: 4 }, (_, index) => {
      const start = addDays(today, -(index * 7));
      const weekStart = addDays(start, -start.getDay());
      const total = Array.from({ length: 7 }, (_, dayIndex) => {
        const date = addDays(weekStart, dayIndex);
        const entry = injectionByDay.get(dateKey(date));
        return entry?.totalMg ?? 0;
      }).reduce((sum, value) => sum + value, 0);
      return {
        label: formatShortDate(weekStart),
        mg: Number(total.toFixed(1)),
      };
    });
    return weeks.reverse();
  }, [injectionByDay, today]);

  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth() - index, 1);
      let total = 0;
      injections.forEach((log) => {
        if (
          log.date.getFullYear() === date.getFullYear() &&
          log.date.getMonth() === date.getMonth()
        ) {
          total += log.doseMg;
        }
      });
      return {
        label: formatMonthLabel(date),
        mg: Number(total.toFixed(1)),
      };
    });
    return months.reverse();
  }, [injections, today]);

  const heatmap = useMemo(() => {
    const start = addDays(today, -41);
    return Array.from({ length: 42 }, (_, index) => {
      const date = addDays(start, index);
      const entry = injectionByDay.get(dateKey(date));
      return {
        date,
        key: dateKey(date),
        count: entry?.count ?? 0,
        totalMg: entry ? Number(entry.totalMg.toFixed(1)) : 0,
      };
    });
  }, [injectionByDay, today]);

  const adherence = useMemo(() => {
    const scheduled = monthStats.scheduledDays;
    const logged = monthStats.loggedDays;
    const ratio = scheduled > 0 ? logged / scheduled : 0;
    return {
      scheduled,
      logged,
      ratio,
    };
  }, [monthStats]);

  return {
    trendData,
    weeklyData,
    monthlyData,
    heatmap,
    adherence,
    streakData,
  };
}
