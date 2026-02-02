import { useMemo } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { GlassPanel } from "@/components/ui/GlassPanel";

interface DosageTrendChartProps {
  injections: Array<{ date: Date; doseMg: number }>;
  days?: number;
}

export function DosageTrendChart({
  injections,
  days = 30,
}: DosageTrendChartProps) {
  const data = useMemo(() => {
    const endDate = new Date();
    const dailyData: Record<string, number> = {};

    injections.forEach((inj) => {
      const dateKey = format(inj.date, "MMM d");
      dailyData[dateKey] = (dailyData[dateKey] || 0) + inj.doseMg;
    });

    return Array.from({ length: days }, (_, i) => {
      const date = subDays(endDate, days - 1 - i);
      const dateKey = format(date, "MMM d");
      return { date: dateKey, dosage: dailyData[dateKey] || 0 };
    });
  }, [injections, days]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassPanel className="p-4">
        <h3 className="text-sm font-medium text-white/70 mb-4 font-display">
          Dosage Trend
        </h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="dosageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    return (
                      <div className="rounded-lg border border-white/10 bg-[#0B111A] px-3 py-2 shadow-xl">
                        <p className="text-xs text-white/60">
                          {payload[0].payload.date}
                        </p>
                        <p className="text-sm font-medium text-white">
                          {payload[0].value} mg
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="dosage"
                stroke="#F97316"
                strokeWidth={2}
                fill="url(#dosageGradient)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
