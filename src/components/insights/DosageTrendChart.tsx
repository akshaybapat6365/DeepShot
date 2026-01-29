import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

type TrendPoint = {
  date: string;
  mg: number;
};

type DosageTrendChartProps = {
  data: TrendPoint[];
};

export function DosageTrendChart({ data }: DosageTrendChartProps) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="mgGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="mg"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            fill="url(#mgGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
