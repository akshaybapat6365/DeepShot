import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  Layers,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Repeat,
  Trash2,
  Undo2,
} from "lucide-react";
import { toJpeg } from "html-to-image";
import { toast } from "sonner";

import { CycleListDialog } from "@/components/CycleListDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InjectionDialog } from "@/components/InjectionDialog";
import { ProtocolDialog } from "@/components/ProtocolDialog";
import { useAuth } from "@/hooks/useAuth";
import { type Injection, useInjections } from "@/hooks/useInjections";
import { type Protocol, useProtocols } from "@/hooks/useProtocols";
import { login, logout } from "@/lib/auth";
import {
  ensureUserDocument,
  restoreInjection,
  restoreProtocol,
  setActiveProtocol,
  trashInjection,
  trashProtocol,
} from "@/lib/firestore";
import { getProtocolTheme } from "@/lib/protocolThemes";

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const dateKey = (date: Date) => startOfDay(date).getTime();

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatMonth = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const formatExportDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatNumber = (value: number) =>
  Number.isFinite(value)
    ? Number.isInteger(value)
      ? value.toString()
      : value.toFixed(1)
    : "--";

const alignToRangeStart = (start: Date, interval: number, rangeStart: Date) => {
  if (rangeStart <= start) return start;
  const diffDays = Math.floor(
    (startOfDay(rangeStart).getTime() - start.getTime()) / DAY_MS
  );
  const remainder = diffDays % interval;
  const offset = remainder === 0 ? 0 : interval - remainder;
  return addDays(start, diffDays + offset);
};

const generateScheduleInRange = (
  startDate: Date,
  intervalDays: number,
  rangeStart: Date,
  rangeEnd: Date,
  endLimit?: Date | null
) => {
  if (intervalDays <= 0) return [];

  const safeStart = startOfDay(startDate);
  const safeRangeStart = startOfDay(rangeStart);
  const safeRangeEnd = startOfDay(rangeEnd);
  const safeEnd = endLimit ? startOfDay(endLimit) : safeRangeEnd;

  if (safeEnd < safeRangeStart) return [];

  let current = alignToRangeStart(safeStart, intervalDays, safeRangeStart);
  if (current < safeStart) current = safeStart;

  const dates: Date[] = [];
  while (current <= safeRangeEnd && current <= safeEnd) {
    dates.push(current);
    current = addDays(current, intervalDays);
  }

  return dates;
};

const buildMonthGrid = (baseDate: Date) => {
  const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const startWeekday = firstDay.getDay();
  const gridStart = addDays(firstDay, -startWeekday);

  const grid = Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return {
      date,
      isCurrentMonth: date.getMonth() === baseDate.getMonth(),
    };
  });

  return {
    grid,
    rangeStart: grid[0].date,
    rangeEnd: grid[grid.length - 1].date,
  };
};

const formatAuthError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return "Sign in failed. Please try again.";
  }
  const code =
    "code" in error && typeof (error as { code?: string }).code === "string"
      ? (error as { code?: string }).code ?? ""
      : "";
  if (code === "auth/unauthorized-domain") {
    return "Auth blocked for this host. Use https://deepshot.web.app or add this IP to Firebase Auth authorized domains.";
  }
  if (code === "auth/popup-blocked") {
    return "Popup blocked. Retrying with redirect.";
  }
  if (code) {
    return `Sign in failed (${code}).`;
  }
  return "Sign in failed. Please try again.";
};

