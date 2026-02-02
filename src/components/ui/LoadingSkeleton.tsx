import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("bg-white/5 rounded-lg animate-pulse", className)}
      {...props}
    />
  );
}

export function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-7 grid-rows-6 gap-px">
      {Array.from({ length: 42 }).map((_, i) => (
        <Skeleton
          key={i}
          className="aspect-square"
          style={{ animationDelay: `${i * 10}ms` }}
        />
      ))}
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-md px-6">
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
    </div>
  );
}
