import { CheckCircle2, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Protocol } from "@/hooks/useProtocols";
import { getProtocolTheme } from "@/lib/protocolThemes";

type CycleListDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  protocols: Protocol[];
  activeProtocolId?: string | null;
  visibleProtocols: Record<string, boolean>;
  onToggleVisibility: (protocolId: string) => void;
  onEdit: (protocol: Protocol) => void;
  onTrash: (protocol: Protocol) => void;
  onSetActive: (protocol: Protocol) => void;
  onCreate: () => void;
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatNumber = (value: number) =>
  Number.isFinite(value)
    ? Number.isInteger(value)
      ? value.toString()
      : value.toFixed(1)
    : "--";

export function CycleListDialog({
  open,
  onOpenChange,
  protocols,
  activeProtocolId,
  visibleProtocols,
  onToggleVisibility,
  onEdit,
  onTrash,
  onSetActive,
  onCreate,
}: CycleListDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-white/10 sm:max-w-3xl p-0 overflow-hidden gap-0">
        <div className="bg-gradient-to-r from-orange-500/20 to-cyan-500/10 border-b border-white/5 p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-wide text-white font-display">
              Cycle Library
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Review, toggle, and manage every protocol layer.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button
              className="gap-2 bg-[#F97316] hover:bg-[#FB923C] text-slate-950"
              onClick={onCreate}
            >
              <Plus className="size-4" />
              New cycle
            </Button>
          </div>
        </div>

        <ScrollArea className="max-h-[65vh]">
          <div className="space-y-3 p-6">
            {protocols.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 p-6 text-center text-sm text-white/50">
                No cycles yet. Create one to start tracking.
              </div>
            ) : (
              protocols.map((protocol) => {
                const theme = getProtocolTheme(protocol.themeKey);
                const isActive = protocol.id === activeProtocolId;
                const isVisible = visibleProtocols[protocol.id];
                const isDimmed = !!activeProtocolId && !isActive;
                return (
                  <div
                    key={protocol.id}
                    className={`rounded-2xl border px-4 py-3 transition ${
                      isActive
                        ? `border-white/30 bg-gradient-to-br from-white/15 to-black/40 ${theme.glow}`
                        : "border-white/5 bg-black/30"
                    } ${
                      isDimmed ? "opacity-35 hover:opacity-70" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`size-3 rounded-full ${theme.accent} ${
                            isVisible ? "" : "opacity-30"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-semibold text-white font-display tracking-[0.08em] uppercase">
                            {protocol.name}
                          </p>
                          <p className="text-xs text-white/40">
                            {formatDate(protocol.startDate)} →{" "}
                            {protocol.endDate ? formatDate(protocol.endDate) : "Open"}
                          </p>
                          <p className="text-xs text-white/40">
                            {formatNumber(
                              protocol.doseMl * protocol.concentrationMgPerMl
                            )}{" "}
                            mg · {protocol.doseMl} mL
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end max-w-full">
                        <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-widest ${theme.chip}`}>
                          E{protocol.intervalDays}D
                        </span>
                        {isActive && (
                          <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] uppercase tracking-widest text-white/70">
                            Active
                          </span>
                        )}
                        {!isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/15 text-white/70 hover:text-white"
                            onClick={() => onSetActive(protocol)}
                          >
                            <CheckCircle2 className="size-4 mr-2" />
                            Set active
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white/50 hover:text-white shrink-0"
                          onClick={() => onToggleVisibility(protocol.id)}
                          aria-label={isVisible ? "Hide cycle" : "Show cycle"}
                        >
                          {isVisible ? (
                            <Eye className="size-4" />
                          ) : (
                            <EyeOff className="size-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white/50 hover:text-white shrink-0"
                          onClick={() => onEdit(protocol)}
                          aria-label="Edit cycle"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white/50 hover:text-white shrink-0"
                          onClick={() => onTrash(protocol)}
                          aria-label="Trash cycle"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
