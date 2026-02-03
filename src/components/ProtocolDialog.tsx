import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Calculator,
  Clock,
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Protocol } from "@/hooks/useProtocols";
import { createOrRestartProtocol, updateProtocol } from "@/lib/firestore";
import { PROTOCOL_THEMES } from "@/lib/protocolThemes";
import {
  generateInjectionSchedule,
  formatInterval,
  formatTimeOfDay,
  PROTOCOL_INTERVALS,
} from "@/lib/scheduleCalculator";

const toInputDate = (date: Date) => {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 10);
};

const fromInputDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const presetFromInterval = (value?: number) => {
  if (value === 1) return "ED";
  if (value === 2) return "EOD";
  if (value === 3) return "E3D";
  if (value === 3.5) return "E3.5D";
  if (value === 7) return "E7D";
  return null;
};

const presets = [
  { key: "ED", label: "ED", sub: "Every day", days: 1 },
  { key: "EOD", label: "EOD", sub: "Alt day", days: 2 },
  { key: "E3D", label: "E3D", sub: "Every 3d", days: 3 },
  { key: "E3.5D", label: "E3.5D", sub: "2x weekly", days: 3.5 },
  { key: "E7D", label: "E7D", sub: "Weekly", days: 7 },
];

type ProtocolDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uid?: string;
  mode?: "create" | "edit";
  initialProtocol?: Protocol | null;
  defaultStartDate?: Date;
};

