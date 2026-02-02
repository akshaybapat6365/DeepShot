import { motion } from "framer-motion";
import { Calendar, Plus, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  onLogClick: () => void;
  onCyclesClick: () => void;
  activeTab?: string;
}

export function MobileNav({
  onLogClick,
  onCyclesClick,
  activeTab = "calendar",
}: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <div className="mx-4 mb-4 rounded-2xl border border-white/10 bg-[#0B111A]/95 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-around p-2">
          <NavItem
            icon={Calendar}
            label="Calendar"
            active={activeTab === "calendar"}
          />
          <NavItem icon={Plus} label="Log" primary onClick={onLogClick} />
          <NavItem
            icon={Layers}
            label="Cycles"
            active={activeTab === "cycles"}
            onClick={onCyclesClick}
          />
        </div>
      </div>
    </nav>
  );
}

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  primary?: boolean;
  onClick?: () => void;
}

function NavItem({
  icon: Icon,
  label,
  active = false,
  primary = false,
  onClick,
}: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-1 p-3 transition-all",
        primary
          ? "-mt-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 p-4 shadow-lg shadow-amber-500/30"
          : "rounded-xl",
        active && !primary && "text-amber-400",
      )}
    >
      {active && !primary && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 rounded-xl bg-white/10"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <Icon
        className={cn(
          "relative z-10",
          primary ? "size-6 text-white" : "size-5",
        )}
      />
      <span
        className={cn(
          "relative z-10 text-[10px] font-medium",
          primary ? "text-white" : "text-white/60",
        )}
      >
        {label}
      </span>
    </button>
  );
}
