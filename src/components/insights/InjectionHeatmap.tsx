import { useMemo } from "react";

type HeatmapDay = {
  key: number;
  date: Date;
  count: number;
  totalMg: number;
};

type InjectionHeatmapProps = {
  days: HeatmapDay[];
};

const formatShortDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const toneForCount = (count: number): string => {
  if (count <= 0) return "bg-white/5";
  if (count === 1) return "bg-primary/30";
  if (count === 2) return "bg-primary/50";
  return "bg-primary/80";
};

export function InjectionHeatmap({ days }: InjectionHeatmapProps) {
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  const weeks = useMemo(() => {
    const result: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];

    days.forEach((day, index) => {
      const dayOfWeek = day.date.getDay();

      if (index === 0 && dayOfWeek !== 0) {
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({
            key: -i - 1,
            date: new Date(0),
            count: -1,
            totalMg: 0,
          });
        }
      }

      currentWeek.push(day);

      if (dayOfWeek === 6 || index === days.length - 1) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

    return result;
  }, [days]);

  return (
    <div className="flex gap-1">
      {/* Weekday labels */}
      <div className="flex flex-col gap-0.5 pr-1">
        {weekdays.map((day, idx) => (
          <div
            key={idx}
            className="h-3 w-3 flex items-center justify-center text-[8px] text-muted-foreground"
          >
            {idx % 2 === 1 ? day : ""}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-0.5 overflow-x-auto">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-0.5">
            {week.map((day) => (
              <div
                key={day.key}
                title={
                  day.count >= 0
                    ? `${formatShortDate(day.date)} · ${day.count} injection${day.count !== 1 ? "s" : ""} · ${day.totalMg} mg`
                    : undefined
                }
                className={`size-3 rounded-sm transition-colors ${
                  day.count < 0 ? "bg-transparent" : toneForCount(day.count)
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
