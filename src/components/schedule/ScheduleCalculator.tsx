import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  Clock,
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  generateInjectionSchedule,
  formatInterval,
  formatTimeOfDay,
  PROTOCOL_INTERVALS,
} from "@/lib/scheduleCalculator";

interface ScheduleCalculatorProps {
  defaultInterval?: number;
  defaultStartDate?: Date;
}

export function ScheduleCalculator({
  defaultInterval = 3.5,
  defaultStartDate = new Date(),
}: ScheduleCalculatorProps) {
  const [intervalDays, setIntervalDays] = useState(defaultInterval);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date(defaultStartDate);
    return date.toISOString().slice(0, 16);
  });
  const [showSchedule, setShowSchedule] = useState(false);
  const [injectionCount, setInjectionCount] = useState(8);

  const schedule = useMemo(() => {
    if (!showSchedule) return [];
    const start = new Date(startDate);
    return generateInjectionSchedule(start, intervalDays, injectionCount);
  }, [startDate, intervalDays, showSchedule, injectionCount]);

  const selectedInterval = PROTOCOL_INTERVALS.find(
    (p) => p.value === intervalDays,
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-5">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Calculator className="size-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            Schedule Calculator
          </h3>
          <p className="text-sm text-white/50">Preview your injection timing</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-white/60 text-xs uppercase tracking-widest">
              Start Date & Time
            </Label>
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white/5 border-white/10 text-white focus-visible:ring-amber-500/50 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/60 text-xs uppercase tracking-widest">
              Interval
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={intervalDays}
                onChange={(e) =>
                  setIntervalDays(parseFloat(e.target.value) || 0)
                }
                className="bg-white/5 border-white/10 text-white focus-visible:ring-amber-500/50 rounded-xl"
              />
              <div className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/70 text-sm whitespace-nowrap">
                days
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PROTOCOL_INTERVALS.filter((p) => p.common).map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setIntervalDays(preset.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                intervalDays === preset.value
                  ? "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {selectedInterval && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-amber-200/80 bg-amber-500/10 rounded-lg px-3 py-2"
          >
            <Clock className="size-4" />
            <span>
              {formatInterval(intervalDays)} — {selectedInterval.description}
            </span>
          </motion.div>
        )}

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowSchedule(!showSchedule)}
            className="flex-1 border-white/15 text-white/80 hover:text-white hover:bg-white/5"
          >
            <CalendarDays className="size-4 mr-2" />
            {showSchedule ? "Hide Schedule" : "Calculate Schedule"}
            {showSchedule ? (
              <ChevronUp className="size-4 ml-2" />
            ) : (
              <ChevronDown className="size-4 ml-2" />
            )}
          </Button>

          {showSchedule && (
            <div className="flex items-center gap-2">
              <Label className="text-white/50 text-xs">Show:</Label>
              <Input
                type="number"
                min="3"
                max="20"
                value={injectionCount}
                onChange={(e) =>
                  setInjectionCount(parseInt(e.target.value) || 8)
                }
                className="w-16 bg-white/5 border-white/10 text-white text-center rounded-lg h-8"
              />
              <span className="text-white/50 text-xs">injections</span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSchedule && schedule.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-white/10">
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {schedule.map((injection, index) => (
                  <motion.div
                    key={injection.injectionNumber}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 font-semibold text-sm">
                        {injection.injectionNumber}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {injection.formattedDate}
                        </p>
                        <p className="text-white/50 text-sm">
                          {formatTimeOfDay(injection.timeOfDay)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-sm font-medium">
                        {injection.formattedTime}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
