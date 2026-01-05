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
  if (value === 2) return "E2D";
  if (value === 3) return "E3D";
  return null;
};

const presets = [
  { key: "ED", label: "ED", sub: "Every day", days: 1 },
  { key: "EOD", label: "EOD", sub: "Alt day", days: 2 },
  { key: "E2D", label: "E2D", sub: "Every 2d", days: 2 },
  { key: "E3D", label: "E3D", sub: "Every 3d", days: 3 },
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

    const seedDate = initialProtocol?.startDate ?? defaultStartDate ?? new Date();
    const intervalValue = initialProtocol?.intervalDays;

    setName(initialProtocol?.name ?? "New cycle");
    setStartDate(toInputDate(seedDate));
    setEndDate(initialProtocol?.endDate ? toInputDate(initialProtocol.endDate) : "");
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
    intervalNumber > 0 &&
    Number.isInteger(intervalNumber);

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
    } catch (error) {
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
      <DialogContent className="glass-panel border-white/10 sm:max-w-2xl p-0 overflow-hidden gap-0">
        <div className="bg-gradient-to-r from-amber-500/20 to-sky-500/10 p-6 border-b border-white/5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-wide text-white">
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
              <Label htmlFor="protocol-name" className="text-white/60 text-xs uppercase tracking-widest pl-1">Cycle Name</Label>
              <Input
                id="protocol-name"
                placeholder="e.g. Cutting Phase"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-500/50 h-10 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protocol-theme" className="text-white/60 text-xs uppercase tracking-widest pl-1">Cycle Theme</Label>
              <div className="grid grid-cols-5 gap-2">
                {PROTOCOL_THEMES.map((theme) => (
                  <button
                    key={theme.key}
                    type="button"
                    onClick={() => setThemeKey(theme.key)}
                    className={`flex flex-col items-center justify-center rounded-xl border px-2 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                      theme.key === themeKey
                        ? `${theme.border} ${theme.accentSoft} ${theme.glow}`
                        : "border-white/10 bg-white/5 text-white/50"
                    }`}
                  >
                    <span className={`mb-2 size-4 rounded-full ${theme.accent}`} />
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-white/60 text-xs uppercase tracking-widest pl-1">Interval Presets</Label>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => {
                    setIntervalDays(String(preset.days));
                    setPresetKey(preset.key);
                    const presetName = `${preset.label} Cycle`;
                    if (name === "" || name === "New cycle" || name.includes("Cycle")) {
                      setName(presetName);
                    }
                  }}
                  className={`glass-pill flex flex-col items-center justify-center h-16 gap-1 group transition-all ${
                    presetKey === preset.key ? "active" : ""
                  }`}
                >
                  <span className={`text-sm font-medium transition-colors ${
                    presetKey === preset.key ? "text-amber-200" : "text-white/70 group-hover:text-white"
                  }`}>
                    {preset.label}
                  </span>
                  <span className="text-[9px] text-white/30 uppercase tracking-tight">{preset.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="protocol-start" className="text-white/60 text-xs uppercase tracking-widest pl-1">Start Date</Label>
              <Input
                id="protocol-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="bg-white/5 border-white/10 text-white/80 focus-visible:ring-amber-500/50 rounded-xl invert-calendar-icon"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protocol-end" className="text-white/60 text-xs uppercase tracking-widest pl-1">End Date (Optional)</Label>
              <Input
                id="protocol-end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="bg-white/5 border-white/10 text-white/80 focus-visible:ring-amber-500/50 rounded-xl invert-calendar-icon"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protocol-interval" className="text-white/60 text-xs uppercase tracking-widest pl-1">Interval (Days)</Label>
              <Input
                id="protocol-interval"
                type="number"
                min="1"
                step="1"
                placeholder="3"
                value={intervalDays}
                onChange={(event) => handleIntervalChange(event.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-500/50 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="protocol-dose" className="text-white/60 text-xs uppercase tracking-widest pl-1">Volume (mL)</Label>
              <div className="relative">
                <Input
                  id="protocol-dose"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.35"
                  value={doseMl}
                  onChange={(event) => setDoseMl(event.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-500/50 rounded-xl pr-10"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-white/30">mL</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="protocol-concentration" className="text-white/60 text-xs uppercase tracking-widest pl-1">Concentration</Label>
              <div className="relative">
                <Input
                  id="protocol-concentration"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="200"
                  value={concentration}
                  onChange={(event) => setConcentration(event.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-500/50 rounded-xl pr-14"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-white/30">mg/mL</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 flex justify-between items-center">
            <span className="text-xs text-white/40 uppercase tracking-widest">Calculated Dose</span>
            <span className="text-lg font-light text-amber-200 drop-shadow-[0_0_8px_rgba(248,159,79,0.3)]">
              {doseMgPreview !== null ? `${doseMgPreview.toFixed(1)} mg` : "--"}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="protocol-notes" className="text-white/60 text-xs uppercase tracking-widest pl-1">Notes</Label>
            <Textarea
              id="protocol-notes"
              placeholder="Ester type, carrier oil, etc."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-500/50 rounded-xl resize-none"
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
              className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-medium border-none rounded-xl"
            >
              {isSaving ? "Saving..." : mode === "edit" ? "Update Cycle" : "Create Cycle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
