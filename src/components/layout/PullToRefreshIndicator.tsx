import { Loader2 } from "lucide-react";

type PullToRefreshIndicatorProps = {
  pullDistance: number;
  refreshing: boolean;
};

export function PullToRefreshIndicator({
  pullDistance,
  refreshing,
}: PullToRefreshIndicatorProps) {
  const progress = Math.min(pullDistance / 80, 1);
  const translate = Math.min(pullDistance, 60);

  if (pullDistance <= 0 && !refreshing) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center">
      <div
        className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0b0f14]/90 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 shadow-[0_18px_45px_rgba(0,0,0,0.6)]"
        style={{
          transform: `translateY(${translate}px)`,
          opacity: 0.6 + progress * 0.4,
        }}
      >
        <Loader2 className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
        {refreshing ? "Refreshing" : "Pull to refresh"}
      </div>
    </div>
  );
}
