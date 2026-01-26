import { useMemo, useRef, type RefObject, type TouchEvent } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

import type { Injection } from "@/hooks/useInjections";
import type { Protocol } from "@/hooks/useProtocols";
import { dateKey, isSameDay, startOfDay } from "@/lib/date";

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

  return (
    <div
      ref={calendarRef}
      className="flex-1 flex flex-col min-h-0 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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

              {/* Bottom: Logged indicator */}
              {hasDayLogs && isCurrentMonth && (
                <div className="absolute bottom-1 right-1 md:bottom-1.5 md:right-1.5">
                  <div className="size-3.5 md:size-4 rounded-full bg-accent flex items-center justify-center shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                    <Check className="size-2 md:size-2.5 text-accent-foreground" strokeWidth={3} />
                  </div>
                </div>
              )}

              {/* Scheduled dot for non-logged days */}
              {!hasDayLogs && isScheduled && isCurrentMonth && (
                <div className="absolute bottom-1 right-1 md:bottom-1.5 md:right-1.5">
                  <div
                    className={`size-2 md:size-2.5 rounded-full ${
                      isMissed
                        ? "bg-destructive/50"
                        : "bg-primary shadow-[0_0_6px_rgba(59,130,246,0.5)]"
                    }`}
                  />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
