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
import type { Injection } from "@/hooks/useInjections";
import type { Protocol } from "@/hooks/useProtocols";
import { logInjection, updateInjection } from "@/lib/firestore";

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

type InjectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uid?: string;
  protocol: Protocol | null;
  protocolName?: string;
  initialDate?: Date;
  initialInjection?: Injection | null;
};

export function InjectionDialog({
  open,
  onOpenChange,
  uid,
  protocol,
  protocolName,
  initialDate,
  initialInjection,
}: InjectionDialogProps) {
  const [dateValue, setDateValue] = useState("");
  const [doseMl, setDoseMl] = useState("");
  const [concentration, setConcentration] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = Boolean(initialInjection);
  const displayProtocolName =
    protocolName ?? protocol?.name ?? "Active protocol";

  useEffect(() => {
    if (!open) return;

    const baseDate = initialInjection?.date ?? initialDate ?? new Date();
    setDateValue(toInputDate(baseDate));
    setDoseMl(
      initialInjection
        ? initialInjection.doseMl.toString()
        : (protocol?.doseMl.toString() ?? ""),
    );
    setConcentration(
      initialInjection
        ? initialInjection.concentrationMgPerMl.toString()
        : (protocol?.concentrationMgPerMl.toString() ?? ""),
    );
    setNotes(initialInjection?.notes ?? "");
  }, [open, initialInjection, initialDate, protocol]);

  const doseMlNumber = Number(doseMl);
  const concentrationNumber = Number(concentration);
  const doseMg = useMemo(() => {
    if (!doseMl.trim() || !concentration.trim()) return null;
    if (
      !Number.isFinite(doseMlNumber) ||
      !Number.isFinite(concentrationNumber)
    ) {
      return null;
    }
    return doseMlNumber * concentrationNumber;
  }, [doseMl, concentration, doseMlNumber, concentrationNumber]);

  const canSubmit =
    Boolean(uid) &&
    Boolean(dateValue) &&
    Number.isFinite(doseMlNumber) &&
    doseMlNumber > 0 &&
    Number.isFinite(concentrationNumber) &&
    concentrationNumber > 0 &&
    (isEditMode || Boolean(protocol));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!uid) {
      toast.error("Please sign in to log injections.");
      return;
    }

    const parsedDate = fromInputDate(dateValue);
    if (!parsedDate) {
      toast.error("Enter a valid date.");
      return;
    }

    if (!Number.isFinite(doseMlNumber) || doseMlNumber <= 0) {
      toast.error("Enter a valid dose in mL.");
      return;
    }

    if (!Number.isFinite(concentrationNumber) || concentrationNumber <= 0) {
      toast.error("Enter a valid concentration.");
      return;
    }

    try {
      setIsSaving(true);
      if (isEditMode && initialInjection) {
        await updateInjection({
          uid,
          injectionId: initialInjection.id,
          date: parsedDate,
          doseMl: doseMlNumber,
          concentrationMgPerMl: concentrationNumber,
          notes: notes.trim() || "",
        });
        toast.success("Injection updated.");
      } else if (protocol) {
        await logInjection({
          uid,
          protocolId: protocol.id,
          date: parsedDate,
          doseMl: doseMlNumber,
          concentrationMgPerMl: concentrationNumber,
          notes: notes.trim() || "",
        });
        toast.success("Injection logged.");
      }

      onOpenChange(false);
    } catch {
      toast.error("Could not save the injection. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-white/10 sm:max-w-xl p-0 overflow-hidden gap-0">
        <div className="bg-gradient-to-r from-amber-500/15 to-sky-500/10 p-6 border-b border-white/5">
          <DialogHeader>
            <DialogTitle className="text-xl font-light tracking-wide text-white font-display">
              {isEditMode ? "Edit Log" : "Log Injection"}
            </DialogTitle>
            <DialogDescription className="text-white/40">
              {isEditMode
                ? "Update the historical record."
                : `Recording dose for ${displayProtocolName}.`}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label
              htmlFor="injection-date"
              className="text-white/60 text-xs uppercase tracking-widest pl-1"
            >
              Date
            </Label>
            <Input
              id="injection-date"
              type="date"
              value={dateValue}
              onChange={(event) => setDateValue(event.target.value)}
              className="bg-white/5 border-white/10 text-white/80 focus-visible:ring-amber-500/50 rounded-xl invert-calendar-icon"
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="dose-ml"
                className="text-white/60 text-xs uppercase tracking-widest pl-1"
              >
                Volume (mL)
              </Label>
              <div className="relative">
                <Input
                  id="dose-ml"
                  type="number"
                  min="0"
                  step="0.01"
                  value={doseMl}
                  onChange={(event) => setDoseMl(event.target.value)}
                  placeholder="0.35"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-500/50 rounded-xl pr-10"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-white/30">
                  mL
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="concentration"
                className="text-white/60 text-xs uppercase tracking-widest pl-1"
              >
                Concentration
              </Label>
              <div className="relative">
                <Input
                  id="concentration"
                  type="number"
                  min="0"
                  step="1"
                  value={concentration}
                  onChange={(event) => setConcentration(event.target.value)}
                  placeholder="200"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-500/50 rounded-xl pr-14"
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
              Total Dosage
            </span>
            <span className="text-lg font-light text-sky-200 drop-shadow-[0_0_8px_rgba(94,198,255,0.35)]">
              {doseMg !== null ? `${doseMg.toFixed(1)} mg` : "--"}
            </span>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="text-white/60 text-xs uppercase tracking-widest pl-1"
            >
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Post-injection site, feeling, etc."
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
              className="bg-[#2DD4BF] text-black hover:bg-[#14B8A6] font-semibold border-none rounded-xl shadow-[0_4px_15px_rgba(45,212,191,0.4)]"
            >
              {isSaving
                ? "Saving..."
                : isEditMode
                  ? "Update Log"
                  : "Log Injection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
