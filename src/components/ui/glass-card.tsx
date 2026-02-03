import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  glowColor?: "orange" | "amber" | "emerald" | "blue" | "purple";
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  glowColor = "orange",
}: GlassCardProps) {
  const glowColors = {
    orange: "hover:shadow-[0_0_40px_rgba(255,149,0,0.3)]",
    amber: "hover:shadow-[0_0_40px_rgba(245,158,11,0.3)]",
    emerald: "hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]",
    blue: "hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]",
    purple: "hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]",
  };

  return (
    <div
      className={cn(
        "glass-card-2026",
        hover && "hover:translate-y-[-4px] hover:scale-[1.01]",
        glow && glowColors[glowColor],
        className,
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
