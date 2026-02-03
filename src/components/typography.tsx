import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

export function Display({ children, className }: TypographyProps) {
  return (
    <h1
      className={cn(
        "font-display text-[clamp(2rem,5vw,4rem)] font-bold tracking-[-0.02em] leading-[1.1] text-white",
        className,
      )}
    >
      {children}
    </h1>
  );
}

export function Headline({ children, className }: TypographyProps) {
  return (
    <h2
      className={cn(
        "font-display text-[clamp(1.5rem,3vw,2.5rem)] font-semibold tracking-[-0.01em] text-white",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function Title({ children, className }: TypographyProps) {
  return (
    <h3
      className={cn(
        "font-display text-[clamp(1.125rem,2vw,1.5rem)] font-semibold text-white",
        className,
      )}
    >
      {children}
    </h3>
  );
}

export function Body({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-base text-white/70 leading-relaxed", className)}>
      {children}
    </p>
  );
}

export function Caption({ children, className }: TypographyProps) {
  return (
    <span
      className={cn(
        "text-xs uppercase tracking-[0.2em] text-white/50",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function GradientText({ children, className }: TypographyProps) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-[#FF9500] via-[#FF6D00] to-[#FF4500] bg-clip-text text-transparent",
        className,
      )}
    >
      {children}
    </span>
  );
}
