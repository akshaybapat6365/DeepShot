import { BarChart3, CalendarDays, Layers } from "lucide-react";

type MobileView = "calendar" | "cycles" | "insights";

type MobileNavProps = {
  value: MobileView;
  onChange: (next: MobileView) => void;
};

const items: Array<{
  key: MobileView;
  label: string;
  icon: typeof CalendarDays;
}> = [
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "cycles", label: "Cycles", icon: Layers },
  { key: "insights", label: "Insights", icon: BarChart3 },
];

export function MobileNav({ value, onChange }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#0b0f14]/95 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2 px-4 py-3">
        {items.map(({ key, label, icon: Icon }) => {
          const isActive = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-pressed={isActive}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                isActive
                  ? "border-amber-400/60 bg-amber-500/15 text-amber-100 shadow-[0_0_18px_rgba(249,115,22,0.35)]"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
