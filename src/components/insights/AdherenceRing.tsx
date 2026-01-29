
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

type AdherenceRingProps = {
  logged: number;
  scheduled: number;
  ratio: number;
};

export function AdherenceRing({ logged, scheduled, ratio }: AdherenceRingProps) {
  const remaining = Math.max(0, scheduled - logged);
  const data = [
    { name: "Logged", value: logged },
    { name: "Remaining", value: remaining },
  ];
  const percent = scheduled > 0 ? Math.round(ratio * 100) : 0;

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius="60%"
            outerRadius="85%"
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill="hsl(var(--accent))" />
            <Cell fill="hsl(var(--secondary))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-lg font-semibold">{percent}%</p>
        <p className="text-[9px] text-muted-foreground">
          {logged} / {scheduled} days
        </p>
      </div>
    </div>
  );
}
