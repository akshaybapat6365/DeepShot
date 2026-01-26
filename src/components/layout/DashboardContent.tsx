import type { ComponentProps } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { CalendarPanel } from "@/components/calendar/CalendarPanel";
import { CycleSidebar } from "@/components/cycles/CycleSidebar";
import { InsightsPanel } from "@/components/insights/InsightsPanel";

type DashboardContentProps = {
  isMobile: boolean;
  mobileView: "calendar" | "cycles" | "insights";
  calendarProps: ComponentProps<typeof CalendarPanel>;
  cyclesProps: ComponentProps<typeof CycleSidebar>;
  insightsProps: ComponentProps<typeof InsightsPanel>;
};

export function DashboardContent({
  isMobile,
  mobileView,
  calendarProps,
  cyclesProps,
  insightsProps,
}: DashboardContentProps) {
  const calendarSection = <CalendarPanel {...calendarProps} />;
  const cyclesSection = <CycleSidebar {...cyclesProps} />;
  const insightsSection = <InsightsPanel {...insightsProps} />;

  if (isMobile) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={mobileView}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2 }}
          className="min-h-0"
        >
          {mobileView === "calendar"
            ? calendarSection
            : mobileView === "cycles"
              ? cyclesSection
              : insightsSection}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="h-full grid grid-cols-[minmax(0,1fr)_minmax(320px,0.62fr)] gap-4 overflow-hidden">
      {/* Main Calendar Area */}
      <div className="min-w-0 flex flex-col">
        {calendarSection}
      </div>

      {/* Right Sidebar - Proportional width (golden ratio) */}
      <div className="min-w-[320px] flex flex-col gap-4 overflow-hidden hover:overflow-y-auto pr-1">
        {cyclesSection}
        {insightsSection}
      </div>
    </div>
  );
}
