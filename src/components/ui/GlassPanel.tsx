import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glow";
  radius?: "default" | "lg" | "xl";
}

export function GlassPanel({
  className,
  variant = "default",
  radius = "default",
  children,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden backdrop-blur-xl border transition-all duration-300",
        variant === "default" && [
          "border-white/10",
          "bg-gradient-to-br from-white/[0.08] to-white/[0.02]",
          "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]",
          "hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)]",
        ],
        variant === "elevated" && [
          "border-white/[0.12]",
          "bg-gradient-to-br from-white/[0.12] to-white/[0.04]",
          "shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]",
        ],
        variant === "glow" && [
          "border-amber-500/30",
          "bg-gradient-to-br from-amber-500/10 to-transparent",
          "shadow-[0_0_40px_-10px_rgba(249,115,22,0.3)]",
        ],
        radius === "default" && "rounded-2xl",
        radius === "lg" && "rounded-3xl",
        radius === "xl" && "rounded-[32px]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