function App() {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { protocols, loading: protocolsLoading } = useProtocols(user?.uid);
  const { injections, loading: injectionsLoading } = useInjections(user?.uid);

  const today = startOfDay(new Date());
  const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);
  const [protocolDialogMode, setProtocolDialogMode] = useState<
    "create" | "edit"
  >("create");
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);
  const [editingInjection, setEditingInjection] = useState<Injection | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [focusActive, setFocusActive] = useState(true);
  const [cycleListOpen, setCycleListOpen] = useState(false);
  const [hiddenProtocols, setHiddenProtocols] = useState<Record<string, boolean>>(
    {}
  );
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    ensureUserDocument(user).catch(() => {
      toast.error("Could not initialize your profile.");
    });
  }, [user]);

  useEffect(() => {
    if (!authError) return;
    toast.error(formatAuthError(authError));
  }, [authError]);

  const protocolsClean = useMemo(
    () => protocols.filter((protocol) => !protocol.isTrashed),
    [protocols]
  );
  const trashedProtocols = useMemo(
    () => protocols.filter((protocol) => protocol.isTrashed),
    [protocols]
  );

  const injectionsClean = useMemo(
    () => injections.filter((injection) => !injection.isTrashed),
    [injections]
  );
  const trashedInjections = useMemo(
    () => injections.filter((injection) => injection.isTrashed),
    [injections]
  );

  const visibleProtocols = useMemo(() => {
    const map: Record<string, boolean> = {};
    protocolsClean.forEach((protocol) => {
      map[protocol.id] = !hiddenProtocols[protocol.id];
    });
    return map;
  }, [protocolsClean, hiddenProtocols]);

  const orderedProtocols = useMemo(() => {
    const active = protocolsClean.filter((protocol) => protocol.isActive);
    const rest = protocolsClean
      .filter((protocol) => !protocol.isActive)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    return [...active, ...rest];
  }, [protocolsClean]);

  const protocolLookup = useMemo(() => {
    const map = new Map<string, Protocol>();
    protocolsClean.forEach((protocol) => {
      map.set(protocol.id, protocol);
    });
    return map;
  }, [protocolsClean]);

  const activeProtocol = useMemo(
    () => orderedProtocols.find((protocol) => protocol.isActive) ?? null,
    [orderedProtocols]
  );
  const activeTheme = useMemo(
    () => getProtocolTheme(activeProtocol?.themeKey),
    [activeProtocol]
  );
  const focusActiveEnabled = focusActive && !!activeProtocol;

  const toggleProtocolVisibility = (protocolId: string) => {
    setHiddenProtocols((prev) => {
      const next = { ...prev };
      if (next[protocolId]) {
        delete next[protocolId];
      } else {
        next[protocolId] = true;
      }
      return next;
    });
  };

  const monthRange = useMemo(() => {
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    return {
      start: startOfDay(start),
      end: startOfDay(end),
    };
  }, [viewDate]);

  const protocolDoseMap = useMemo(() => {
    const map = new Map<string, number>();
    protocolsClean.forEach((protocol) => {
      map.set(
        protocol.id,
        protocol.doseMl * protocol.concentrationMgPerMl
      );
    });
    return map;
  }, [protocolsClean]);

  const lastLogByProtocol = useMemo(() => {
    const map = new Map<string, Injection>();
    injectionsClean.forEach((log) => {
      if (!protocolLookup.has(log.protocolId)) return;
      const existing = map.get(log.protocolId);
      if (!existing || log.date > existing.date) {
        map.set(log.protocolId, log);
      }
    });
    return map;
  }, [injectionsClean, protocolLookup]);

  const activeLastLog = activeProtocol
    ? lastLogByProtocol.get(activeProtocol.id)
    : null;

  const nextInjectionDate = activeProtocol
    ? activeLastLog
      ? addDays(startOfDay(activeLastLog.date), activeProtocol.intervalDays)
      : startOfDay(activeProtocol.startDate)
    : null;

  const nextInjectionWithinRange =
    activeProtocol && activeProtocol.endDate && nextInjectionDate
      ? nextInjectionDate <= activeProtocol.endDate
      : true;

  const daysRemaining = nextInjectionDate
    ? Math.max(
        0,
        Math.ceil(
          (startOfDay(nextInjectionDate).getTime() -
            startOfDay(new Date()).getTime()) /
            DAY_MS
        )
      )
    : null;

  const mgPerInjection = activeProtocol
    ? activeProtocol.doseMl * activeProtocol.concentrationMgPerMl
    : null;
  const mgPerWeek = activeProtocol
    ? activeProtocol.doseMl *
      activeProtocol.concentrationMgPerMl *
      (7 / activeProtocol.intervalDays)
    : null;

  const { grid: monthGrid, rangeStart, rangeEnd } = useMemo(
    () => buildMonthGrid(viewDate),
    [viewDate]
  );

  const scheduleByDate = useMemo(() => {
    const map = new Map<number, string[]>();

    orderedProtocols.forEach((protocol) => {
      if (!visibleProtocols[protocol.id]) return;

      const scheduleDates = generateScheduleInRange(
        protocol.startDate,
        protocol.intervalDays,
        rangeStart,
        rangeEnd,
        protocol.endDate ?? null
      );

      scheduleDates.forEach((date) => {
        const key = dateKey(date);
        const existing = map.get(key) ?? [];
        existing.push(protocol.id);
        map.set(key, existing);
      });
    });

    return map;
  }, [orderedProtocols, rangeStart, rangeEnd, visibleProtocols]);

  const loggedSummary = useMemo(() => {
    const map = new Map<number, { count: number; totalMg: number }>();
    injectionsClean.forEach((log) => {
      if (!protocolLookup.has(log.protocolId)) return;
      if (!visibleProtocols[log.protocolId]) return;
      const key = dateKey(log.date);
      const entry = map.get(key) ?? { count: 0, totalMg: 0 };
      const doseMg = Number.isFinite(log.doseMg)
        ? log.doseMg
        : log.doseMl * log.concentrationMgPerMl;
      entry.count += 1;
      entry.totalMg += doseMg;
      map.set(key, entry);
    });
    return map;
  }, [injectionsClean, protocolLookup, visibleProtocols]);

  const monthStats = useMemo(() => {
    let scheduledDays = 0;
    scheduleByDate.forEach((protocolIds, key) => {
      if (protocolIds.length === 0) return;
      const date = new Date(Number(key));
      if (date >= monthRange.start && date <= monthRange.end) {
        scheduledDays += 1;
      }
    });

    let loggedDays = 0;
    loggedSummary.forEach((_summary, key) => {
      const date = new Date(Number(key));
      if (date >= monthRange.start && date <= monthRange.end) {
        loggedDays += 1;
      }
    });

    return { scheduledDays, loggedDays };
  }, [loggedSummary, monthRange, scheduleByDate]);

  const logsByDate = useMemo(() => {
    const map = new Map<number, Injection[]>();
    injectionsClean.forEach((log) => {
      if (!protocolLookup.has(log.protocolId)) return;
      if (!visibleProtocols[log.protocolId]) return;
      const key = dateKey(log.date);
      const existing = map.get(key) ?? [];
      existing.push(log);
      map.set(key, existing);
    });
    return map;
  }, [injectionsClean, protocolLookup, visibleProtocols]);

  const selectedKey = dateKey(selectedDate);
  const selectedLogs = logsByDate.get(selectedKey) ?? [];
  const selectedSummary = loggedSummary.get(selectedKey);

  const selectedLayerProtocols = scheduleByDate.get(selectedKey) ?? [];
  const selectedScheduledProtocols = selectedLayerProtocols.filter(
    (protocolId) => !selectedLogs.some((log) => log.protocolId === protocolId)
  );
  const isSelectedPast = selectedDate < today;
  const selectedStatus = selectedSummary
    ? selectedSummary.count > 1
      ? `${selectedSummary.count} logs`
      : "Logged"
    : selectedLayerProtocols.length > 0
      ? isSelectedPast
        ? "Past"
        : "Scheduled"
      : "No injection";

  const selectedDose = selectedSummary
    ? `${formatNumber(selectedSummary.totalMg)} mg`
    : selectedLayerProtocols.length > 0
      ? `${formatNumber(
          protocolDoseMap.get(selectedLayerProtocols[0]) ?? 0
        )} mg`
      : "--";

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      toast.error(formatAuthError(error));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast.error("Sign out failed. Please try again.");
    }
  };

  const handleOpenLogDialog = (injection?: Injection) => {
    setEditingInjection(injection ?? null);
    setLogDialogOpen(true);
  };

  const handleLogDialogChange = (open: boolean) => {
    setLogDialogOpen(open);
    if (!open) {
      setEditingInjection(null);
    }
  };

  const handleOpenNewCycle = () => {
    setEditingProtocol(null);
    setProtocolDialogMode("create");
    setProtocolDialogOpen(true);
  };

  const handleEditCycle = (protocol: Protocol) => {
    setEditingProtocol(protocol);
    setProtocolDialogMode("edit");
    setProtocolDialogOpen(true);
  };

  const handleOpenCycleList = () => {
    setCycleListOpen(true);
  };

  const handleCreateFromCycleList = () => {
    setCycleListOpen(false);
    handleOpenNewCycle();
  };

  const handleEditFromCycleList = (protocol: Protocol) => {
    setCycleListOpen(false);
    handleEditCycle(protocol);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(startOfDay(date));
    if (
      date.getMonth() !== viewDate.getMonth() ||
      date.getFullYear() !== viewDate.getFullYear()
    ) {
      setViewDate(startOfDay(new Date(date.getFullYear(), date.getMonth(), 1)));
    }
  };

  const shiftMonth = (offset: number) => {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(startOfDay(next));
    setSelectedDate(startOfDay(next));
  };

  const jumpToToday = () => {
    const today = startOfDay(new Date());
    setViewDate(today);
    setSelectedDate(today);
  };

  const handleExportCalendar = async () => {
    if (!calendarRef.current) {
      toast.error("Calendar export is not available yet.");
      return;
    }

    try {
      const dataUrl = await toJpeg(calendarRef.current, {
        quality: 0.95,
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "#0b0f14",
        filter: (node) => {
          if (!(node instanceof HTMLElement)) return true;
          return node.dataset.exportIgnore !== "true";
        },
      });

      const link = document.createElement("a");
      link.download = `deepshot-calendar-${formatExportDate(viewDate)}.jpg`;
      link.href = dataUrl;
      link.click();
      toast.success("Calendar exported.");
    } catch {
      toast.error("Export failed. Try again.");
    }
  };

  const handleTrashProtocol = async (protocol: Protocol) => {
    if (!user) return;
    try {
      await trashProtocol({ uid: user.uid, protocolId: protocol.id });
      toast.success("Cycle moved to trash.");
    } catch {
      toast.error("Could not move cycle to trash.");
    }
  };

  const handleSetActiveCycle = async (protocol: Protocol) => {
    if (!user) return;
    try {
      await setActiveProtocol({ uid: user.uid, protocolId: protocol.id });
      toast.success(`"${protocol.name}" is now active.`);
    } catch {
      toast.error("Could not set active cycle.");
    }
  };

  const handleRestoreProtocol = async (protocol: Protocol) => {
    if (!user) return;
    try {
      await restoreProtocol({ uid: user.uid, protocolId: protocol.id });
      toast.success("Cycle restored.");
    } catch {
      toast.error("Could not restore cycle.");
    }
  };

  const handleTrashInjection = async (injection: Injection) => {
    if (!user) return;
    try {
      await trashInjection({ uid: user.uid, injectionId: injection.id });
      toast.success("Injection moved to trash.");
    } catch {
      toast.error("Could not move injection to trash.");
    }
  };

  const handleRestoreInjection = async (injection: Injection) => {
    if (!user) return;
    try {
      await restoreInjection({ uid: user.uid, injectionId: injection.id });
      toast.success("Injection restored.");
    } catch {
      toast.error("Could not restore injection.");
    }
  };

  if (authLoading || protocolsLoading || injectionsLoading) {
    return (
      <div className="min-h-screen app-shell text-foreground">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
          <Card className="w-full max-w-md border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Loading your session</CardTitle>
              <CardDescription>Hang tight while we connect to Firebase.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-shell text-foreground flex flex-col">
      <header className="shrink-0 border-b border-white/10 bg-[#07090d]/95 backdrop-blur-md sticky top-0 z-20 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl border border-white/10 bg-black/60 grid place-items-center shadow-[0_18px_40px_rgba(255,120,40,0.35)]">
                <img
                  src="/deepshot-icon.svg"
                  alt="DeepShot"
                  className="size-9"
                />
              </div>
              <div className="leading-none">
                <p className="text-3xl font-semibold text-white tracking-[0.12em] font-display uppercase">
                  DeepShot
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.5em] text-white/35">
                  Cycle Control
                </p>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button
                  className="gap-2 bg-[#F97316] hover:bg-[#FB923C] text-slate-950"
                  onClick={() => handleOpenLogDialog()}
                  disabled={!activeProtocol}
                >
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">Log injection</span>
                </Button>
                <Button
                  variant="outline"
                  className="border-blue-400/40 text-blue-100 hover:border-blue-300/70 hover:text-white"
                  onClick={handleOpenCycleList}
                >
                  <Layers className="size-4 mr-2" />
                  <span className="hidden sm:inline">Cycles</span>
                </Button>
                <Button
                  variant="outline"
                  className="border-blue-400/30 text-blue-100 hover:border-blue-300/70 hover:text-white"
                  onClick={handleOpenNewCycle}
                >
                  <Repeat className="size-4 mr-2" />
                  New cycle
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/50 hover:text-white"
                  onClick={handleLogout}
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </Button>
              </>
            ) : (
              <Button className="gap-2 bg-[#F97316] hover:bg-[#FB923C] text-slate-950" onClick={handleLogin}>
                <LogIn className="size-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>

      </header>

      <main className="flex-1 min-h-0 flex flex-col overflow-auto">
        {!user ? (
          <div className="flex-1 flex items-center justify-center p-4">
              <Card className="max-w-md w-full bg-white/5 border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.6)]">
                <CardHeader className="text-center">
                <div className="size-20 rounded-2xl border border-white/10 bg-black/60 mx-auto grid place-items-center mb-4 shadow-[0_20px_50px_rgba(255,120,40,0.25)]">
                  <img src="/deepshot-icon.svg" alt="DeepShot" className="size-14" />
                </div>
                <CardTitle className="text-2xl text-white font-display">DeepShot</CardTitle>
                <CardDescription className="text-white/50">
                  Own your cycle. Precision dosing, layered schedules, and a calendar
                  built for clarity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2 bg-[#F97316] hover:bg-[#FB923C] text-slate-950" onClick={handleLogin}>
                  <LogIn className="size-4" />
                  Continue with Google
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : !activeProtocol ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white/5 border-white/10">
              <CardHeader className="text-center">
                <div className="size-16 rounded-2xl bg-white/5 mx-auto grid place-items-center mb-4 border border-white/10">
                  <Repeat className="size-8 text-orange-300" />
                </div>
                <CardTitle className="text-white">No Active Cycle</CardTitle>
                <CardDescription>Set your schedule to start tracking.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2 bg-[#F97316] hover:bg-[#FB923C] text-slate-950" onClick={handleOpenNewCycle}>
                  <Plus className="size-4" />
                  Create Cycle
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 min-h-0 grid gap-3 p-3 md:p-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
            <section className="order-2 lg:order-1 min-h-0 flex flex-col gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_24px_60px_rgba(0,0,0,0.55)] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                      Active cycle
                    </p>
                    <p className="text-2xl font-semibold text-white font-display tracking-[0.08em] uppercase">
                      {activeProtocol.name}
                    </p>
                    <p className="text-xs text-white/50 flex items-center gap-2">
                      <span className={`size-2 rounded-full ${activeTheme.accent}`} />
                      E{activeProtocol.intervalDays}D
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/15 text-white/70 hover:text-white"
                    onClick={handleOpenNewCycle}
                  >
                    <Repeat className="size-4 mr-2" />
                    New
                  </Button>
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                      Last shot
                    </p>
                    <p className="text-base font-semibold text-white">
                      {activeLastLog ? formatDate(activeLastLog.date) : "--"}
                    </p>
                    <p className="text-xs text-white/40">
                      {activeLastLog ? `${formatNumber(activeLastLog.doseMg)} mg` : "No logs yet"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                      Next shot
                    </p>
                    <p className="text-base font-semibold text-white">
                      {nextInjectionDate && nextInjectionWithinRange
                        ? formatDate(nextInjectionDate)
                        : "--"}
                    </p>
                    <p className="text-xs text-white/40">
                      {daysRemaining !== null && nextInjectionWithinRange
                        ? `${daysRemaining} days`
                        : "Set end date"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                      Per injection
                    </p>
                    <p className="text-base font-semibold text-white">
                      {mgPerInjection ? `${formatNumber(mgPerInjection)} mg` : "--"}
                    </p>
                    <p className="text-xs text-white/40">Dose × concentration</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                      Weekly avg
                    </p>
                    <p className="text-base font-semibold text-white">
                      {mgPerWeek ? `${formatNumber(mgPerWeek)} mg` : "--"}
                    </p>
                    <p className="text-xs text-white/40">Based on interval</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_24px_60px_rgba(0,0,0,0.55)] p-5 min-h-[240px]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">Cycles</p>
                  <p className="text-lg font-semibold text-white font-display tracking-[0.08em] uppercase">Layer control</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-white/15 text-white/70 hover:text-white ${focusActiveEnabled ? "bg-white/10 text-white" : ""}`}
                      onClick={() => setFocusActive((prev) => !prev)}
                      disabled={!activeProtocol}
                    >
                      {focusActiveEnabled ? (
                        <Eye className="size-4 mr-2" />
                      ) : (
                        <EyeOff className="size-4 mr-2" />
                      )}
                      {focusActiveEnabled ? "Focus active" : "Show all"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/15 text-white/70 hover:text-white"
                      onClick={() => setShowTrash((prev) => !prev)}
                    >
                      {showTrash ? "Hide trash" : "Show trash"}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {orderedProtocols.map((protocol) => {
                    const theme = getProtocolTheme(protocol.themeKey);
                    const isVisible = visibleProtocols[protocol.id];
                    const isActive = protocol.isActive;
                    const isDimmed = focusActiveEnabled && !isActive;
                    return (
                      <div
                        key={protocol.id}
                        className={`relative rounded-2xl border px-4 py-3 pl-6 transition ${
                          isActive
                            ? `border-white/30 bg-gradient-to-br from-white/15 to-black/40 ${theme.glow}`
                            : "border-white/5 bg-black/30"
                        } ${
                          isDimmed
                            ? "opacity-35 hover:opacity-70"
                            : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        <span
                          className={`absolute left-2 top-3 bottom-3 rounded-full ${theme.accent} ${
                            isVisible ? "" : "opacity-30"
                          } ${isActive ? "w-1.5" : "w-1"}`}
                        />
                        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                          <button
                            type="button"
                            onClick={() => toggleProtocolVisibility(protocol.id)}
                            className="flex min-w-0 items-center gap-3 text-left"
                          >
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
                          </button>
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
                                onClick={() => handleSetActiveCycle(protocol)}
                              >
                                <CheckCircle2 className="size-4 mr-2" />
                                Set active
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white/50 hover:text-white shrink-0"
                              onClick={() => toggleProtocolVisibility(protocol.id)}
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
                              onClick={() => handleEditCycle(protocol)}
                              aria-label="Edit cycle"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white/50 hover:text-white shrink-0"
                              onClick={() => handleTrashProtocol(protocol)}
                              aria-label="Trash cycle"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {showTrash && (trashedProtocols.length > 0 || trashedInjections.length > 0) && (
                  <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">Trash</p>
                    <div className="mt-3 space-y-3">
                      {trashedProtocols.map((protocol) => (
                        <div key={protocol.id} className="flex items-center justify-between text-sm">
                          <span className="text-white/70">{protocol.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/60 hover:text-white"
                            onClick={() => handleRestoreProtocol(protocol)}
                          >
                            <Undo2 className="size-4 mr-2" />
                            Restore
                          </Button>
                        </div>
                      ))}
                      {trashedInjections.slice(0, 4).map((injection) => (
                        <div key={injection.id} className="flex items-center justify-between text-sm">
                          <span className="text-white/70">
                            {formatDate(injection.date)} · {formatNumber(injection.doseMg)} mg
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/60 hover:text-white"
                            onClick={() => handleRestoreInjection(injection)}
                          >
                            <Undo2 className="size-4 mr-2" />
                            Restore
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.45)] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">Selected day</p>
                    <p className="text-xl font-semibold text-white font-display">
                      {formatDate(selectedDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Status</p>
                    <p className="text-sm font-semibold text-white">{selectedStatus}</p>
                    <p className="text-xs text-white/40">{selectedDose}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedScheduledProtocols.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                        Scheduled
                      </p>
                      {selectedScheduledProtocols.map((protocolId) => {
                        const protocol = protocolLookup.get(protocolId);
                        if (!protocol) return null;
                        const theme = getProtocolTheme(protocol.themeKey);
                        return (
                          <div
                            key={`${selectedKey}-${protocolId}`}
                            className="rounded-2xl border border-white/10 bg-black/30 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {protocol.name}
                                </p>
                                <p className="text-xs text-white/40">
                                  {formatNumber(
                                    protocol.doseMl * protocol.concentrationMgPerMl
                                  )}{" "}
                                  mg · {protocol.doseMl} mL
                                </p>
                              </div>
                              <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-widest ${theme.chip}`}>
                                {isSelectedPast ? "Past" : "Scheduled"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                      Logged
                    </p>
                    {selectedLogs.length === 0 ? (
                      <p className="text-sm text-white/40">No injections logged.</p>
                    ) : (
                      selectedLogs.map((log) => {
                        const protocol = protocolLookup.get(log.protocolId);
                        const theme = getProtocolTheme(protocol?.themeKey);
                        return (
                          <div
                            key={log.id}
                            className="rounded-2xl border border-white/10 bg-black/30 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {protocol?.name ?? "Cycle"}
                                </p>
                                <p className="text-xs text-white/40">
                                  {formatNumber(log.doseMg)} mg · {log.doseMl} mL
                                </p>
                              </div>
                              <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-widest ${theme.chip}`}>
                                Logged
                              </span>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/10 text-white/70 hover:text-white"
                                onClick={() => handleOpenLogDialog(log)}
                              >
                                <Pencil className="size-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/50 hover:text-white"
                                onClick={() => handleTrashInjection(log)}
                              >
                                <Trash2 className="size-4 mr-2" />
                                Trash
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="order-1 lg:order-2 min-h-0 flex flex-col rounded-[32px] border border-white/10 bg-[#0f131a]/80 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
              <div className="border-b border-white/10 px-4 py-3 md:px-6 bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/60 hover:text-white"
                      onClick={() => shiftMonth(-1)}
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="size-5" />
                    </Button>
                    <div className="text-3xl md:text-4xl font-semibold tracking-[0.08em] uppercase text-white font-display">
                      {formatMonth(viewDate)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/60 hover:text-white"
                      onClick={() => shiftMonth(1)}
                      aria-label="Next month"
                    >
                      <ChevronRight className="size-5" />
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/15 text-white/70 hover:text-white"
                      onClick={jumpToToday}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/15 text-white/70 hover:text-white"
                      onClick={handleExportCalendar}
                      data-export-ignore="true"
                    >
                      <Download className="mr-2 size-4" />
                      Export JPEG
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-white/50">
                    <div className="flex items-center gap-2">
                      <span className="text-white/80">{monthStats.scheduledDays}</span>
                      Scheduled days
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/80">{monthStats.loggedDays}</span>
                      Logged days
                    </div>
                    <div className="hidden sm:block h-4 w-px bg-white/10" />
                    {activeProtocol && (
                      <div className="flex items-center gap-2 text-white/70">
                        <span className={`size-2.5 rounded-full ${activeTheme.accent}`} />
                        Active cycle
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-[#F97316]" />
                      Scheduled
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-cyan-300" />
                      Logged
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-white/20" />
                      Past
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full border border-[#F97316]/70" />
                      Today
                    </div>
                  </div>
                </div>
                {orderedProtocols.length > 0 && (
                  <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-2 text-[10px] uppercase tracking-[0.26em] text-white/50">
                    {orderedProtocols.map((protocol) => {
                      const theme = getProtocolTheme(protocol.themeKey);
                      const isActive = activeProtocol?.id === protocol.id;
                      const isVisible = visibleProtocols[protocol.id];
                      const isDimmed = focusActiveEnabled && !isActive;
                      return (
                        <button
                          key={protocol.id}
                          type="button"
                          onClick={() => {
                            if (!isActive) {
                              handleSetActiveCycle(protocol);
                            }
                          }}
                          className={`flex items-center gap-2 rounded-full border px-3 py-1 transition ${
                            isActive
                              ? `border-white/30 bg-white/15 text-white ${theme.glow}`
                              : "border-white/10 bg-black/30 text-white/60 hover:text-white"
                          } ${isVisible ? "" : "opacity-30"} ${isDimmed ? "opacity-40" : ""}`}
                        >
                          <span className={`size-2 rounded-full ${theme.accent}`} />
                          <span className="truncate max-w-[140px] whitespace-nowrap">
                            {protocol.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div ref={calendarRef} className="flex-1 flex flex-col">
                <div className="grid grid-cols-7 border-b border-white/15 bg-white/5">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                      key={day}
                      className="py-3 text-center text-[12px] font-semibold uppercase tracking-[0.32em] text-white/40 font-display"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="flex-1 grid grid-cols-7 grid-rows-6 divide-x divide-y divide-white/15">
                  {monthGrid.map(({ date, isCurrentMonth }) => {
                    const key = dateKey(date);
                    const dayLogs = logsByDate.get(key) ?? [];
                    const scheduledProtocols = scheduleByDate.get(key) ?? [];

                    const logProtocolIds = Array.from(
                      new Set(dayLogs.map((log) => log.protocolId))
                    );

                    const layerIds = orderedProtocols
                      .filter((protocol) =>
                        scheduledProtocols.includes(protocol.id) ||
                        logProtocolIds.includes(protocol.id)
                      )
                      .map((protocol) => protocol.id);

                    const hasLogs = dayLogs.length > 0;
                    const isScheduled = scheduledProtocols.length > 0;
                    const hasActiveLayer = activeProtocol
                      ? layerIds.includes(activeProtocol.id)
                      : false;
                    const isToday = isSameDay(date, new Date());
                    const isSelected = isSameDay(date, selectedDate);
                    const isPast = date < today;
                    const focusInactive = focusActiveEnabled && !hasActiveLayer;
                    const focusTone = focusInactive && !isSelected ? "opacity-55" : "";

                    const primaryProtocolId =
                      activeProtocol &&
                      layerIds.includes(activeProtocol.id)
                        ? activeProtocol.id
                        : layerIds[0];

                    const primaryTheme = getProtocolTheme(
                      primaryProtocolId
                        ? protocolLookup.get(primaryProtocolId)?.themeKey
                        : null
                    );
                    const primaryIsActive =
                      !!activeProtocol && primaryProtocolId === activeProtocol.id;

                    const cellTone = hasLogs
                      ? "bg-white/[0.1]"
                      : isScheduled
                        ? hasActiveLayer
                          ? `bg-white/[0.12] ${primaryTheme.accentSoft}`
                          : focusInactive
                            ? "bg-white/[0.015]"
                            : "bg-white/[0.03]"
                        : "";

                    const orderedLayerIds = primaryProtocolId
                      ? [
                          primaryProtocolId,
                          ...layerIds.filter((id) => id !== primaryProtocolId),
                        ]
                      : layerIds;

                    const summary = loggedSummary.get(key);
                    const doseLabel = summary
                      ? `${formatNumber(summary.totalMg)} mg`
                      : primaryProtocolId
                        ? `${formatNumber(
                            protocolDoseMap.get(primaryProtocolId) ?? 0
                          )} mg`
                        : null;

                    const statusLabel = hasLogs
                      ? layerIds.length > 1
                        ? `${layerIds.length} layers`
                        : "Logged"
                      : isScheduled
                        ? isPast
                          ? "Past"
                          : layerIds.length > 1
                            ? `${layerIds.length} layers`
                            : "Scheduled"
                        : "";

                    const statusTone = hasLogs
                      ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-100"
                      : statusLabel === "Past"
                        ? "border-white/15 bg-white/10 text-white/60"
                        : primaryIsActive
                          ? primaryTheme.chip
                          : focusInactive
                            ? "border-white/10 bg-white/5 text-white/35"
                            : "border-white/10 bg-white/5 text-white/50";

                    const layerNames = orderedLayerIds
                      .map((id) => protocolLookup.get(id)?.name)
                      .filter(Boolean)
                      .join(" • ");

                    const activeCycleLabel =
                      primaryIsActive && primaryProtocolId
                        ? protocolLookup.get(primaryProtocolId)?.name
                        : null;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectDate(date)}
                        title={layerNames || undefined}
                        className={`group relative flex flex-col justify-between p-3 md:p-4 text-left transition-colors ${focusTone} ${
                          isCurrentMonth ? "bg-transparent" : "bg-white/[0.02] text-white/30"
                        } ${cellTone} ${
                          isSelected
                            ? `ring-2 ${primaryTheme.ring} ring-inset`
                            : hasActiveLayer
                              ? `ring-1 ${primaryTheme.ring} ring-inset hover:bg-white/[0.05]`
                              : "hover:bg-white/[0.05]"
                        } ${primaryIsActive ? primaryTheme.glow : ""} ${
                          isToday ? "shadow-[inset_0_0_0_1px_rgba(251,191,36,0.4)]" : ""
                        }`}
                      >
                        {hasActiveLayer && (
                          <span
                            className={`absolute left-0 top-0 h-full ${primaryTheme.accent} opacity-80 ${
                              primaryIsActive ? "w-1.5" : "w-1"
                            }`}
                          />
                        )}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span
                              className={`text-2xl md:text-3xl font-semibold leading-tight font-display tracking-tight ${
                                isCurrentMonth ? "text-white" : "text-white/40"
                              } ${isToday ? "text-amber-200" : ""}`}
                            >
                              {date.getDate()}
                            </span>
                            {isToday && (
                              <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200">
                                Today
                              </p>
                            )}
                          </div>
                          {statusLabel && (
                            <span
                              className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${statusTone}`}
                            >
                              {statusLabel}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          {doseLabel && (
                            <p
                              className={`text-base md:text-lg font-semibold tracking-tight ${
                                primaryIsActive ? "text-white/90" : "text-white/55"
                              }`}
                            >
                              {doseLabel}
                            </p>
                          )}
                          {!doseLabel && (hasLogs || isScheduled) && (
                            <p className="text-xs text-white/40">Cycle day</p>
                          )}
                          {activeCycleLabel && (
                            <p
                              className={`text-[10px] uppercase tracking-[0.28em] ${primaryTheme.accentText} max-w-[90%] truncate drop-shadow-[0_0_12px_rgba(249,115,22,0.35)] ${
                                isSelected ? "opacity-95" : "opacity-70"
                              }`}
                            >
                              {activeCycleLabel}
                            </p>
                          )}

                          {layerIds.length > 0 && (
                            <div className="flex items-end gap-1">
                              {orderedLayerIds.slice(0, 4).map((id) => {
                                const theme = getProtocolTheme(
                                  protocolLookup.get(id)?.themeKey
                                );
                                const isActiveLayer =
                                  activeProtocol && id === activeProtocol.id;
                                return (
                                  <span
                                    key={`${key}-${id}`}
                                    className={`flex-1 rounded-full ${theme.accent} ${
                                      isActiveLayer
                                        ? "h-3 shadow-[0_0_12px_rgba(249,115,22,0.45)]"
                                        : focusActiveEnabled
                                          ? "h-1.5 opacity-25"
                                          : "h-1.5 opacity-45"
                                    }`}
                                  />
                                );
                              })}
                              {layerIds.length > 4 && (
                                <span className="text-[10px] text-white/40">
                                  +{layerIds.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {hasLogs && (
                          <CheckCircle2 className="absolute bottom-3 right-3 size-5 text-cyan-300" />
                        )}
                        {!hasLogs && isScheduled && (
                          <span
                            className={`absolute bottom-3 right-3 size-3 rounded-full ${
                              primaryIsActive
                                ? primaryTheme.accent
                                : focusInactive
                                  ? "bg-white/20"
                                  : "bg-white/40"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <CycleListDialog
        open={cycleListOpen}
        onOpenChange={setCycleListOpen}
        protocols={orderedProtocols}
        activeProtocolId={activeProtocol?.id}
        visibleProtocols={visibleProtocols}
        onToggleVisibility={toggleProtocolVisibility}
        onEdit={handleEditFromCycleList}
        onTrash={handleTrashProtocol}
        onSetActive={handleSetActiveCycle}
        onCreate={handleCreateFromCycleList}
      />

      <InjectionDialog
        open={logDialogOpen}
        onOpenChange={handleLogDialogChange}
        uid={user?.uid}
        protocol={activeProtocol}
        protocolName={
          editingInjection
            ? protocolLookup.get(editingInjection.protocolId)?.name
            : undefined
        }
        initialDate={selectedDate}
        initialInjection={editingInjection}
      />

      <ProtocolDialog
        open={protocolDialogOpen}
        onOpenChange={setProtocolDialogOpen}
        uid={user?.uid}
        mode={protocolDialogMode}
        initialProtocol={editingProtocol ?? (protocolDialogMode === "edit" ? activeProtocol : null)}
        defaultStartDate={selectedDate}
      />
    </div>
  );
}

export default App;
