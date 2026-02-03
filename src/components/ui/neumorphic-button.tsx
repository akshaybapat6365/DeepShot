import React from "react";
import { cn } from "@/lib/utils";

interface NeumorphicButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function NeumorphicButton({
  children,
  className,
  onClick,
  disabled = false,
  size = "md",
}: NeumorphicButtonProps) {
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "btn-neumorphic font-semibold text-white/90 transition-all duration-200",
        "hover:text-white disabled:opacity-50 disabled:cursor-not-allowed",
        sizes[size],
        className,
      )}
    >
      {children}
    </button>
  );
}
