import { useState } from "react";

import type { Injection } from "@/hooks/useInjections";

export type OptimisticInjection = Injection & { isOptimistic: true };

const createOptimisticId = () =>
  `optimistic-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function useOptimisticInjections() {
  const [optimisticInjections, setOptimisticInjections] = useState<
    OptimisticInjection[]
  >([]);

  const addOptimistic = (entry: Omit<OptimisticInjection, "id" | "isOptimistic">) => {
    const id = createOptimisticId();
    setOptimisticInjections((prev) => [
      { ...entry, id, isOptimistic: true },
      ...prev,
    ]);
    return id;
  };

  const resolveOptimistic = (id: string) => {
    setOptimisticInjections((prev) => prev.filter((item) => item.id !== id));
  };

  return { optimisticInjections, addOptimistic, resolveOptimistic };
}
