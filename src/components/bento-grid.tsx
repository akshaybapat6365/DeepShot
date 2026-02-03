import React from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return <div className={cn("bento-grid", className)}>{children}</div>;
}

interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  span?: 1 | 2 | "full";
  spanRow?: 1 | 2;
  title?: string;
  description?: string;
}

export function BentoItem({
  children,
  className,
  span = 1,
  spanRow = 1,
  title,
  description,
}: BentoItemProps) {
  return (
    <div
      className={cn(
        "bento-item",
        span === 2 && "span-2",
        span === "full" && "span-full",
        spanRow === 2 && "span-2-row",
        className,
      )}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-white font-display">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-white/60 mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
