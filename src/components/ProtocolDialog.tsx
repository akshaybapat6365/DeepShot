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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Start a new protocol</DialogTitle>
          <DialogDescription>
            Creating a new protocol preserves your history and updates the active schedule.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="protocol-name">Protocol name</Label>
            <Input
              id="protocol-name"
              placeholder="E3D Cypionate"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="protocol-start">Start date</Label>
              <Input
                id="protocol-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="protocol-interval">Interval (days)</Label>
              <Input
                id="protocol-interval"
                type="number"
                min="1"
                step="1"
                placeholder="3"
                value={intervalDays}
                onChange={(event) => setIntervalDays(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="protocol-dose">Dose (mL)</Label>
              <Input
                id="protocol-dose"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.35"
                value={doseMl}
                onChange={(event) => setDoseMl(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="protocol-concentration">Concentration (mg/mL)</Label>
              <Input
                id="protocol-concentration"
                type="number"
                min="0"
                step="1"
                placeholder="200"
                value={concentration}
                onChange={(event) => setConcentration(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            Dose total: {doseMgPreview !== null ? `${doseMgPreview.toFixed(1)} mg` : "--"}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="protocol-notes">Notes</Label>
            <Textarea
              id="protocol-notes"
              placeholder="Optional notes about this protocol."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSaving}>
              {isSaving ? "Saving..." : "Save protocol"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
