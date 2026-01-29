 import { useMemo } from "react";
 
 import type { Protocol } from "@/hooks/useProtocols";
 
 type UseNotificationsArgs = {
   activeProtocol: Protocol | null;
   nextInjectionDate: Date | null;
   daysRemaining: number | null;
   monthStats: { scheduledDays: number; loggedDays: number };
   currentStreak: number;
  hasLogs: boolean;
 };
 
 export function useNotifications({
   activeProtocol,
   nextInjectionDate,
   daysRemaining,
   monthStats,
   currentStreak,
  hasLogs,
 }: UseNotificationsArgs) {
   const missedCount = useMemo(() => {
    if (!hasLogs) return 0;
    return Math.max(0, monthStats.scheduledDays - monthStats.loggedDays);
  }, [hasLogs, monthStats]);
 
   const notificationCount = useMemo(() => {
     let count = 0;
 
     // Upcoming injection (today or within 3 days)
     if (activeProtocol && nextInjectionDate && daysRemaining !== null && daysRemaining <= 3) {
       count += 1;
     }
 
     // Missed injections
     if (missedCount > 0) {
       count += 1;
     }
 
     // Streak milestone
     if (currentStreak >= 4) {
       count += 1;
     }
 
     return count;
   }, [activeProtocol, nextInjectionDate, daysRemaining, missedCount, currentStreak]);
 
   return {
     notificationCount,
     missedCount,
   };
 }
