import { useMemo, useRef, type RefObject, type TouchEvent } from "react";
import { motion } from "framer-motion";

import type { Injection } from "@/hooks/useInjections";
import type { Protocol } from "@/hooks/useProtocols";
import { dateKey, isSameDay, startOfDay } from "@/lib/date";
import { getProtocolTheme } from "@/lib/protocolThemes";

type MonthDay = { date: Date; isCurrentMonth: boolean };

type CalendarGridProps = {
  isMobile: boolean;
  monthGrid: MonthDay[];
  scheduleByDate: Map<number, string[]>;
  logsByDate: Map<number, Injection[]>;
  loggedSummary: Map<number, { count: number; totalMg: number }>;
  selectedDate: Date;
  activeProtocol: Protocol | null;
  orderedProtocols: Protocol[];
  visibleProtocols: Record<string, boolean>;
  protocolLookup: Map<string, Protocol>;
  protocolDoseMap: Map<string, number>;
  focusActiveEnabled: boolean;
  onSelectDate: (date: Date) => void;
  today: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  calendarRef: RefObject<HTMLDivElement | null>;
  hasLogs: boolean;
};

export function CalendarGrid({
  monthGrid,
  scheduleByDate,
  logsByDate,
  selectedDate,
  activeProtocol,
  orderedProtocols,
  visibleProtocols,
  protocolLookup,
  focusActiveEnabled,
  onSelectDate,
  today,
  onPrevMonth,
  onNextMonth,
  calendarRef,
  protocolDoseMap,
  hasLogs,
}: CalendarGridProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const weekdayLabels = useMemo(
    () => ["S", "M", "T", "W", "T", "F", "S"],
    []
  );

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    const start = touchStart.current;
    touchStart.current = null;
    if (!touch || !start) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    if (deltaX > 0) {
      onPrevMonth();
    } else {
      onNextMonth();
    }
  };

  const getDoseLabel = (
    logs: Injection[],
    scheduledProtocols: string[]
  ): string | null => {
    if (logs.length > 0) {
      const totalMg = logs.reduce((sum, l) => sum + (l.doseMg ?? 0), 0);
      return `${Math.round(totalMg)} mg`;
    }
    if (scheduledProtocols.length > 0 && activeProtocol) {
      const dose = protocolDoseMap.get(activeProtocol.id);
      if (dose) return `${Math.round(dose)} mg`;
    }
    return null;
  };

  const getStatusLabel = (
    dayHasLogs: boolean,
    isScheduled: boolean,
    isPast: boolean
  ): string | null => {
    if (dayHasLogs) return "Logged";
    if (isScheduled && isPast && hasLogs) return "Missed";
    if (isScheduled) return "Scheduled";
    return null;
  };

  const legendProtocols = orderedProtocols.filter(
    (protocol) => visibleProtocols[protocol.id] !== false
  );
  const legendVisible = legendProtocols.slice(0, 4);
  const legendOverflow = Math.max(legendProtocols.length - legendVisible.length, 0);

  return (
    <div
      ref={calendarRef}
      className="flex-1 flex flex-col min-h-0 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {legendVisible.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-2 md:px-3 pt-3 pb-1">
          {legendVisible.map((protocol) => {
            const theme = getProtocolTheme(protocol.themeKey);
            return (
              <span
                key={protocol.id}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] md:text-sm font-medium ${theme.chip}`}
              >
                <span className={`size-2 rounded-full ${theme.accent} shadow-[0_0_8px_rgba(255,255,255,0.25)]`} />
                {protocol.name}
              </span>
            );
          })}
          {legendOverflow > 0 && (
            <span className="text-xs md:text-sm text-muted-foreground">
              +{legendOverflow} more
            </span>
          )}
        </div>
      )}

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 px-2 md:px-2 pt-2 shrink-0">
        {weekdayLabels.map((day, idx) => (
          <div
            key={`${day}-${idx}`}
            className="text-center text-[10px] md:text-sm font-semibold text-muted-foreground/70 py-2 border-b border-white/5 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-1 md:gap-1.5 p-2 md:p-2 min-h-0">
        {monthGrid.map(({ date, isCurrentMonth }) => {
          const key = dateKey(date);
          const dayLogs = logsByDate.get(key) ?? [];
          const scheduledProtocols = scheduleByDate.get(key) ?? [];

          const hasDayLogs = dayLogs.length > 0;
          const isScheduled = scheduledProtocols.length > 0;
          const hasActiveLayer = activeProtocol
            ? scheduledProtocols.includes(activeProtocol.id)
            : false;
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);
          const isPast = date < today;
          const isMissed = isScheduled && isPast && !hasDayLogs && hasLogs;
          const focusInactive = focusActiveEnabled && !hasActiveLayer;

          const doseLabel = getDoseLabel(dayLogs, scheduledProtocols);
          const statusLabel = getStatusLabel(hasDayLogs, isScheduled, isPast);
          const logProtocolIds = new Set(dayLogs.map((log) => log.protocolId));
          const indicatorProtocols = Array.from(
            new Set([...scheduledProtocols, ...dayLogs.map((log) => log.protocolId)])
          );
          const protocolIndicators = indicatorProtocols
            .map((id) => protocolLookup.get(id))
            .filter((protocol): protocol is Protocol => Boolean(protocol));

          const ariaLabel = `${date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}${statusLabel ? `. ${statusLabel}` : ""}${doseLabel ? `. ${doseLabel}` : ""}${isToday ? ". Today" : ""}`;

          return (
            <motion.button
              key={key}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectDate(startOfDay(date))}
              aria-label={ariaLabel}
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
              className={`
                calendar-day relative flex flex-col justify-between p-1.5 md:p-2 text-left overflow-hidden
                ${!isCurrentMonth ? "muted" : ""}
                ${isSelected ? "selected" : ""}
                ${isToday && !isSelected ? "today" : ""}
                ${focusInactive && !isSelected ? "inactive" : ""}
                ${hasDayLogs ? "has-logs" : ""}
                ${isScheduled && !hasDayLogs ? "is-scheduled" : ""}
              `}
            >
              {/* Active cycle indicator rail */}
              {hasActiveLayer && isCurrentMonth && (
                <span className="absolute left-0 top-0 h-full w-0.5 md:w-1 bg-primary rounded-r" />
              )}

              {/* Top row: Date + Today badge */}
              <div className="flex items-start justify-between gap-1">
                <span
                  className={`
                    text-sm md:text-lg font-semibold font-display leading-none
                    ${isCurrentMonth ? "text-foreground" : "text-muted-foreground/40"}
                    ${isToday ? "text-primary" : ""}
                  `}
                >
                  {date.getDate()}
                </span>
                {isToday && (
                  <span className="hidden md:inline-block px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide bg-primary/20 text-primary">
                    Today
                  </span>
                )}
              </div>

              {/* Middle: Status and Dose */}
              {isCurrentMonth && (statusLabel || doseLabel) && (
                <div className="flex-1 flex flex-col justify-center mt-0.5 md:mt-1 min-h-0">
              {statusLabel && (
                    <span
                      className={`
                        text-[9px] md:text-sm font-medium uppercase tracking-wide leading-tight
                        ${hasDayLogs ? "text-accent" : ""}
                        ${isMissed ? "text-destructive/70" : ""}
                        ${isScheduled && !hasDayLogs && !isPast ? "text-primary/80" : ""}
                        ${isScheduled && !hasDayLogs && isPast && !isMissed ? "text-primary/70" : ""}
                      `}
                    >
                      {statusLabel}
                    </span>
                  )}
                  {doseLabel && (
                    <span className="text-[10px] md:text-sm font-medium text-foreground/80 leading-tight">
                      {doseLabel}
                    </span>
                  )}
                </div>
              )}

              {protocolIndicators.length > 0 && isCurrentMonth && (
                <div className="absolute bottom-1 left-1 md:bottom-1.5 md:left-1.5 flex items-center gap-1">
                  {protocolIndicators.slice(0, 4).map((protocol) => {
                    const theme = getProtocolTheme(protocol.themeKey);
                    const hasLog = logProtocolIds.has(protocol.id);
                    return (
                      <span
                        key={protocol.id}
                        className={`size-2.5 md:size-3 rounded-full ${theme.accent} ${
                          hasLog
                            ? "ring-1 ring-white/70 shadow-[0_0_8px_rgba(255,255,255,0.25)]"
                            : "opacity-80"
                        }`}
                      />
                    );
                  })}
                  {protocolIndicators.length > 4 && (
                    <span className="text-[9px] md:text-xs text-muted-foreground">
                      +{protocolIndicators.length - 4}
                    </span>
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
