import { useMemo } from "react";

import type { Injection } from "@/hooks/useInjections";
import type { Protocol } from "@/hooks/useProtocols";
import { DAY_MS, addDays, startOfDay } from "@/lib/date";

type ActiveMetricsArgs = {
  activeProtocol: Protocol | null;
  injections: Injection[];
};

export function useActiveMetrics({
  activeProtocol,
  injections,
}: ActiveMetricsArgs) {
  const activeLastLog = useMemo(() => {
    if (!activeProtocol) return null;
    return injections
      .filter((log) => log.protocolId === activeProtocol.id)
      .reduce<Injection | null>((latest, log) => {
        if (!latest || log.date > latest.date) return log;
        return latest;
      }, null);
  }, [activeProtocol, injections]);

  const nextInjectionDate = activeProtocol
    ? activeLastLog
      ? addDays(startOfDay(activeLastLog.date), activeProtocol.intervalDays)
      : startOfDay(activeProtocol.startDate)
    : null;

  const nextInjectionWithinRange =
    activeProtocol && activeProtocol.endDate && nextInjectionDate
      ? nextInjectionDate <= activeProtocol.endDate
      : true;

  const daysRemaining = nextInjectionDate
    ? Math.max(
        0,
        Math.ceil(
          (startOfDay(nextInjectionDate).getTime() -
            startOfDay(new Date()).getTime()) /
            DAY_MS
        )
      )
    : null;

  const mgPerInjection = activeProtocol
    ? activeProtocol.doseMl * activeProtocol.concentrationMgPerMl
    : null;
  const mgPerWeek = activeProtocol
    ? activeProtocol.doseMl *
      activeProtocol.concentrationMgPerMl *
      (7 / activeProtocol.intervalDays)
    : null;

  return {
    activeLastLog,
    nextInjectionDate,
    nextInjectionWithinRange,
    daysRemaining,
    mgPerInjection,
    mgPerWeek,
  };
}
