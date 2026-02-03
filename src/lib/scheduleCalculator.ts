export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface InjectionSchedule {
  date: Date;
  injectionNumber: number;
  timeOfDay: TimeOfDay;
  formattedDate: string;
  formattedTime: string;
}

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 24) return "evening";
  return "night";
}

export function formatTimeOfDay(timeOfDay: TimeOfDay): string {
  const icons: Record<TimeOfDay, string> = {
    morning: "🌅",
    afternoon: "☀️",
    evening: "🌆",
    night: "🌙",
  };
  return `${icons[timeOfDay]} ${timeOfDay}`;
}

export function calculateNextInjection(
  currentDate: Date,
  intervalDays: number,
): Date {
  const hours = intervalDays * 24;
  const nextDate = new Date(currentDate);
  nextDate.setTime(nextDate.getTime() + hours * 60 * 60 * 1000);
  return nextDate;
}

export function generateInjectionSchedule(
  startDate: Date,
  intervalDays: number,
  count: number = 10,
): InjectionSchedule[] {
  const schedule: InjectionSchedule[] = [];
  let currentDate = new Date(startDate);

  for (let i = 1; i <= count; i++) {
    const hour = currentDate.getHours();
    const timeOfDay = getTimeOfDay(hour);

    schedule.push({
      date: new Date(currentDate),
      injectionNumber: i,
      timeOfDay,
      formattedDate: currentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      formattedTime: currentDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    });

    currentDate = calculateNextInjection(currentDate, intervalDays);
  }

  return schedule;
}

export function getDaysUntilInjection(nextDate: Date): number {
  const now = new Date();
  const diffMs = nextDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function getHoursUntilInjection(nextDate: Date): number {
  const now = new Date();
  const diffMs = nextDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
}

export function formatInterval(intervalDays: number): string {
  const hours = intervalDays * 24;
  if (Number.isInteger(intervalDays)) {
    return `${intervalDays} day${intervalDays !== 1 ? "s" : ""}`;
  }
  return `${intervalDays} days (${hours} hours)`;
}

export const PROTOCOL_INTERVALS = [
  { value: 1, label: "ED", description: "Every Day", common: false },
  { value: 2, label: "EOD", description: "Every Other Day", common: true },
  { value: 3, label: "E3D", description: "Every 3 Days", common: true },
  { value: 3.5, label: "E3.5D", description: "Twice Weekly", common: true },
  { value: 7, label: "E7D", description: "Weekly", common: true },
  { value: 14, label: "E14D", description: "Bi-weekly", common: false },
] as const;

export function getIntervalInfo(intervalDays: number) {
  return (
    PROTOCOL_INTERVALS.find((p) => p.value === intervalDays) || {
      value: intervalDays,
      label: `E${intervalDays}D`,
      description: `Every ${intervalDays} Days`,
      common: false,
    }
  );
}
