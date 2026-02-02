import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  highlight?: boolean;
  delay?: number;
}

export function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  trendValue,
  highlight = false,
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <GlassPanel
        variant={highlight ? "glow" : "default"}
        className={cn(
          "p-4 cursor-pointer group",
          highlight && "border-amber-500/30",
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">
              {label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-white font-display tracking-tight">
              {value}
            </p>
            {subtext && <p className="mt-1 text-xs text-white/40">{subtext}</p>}
          </div>
          {Icon && (
            <div className="rounded-xl bg-white/5 p-2 text-white/30 group-hover:text-white/50 transition-colors">
              <Icon className="size-5" />
            </div>
          )}
        </div>

        {trend && (
          <div className="mt-3 flex items-center gap-1.5">
            {trend === "up" ? (
              <TrendingUp className="size-3 text-emerald-400" />
            ) : trend === "down" ? (
              <TrendingDown className="size-3 text-rose-400" />
            ) : (
              <Minus className="size-3 text-white/30" />
            )}
            <span
              className={cn(
                "text-xs",
                trend === "up" && "text-emerald-400",
                trend === "down" && "text-rose-400",
                trend === "neutral" && "text-white/40",
              )}
            >
              {trendValue}
            </span>
          </div>
        )}
      </GlassPanel>
    </motion.div>
  );
}
