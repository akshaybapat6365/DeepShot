import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

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
  }, [open, initialProtocol, defaultStartDate]);

  const intervalNumber = Number(intervalDays);
  const doseNumber = Number(doseMl);
  const concentrationNumber = Number(concentration);
  const isIntervalValid =
    Number.isFinite(intervalNumber) &&
    intervalNumber >= 0.5 &&
    (intervalNumber * 2) % 1 === 0; // Allow 0.5 increments (e.g., 3.5)

  const doseMgPreview = useMemo(() => {
    if (!doseMl.trim() || !concentration.trim()) return null;
    if (!Number.isFinite(doseNumber) || !Number.isFinite(concentrationNumber)) {
      return null;
    }
    return doseNumber * concentrationNumber;
  }, [doseMl, concentration, doseNumber, concentrationNumber]);

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
      toast.error("Interval must be a whole number of days.");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ds-glass border-white/10 sm:max-w-2xl p-0 overflow-hidden gap-0 max-h-[85vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#2DD4BF]/20 to-[#14B8A6]/10 p-6 border-b border-white/5 sticky top-0 z-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-wide text-white font-display">
              {mode === "edit" ? "Edit Cycle" : "New Cycle"}
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Define the schedule, theme, and range for this protocol.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="protocol-name"
                className="text-white/60 text-xs uppercase tracking-widest pl-1"
              >
                Cycle Name
              </Label>
              <Input
                id="protocol-name"
                placeholder="e.g. Cutting Phase"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-[#2DD4BF]/50 h-10 rounded-xl"
                required
              />
            </div>
            <div className="space-y-3">
              <Label className="text-white/60 text-xs uppercase tracking-widest pl-1">
                Cycle Color
              </Label>
              <div className="grid grid-cols-4 gap-3">
                {PROTOCOL_THEMES.map((theme) => (
                  <button
                    key={theme.key}
                    type="button"
                    onClick={() => setThemeKey(theme.key)}
                    className={`group relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                      theme.key === themeKey
                        ? "border-white/30 bg-white/10"
                        : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/8"
                    }`}
                  >
                    {/* Color Swatch */}
                    <div
                      className="w-10 h-10 rounded-lg shadow-lg transition-transform group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${theme.accentHex} 0%, ${theme.accentHex}dd 100%)`,
                        boxShadow:
                          theme.key === themeKey
                            ? `0 0 20px ${theme.accentHex}60, 0 4px 10px ${theme.accentHex}40`
                            : `0 2px 8px ${theme.accentHex}30`,
                      }}
                    />
                    {/* Theme Name */}
                    <span
                      className={`text-sm font-medium ${
                        theme.key === themeKey ? "text-white" : "text-white/60"
                      }`}
                    >
                      {theme.name}
                    </span>
                    {/* Selected Indicator */}
                    {theme.key === themeKey && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white shadow-lg" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-white/60 text-xs uppercase tracking-widest pl-1">
              Interval Presets
            </Label>
            <div className="grid grid-cols-4 gap-2">
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
                  className={`glass-pill flex flex-col items-center justify-center h-16 gap-1 group transition-all ${
                    presetKey === preset.key ? "active" : ""
                  }`}
                >
                  <span
                    className={`text-sm font-medium transition-colors ${
                      presetKey === preset.key
                        ? "text-[#5EEAD4]"
                        : "text-white/70 group-hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </span>
                  <span className="text-[9px] text-white/30 uppercase tracking-tight">
                    {preset.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label
                htmlFor="protocol-start"
                className="text-white/60 text-xs uppercase tracking-widest pl-1"
              >
                Start Date
              </Label>
              <Input
                id="protocol-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="bg-white/5 border-white/10 text-white/80 focus-visible:ring-[#2DD4BF]/50 rounded-xl invert-calendar-icon"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="protocol-end"
                className="text-white/60 text-xs uppercase tracking-widest pl-1"
              >
                End Date (Optional)
              </Label>
              <Input
                id="protocol-end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="bg-white/5 border-white/10 text-white/80 focus-visible:ring-[#2DD4BF]/50 rounded-xl invert-calendar-icon"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="protocol-interval"
                className="text-white/60 text-xs uppercase tracking-widest pl-1"
              >
                Interval (Days)
              </Label>
              <Input
                id="protocol-interval"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="3.5"
                value={intervalDays}
                onChange={(event) => handleIntervalChange(event.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-[#2DD4BF]/50 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="protocol-end"
                className="text-white/60 text-xs uppercase tracking-widest pl-1"
              >
                End Date (Optional)
              </Label>
              <Input
                id="protocol-end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="bg-white/5 border-white/10 text-white/80 focus-visible:ring-[#2DD4BF]/50 rounded-xl invert-calendar-icon"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="protocol-interval"
                className="text-white/60 text-xs uppercase tracking-widest pl-1"
              >
                Interval (Days)
              </Label>
              <Input
                id="protocol-interval"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="3.5"
                value={intervalDays}
                onChange={(event) => handleIntervalChange(event.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-[#2DD4BF]/50 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="protocol-dose"
                className="text-white/60 text-xs uppercase tracking-widest pl-1"
              >
                Volume (mL)
              </Label>
              <div className="relative">
                <Input
                  id="protocol-dose"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.35"
                  value={doseMl}
                  onChange={(event) => setDoseMl(event.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-[#2DD4BF]/50 rounded-xl pr-10"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-white/30">
                  mL
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="protocol-concentration"
                className="text-white/60 text-xs uppercase tracking-widest pl-1"
              >
                Concentration
              </Label>
              <div className="relative">
                <Input
                  id="protocol-concentration"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="200"
                  value={concentration}
                  onChange={(event) => setConcentration(event.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-[#2DD4BF]/50 rounded-xl pr-14"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-white/30">
                  mg/mL
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 flex justify-between items-center">
            <span className="text-xs text-white/40 uppercase tracking-widest">
              Calculated Dose
            </span>
            <span className="text-lg font-light text-amber-200 drop-shadow-[0_0_8px_rgba(248,159,79,0.3)]">
              {doseMgPreview !== null ? `${doseMgPreview.toFixed(1)} mg` : "--"}
            </span>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="protocol-notes"
              className="text-white/60 text-xs uppercase tracking-widest pl-1"
            >
              Notes
            </Label>
            <Textarea
              id="protocol-notes"
              placeholder="Ester type, carrier oil, etc."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-[#2DD4BF]/50 rounded-xl resize-none"
            />
          </div>

          <DialogFooter className="gap-3 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-white/40 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isSaving}
              className="bg-[#2DD4BF] text-black hover:bg-[#14B8A6] font-semibold border-none rounded-xl shadow-[0_4px_15px_rgba(45,212,191,0.4)]"
            >
              {isSaving
                ? "Saving..."
                : mode === "edit"
                  ? "Update Cycle"
                  : "Create Cycle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
