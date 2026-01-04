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
import { createOrRestartProtocol } from "@/lib/firestore";

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

type ProtocolDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uid?: string;
  initialProtocol?: Protocol | null;
  defaultStartDate?: Date;
};

export function ProtocolDialog({
  open,
  onOpenChange,
  uid,
  initialProtocol,
  defaultStartDate,
}: ProtocolDialogProps) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [intervalDays, setIntervalDays] = useState("");
  const [doseMl, setDoseMl] = useState("");
  const [concentration, setConcentration] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const seedDate = defaultStartDate ?? new Date();
    setName(initialProtocol?.name ?? "New protocol");
    setStartDate(toInputDate(seedDate));
    setIntervalDays(initialProtocol?.intervalDays.toString() ?? "");
    setDoseMl(initialProtocol?.doseMl.toString() ?? "");
    setConcentration(initialProtocol?.concentrationMgPerMl.toString() ?? "");
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
      toast.error("Please sign in to create a protocol.");
      return;
    }

    const parsedDate = fromInputDate(startDate);
    if (!parsedDate) {
      toast.error("Enter a valid start date.");
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
      await createOrRestartProtocol(uid, {
        name: name.trim(),
        startDate: parsedDate,
        intervalDays: intervalNumber,
        doseMl: doseNumber,
        concentrationMgPerMl: concentrationNumber,
        notes: notes.trim() || "",
      });

      toast.success("Protocol saved.");
      onOpenChange(false);
    } catch (error) {
      toast.error("Could not save the protocol. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-white/10 sm:max-w-xl p-0 overflow-hidden gap-0">
        <div className="bg-gradient-to-r from-cyan-500/10 to-transparent p-6 border-b border-white/5">
          <DialogHeader>
            <DialogTitle className="text-xl font-light tracking-wide text-white">New Protocol</DialogTitle>
            <DialogDescription className="text-white/40">
              Configure your injection schedule logic.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="protocol-name" className="text-white/60 text-xs uppercase tracking-widest pl-1">Protocol Name</Label>
            <Input
              id="protocol-name"
              placeholder="e.g. TRT Blast & Cruise"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-cyan-500/50 h-10 rounded-xl"
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-white/60 text-xs uppercase tracking-widest pl-1">Interval Presets</Label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: "ED", sub: "Daily", days: 1 },
                { label: "EOD", sub: "Alt Day", days: 2 },
                { label: "E2D", sub: "2 Days", days: 2 },
                { label: "E3D", sub: "3 Days", days: 3 },
                { label: "E3.5D", sub: "3.5 Days", days: 3.5 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setIntervalDays(String(Math.ceil(preset.days)));
                    const presetName = `${preset.label} Protocol`;
                    if (name === "" || name === "New protocol" || name.includes("Protocol")) {
                      setName(presetName);
                    }
                  }}
                  className={`glass-pill flex flex-col items-center justify-center h-16 gap-1 border-white/5 hover:border-cyan-500/30 group transition-all ${intervalDays === String(Math.ceil(preset.days))
                      ? "bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                      : "bg-white/5"
                    }`}
                >
                  <span className={`text-sm font-medium transition-colors ${intervalDays === String(Math.ceil(preset.days)) ? "text-cyan-400" : "text-white/70 group-hover:text-white"}`}>
                    {preset.label}
                  </span>
                  <span className="text-[9px] text-white/30 uppercase tracking-tight">{preset.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="protocol-start" className="text-white/60 text-xs uppercase tracking-widest pl-1">Start Date</Label>
              <Input
                id="protocol-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="bg-white/5 border-white/10 text-white/80 focus-visible:ring-cyan-500/50 rounded-xl invert-calendar-icon"
                required
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
                onChange={(event) => setIntervalDays(event.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-cyan-500/50 rounded-xl"
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
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-cyan-500/50 rounded-xl pr-10"
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
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-cyan-500/50 rounded-xl pr-14"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-white/30">mg/mL</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 flex justify-between items-center">
            <span className="text-xs text-white/40 uppercase tracking-widest">Calculated Dose</span>
            <span className="text-lg font-light text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
              {doseMgPreview !== null ? `${doseMgPreview.toFixed(1)} mg` : "--"}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="protocol-notes" className="text-white/60 text-xs uppercase tracking-widest pl-1">Notes</Label>
            <Textarea
              id="protocol-notes"
              placeholder="Esther type, carrier oil, etc."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-cyan-500/50 rounded-xl resize-none"
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
              className="bg-cyan-500 text-black hover:bg-cyan-400 font-medium shadow-[0_0_20px_rgba(0,240,255,0.3)] border-none rounded-xl"
            >
              {isSaving ? "Saving..." : "Create Protocol"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