export function ProtocolDialog({
  open,
  onOpenChange,
  uid,
  mode = "create",
  initialProtocol,
  defaultStartDate,
}: ProtocolDialogProps) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [intervalDays, setIntervalDays] = useState("");
  const [presetKey, setPresetKey] = useState<string | null>(null);
  const [doseMl, setDoseMl] = useState("");
  const [concentration, setConcentration] = useState("");
  const [themeKey, setThemeKey] = useState(PROTOCOL_THEMES[0].key);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Schedule calculator state
  const [showCalculator, setShowCalculator] = useState(false);
  const [injectionCount] = useState(8);

  useEffect(() => {
    if (!open) return;

    const seedDate =
      initialProtocol?.startDate ?? defaultStartDate ?? new Date();
    const intervalValue = initialProtocol?.intervalDays;

    setName(initialProtocol?.name ?? "New cycle");
    setStartDate(toInputDate(seedDate));
    setEndDate(
      initialProtocol?.endDate ? toInputDate(initialProtocol.endDate) : "",
    );
    setIntervalDays(intervalValue?.toString() ?? "");
    setPresetKey(presetFromInterval(intervalValue));
    setDoseMl(initialProtocol?.doseMl.toString() ?? "");
    setConcentration(initialProtocol?.concentrationMgPerMl.toString() ?? "");
    setThemeKey(initialProtocol?.themeKey ?? PROTOCOL_THEMES[0].key);
    setNotes(initialProtocol?.notes ?? "");
    setShowCalculator(false);
  }, [open, initialProtocol, defaultStartDate]);

  const intervalNumber = Number(intervalDays);
  const doseNumber = Number(doseMl);
  const concentrationNumber = Number(concentration);
  const isIntervalValid =
    Number.isFinite(intervalNumber) &&
    intervalNumber >= 0.5 &&
    (intervalNumber * 2) % 1 === 0;

  const doseMgPreview = useMemo(() => {
    if (!doseMl.trim() || !concentration.trim()) return null;
    if (!Number.isFinite(doseNumber) || !Number.isFinite(concentrationNumber)) {
      return null;
    }
    return doseNumber * concentrationNumber;
  }, [doseMl, concentration, doseNumber, concentrationNumber]);

  // Generate schedule preview
  const schedule = useMemo(() => {
    if (!showCalculator || !isIntervalValid || !startDate) return [];
    const start = fromInputDate(startDate);
    if (!start) return [];
    return generateInjectionSchedule(start, intervalNumber, injectionCount);
  }, [
    showCalculator,
    isIntervalValid,
    startDate,
    intervalNumber,
    injectionCount,
  ]);

  const selectedInterval = PROTOCOL_INTERVALS.find(
    (p) => p.value === intervalNumber,
  );

  const canSubmit =
    Boolean(uid) &&
    name.trim().length > 0 &&
    Boolean(startDate) &&
    isIntervalValid &&
    Number.isFinite(doseNumber) &&
    doseNumber > 0 &&
    Number.isFinite(concentrationNumber) &&
    concentrationNumber > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!uid) {
      toast.error("Please sign in to manage protocols.");
      return;
    }

    const parsedStartDate = fromInputDate(startDate);
    if (!parsedStartDate) {
      toast.error("Enter a valid start date.");
      return;
    }

    const parsedEndDate = endDate ? fromInputDate(endDate) : null;
    if (endDate && !parsedEndDate) {
      toast.error("Enter a valid end date.");
      return;
    }

    if (parsedEndDate && parsedEndDate < parsedStartDate) {
      toast.error("End date must be after the start date.");
      return;
    }

    if (!isIntervalValid) {
      toast.error("Interval must be a valid number of days.");
      return;
    }

    if (!Number.isFinite(doseNumber) || doseNumber <= 0) {
      toast.error("Enter a valid dose.");
      return;
    }

    if (!Number.isFinite(concentrationNumber) || concentrationNumber <= 0) {
      toast.error("Enter a valid concentration.");
      return;
    }

    try {
      setIsSaving(true);
      if (mode === "edit" && initialProtocol) {
        await updateProtocol(uid, initialProtocol.id, {
          name: name.trim(),
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          intervalDays: intervalNumber,
          doseMl: doseNumber,
          concentrationMgPerMl: concentrationNumber,
          themeKey,
          notes: notes.trim() || "",
        });
        toast.success("Cycle updated.");
      } else {
        await createOrRestartProtocol(uid, {
          name: name.trim(),
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          intervalDays: intervalNumber,
          doseMl: doseNumber,
          concentrationMgPerMl: concentrationNumber,
          themeKey,
          notes: notes.trim() || "",
        });
        toast.success("Cycle saved.");
      }

      onOpenChange(false);
    } catch {
      toast.error("Could not save the cycle. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleIntervalChange = (value: string) => {
    setIntervalDays(value);
    setPresetKey(null);
  };

  const currentTheme =
    PROTOCOL_THEMES.find((t) => t.key === themeKey) ?? PROTOCOL_THEMES[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 border border-white/10 bg-[#0a0a0a]">
        {/* Header */}
        <div
          className="p-6 border-b border-white/5 sticky top-0 z-10"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.accentHex}20 0%, ${currentTheme.accentHex}10 100%)`,
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-wide text-white">
              {mode === "edit" ? "Edit Cycle" : "New Cycle"}
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Define the schedule, theme, and range for this protocol.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left Column - Main Form */}
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            {/* Cycle Name */}
            <div className="space-y-2">
              <Label className="text-white/60 text-xs uppercase tracking-widest">
                Cycle Name
              </Label>
              <Input
                placeholder="e.g. Cutting Phase"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#FF9500]/50 rounded-xl h-11"
                required
              />
            </div>

            {/* Color Theme */}
            <div className="space-y-3">
              <Label className="text-white/60 text-xs uppercase tracking-widest">
                Cycle Color
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {PROTOCOL_THEMES.map((theme) => (
                  <button
                    key={theme.key}
                    type="button"
                    onClick={() => setThemeKey(theme.key)}
                    className={`group relative aspect-square rounded-xl border-2 transition-all duration-200 ${
                      theme.key === themeKey
                        ? "border-white/40 scale-105"
                        : "border-white/5 hover:border-white/20"
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${theme.accentHex}30 0%, ${theme.accentHex}10 100%)`,
                    }}
                  >
                    <div
                      className="absolute inset-2 rounded-lg transition-transform group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${theme.accentHex} 0%, ${theme.accentHex}dd 100%)`,
                        boxShadow:
                          theme.key === themeKey
                            ? `0 0 20px ${theme.accentHex}80, 0 4px 12px ${theme.accentHex}50`
                            : `0 2px 8px ${theme.accentHex}30`,
                      }}
                    />
                    {theme.key === themeKey && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white shadow-lg" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Interval Presets */}
            <div className="space-y-3">
              <Label className="text-white/60 text-xs uppercase tracking-widest">
                Protocol Presets
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => {
                      setIntervalDays(String(preset.days));
                      setPresetKey(preset.key);
                      const presetName = `${preset.label} Cycle`;
                      if (
                        name === "" ||
                        name === "New cycle" ||
                        name.includes("Cycle")
                      ) {
                        setName(presetName);
                      }
                    }}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all duration-200 ${
                      presetKey === preset.key
                        ? "bg-[#FF9500]/20 border-[#FF9500]/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold ${
                        presetKey === preset.key
                          ? "text-[#FFB84D]"
                          : "text-white/80"
                      }`}
                    >
                      {preset.label}
                    </span>
                    <span className="text-[10px] text-white/40 uppercase tracking-tight mt-0.5">
                      {preset.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date and Interval Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-white/60 text-xs uppercase tracking-widest">
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white/5 border-white/10 text-white/80 focus-visible:ring-[#FF9500]/50 rounded-xl h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs uppercase tracking-widest">
                  End Date
                </Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white/5 border-white/10 text-white/80 focus-visible:ring-[#FF9500]/50 rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs uppercase tracking-widest">
                  Interval (Days)
                </Label>
                <Input
                  type="number"
                  min="0.5"
                  step="0.5"
                  placeholder="3.5"
                  value={intervalDays}
                  onChange={(e) => handleIntervalChange(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#FF9500]/50 rounded-xl h-11"
                  required
                />
              </div>
            </div>

            {/* Dose and Concentration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/60 text-xs uppercase tracking-widest">
                  Volume (mL)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.35"
                    value={doseMl}
                    onChange={(e) => setDoseMl(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#FF9500]/50 rounded-xl h-11 pr-10"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
                    mL
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs uppercase tracking-widest">
                  Concentration
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="200"
                    value={concentration}
                    onChange={(e) => setConcentration(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#FF9500]/50 rounded-xl h-11 pr-14"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
                    mg/mL
                  </span>
                </div>
              </div>
            </div>

            {/* Calculated Dose */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 flex justify-between items-center">
              <span className="text-xs text-white/40 uppercase tracking-widest">
                Calculated Dose
              </span>
              <span className="text-lg font-light text-[#FFB84D]">
                {doseMgPreview !== null
                  ? `${doseMgPreview.toFixed(1)} mg`
                  : "--"}
              </span>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-white/60 text-xs uppercase tracking-widest">
                Notes
              </Label>
              <Textarea
                placeholder="Ester type, carrier oil, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#FF9500]/50 rounded-xl resize-none min-h-[80px]"
              />
            </div>

            {/* Action Buttons */}
            <DialogFooter className="gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit || isSaving}
                className="bg-[#FF9500] text-black hover:bg-[#FF6D00] font-semibold border-none rounded-xl shadow-[0_4px_20px_rgba(255,149,0,0.4)] disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : mode === "edit"
                    ? "Update Cycle"
                    : "Create Cycle"}
              </Button>
            </DialogFooter>
          </form>

          {/* Right Column - Schedule Calculator */}
          <div className="p-6 border-l border-white/5 bg-white/[0.02]">
            <div className="space-y-6">
              {/* Calculator Header */}
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-[#FF9500]/20 flex items-center justify-center">
                  <Calculator className="size-5 text-[#FF9500]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Schedule Preview
                  </h3>
                  <p className="text-sm text-white/50">
                    Preview your injection timing
                  </p>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2">
                {PROTOCOL_INTERVALS.filter((p) => p.common).map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setIntervalDays(String(preset.value));
                      setPresetKey(presetFromInterval(preset.value));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      intervalNumber === preset.value
                        ? "bg-[#FF9500]/20 text-[#FFB84D] border border-[#FF9500]/40"
                        : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Interval Info */}
              {selectedInterval && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-[#FFB84D] bg-[#FF9500]/10 rounded-lg px-3 py-2 border border-[#FF9500]/20"
                >
                  <Clock className="size-4" />
                  <span>
                    {formatInterval(intervalNumber)} —{" "}
                    {selectedInterval.description}
                  </span>
                </motion.div>
              )}

              {/* Toggle Schedule */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCalculator(!showCalculator)}
                disabled={!isIntervalValid || !startDate}
                className="w-full border-white/10 text-white/80 hover:text-white hover:bg-white/5 rounded-xl"
              >
                <CalendarDays className="size-4 mr-2" />
                {showCalculator ? "Hide Schedule" : "Show Schedule"}
                {showCalculator ? (
                  <ChevronUp className="size-4 ml-2" />
                ) : (
                  <ChevronDown className="size-4 ml-2" />
                )}
              </Button>

              {/* Schedule List */}
              <AnimatePresence>
                {showCalculator && schedule.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {schedule.map((injection, index) => (
                        <motion.div
                          key={injection.injectionNumber}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-[#FF9500]/20 flex items-center justify-center text-[#FF9500] font-semibold text-sm">
                              {injection.injectionNumber}
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">
                                {injection.formattedDate}
                              </p>
                              <p className="text-white/50 text-xs">
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
                  </motion.div>
                )}
              </AnimatePresence>

              {!isIntervalValid && (
                <p className="text-sm text-white/40 text-center py-4">
                  Enter a valid interval to see schedule preview
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
