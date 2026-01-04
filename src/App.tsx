import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock,
  Droplet,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Repeat,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InjectionDialog } from "@/components/InjectionDialog";
import { ProtocolDialog } from "@/components/ProtocolDialog";
import { useAuth } from "@/hooks/useAuth";
import { type Injection, useInjections } from "@/hooks/useInjections";
import { type Protocol, useProtocols } from "@/hooks/useProtocols";
import { login, logout } from "@/lib/auth";
import { ensureUserDocument } from "@/lib/firestore";

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

const uniqueDates = (dates: Date[]) => {
  const seen = new Set<number>();
  return dates.filter((date) => {
    const key = startOfDay(date).getTime();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const generateScheduleDates = (
  startDate: Date | null,
  intervalDays: number,
  endDate: Date
) => {
  if (!startDate || intervalDays <= 0) return [];

  const dates: Date[] = [];
  let current = startOfDay(startDate);
  const end = startOfDay(endDate);

  if (current > end) return dates;

  while (current <= end) {
    dates.push(current);
    current = addDays(current, intervalDays);
  }

  return dates;
};

function App() {
  const { user, loading: authLoading } = useAuth();
  const { protocols, loading: protocolsLoading } = useProtocols(user?.uid);
  const { injections, loading: injectionsLoading } = useInjections(user?.uid);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);
  const [editingInjection, setEditingInjection] = useState<Injection | null>(null);

  useEffect(() => {
    if (!user) return;

    ensureUserDocument(user).catch(() => {
      toast.error("Could not initialize your profile.");
    });
  }, [user]);

  const activeProtocol = useMemo(
    () => protocols.find((protocol) => protocol.isActive) ?? null,
    [protocols]
  );
  const pastProtocols = useMemo(
    () => protocols.filter((protocol) => !protocol.isActive),
    [protocols]
  );

  const protocolLookup = useMemo(() => {
    const map = new Map<string, Protocol>();
    protocols.forEach((protocol) => {
      map.set(protocol.id, protocol);
    });
    return map;
  }, [protocols]);

  const activeInjections = useMemo(() => {
    if (!activeProtocol) return [];
    return injections.filter((log) => log.protocolId === activeProtocol.id);
  }, [injections, activeProtocol]);

  const latestInjectionDate = activeInjections[0]?.date ?? null;
  const nextInjectionDate = activeProtocol
    ? latestInjectionDate
      ? addDays(startOfDay(latestInjectionDate), activeProtocol.intervalDays)
      : startOfDay(activeProtocol.startDate)
    : null;

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

  const scheduleStart = activeProtocol
    ? latestInjectionDate
      ? addDays(startOfDay(latestInjectionDate), activeProtocol.intervalDays)
      : startOfDay(activeProtocol.startDate)
    : null;
  const scheduleEnd = addDays(new Date(), 90);

  const upcomingScheduleDates = generateScheduleDates(
    scheduleStart,
    activeProtocol?.intervalDays ?? 0,
    scheduleEnd
  );

  const archivedScheduleDates = pastProtocols.flatMap((protocol) =>
    generateScheduleDates(protocol.startDate, protocol.intervalDays, protocol.endDate ?? protocol.startDate)
  );

  const scheduledDates = uniqueDates(upcomingScheduleDates);
  const archivedDates = uniqueDates(archivedScheduleDates);
  const loggedDates = uniqueDates(injections.map((log) => log.date));

  const logsForSelectedDate = selectedDate
    ? injections.filter((log) => isSameDay(log.date, selectedDate))
    : [];

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      toast.error("Sign in failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
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

  const handleOpenProtocolDialog = () => {
    setProtocolDialogOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
          <Card className="w-full max-w-md border-border/60 bg-card/70">
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
    <div className="min-h-screen bg-[#080c10] text-foreground flex flex-col">
      {/* Top Header Bar - Compact with all metrics */}
      <header className="shrink-0 border-b border-white/10 bg-[#0a0e14]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 max-w-[1920px] mx-auto">
          {/* Logo + Protocol Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 grid place-items-center">
                <Droplet className="size-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white hidden sm:block">TRT Tracker</span>
            </div>

            {user && activeProtocol && (
              <Button
                variant="outline"
                className="border-white/20 text-white/80 bg-white/5 hover:bg-white/10 gap-2"
                onClick={handleOpenProtocolDialog}
              >
                <span className="text-amber-400 font-medium">E{activeProtocol.intervalDays}D</span>
                <span className="text-white/40 text-sm hidden md:inline">Every {activeProtocol.intervalDays} days</span>
              </Button>
            )}
          </div>

          {/* Metrics - visible when logged in */}
          {user && activeProtocol && (
            <div className="flex items-center gap-6">
              <div className="text-center hidden md:block">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Per Injection</p>
                <p className="text-xl font-bold text-amber-400">{formatNumber(mgPerInjection ?? 0)} mg</p>
              </div>
              <div className="h-8 w-px bg-white/10 hidden md:block" />
              <div className="text-center hidden md:block">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Weekly Total</p>
                <p className="text-xl font-bold text-emerald-400">{formatNumber(mgPerWeek ?? 0)} mg</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button
                  className="gap-2 bg-amber-600 hover:bg-amber-500 text-white"
                  onClick={() => handleOpenLogDialog()}
                  disabled={!activeProtocol}
                >
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">Log Injection</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={handleLogout}>
                  <LogOut className="size-4" />
                </Button>
              </>
            ) : (
              <Button className="gap-2 bg-amber-600 hover:bg-amber-500" onClick={handleLogin}>
                <LogIn className="size-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Full Screen Calendar */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {!user ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white/5 border-white/10">
              <CardHeader className="text-center">
                <div className="size-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mx-auto grid place-items-center mb-4 shadow-lg shadow-amber-500/20">
                  <CalendarDays className="size-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">TRT Tracker</CardTitle>
                <CardDescription className="text-white/50">Track your testosterone protocol with precision.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2 bg-amber-600 hover:bg-amber-500" onClick={handleLogin}>
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
                <div className="size-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 mx-auto grid place-items-center mb-4 border border-amber-500/30">
                  <Repeat className="size-8 text-amber-400" />
                </div>
                <CardTitle className="text-white">No Active Protocol</CardTitle>
                <CardDescription>Create a protocol to start tracking your injections.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2 bg-amber-600 hover:bg-amber-500" onClick={handleOpenProtocolDialog}>
                  <Plus className="size-4" />
                  Create Protocol
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="border-white/20 text-white/60 hover:text-white hover:bg-white/10" onClick={() => {
                  const newDate = new Date(selectedDate || new Date());
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}>
                  &lt;
                </Button>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {(selectedDate || new Date()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h2>
                <Button variant="outline" size="icon" className="border-white/20 text-white/60 hover:text-white hover:bg-white/10" onClick={() => {
                  const newDate = new Date(selectedDate || new Date());
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}>
                  &gt;
                </Button>
              </div>

              <Button
                variant="outline"
                className="border-white/20 text-white/70 hover:bg-white/10"
                onClick={handleOpenProtocolDialog}
              >
                <Repeat className="size-4 mr-2" />
                Protocol Settings
              </Button>
            </div>

            {/* Full-Screen Calendar Grid */}
            <div className="flex-1 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => (
                  <div key={day} className="py-3 text-center text-xs font-medium text-white/40 tracking-wider">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                {(() => {
                  const currentDate = selectedDate || new Date();
                  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                  const startDay = firstDay.getDay();
                  const daysInMonth = lastDay.getDate();
                  const cells = [];

                  // Empty cells for days before month starts
                  for (let i = 0; i < startDay; i++) {
                    cells.push(<div key={`empty-${i}`} className="border-b border-r border-white/5" />);
                  }

                  // Day cells
                  for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const isToday = isSameDay(date, new Date());
                    const isScheduled = scheduledDates.some(d => isSameDay(d, date));
                    const isLogged = loggedDates.some(d => isSameDay(d, date));
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const log = injections.find(l => isSameDay(l.date, date));

                    cells.push(
                      <button
                        key={day}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          relative border-b border-r border-white/5 p-2 text-left transition-all hover:bg-white/5
                          ${isSelected ? 'bg-white/10 ring-2 ring-amber-500/50 ring-inset' : ''}
                          ${isToday ? 'bg-amber-500/10' : ''}
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <span className={`
                            text-lg font-medium
                            ${isToday ? 'text-amber-400 font-bold' : 'text-white/70'}
                            ${isLogged ? 'text-emerald-400' : ''}
                          `}>
                            {day}
                          </span>
                          {isScheduled && !isLogged && (
                            <span className="size-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                          )}
                          {isLogged && (
                            <CheckCircle2 className="size-4 text-emerald-400" />
                          )}
                        </div>
                        {(isScheduled || isLogged) && (
                          <p className="text-xs text-white/40 mt-1">
                            {formatNumber(mgPerInjection ?? 0)} mg
                          </p>
                        )}
                        {isToday && (
                          <div className="absolute bottom-2 left-2 flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-[10px] text-amber-400 font-medium">TODAY</span>
                          </div>
                        )}
                      </button>
                    );
                  }

                  // Fill remaining cells
                  const totalCells = cells.length;
                  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
                  for (let i = 0; i < remainingCells; i++) {
                    cells.push(<div key={`end-${i}`} className="border-b border-r border-white/5" />);
                  }

                  return cells;
                })()}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-amber-500" />
                <span className="text-sm text-white/50">Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span className="text-sm text-white/50">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm text-white/50">Today</span>
              </div>
            </div>
          </div>
        )}
      </main>

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
        initialProtocol={activeProtocol}
        defaultStartDate={selectedDate}
      />
    </div>
  );
}

export default App;
