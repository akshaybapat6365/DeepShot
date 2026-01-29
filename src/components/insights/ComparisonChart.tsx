import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ComparisonPoint = {
  label: string;
  mg: number;
};

type ComparisonChartProps = {
  weekly: ComparisonPoint[];
  monthly: ComparisonPoint[];
};

const Chart = ({ data }: { data: ComparisonPoint[] }) => (
  <div className="h-52">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(9,12,18,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            fontSize: 12,
            color: "#fff",
          }}
        />
        <Bar dataKey="mg" fill="#F97316" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export function ComparisonChart({ weekly, monthly }: ComparisonChartProps) {
  return (
    <Tabs defaultValue="weekly" className="w-full">
      <TabsList className="mb-3 w-full justify-start bg-white/5">
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
      </TabsList>
      <TabsContent value="weekly">
        <Chart data={weekly} />
      </TabsContent>
      <TabsContent value="monthly">
        <Chart data={monthly} />
      </TabsContent>
    </Tabs>
  );
}
