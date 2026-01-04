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
        : protocol?.doseMl.toString() ?? ""
    );
    setConcentration(
      initialInjection
        ? initialInjection.concentrationMgPerMl.toString()
        : protocol?.concentrationMgPerMl.toString() ?? ""
    );
    setNotes(initialInjection?.notes ?? "");
  }, [open, initialInjection, initialDate, protocol]);

  const doseMlNumber = Number(doseMl);
  const concentrationNumber = Number(concentration);
  const doseMg = useMemo(() => {
    if (!doseMl.trim() || !concentration.trim()) return null;
    if (!Number.isFinite(doseMlNumber) || !Number.isFinite(concentrationNumber)) {
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
    } catch (error) {
      toast.error("Could not save the injection. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit injection" : "Log injection"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the logged injection details."
              : `Logging for ${displayProtocolName}.`}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="injection-date">Date</Label>
            <Input
              id="injection-date"
              type="date"
              value={dateValue}
              onChange={(event) => setDateValue(event.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="dose-ml">Dose (mL)</Label>
              <Input
                id="dose-ml"
                type="number"
                min="0"
                step="0.01"
                value={doseMl}
                onChange={(event) => setDoseMl(event.target.value)}
                placeholder="0.35"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="concentration">Concentration (mg/mL)</Label>
              <Input
                id="concentration"
                type="number"
                min="0"
                step="1"
                value={concentration}
                onChange={(event) => setConcentration(event.target.value)}
                placeholder="200"
                required
              />
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            Dose total: {doseMg !== null ? `${doseMg.toFixed(1)} mg` : "--"}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes about the injection."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSaving}>
              {isSaving ? "Saving..." : isEditMode ? "Update" : "Log injection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
