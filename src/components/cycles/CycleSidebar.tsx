import {
  Calendar,
  ChevronRight,
  Clock,
  Pencil,
  Plus,
  Syringe,
  Trash2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Injection } from "@/hooks/useInjections";
import type { Protocol } from "@/hooks/useProtocols";
import { formatDate, formatNumber } from "@/lib/date";

type CycleSidebarProps = {
  activeProtocol: Protocol;
  activeLastLog: Injection | null;
  nextInjectionDate: Date | null;
  nextInjectionWithinRange: boolean;
  daysRemaining: number | null;
  mgPerInjection: number | null;
  mgPerWeek: number | null;
  orderedProtocols: Protocol[];
  visibleProtocols: Record<string, boolean>;
  focusActiveEnabled: boolean;
  showTrash: boolean;
  trashedProtocols: Protocol[];
  trashedInjections: Injection[];
  selectedDate: Date;
  selectedStatus: string;
  selectedDose: string;
  selectedKey: number;
  selectedScheduledProtocols: string[];
  selectedLogs: Injection[];
  isSelectedPast: boolean;
  protocolLookup: Map<string, Protocol>;
  hasLogs: boolean;
  onToggleFocus: () => void;
  onToggleTrash: () => void;
  onOpenNewCycle: () => void;
  onSetActive: (protocol: Protocol) => void;
  onToggleVisibility: (protocolId: string) => void;
  onEdit: (protocol: Protocol) => void;
  onTrash: (protocol: Protocol) => void;
  onRestoreProtocol: (protocol: Protocol) => void;
  onRestoreInjection: (injection: Injection) => void;
  onEditLog: (injection: Injection) => void;
  onTrashLog: (injection: Injection) => void;
};

