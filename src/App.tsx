import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { SkipLink } from "@/components/ui/SkipLink";
import { MobileNav } from "@/components/layout/MobileNav";
import { MetricCard } from "@/components/metrics/MetricCard";
import { AdherenceRing } from "@/components/metrics/AdherenceRing";
import { DosageTrendChart } from "@/components/metrics/DosageTrendChart";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

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
    (startOfDay(rangeStart).getTime() - start.getTime()) / DAY_MS,
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
  endLimit?: Date | null,
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
      ? ((error as { code?: string }).code ?? "")
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
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfDay(new Date()),
  );
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);
  const [protocolDialogMode, setProtocolDialogMode] = useState<
    "create" | "edit"
  >("create");
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);
  const [editingInjection, setEditingInjection] = useState<Injection | null>(
    null,
  );
  const [showTrash, setShowTrash] = useState(false);
  const [focusActive, setFocusActive] = useState(true);
  const [cycleListOpen, setCycleListOpen] = useState(false);
  const [hiddenProtocols, setHiddenProtocols] = useState<
    Record<string, boolean>
  >({});
  const [protocolOpacities, setProtocolOpacities] = useState<
    Record<string, number>
  >({});
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [monthDirection, setMonthDirection] = useState(1);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    ensureUserDocument(user).catch(() => {
      toast.error("Could not initialize your profile.");
    });

    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem(
      "deepshot-onboarding-complete",
    );
    if (!hasSeenOnboarding && protocols.length === 0) {
      setShowOnboarding(true);
    }
  }, [user, protocols.length]);

  useEffect(() => {
    if (!authError) return;
    toast.error(formatAuthError(authError));
  }, [authError]);

  const protocolsClean = useMemo(
    () => protocols.filter((protocol) => !protocol.isTrashed),
    [protocols],
  );
  const trashedProtocols = useMemo(
    () => protocols.filter((protocol) => protocol.isTrashed),
    [protocols],
  );

  const injectionsClean = useMemo(
    () => injections.filter((injection) => !injection.isTrashed),
    [injections],
  );
  const trashedInjections = useMemo(
    () => injections.filter((injection) => injection.isTrashed),
    [injections],
  );

  const visibleProtocols = useMemo(() => {
    const map: Record<string, boolean> = {};
    protocolsClean.forEach((protocol) => {
      map[protocol.id] = !hiddenProtocols[protocol.id];
    });
    return map;
  }, [protocolsClean, hiddenProtocols]);

  const getProtocolOpacity = (protocolId: string) => {
    return protocolOpacities[protocolId] ?? 1;
  };

  const handleOpacityChange = (protocolId: string, opacity: number) => {
    setProtocolOpacities((prev) => ({ ...prev, [protocolId]: opacity }));
  };

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
    [orderedProtocols],
  );
  const activeTheme = useMemo(
    () => getProtocolTheme(activeProtocol?.themeKey),
    [activeProtocol],
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
      map.set(protocol.id, protocol.doseMl * protocol.concentrationMgPerMl);
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
            DAY_MS,
        ),
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

  const {
    grid: monthGrid,
    rangeStart,
    rangeEnd,
  } = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  const scheduleByDate = useMemo(() => {
    const map = new Map<number, string[]>();

    orderedProtocols.forEach((protocol) => {
      if (!visibleProtocols[protocol.id]) return;

      const scheduleDates = generateScheduleInRange(
        protocol.startDate,
        protocol.intervalDays,
        rangeStart,
        rangeEnd,
        protocol.endDate ?? null,
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
    (protocolId) => !selectedLogs.some((log) => log.protocolId === protocolId),
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
      ? `${formatNumber(protocolDoseMap.get(selectedLayerProtocols[0]) ?? 0)} mg`
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
    setMonthDirection(offset > 0 ? 1 : -1);
    const next = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + offset,
      1,
    );
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

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("deepshot-onboarding-complete", "true");
  };

  if (authLoading || protocolsLoading || injectionsLoading) {
    return (
      <div className="min-h-screen app-shell text-foreground flex items-center justify-center">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen app-shell text-foreground flex flex-col">
      <SkipLink />

      {showOnboarding && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}

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
                <p className="mt-1 text-[10px] uppercase tracking-[0.5em] text-white/70">
                  Cycle Control
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="gap-2 bg-[#F97316] hover:bg-[#FB923C] text-slate-950"
                    onClick={() => handleOpenLogDialog()}
                    disabled={!activeProtocol}
                  >
                    <Plus className="size-4" />
                    <span>Log injection</span>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="border-blue-400/40 text-blue-100 hover:border-blue-300/70 hover:text-white"
                    onClick={handleOpenCycleList}
                  >
                    <Layers className="size-4 mr-2" />
                    <span>Cycles</span>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="border-blue-400/30 text-blue-100 hover:border-blue-300/70 hover:text-white"
                    onClick={handleOpenNewCycle}
                  >
                    <Repeat className="size-4 mr-2" />
                    New cycle
                  </Button>
                </motion.div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white"
                  onClick={handleLogout}
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </Button>
              </>
            ) : (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="gap-2 bg-[#F97316] hover:bg-[#FB923C] text-slate-950"
                  onClick={handleLogin}
                >
                  <LogIn className="size-4" />
                  Sign In
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="flex-1 min-h-0 flex flex-col pb-20 md:pb-0"
      >
        {!user ? (
          <div className="flex-1 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/10 blur-3xl animate-pulse" />
              <div
                className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/15 to-purple-600/10 blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              />
            </div>

            {/* Main content */}
            <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center min-h-full p-6 lg:p-12 gap-12">
              {/* Left side - Hero text */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex-1 max-w-2xl text-center lg:text-left"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-sm text-white/70">
                    Now with enhanced tracking
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                >
                  <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                    DeepShot
                  </span>
                  <br />
                  <span className="text-3xl lg:text-5xl font-light text-white/80">
                    Cycle Intelligence
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-lg lg:text-xl text-white/60 mb-8 max-w-xl leading-relaxed"
                >
                  Precision dosing, layered schedules, and intelligent tracking.
                  Take complete control of your protocol with stunning clarity.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogin}
                    className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-semibold text-black text-lg overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.4)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center justify-center gap-3">
                      <LogIn className="size-5" />
                      Get Started
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/5 transition-colors text-lg"
                  >
                    Learn More
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Right side - Visual showcase */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="flex-1 max-w-lg w-full"
              >
                <div className="relative">
                  {/* Main card */}
                  <div className="relative rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-8 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                          <img
                            src="/deepshot-icon.svg"
                            alt=""
                            className="w-8 h-8"
                          />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            Active Cycle
                          </h3>
                          <p className="text-white/50 text-sm">
                            Testosterone E3D
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium">
                        Active
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="rounded-2xl bg-black/40 border border-white/5 p-4">
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                          Next Shot
                        </p>
                        <p className="text-white text-2xl font-bold">2 days</p>
                        <p className="text-amber-400 text-sm">250 mg</p>
                      </div>
                      <div className="rounded-2xl bg-black/40 border border-white/5 p-4">
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                          Adherence
                        </p>
                        <p className="text-white text-2xl font-bold">94%</p>
                        <p className="text-emerald-400 text-sm">On track</p>
                      </div>
                    </div>

                    {/* Calendar preview */}
                    <div className="rounded-2xl bg-black/40 border border-white/5 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white/60 text-sm font-medium">
                          January 2026
                        </p>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                          <div
                            key={i}
                            className="text-center text-white/30 text-xs py-1"
                          >
                            {day}
                          </div>
                        ))}
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(
                          (date) => (
                            <div
                              key={date}
                              className={`text-center text-xs py-1.5 rounded-lg ${
                                [5, 8, 11, 14, 17, 20, 23, 26, 29].includes(
                                  date,
                                )
                                  ? "bg-amber-500/30 text-amber-200"
                                  : date === 30
                                    ? "bg-emerald-500/30 text-emerald-200"
                                    : "text-white/50"
                              }`}
                            >
                              {date}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Floating elements */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500/30 to-purple-600/20 border border-white/10 backdrop-blur-xl flex items-center justify-center"
                  >
                    <div className="text-center">
                      <p className="text-white text-xl font-bold">12</p>
                      <p className="text-white/50 text-xs">Protocols</p>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                    className="absolute -bottom-4 -left-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-600/20 border border-white/10 backdrop-blur-xl flex items-center justify-center"
                  >
                    <div className="text-center">
                      <p className="text-white text-lg font-bold">48</p>
                      <p className="text-white/50 text-[10px]">Logged</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : !activeProtocol ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white/5 border-white/10">
              <CardHeader className="text-center">
                <div className="size-16 rounded-2xl bg-white/5 mx-auto grid place-items-center mb-4 border border-white/10">
                  <Repeat className="size-8 text-orange-300" />
                </div>
                <CardTitle className="text-white">No Active Cycle</CardTitle>
                <CardDescription className="text-white/70">
                  Set your schedule to start tracking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="w-full gap-2 bg-[#F97316] hover:bg-[#FB923C] text-slate-950"
                    onClick={handleOpenNewCycle}
                  >
                    <Plus className="size-4" />
                    Create Cycle
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 min-h-0 grid gap-4 p-3 md:p-4 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
            <section className="order-2 lg:order-1 min-h-0 flex flex-col gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.06] to-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/70">
                      Active cycle
                    </p>
                    <p className="text-2xl font-semibold text-white font-display tracking-[0.08em] uppercase">
                      {activeProtocol.name}
                    </p>
                    <p className="text-xs text-white/70 flex items-center gap-2">
                      <span
                        className={`size-2 rounded-full ${activeTheme.accent}`}
                      />
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

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MetricCard
                    label="Last shot"
                    value={
                      activeLastLog ? formatDate(activeLastLog.date) : "--"
                    }
                    subtext={
                      activeLastLog
                        ? `${formatNumber(activeLastLog.doseMg)} mg`
                        : "No logs yet"
                    }
                    delay={0.2}
                  />
                  <MetricCard
                    label="Next shot"
                    value={
                      nextInjectionDate && nextInjectionWithinRange
                        ? formatDate(nextInjectionDate)
                        : "--"
                    }
                    subtext={
                      daysRemaining !== null && nextInjectionWithinRange
                        ? `${daysRemaining} days`
                        : "Set end date"
                    }
                    delay={0.3}
                  />
                  <MetricCard
                    label="Per injection"
                    value={
                      mgPerInjection
                        ? `${formatNumber(mgPerInjection)} mg`
                        : "--"
                    }
                    subtext="Dose × concentration"
                    delay={0.4}
                  />
                  <MetricCard
                    label="Weekly avg"
                    value={mgPerWeek ? `${formatNumber(mgPerWeek)} mg` : "--"}
                    subtext="Based on interval"
                    delay={0.5}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.06] to-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-4"
              >
                <div className="flex items-center justify-center mb-3">
                  <AdherenceRing
                    scheduled={monthStats.scheduledDays}
                    logged={monthStats.loggedDays}
                  />
                </div>
                <DosageTrendChart injections={injectionsClean} days={14} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.06] to-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-4 min-h-[200px]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                      Cycles
                    </p>
                    <p className="text-lg font-semibold text-white font-display tracking-[0.08em] uppercase">
                      Layer control
                    </p>
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
                      <motion.div
                        key={protocol.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`relative rounded-xl border px-3 py-2.5 pl-5 transition-all duration-200 ${
                          isActive
                            ? `border-white/25 bg-gradient-to-br from-white/[0.12] to-black/60 ${theme.glow}`
                            : "border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-black/40"
                        } ${isDimmed ? "opacity-40 hover:opacity-80" : "opacity-80 hover:opacity-100"}`}
                      >
                        <span
                          className={`absolute left-2 top-3 bottom-3 rounded-full ${theme.accent} ${isVisible ? "" : "opacity-30"} ${isActive ? "w-1.5" : "w-1"}`}
                        />
                        <div className="flex flex-col gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              toggleProtocolVisibility(protocol.id)
                            }
                            className="flex min-w-0 items-center gap-3 text-left"
                          >
                            <span
                              className={`size-3 rounded-full shrink-0 ${theme.accent} ${isVisible ? "" : "opacity-30"}`}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white font-display tracking-[0.08em] uppercase truncate">
                                {protocol.name}
                              </p>
                              <p className="text-xs text-white/70 truncate">
                                {formatDate(protocol.startDate)} →{" "}
                                {protocol.endDate
                                  ? formatDate(protocol.endDate)
                                  : "Open"}
                              </p>
                              <p className="text-xs text-white/70">
                                {formatNumber(
                                  protocol.doseMl *
                                    protocol.concentrationMgPerMl,
                                )}{" "}
                                mg · {protocol.doseMl} mL
                              </p>
                            </div>
                          </button>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-widest shrink-0 ${theme.chip}`}
                            >
                              E{protocol.intervalDays}D
                            </span>
                            {isActive && (
                              <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] uppercase tracking-widest text-white/70 shrink-0">
                                Active
                              </span>
                            )}
                            {!isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/15 text-white/70 hover:text-white h-7 text-xs"
                                onClick={() => handleSetActiveCycle(protocol)}
                              >
                                <CheckCircle2 className="size-3 mr-1" />
                                Set active
                              </Button>
                            )}
                            <div className="flex items-center gap-1 ml-auto">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white/70 hover:text-white size-7"
                                onClick={() =>
                                  toggleProtocolVisibility(protocol.id)
                                }
                                aria-label={
                                  isVisible ? "Hide cycle" : "Show cycle"
                                }
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
                                className="text-white/70 hover:text-white size-7"
                                onClick={() => handleEditCycle(protocol)}
                                aria-label="Edit cycle"
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white/70 hover:text-white size-7"
                                onClick={() => handleTrashProtocol(protocol)}
                                aria-label="Trash cycle"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">
                              Opacity
                            </span>
                            <input
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.1"
                              value={getProtocolOpacity(protocol.id)}
                              onChange={(e) =>
                                handleOpacityChange(
                                  protocol.id,
                                  parseFloat(e.target.value),
                                )
                              }
                              className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500"
                            />
                            <span className="text-[10px] text-white/50 w-8 text-right">
                              {Math.round(
                                getProtocolOpacity(protocol.id) * 100,
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {showTrash &&
                  (trashedProtocols.length > 0 ||
                    trashedInjections.length > 0) && (
                    <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                        Trash
                      </p>
                      <div className="mt-3 space-y-3">
                        {trashedProtocols.map((protocol) => (
                          <div
                            key={protocol.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-white/70">
                              {protocol.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white/70 hover:text-white"
                              onClick={() => handleRestoreProtocol(protocol)}
                            >
                              <Undo2 className="size-4 mr-2" />
                              Restore
                            </Button>
                          </div>
                        ))}
                        {trashedInjections.slice(0, 4).map((injection) => (
                          <div
                            key={injection.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-white/70">
                              {formatDate(injection.date)} ·{" "}
                              {formatNumber(injection.doseMg)} mg
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white/70 hover:text-white"
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
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.06] to-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                      Selected day
                    </p>
                    <p className="text-xl font-semibold text-white font-display">
                      {formatDate(selectedDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                      Status
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {selectedStatus}
                    </p>
                    <p className="text-xs text-white/70">{selectedDose}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedScheduledProtocols.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/70">
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
                                <p className="text-xs text-white/70">
                                  {formatNumber(
                                    protocol.doseMl *
                                      protocol.concentrationMgPerMl,
                                  )}{" "}
                                  mg · {protocol.doseMl} mL
                                </p>
                              </div>
                              <span
                                className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-widest ${theme.chip}`}
                              >
                                {isSelectedPast ? "Past" : "Scheduled"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/70">
                      Logged
                    </p>
                    {selectedLogs.length === 0 ? (
                      <p className="text-sm text-white/70">
                        No injections logged.
                      </p>
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
                                <p className="text-xs text-white/70">
                                  {formatNumber(log.doseMg)} mg · {log.doseMl}{" "}
                                  mL
                                </p>
                              </div>
                              <span
                                className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-widest ${theme.chip}`}
                              >
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
                                className="text-white/70 hover:text-white"
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
              </motion.div>
            </section>

            <section className="order-1 lg:order-2 h-[calc(100vh-120px)] flex flex-col rounded-2xl border border-white/8 bg-gradient-to-b from-[#0c0c0c] to-[#080808] shadow-[0_24px_60px_rgba(0,0,0,0.7)]">
              <div className="border-b border-white/8 px-3 py-2 md:px-4 bg-gradient-to-r from-white/[0.04] to-transparent">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/70 hover:text-white"
                      onClick={() => shiftMonth(-1)}
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="size-5" />
                    </Button>
                    <AnimatePresence
                      mode="wait"
                      initial={false}
                      custom={monthDirection}
                    >
                      <motion.div
                        key={viewDate.getMonth()}
                        custom={monthDirection}
                        initial={{
                          opacity: 0,
                          x: monthDirection > 0 ? 50 : -50,
                        }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: monthDirection > 0 ? -50 : 50 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="text-3xl md:text-4xl font-semibold tracking-[0.08em] uppercase text-white font-display"
                      >
                        {formatMonth(viewDate)}
                      </motion.div>
                    </AnimatePresence>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/70 hover:text-white"
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

                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-white/70">
                    <div className="flex items-center gap-2">
                      <span className="text-white/90">
                        {monthStats.scheduledDays}
                      </span>
                      Scheduled days
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/90">
                        {monthStats.loggedDays}
                      </span>
                      Logged days
                    </div>
                    <div className="hidden sm:block h-4 w-px bg-white/10" />
                    {activeProtocol && (
                      <div className="flex items-center gap-2 text-white/90">
                        <span
                          className={`size-2.5 rounded-full ${activeTheme.accent}`}
                        />
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
                      <span className="size-2.5 rounded-full bg-white/30" />
                      Past
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full border border-[#F97316]/70" />
                      Today
                    </div>
                  </div>
                </div>
                {orderedProtocols.length > 0 && (
                  <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-2 text-[10px] uppercase tracking-[0.26em] text-white/70">
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
                            if (!isActive) handleSetActiveCycle(protocol);
                          }}
                          className={`flex items-center gap-2 rounded-full border px-3 py-1 transition ${
                            isActive
                              ? `border-white/30 bg-white/15 text-white ${theme.glow}`
                              : "border-white/10 bg-black/30 text-white/70 hover:text-white"
                          } ${isVisible ? "" : "opacity-30"} ${isDimmed ? "opacity-40" : ""}`}
                        >
                          <span
                            className={`size-2 rounded-full ${theme.accent}`}
                          />
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
                <div className="grid grid-cols-7 border-b border-white/8 bg-white/[0.03]">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="py-2 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50 font-display"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>

                <div
                  className="flex-1 grid grid-cols-7 grid-rows-6 h-full divide-x divide-y divide-white/10"
                  style={{ minHeight: 0 }}
                >
                  {monthGrid.map(({ date, isCurrentMonth }) => {
                    const key = dateKey(date);
                    const dayLogs = logsByDate.get(key) ?? [];
                    const scheduledProtocols = scheduleByDate.get(key) ?? [];
                    const logProtocolIds = Array.from(
                      new Set(dayLogs.map((log) => log.protocolId)),
                    );
                    const layerIds = orderedProtocols
                      .filter(
                        (protocol) =>
                          scheduledProtocols.includes(protocol.id) ||
                          logProtocolIds.includes(protocol.id),
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
                    const focusTone =
                      focusInactive && !isSelected ? "opacity-55" : "";
                    const primaryProtocolId =
                      activeProtocol && layerIds.includes(activeProtocol.id)
                        ? activeProtocol.id
                        : layerIds[0];
                    const primaryTheme = getProtocolTheme(
                      primaryProtocolId
                        ? protocolLookup.get(primaryProtocolId)?.themeKey
                        : null,
                    );
                    const primaryIsActive =
                      !!activeProtocol &&
                      primaryProtocolId === activeProtocol.id;
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
                        ? `${formatNumber(protocolDoseMap.get(primaryProtocolId) ?? 0)} mg`
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
                        ? "border-white/15 bg-white/10 text-white/70"
                        : primaryIsActive
                          ? primaryTheme.chip
                          : focusInactive
                            ? "border-white/10 bg-white/5 text-white/50"
                            : "border-white/10 bg-white/5 text-white/70";

                    return (
                      <motion.button
                        key={key}
                        type="button"
                        onClick={() => handleSelectDate(date)}
                        title={
                          layerIds
                            .map((id) => protocolLookup.get(id)?.name)
                            .filter(Boolean)
                            .join(" • ") || undefined
                        }
                        aria-label={`${formatDate(date)}. ${statusLabel || "No injection scheduled"}${doseLabel ? `. Dose: ${doseLabel}` : ""}`}
                        aria-pressed={isSelected}
                        aria-current={isToday ? "date" : undefined}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.1 }}
                        className={`group relative flex flex-col p-1.5 text-left transition-all duration-200 ${focusTone} ${isCurrentMonth ? "bg-black/20" : "bg-black/40 text-white/25"} ${cellTone} ${isSelected ? `ring-2 ${primaryTheme.ring} ring-inset bg-gradient-to-br from-white/10 to-transparent` : hasActiveLayer ? `ring-1 ${primaryTheme.ring} ring-inset hover:bg-white/[0.08]` : "hover:bg-white/[0.04]"} ${isToday ? "bg-gradient-to-br from-amber-500/10 to-orange-500/5 shadow-[inset_0_0_0_1px_rgba(251,146,60,0.6)]" : ""}`}
                      >
                        {hasActiveLayer && (
                          <span
                            className={`absolute left-0 top-0 h-full ${primaryTheme.accent} opacity-80 ${primaryIsActive ? "w-1.5" : "w-1"}`}
                          />
                        )}
                        <div className="flex items-start justify-between gap-0.5">
                          <div>
                            <span
                              className={`text-xs font-semibold leading-none ${isCurrentMonth ? "text-white/70" : "text-white/25"} ${isToday ? "text-orange-400" : ""}`}
                            >
                              {date.getDate()}
                            </span>
                          </div>
                          {isToday && (
                            <span className="text-[8px] font-bold uppercase tracking-wider text-orange-400">
                              Today
                            </span>
                          )}
                          {!isToday && statusLabel && (
                            <span
                              className={`rounded-sm px-1 py-0 text-[8px] font-semibold uppercase tracking-wide ${statusTone}`}
                            >
                              {statusLabel}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center gap-0.5 min-h-0">
                          {doseLabel && (
                            <p
                              className={`text-base font-bold tracking-tight leading-none ${primaryIsActive ? "text-white" : "text-white/90"}`}
                            >
                              {doseLabel}
                            </p>
                          )}
                          {primaryProtocolId &&
                            protocolLookup.get(primaryProtocolId)?.name && (
                              <p
                                className={`text-[9px] uppercase tracking-wider font-medium ${primaryTheme.accentText} truncate ${isSelected ? "opacity-100" : "opacity-80"}`}
                              >
                                {protocolLookup.get(primaryProtocolId)?.name}
                              </p>
                            )}
                        </div>
                        <div className="mt-auto">
                          {layerIds.length > 0 && (
                            <div className="flex items-center gap-[2px]">
                              {orderedLayerIds.slice(0, 5).map((id) => {
                                const theme = getProtocolTheme(
                                  protocolLookup.get(id)?.themeKey,
                                );
                                const isActiveLayer =
                                  activeProtocol && id === activeProtocol.id;
                                const opacity = getProtocolOpacity(id);
                                const effectiveOpacity = isActiveLayer
                                  ? opacity
                                  : focusActiveEnabled
                                    ? opacity * 0.3
                                    : opacity * 0.7;
                                return (
                                  <span
                                    key={`${key}-${id}`}
                                    className={`flex-1 h-1 rounded-full ${theme.accent}`}
                                    style={{ opacity: effectiveOpacity }}
                                  />
                                );
                              })}
                              {layerIds.length > 5 && (
                                <span className="text-[7px] text-white/50 ml-0.5">
                                  +{layerIds.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {hasLogs && (
                          <div className="absolute top-1/2 right-1 -translate-y-1/2">
                            <CheckCircle2 className="size-3.5 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <MobileNav
        onLogClick={() => handleOpenLogDialog()}
        onCyclesClick={handleOpenCycleList}
      />

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
        initialProtocol={
          editingProtocol ??
          (protocolDialogMode === "edit" ? activeProtocol : null)
        }
        defaultStartDate={selectedDate}
      />
    </div>
  );
}

export default App;
