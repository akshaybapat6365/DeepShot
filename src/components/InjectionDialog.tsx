import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DrawerClose,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Injection } from "@/hooks/useInjections";
import type { Protocol } from "@/hooks/useProtocols";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { logInjection, updateInjection } from "@/lib/firestore";
import { triggerCelebration } from "@/lib/celebration";
import { Loader2, X } from "lucide-react";

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
  onOptimisticLog?: (entry: Omit<Injection, "id">) => string;
  onOptimisticResolve?: (id: string) => void;
};

export function InjectionDialog({
  open,
  onOpenChange,
  uid,
  protocol,
  protocolName,
  initialDate,
  initialInjection,
  onOptimisticLog,
  onOptimisticResolve,
}: InjectionDialogProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const Title = isMobile ? DrawerTitle : DialogTitle;
  const Description = isMobile ? DrawerDescription : DialogDescription;
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

    let optimisticId: string | null = null;
    if (!isEditMode && protocol && onOptimisticLog) {
      optimisticId = onOptimisticLog({
        protocolId: protocol.id,
        date: parsedDate,
        doseMl: doseMlNumber,
        concentrationMgPerMl: concentrationNumber,
        doseMg: doseMlNumber * concentrationNumber,
        notes: notes.trim() || "",
        createdAt: new Date(),
      });
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
        void triggerCelebration();
      }

      onOpenChange(false);
    } catch {
      toast.error("Could not save the injection. Try again.");
      if (optimisticId && onOptimisticResolve) {
        onOptimisticResolve(optimisticId);
      }
    } finally {
      setIsSaving(false);
      if (optimisticId && onOptimisticResolve) {
        setTimeout(() => onOptimisticResolve(optimisticId), 1200);
      }
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="glass-panel border-white/10 sm:max-w-md p-0 overflow-hidden gap-0"
    >
        <div className="bg-gradient-to-r from-amber-500/15 to-sky-500/10 p-5 border-b border-white/5">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <Title className="text-xl font-light tracking-wide text-white font-display">
                {isEditMode ? "Edit Log" : "Log Injection"}
              </Title>
              {isMobile && (
                <DrawerClose asChild>
                  <button
                    type="button"
                    className="rounded-full border border-white/10 p-2 text-white/70 hover:text-white"
                    aria-label="Close"
                  >
                    <X className="size-4" />
                  </button>
                </DrawerClose>
              )}
            </div>
            <Description className="text-white/70">
              {isEditMode
                ? "Update the historical record."
                : `Recording dose for ${displayProtocolName}.`}
            </Description>
          </DialogHeader>
        </div>

        <form className="p-5 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="injection-date" className="text-white/60 text-xs md:text-sm uppercase tracking-widest pl-1">Date</Label>
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
              <Label htmlFor="dose-ml" className="text-white/60 text-xs md:text-sm uppercase tracking-widest pl-1">Volume (mL)</Label>
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
                <span className="absolute right-3 top-2.5 text-xs md:text-sm text-white/30">mL</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="concentration" className="text-white/60 text-xs md:text-sm uppercase tracking-widest pl-1">Concentration</Label>
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
                <span className="absolute right-3 top-2.5 text-xs md:text-sm text-white/30">mg/mL</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-white/70 uppercase tracking-widest">Total Dosage</span>
            <span className="text-lg font-light text-sky-200 drop-shadow-[0_0_8px_rgba(94,198,255,0.35)]">
              {doseMg !== null ? `${doseMg.toFixed(1)} mg` : "--"}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white/60 text-xs md:text-sm uppercase tracking-widest pl-1">Notes</Label>
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
              className="text-white/70 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isSaving}
              className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-medium border-none rounded-xl"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : isEditMode ? (
                "Update Log"
              ) : (
                "Log Injection"
              )}
            </Button>
          </DialogFooter>
        </form>
    </ResponsiveDialog>
  );
}
