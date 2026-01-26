import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Grid3X3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Protocol } from "@/hooks/useProtocols";
import { formatMonth } from "@/lib/date";

type CalendarHeaderProps = {
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
  viewMode?: "month" | "week";
  onViewModeChange?: (mode: "month" | "week") => void;
};

export function CalendarHeader({
  viewDate,
  onPrev,
  onNext,
  onToday,
  onExport,
  monthStats,
  viewMode = "month",
  onViewModeChange,
}: CalendarHeaderProps) {
  return (
    <div className="shrink-0 border-b border-white/5 bg-white/[0.02] px-4 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={onPrev}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="text-sm font-semibold min-w-[120px] text-center font-display tracking-wide">
            {formatMonth(viewDate)}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={onNext}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="hidden sm:flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
              <button
                type="button"
                onClick={() => onViewModeChange("month")}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs md:text-sm font-medium transition-all ${
                  viewMode === "month"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={viewMode === "month"}
              >
                <Grid3X3 className="size-3" />
                Month
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("week")}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs md:text-sm font-medium transition-all ${
                  viewMode === "week"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={viewMode === "week"}
              >
                <CalendarIcon className="size-3" />
                Week
              </button>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground mr-2">
            <span><strong className="text-foreground/90 font-display">{monthStats.loggedDays}</strong> logged</span>
            <span><strong className="text-foreground/90 font-display">{monthStats.scheduledDays}</strong> scheduled</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs md:text-sm"
            onClick={onToday}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={onExport}
            data-export-ignore="true"
            aria-label="Export JPEG"
          >
            <Download className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
