 import { useMemo } from "react";
 import { Check, ChevronLeft, ChevronRight } from "lucide-react";
 import { motion } from "framer-motion";
 
 import { Button } from "@/components/ui/button";
 import type { Injection } from "@/hooks/useInjections";
 import type { Protocol } from "@/hooks/useProtocols";
 import { dateKey, isSameDay, startOfDay } from "@/lib/date";
 
 type WeeklyCalendarGridProps = {
   selectedDate: Date;
   today: Date;
   scheduleByDate: Map<number, string[]>;
   logsByDate: Map<number, Injection[]>;
   activeProtocol: Protocol | null;
   protocolLookup: Map<string, Protocol>;
   protocolDoseMap: Map<string, number>;
   focusActiveEnabled: boolean;
   onSelectDate: (date: Date) => void;
   onPrevWeek: () => void;
   onNextWeek: () => void;
  hasLogs: boolean;
 };
 
 export function WeeklyCalendarGrid({
   selectedDate,
   today,
   scheduleByDate,
   logsByDate,
   activeProtocol,
   protocolDoseMap,
   focusActiveEnabled,
   onSelectDate,
   onPrevWeek,
   onNextWeek,
  hasLogs,
 }: WeeklyCalendarGridProps) {
   const weekDays = useMemo(() => {
     const start = startOfDay(selectedDate);
     const dayOfWeek = start.getDay();
     const weekStart = new Date(start);
     weekStart.setDate(start.getDate() - dayOfWeek);
 
     return Array.from({ length: 7 }, (_, i) => {
       const date = new Date(weekStart);
       date.setDate(weekStart.getDate() + i);
       return date;
     });
   }, [selectedDate]);
 
   const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
 
   const getDoseLabel = (
     logs: Injection[],
     scheduledProtocols: string[]
   ): string | null => {
     if (logs.length > 0) {
       const totalMg = logs.reduce((sum, l) => sum + (l.doseMg ?? 0), 0);
       return `${Math.round(totalMg)} mg`;
     }
     if (scheduledProtocols.length > 0 && activeProtocol) {
       const dose = protocolDoseMap.get(activeProtocol.id);
       if (dose) return `${Math.round(dose)} mg`;
     }
     return null;
   };
 
   const getStatusLabel = (
    dayHasLogs: boolean,
     isScheduled: boolean,
     isPast: boolean
   ): string | null => {
    if (dayHasLogs) return "Logged";
    if (isScheduled && isPast && hasLogs) return "Missed";
     if (isScheduled) return "Scheduled";
     return null;
   };
 
   const formatWeekRange = () => {
     const start = weekDays[0];
     const end = weekDays[6];
     const startMonth = start.toLocaleDateString("en-US", { month: "short" });
     const endMonth = end.toLocaleDateString("en-US", { month: "short" });
     const year = end.getFullYear();
 
     if (startMonth === endMonth) {
       return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${year}`;
     }
     return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
   };
 
   return (
     <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
       {/* Week Navigation */}
       <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
         <Button
           variant="ghost"
           size="icon"
           className="size-8"
           onClick={onPrevWeek}
           aria-label="Previous week"
         >
           <ChevronLeft className="size-4" />
         </Button>
         <span className="text-sm font-semibold font-display">{formatWeekRange()}</span>
         <Button
           variant="ghost"
           size="icon"
           className="size-8"
           onClick={onNextWeek}
           aria-label="Next week"
         >
           <ChevronRight className="size-4" />
         </Button>
       </div>
 
       {/* Week Grid */}
       <div className="flex-1 grid grid-cols-7 gap-2 p-3">
         {weekDays.map((date, idx) => {
           const key = dateKey(date);
           const dayLogs = logsByDate.get(key) ?? [];
           const scheduledProtocols = scheduleByDate.get(key) ?? [];
 
           const hasDayLogs = dayLogs.length > 0;
           const isScheduled = scheduledProtocols.length > 0;
           const hasActiveLayer = activeProtocol
             ? scheduledProtocols.includes(activeProtocol.id)
             : false;
           const isToday = isSameDay(date, today);
           const isSelected = isSameDay(date, selectedDate);
           const isPast = date < today;
           const isMissed = isScheduled && isPast && !hasDayLogs && hasLogs;
           const focusInactive = focusActiveEnabled && !hasActiveLayer;
 
           const doseLabel = getDoseLabel(dayLogs, scheduledProtocols);
           const statusLabel = getStatusLabel(hasDayLogs, isScheduled, isPast);
 
           return (
             <motion.button
               key={key}
               type="button"
               whileTap={{ scale: 0.97 }}
               onClick={() => onSelectDate(startOfDay(date))}
               aria-label={`${date.toLocaleDateString("en-US", {
                 weekday: "long",
                 month: "long",
                 day: "numeric",
               })}${statusLabel ? `. ${statusLabel}` : ""}${doseLabel ? `. ${doseLabel}` : ""}`}
               aria-pressed={isSelected}
               aria-current={isToday ? "date" : undefined}
               className={`
                 relative flex flex-col items-center justify-start p-3 rounded-xl border transition-all duration-150
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer
                 ${isSelected ? "bg-primary/15 border-primary/50 shadow-[0_0_0_1px_rgba(59,130,246,0.4),0_4px_20px_rgba(59,130,246,0.2)]" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.06]"}
                 ${isToday && !isSelected ? "border-primary/30" : ""}
                 ${focusInactive ? "opacity-50" : ""}
                 ${hasDayLogs ? "bg-accent/10 border-accent/20" : ""}
               `}
             >
               {/* Weekday Label */}
              <span className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                 {weekdayLabels[idx]}
               </span>
 
               {/* Date */}
               <span
                 className={`
                   text-2xl md:text-3xl font-bold font-display mt-1
                   ${isToday ? "text-primary" : "text-foreground"}
                 `}
               >
                 {date.getDate()}
               </span>
 
               {/* Status */}
               {statusLabel && (
                 <span
                   className={`
                    mt-2 text-[10px] md:text-sm font-semibold uppercase tracking-wide
                     ${hasDayLogs ? "text-accent" : ""}
                     ${isMissed ? "text-destructive/70" : ""}
                     ${isScheduled && !hasDayLogs && !isPast ? "text-primary/80" : ""}
                     ${isScheduled && !hasDayLogs && isPast && !isMissed ? "text-primary/70" : ""}
                   `}
                 >
                   {statusLabel}
                 </span>
               )}
 
               {/* Dose */}
               {doseLabel && (
                <span className="mt-1 text-xs md:text-sm font-medium text-foreground/80">
                   {doseLabel}
                 </span>
               )}
 
               {/* Logged indicator */}
               {hasDayLogs && (
                 <div className="absolute top-2 right-2 size-4 rounded-full bg-accent flex items-center justify-center shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                   <Check className="size-2.5 text-accent-foreground" strokeWidth={3} />
                 </div>
               )}
 
               {/* Today badge */}
               {isToday && (
                 <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide bg-primary/20 text-primary">
                   Today
                 </span>
               )}
             </motion.button>
           );
         })}
       </div>
     </div>
   );
 }