export function CycleSidebar({
  activeProtocol,
  activeLastLog,
  nextInjectionDate,
  nextInjectionWithinRange,
  daysRemaining,
  mgPerInjection,
  mgPerWeek,
  orderedProtocols,
  selectedDate,
  selectedStatus,
  selectedDose,
  selectedScheduledProtocols,
  selectedLogs,
  protocolLookup,
  hasLogs,
  onOpenNewCycle,
  onSetActive,
  onEditLog,
  onTrashLog,
}: CycleSidebarProps) {
  const inactiveProtocols = orderedProtocols.filter((protocol) => !protocol.isActive);

  return (
    <section className="flex flex-col gap-3">
      {/* Active Protocol Card */}
      <div className="glass-card p-4 bg-gradient-to-br from-primary/10 via-white/[0.02] to-transparent border-primary/20">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground">Active</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate font-display">{activeProtocol.name}</p>
              {!hasLogs && (
                <span className="text-xs md:text-sm uppercase tracking-wider bg-white/10 text-muted-foreground px-2 py-0.5 rounded-full">
                  Schedule-only
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Every {activeProtocol.intervalDays} days</p>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs md:text-sm" onClick={onOpenNewCycle}>
            <Plus className="size-3 mr-1" />
            New
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
          <MetricBox
            icon={<Syringe className="size-3" />}
            label="Per dose"
            value={mgPerInjection ? `${formatNumber(mgPerInjection)} mg` : "--"}
          />
          <MetricBox
            icon={<Calendar className="size-3" />}
            label="Weekly"
            value={mgPerWeek ? `${formatNumber(mgPerWeek)} mg` : "--"}
          />
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Last</p>
            <p className="font-medium">
              {activeLastLog ? formatDate(activeLastLog.date) : "None"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Next</p>
            <p className="font-medium">
              {nextInjectionDate && nextInjectionWithinRange ? (
                <>
                  {formatDate(nextInjectionDate)}
                  {daysRemaining !== null && (
                    <span className="text-muted-foreground ml-1">({daysRemaining}d)</span>
                  )}
                </>
              ) : (
                "--"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Cycles List */}
      <div className="glass-card p-4">
        <p className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground mb-2">Other Cycles</p>
        <div className="space-y-2">
          {inactiveProtocols.length === 0 && (
            <p className="text-sm text-muted-foreground">No inactive cycles</p>
          )}
          {inactiveProtocols.slice(0, 5).map((protocol, index) => (
            <button
              key={protocol.id}
              type="button"
              onClick={() => onSetActive(protocol)}
              className="w-full flex items-center justify-between gap-2 px-2.5 py-2.5 rounded-lg text-xs md:text-sm transition-all border border-white/5 bg-white/[0.02] hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="size-5 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-sm flex items-center justify-center text-muted-foreground">
                  {index + 1}
                </span>
                <span className="truncate font-medium">{protocol.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">E{protocol.intervalDays}D</span>
                <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-medium text-muted-foreground">
                  INACTIVE
                </span>
                <ChevronRight className="size-3 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground">Selected</p>
            <p className="text-base font-semibold font-display">{formatDate(selectedDate)}</p>
          </div>
          {selectedStatus && (
            <div
              className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs md:text-sm font-semibold
                ${selectedStatus === "Logged" ? "bg-accent/20 text-accent" : ""}
                ${selectedStatus === "Scheduled" ? "bg-primary/20 text-primary" : ""}
                ${selectedStatus === "Missed" ? "bg-destructive/20 text-destructive" : ""}
                ${!selectedStatus || selectedStatus === "No injection" ? "bg-white/5 text-muted-foreground" : ""}
              `}
            >
              {selectedStatus === "Logged" && <Syringe className="size-3" />}
              {selectedStatus === "Scheduled" && <Clock className="size-3" />}
              {selectedStatus === "Missed" && <AlertCircle className="size-3" />}
              {selectedStatus}
            </div>
          )}
        </div>

        {/* Dose Summary */}
        {selectedDose && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.04] border border-white/5 mb-3">
            <span className="text-sm text-muted-foreground">Total Dose</span>
            <span className="text-lg font-bold font-display text-foreground">{selectedDose}</span>
          </div>
        )}

        {/* Scheduled Protocols (when no logs) */}
        {selectedScheduledProtocols.length > 0 && selectedLogs.length === 0 && (
          <div className="space-y-2 py-3 border-t border-white/5">
            <p className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground mb-2">
              Scheduled Protocols
            </p>
            {selectedScheduledProtocols.map((id) => {
              const p = protocolLookup.get(id);
              return p ? (
                <div
                  key={id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/10"
                >
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                  <span className="text-sm font-semibold font-display">
                    {formatNumber(p.doseMl * p.concentrationMgPerMl)} mg
                  </span>
                </div>
              ) : null;
            })}
          </div>
        )}

        {/* Logged Injections */}
        {selectedLogs.length > 0 && (
          <div className="space-y-2 py-3 border-t border-white/5">
            <p className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground mb-2">
              Logged Injections
            </p>
            {selectedLogs.map((log) => {
              const protocol = protocolLookup.get(log.protocolId);
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-accent/5 border border-accent/10"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-accent" />
                      <span className="text-sm font-semibold font-display">
                        {formatNumber(log.doseMg)} mg
                      </span>
                      <span className="text-xs md:text-sm text-muted-foreground">
                        ({log.doseMl} mL)
                      </span>
                    </div>
                    {protocol && (
                      <p className="text-xs md:text-sm text-muted-foreground mt-0.5 ml-4">
                        {protocol.name}
                      </p>
                    )}
                    {log.notes && (
                      <p className="text-xs md:text-sm text-muted-foreground mt-1 ml-4 italic">
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 hover:bg-white/10"
                      onClick={() => onEditLog(log)}
                      aria-label="Edit injection"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:bg-destructive/10"
                      onClick={() => onTrashLog(log)}
                      aria-label="Delete injection"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {selectedLogs.length === 0 && selectedScheduledProtocols.length === 0 && (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No injections scheduled or logged for this day.
          </div>
        )}
      </div>
    </section>
  );
}

function MetricBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.04] border border-white/5">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
        <p className="text-sm md:text-base font-medium font-display">{value}</p>
      </div>
    </div>
  );
}
