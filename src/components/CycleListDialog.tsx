import { CheckCircle2, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DrawerClose,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Protocol } from "@/hooks/useProtocols";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getProtocolTheme } from "@/lib/protocolThemes";
import { X } from "lucide-react";

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
  const isMobile = useMediaQuery("(max-width: 768px)");
  const Title = isMobile ? DrawerTitle : DialogTitle;
  const Description = isMobile ? DrawerDescription : DialogDescription;
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="glass-panel border-white/10 sm:max-w-3xl p-0 overflow-hidden gap-0"
    >
        <div className="bg-gradient-to-r from-orange-500/20 to-cyan-500/10 border-b border-white/5 p-6">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <Title className="text-2xl font-semibold tracking-wide text-white font-display">
                Cycle Library
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
            <Description className="text-sm text-white/70">
              Review, toggle, and manage every protocol layer.
            </Description>
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
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 p-6 text-center text-sm text-white/70">
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
                      <p className="text-xs md:text-sm text-white/70">
                            {formatDate(protocol.startDate)} →{" "}
                            {protocol.endDate ? formatDate(protocol.endDate) : "Open"}
                          </p>
                      <p className="text-xs md:text-sm text-white/70">
                            {formatNumber(
                              protocol.doseMl * protocol.concentrationMgPerMl
                            )}{" "}
                            mg · {protocol.doseMl} mL
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end max-w-full">
                        <span className={`rounded-full border px-2 py-1 text-xs md:text-sm uppercase tracking-widest ${theme.chip}`}>
                          E{protocol.intervalDays}D
                        </span>
                        {isActive && (
                          <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-xs md:text-sm uppercase tracking-widest text-white/70">
                            Active
                          </span>
                        )}
                        {!isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/15 text-white/70 hover:text-white text-xs md:text-sm"
                            onClick={() => onSetActive(protocol)}
                          >
                            <CheckCircle2 className="size-4 mr-2" />
                            Set active
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white/70 hover:text-white shrink-0"
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
                          className="text-white/70 hover:text-white shrink-0"
                          onClick={() => onEdit(protocol)}
                          aria-label="Edit cycle"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white/70 hover:text-white shrink-0"
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
    </ResponsiveDialog>
  );
}
