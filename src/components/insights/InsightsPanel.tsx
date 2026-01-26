import { useState } from "react";
import { Flame, TrendingUp, Calendar, BarChart3 } from "lucide-react";

import { AdherenceRing } from "@/components/insights/AdherenceRing";
import { BloodWorkPanel } from "@/components/insights/BloodWorkPanel";
import { ComparisonChart } from "@/components/insights/ComparisonChart";
import { DosageTrendChart } from "@/components/insights/DosageTrendChart";
import { InjectionHeatmap } from "@/components/insights/InjectionHeatmap";
import type { BloodWork } from "@/hooks/useBloodWork";

type InsightsPanelProps = {
  trendData: Array<{ date: string; mg: number }>;
  weeklyData: Array<{ label: string; mg: number }>;
  monthlyData: Array<{ label: string; mg: number }>;
  heatmap: Array<{ key: number; date: Date; count: number; totalMg: number }>;
  adherence: { logged: number; scheduled: number; ratio: number };
  streakData?: { currentStreak: number; longestStreak: number; totalInjections: number };
  bloodWork?: BloodWork[];
  onAddBloodWork?: () => void;
  onEditBloodWork?: (bw: BloodWork) => void;
  onDeleteBloodWork?: (bw: BloodWork) => void;
};

export function InsightsPanel({
  trendData,
  weeklyData,
  monthlyData,
  heatmap,
  adherence,
  streakData,
  bloodWork = [],
  onAddBloodWork,
  onEditBloodWork,
  onDeleteBloodWork,
}: InsightsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
    <section className="glass-card p-4 space-y-4">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <div className="flex items-center gap-2">
        <TrendingUp className="size-3.5" />
          <span className="font-medium text-foreground font-display tracking-wide">
            Insights
          </span>
        </div>
        <span className="text-[10px] md:text-sm uppercase tracking-wider">
          {expanded ? "Collapse" : "Expand"}
        </span>
      </button>

      {/* Primary Stats Row */}
      <div className="grid grid-cols-2 gap-2">
        {/* 30-Day Trend */}
        <div>
          <p className="text-[10px] md:text-sm uppercase tracking-wider text-muted-foreground mb-1">
            30-Day Trend
          </p>
          <div className="h-20 rounded-lg border border-white/5 bg-white/[0.03] p-2 shadow-[inset_0_0_30px_rgba(59,130,246,0.08)]">
            <DosageTrendChart data={trendData} />
          </div>
        </div>

        {/* Adherence */}
        <div>
          <p className="text-[10px] md:text-sm uppercase tracking-wider text-muted-foreground mb-1">
            Adherence
          </p>
          <div className="h-20 rounded-lg border border-white/5 bg-white/[0.03] p-2 shadow-[inset_0_0_30px_rgba(34,211,238,0.08)]">
            <AdherenceRing {...adherence} />
          </div>
        </div>
      </div>

      {/* Streak Stats */}
      {streakData && (
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.04] border border-white/5">
            <Flame className="size-4 text-orange-400" />
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Current</p>
              <p className="text-sm font-bold font-display">{streakData.currentStreak}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.04] border border-white/5">
            <Flame className="size-4 text-amber-500" />
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Best</p>
              <p className="text-sm font-bold font-display">{streakData.longestStreak}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.04] border border-white/5">
            <Calendar className="size-4 text-primary" />
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Total</p>
              <p className="text-sm font-bold font-display">{streakData.totalInjections}</p>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {expanded && (
        <div className="space-y-4 pt-2 border-t border-white/5">
          {/* Heatmap */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="size-3.5 text-muted-foreground" />
              <p className="text-[10px] md:text-sm uppercase tracking-wider text-muted-foreground">
                6-Week Activity
              </p>
            </div>
            <InjectionHeatmap days={heatmap} />
          </div>

          {/* Comparison Charts */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="size-3.5 text-muted-foreground" />
              <p className="text-[10px] md:text-sm uppercase tracking-wider text-muted-foreground">
                Dosage Comparison
              </p>
            </div>
            <ComparisonChart weekly={weeklyData} monthly={monthlyData} />
          </div>
        </div>
      )}
    </section>

      {/* Blood Work Panel */}
      {onAddBloodWork && onEditBloodWork && onDeleteBloodWork && (
        <BloodWorkPanel
          bloodWork={bloodWork}
          onAdd={onAddBloodWork}
          onEdit={onEditBloodWork}
          onDelete={onDeleteBloodWork}
        />
      )}
    </>
  );
}
