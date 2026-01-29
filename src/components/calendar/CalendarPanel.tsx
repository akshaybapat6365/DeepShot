import { useState, type RefObject } from "react";
import type { Injection } from "@/hooks/useInjections";
import type { Protocol } from "@/hooks/useProtocols";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { WeeklyCalendarGrid } from "@/components/calendar/WeeklyCalendarGrid";

type MonthDay = { date: Date; isCurrentMonth: boolean };

type CalendarPanelProps = {
  calendarRef: RefObject<HTMLDivElement | null>;
  viewDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onExport: () => void;
  monthStats: { scheduledDays: number; loggedDays: number };
  activeProtocol: Protocol | null;
  orderedProtocols: Protocol[];
  visibleProtocols: Record<string, boolean>;
  focusActiveEnabled: boolean;
  onSetActive: (protocol: Protocol) => void;
  isMobile: boolean;
  hasLogs: boolean;
  monthGrid: MonthDay[];
  scheduleByDate: Map<number, string[]>;
  logsByDate: Map<number, Injection[]>;
  loggedSummary: Map<number, { count: number; totalMg: number }>;
  selectedDate: Date;
  protocolLookup: Map<string, Protocol>;
  protocolDoseMap: Map<string, number>;
  onSelectDate: (date: Date) => void;
  today: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

export function CalendarPanel({
  calendarRef,
  viewDate,
  onPrev,
  onNext,
  onToday,
  onExport,
  monthStats,
  activeProtocol,
  orderedProtocols,
  visibleProtocols,
  focusActiveEnabled,
  onSetActive,
  isMobile,
  hasLogs,
  monthGrid,
  scheduleByDate,
  logsByDate,
  loggedSummary,
  selectedDate,
  protocolLookup,
  protocolDoseMap,
  onSelectDate,
  today,
  onPrevMonth,
  onNextMonth,
}: CalendarPanelProps) {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  return (
    <section className="flex-1 min-h-0 flex flex-col calendar-shell">
      <CalendarHeader
        viewDate={viewDate}
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
        onExport={onExport}
        monthStats={monthStats}
        activeProtocol={activeProtocol}
        orderedProtocols={orderedProtocols}
        visibleProtocols={visibleProtocols}
        focusActiveEnabled={focusActiveEnabled}
        onSetActive={onSetActive}
        isMobile={isMobile}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === "month" ? (
        <CalendarGrid
          calendarRef={calendarRef}
          isMobile={isMobile}
          monthGrid={monthGrid}
          scheduleByDate={scheduleByDate}
          logsByDate={logsByDate}
          loggedSummary={loggedSummary}
          selectedDate={selectedDate}
          activeProtocol={activeProtocol}
          orderedProtocols={orderedProtocols}
          visibleProtocols={visibleProtocols}
          protocolLookup={protocolLookup}
          protocolDoseMap={protocolDoseMap}
          focusActiveEnabled={focusActiveEnabled}
          onSelectDate={onSelectDate}
          today={today}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          hasLogs={hasLogs}
        />
      ) : (
        <WeeklyCalendarGrid
          selectedDate={selectedDate}
          today={today}
          scheduleByDate={scheduleByDate}
          logsByDate={logsByDate}
          activeProtocol={activeProtocol}
          protocolLookup={protocolLookup}
          protocolDoseMap={protocolDoseMap}
          visibleProtocols={visibleProtocols}
          orderedProtocols={orderedProtocols}
          focusActiveEnabled={focusActiveEnabled}
          onSelectDate={onSelectDate}
          onPrevWeek={() => {
            const prev = new Date(selectedDate);
            prev.setDate(prev.getDate() - 7);
            onSelectDate(prev);
          }}
          onNextWeek={() => {
            const next = new Date(selectedDate);
            next.setDate(next.getDate() + 7);
            onSelectDate(next);
          }}
          hasLogs={hasLogs}
        />
      )}
    </section>
  );
}
