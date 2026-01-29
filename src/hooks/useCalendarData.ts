import { useMemo } from "react";

import type { Injection } from "@/hooks/useInjections";
import type { Protocol } from "@/hooks/useProtocols";
import { buildMonthGrid, generateScheduleInRange } from "@/lib/calendar";
import { dateKey, formatNumber, startOfDay } from "@/lib/date";

type CalendarDataArgs = {
  viewDate: Date;
  selectedDate: Date;
  protocols: Protocol[];
  visibleProtocols: Record<string, boolean>;
  injections: Array<Injection & { isOptimistic?: boolean }>;
  protocolLookup: Map<string, Protocol>;
  firstInjectionDate?: Date | null;
  hasLogs: boolean;
};

export function useCalendarData({
  viewDate,
  selectedDate,
  protocols,
  visibleProtocols,
  injections,
  protocolLookup,
  firstInjectionDate,
  hasLogs,
}: CalendarDataArgs) {
  const monthRange = useMemo(() => {
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    return {
      start: startOfDay(start),
      end: startOfDay(end),
    };
  }, [viewDate]);

  const { grid: monthGrid, rangeStart, rangeEnd } = useMemo(
    () => buildMonthGrid(viewDate),
    [viewDate]
  );

  const protocolDoseMap = useMemo(() => {
    const map = new Map<string, number>();
    protocols.forEach((protocol) => {
      map.set(protocol.id, protocol.doseMl * protocol.concentrationMgPerMl);
    });
    return map;
  }, [protocols]);

  const scheduleByDate = useMemo(() => {
    const map = new Map<number, string[]>();

    protocols.forEach((protocol) => {
      if (!visibleProtocols[protocol.id]) return;

      const scheduleDates = generateScheduleInRange(
        protocol.startDate,
        protocol.intervalDays,
        rangeStart,
        rangeEnd,
        protocol.endDate ?? null
      );

      scheduleDates.forEach((date) => {
        const key = dateKey(date);
        const existing = map.get(key) ?? [];
        existing.push(protocol.id);
        map.set(key, existing);
      });
    });

    return map;
  }, [protocols, rangeStart, rangeEnd, visibleProtocols]);

  const loggedSummary = useMemo(() => {
    const map = new Map<number, { count: number; totalMg: number }>();
    injections.forEach((log) => {
      if (!protocolLookup.has(log.protocolId)) return;
      if (!visibleProtocols[log.protocolId]) return;
      const key = dateKey(log.date);
      const entry = map.get(key) ?? { count: 0, totalMg: 0 };
      const doseMg = Number.isFinite(log.doseMg)
        ? log.doseMg
        : log.doseMl * log.concentrationMgPerMl;
      entry.count += 1;
      entry.totalMg += doseMg;
      map.set(key, entry);
    });
    return map;
  }, [injections, protocolLookup, visibleProtocols]);

  const logsByDate = useMemo(() => {
    const map = new Map<number, Injection[]>();
    injections.forEach((log) => {
      if (!protocolLookup.has(log.protocolId)) return;
      if (!visibleProtocols[log.protocolId]) return;
      const key = dateKey(log.date);
      const existing = map.get(key) ?? [];
      existing.push(log);
      map.set(key, existing);
    });
    return map;
  }, [injections, protocolLookup, visibleProtocols]);

  const monthStats = useMemo(() => {
    const today = startOfDay(new Date());
    // Only count scheduled days from the first injection date (when user started tracking)
    const trackingStart = firstInjectionDate ? startOfDay(firstInjectionDate) : null;
    let scheduledDays = 0;
    scheduleByDate.forEach((protocolIds, key) => {
      if (protocolIds.length === 0) return;
      const date = new Date(Number(key));
      // Only count scheduled days that are in the past (up to today)
      // AND after the first injection was logged (when tracking started)
      const afterTrackingStart = trackingStart ? date >= trackingStart : true;
      if (date >= monthRange.start && date <= monthRange.end && date <= today && afterTrackingStart) {
        scheduledDays += 1;
      }
    });

    let loggedDays = 0;
    loggedSummary.forEach((_summary, key) => {
      const date = new Date(Number(key));
      if (date >= monthRange.start && date <= monthRange.end) {
        loggedDays += 1;
      }
    });

    return { scheduledDays, loggedDays };
  }, [firstInjectionDate, loggedSummary, monthRange, scheduleByDate]);

  const selectedKey = dateKey(selectedDate);
  const selectedLogs = logsByDate.get(selectedKey) ?? [];
  const selectedSummary = loggedSummary.get(selectedKey);

  const selectedLayerProtocols = scheduleByDate.get(selectedKey) ?? [];
  const selectedScheduledProtocols = selectedLayerProtocols.filter(
    (protocolId) => !selectedLogs.some((log) => log.protocolId === protocolId)
  );
  const isSelectedPast = selectedDate < startOfDay(new Date());
  const selectedStatus = selectedSummary
    ? selectedSummary.count > 1
      ? `${selectedSummary.count} logs`
      : "Logged"
    : selectedLayerProtocols.length > 0
      ? isSelectedPast && hasLogs
        ? "Missed"
        : "Scheduled"
      : "No injection";

  const selectedDose = selectedSummary
    ? `${formatNumber(selectedSummary.totalMg)} mg`
    : selectedLayerProtocols.length > 0
      ? `${formatNumber(
          protocolDoseMap.get(selectedLayerProtocols[0]) ?? 0
        )} mg`
      : "--";

  return {
    monthRange,
    monthGrid,
    rangeStart,
    rangeEnd,
    scheduleByDate,
    loggedSummary,
    logsByDate,
    monthStats,
    selectedKey,
    selectedLogs,
    selectedSummary,
    selectedLayerProtocols,
    selectedScheduledProtocols,
    selectedStatus,
    selectedDose,
    isSelectedPast,
    protocolDoseMap,
  };
}
