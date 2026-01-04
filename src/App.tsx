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
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.15),_transparent_45%),radial-gradient(circle_at_20%_80%,_rgba(56,189,248,0.12),_transparent_40%)]" />
        <div className="absolute -top-20 right-10 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
          <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit">DeepShot</Badge>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">DeepShot</h1>
                <p className="text-muted-foreground">
                  Track protocols, calculate dosage, and stay ahead of every injection.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm">
                    <p className="text-xs text-muted-foreground">Signed in</p>
                    <p className="font-medium">
                      {user.displayName ?? user.email ?? "TRT member"}
                    </p>
                  </div>
                  <Button variant="secondary" className="gap-2" onClick={handleLogout}>
                    <LogOut className="size-4" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <Button className="gap-2" onClick={handleLogin}>
                  <LogIn className="size-4" />
                  Sign in with Google
                </Button>
              )}
              <Button
                className="gap-2"
                onClick={() => handleOpenLogDialog()}
                disabled={!user || !activeProtocol}
              >
                <Plus className="size-4" />
                Log injection
              </Button>
            </div>
          </header>

          {!user ? (
            <Card className="border-border/60 bg-card/70">
              <CardHeader>
                <CardTitle>Sign in to get started</CardTitle>
                <CardDescription>
                  Your data is stored privately in Firestore and synced across devices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="gap-2" onClick={handleLogin}>
                  <LogIn className="size-4" />
                  Continue with Google
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid w-full max-w-xs grid-cols-2">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Card className="border-border/60 bg-card/70 shadow-lg shadow-black/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CalendarDays className="size-4 text-emerald-400" />
                        Next injection
                      </CardTitle>
                      <CardDescription>Based on your latest log</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-2xl font-semibold">
                        {nextInjectionDate
                          ? formatDate(nextInjectionDate)
                          : "No active protocol"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {daysRemaining !== null
                          ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`
                          : "Create a protocol to begin"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 bg-card/70 shadow-lg shadow-black/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Droplet className="size-4 text-cyan-300" />
                        mg per injection
                      </CardTitle>
                      <CardDescription>
                        {activeProtocol
                          ? `${formatNumber(activeProtocol.doseMl)} mL @ ${activeProtocol.concentrationMgPerMl} mg/mL`
                          : "Set a protocol to calculate"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-semibold">
                        {mgPerInjection !== null
                          ? `${formatNumber(mgPerInjection)} mg`
                          : "--"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 bg-card/70 shadow-lg shadow-black/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="size-4 text-amber-300" />
                        mg per week
                      </CardTitle>
                      <CardDescription>
                        {activeProtocol
                          ? `Interval ${activeProtocol.intervalDays} days`
                          : "Waiting for protocol"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-semibold">
                        {mgPerWeek !== null ? `${formatNumber(mgPerWeek)} mg` : "--"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-transparent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CheckCircle2 className="size-4 text-emerald-300" />
                        Ready to log?
                      </CardTitle>
                      <CardDescription>
                        {activeProtocol
                          ? "Record today or yesterday"
                          : "Create a protocol to start logging"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        className="w-full gap-2"
                        onClick={() => handleOpenLogDialog()}
                        disabled={!activeProtocol}
                      >
                        <Plus className="size-4" />
                        Log injection
                      </Button>
                      {!activeProtocol && (
                        <Button
                          variant="secondary"
                          className="w-full gap-2"
                          onClick={handleOpenProtocolDialog}
                        >
                          <Repeat className="size-4" />
                          Start a protocol
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <Card className="border-border/60 bg-card/70">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Repeat className="size-4 text-emerald-300" />
                        Active protocol
                      </CardTitle>
                      <CardDescription>Current schedule and dosing details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {protocolsLoading ? (
                        <p className="text-sm text-muted-foreground">
                          Loading protocol details...
                        </p>
                      ) : activeProtocol ? (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{activeProtocol.name}</Badge>
                            <Badge variant="outline">Active</Badge>
                          </div>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <p className="text-xs uppercase text-muted-foreground">Start date</p>
                              <p className="font-medium">{formatDate(activeProtocol.startDate)}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase text-muted-foreground">Interval</p>
                              <p className="font-medium">Every {activeProtocol.intervalDays} days</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase text-muted-foreground">Dose</p>
                              <p className="font-medium">
                                {formatNumber(activeProtocol.doseMl)} mL · {formatNumber(mgPerInjection ?? Number.NaN)} mg
                              </p>
                            </div>
                          </div>
                          <Separator />
                          <p className="text-sm text-muted-foreground">
                            {activeProtocol.notes || "No protocol notes yet."}
                          </p>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            No active protocol. Create one to generate your schedule.
                          </p>
                          <Button className="gap-2" onClick={handleOpenProtocolDialog}>
                            <Repeat className="size-4" />
                            Create protocol
                          </Button>
                        </div>
                      )}

                      {pastProtocols.length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-3">
                            <p className="text-xs uppercase text-muted-foreground">
                              Protocol history
                            </p>
                            <div className="space-y-2">
                              {pastProtocols.slice(0, 4).map((protocol) => (
                                <div key={protocol.id} className="text-sm">
                                  <p className="font-medium">{protocol.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(protocol.startDate)}
                                    {protocol.endDate ? ` -> ${formatDate(protocol.endDate)}` : ""}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 bg-card/70">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="size-4 text-cyan-300" />
                        Recent injections
                      </CardTitle>
                      <CardDescription>Most recent logs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-56 pr-3">
                        <div className="space-y-3">
                          {injectionsLoading ? (
                            <p className="text-sm text-muted-foreground">Loading logs...</p>
                          ) : injections.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No injections logged yet.</p>
                          ) : (
                            injections.slice(0, 6).map((log) => (
                              <div key={log.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium">{formatDate(log.date)}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {protocolLookup.get(log.protocolId)?.name ?? "Protocol"}
                                    </p>
                                  </div>
                                  <Badge variant="outline">{formatNumber(log.doseMg)} mg</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {log.notes || "No notes"}
                                </p>
                                <Separator />
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="calendar" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <Card className="border-border/60 bg-card/70">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CalendarDays className="size-4 text-emerald-300" />
                        Injection calendar
                      </CardTitle>
                      <CardDescription>
                        Scheduled injections are highlighted. Logged injections are outlined.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        modifiers={{
                          scheduled: scheduledDates,
                          archived: archivedDates,
                          logged: loggedDates,
                        }}
                        modifiersClassNames={{
                          scheduled:
                            "bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30",
                          archived:
                            "bg-muted/40 text-muted-foreground hover:bg-muted/60",
                          logged:
                            "ring-1 ring-cyan-400/70 text-cyan-100 hover:bg-cyan-500/20",
                        }}
                        className="rounded-xl border border-border/60 bg-background/40"
                      />
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="border-emerald-400/60 text-emerald-200">
                          Scheduled
                        </Badge>
                        <Badge variant="outline" className="border-cyan-400/60 text-cyan-200">
                          Logged
                        </Badge>
                        <Badge variant="outline" className="border-border/70 text-muted-foreground">
                          Archived protocol
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 bg-card/70">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="size-4 text-cyan-300" />
                        {selectedDate ? formatDate(selectedDate) : "Day details"}
                      </CardTitle>
                      <CardDescription>
                        Log injections, edit history, or start a new protocol.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          className="gap-2"
                          size="sm"
                          onClick={() => handleOpenLogDialog()}
                          disabled={!activeProtocol}
                        >
                          <Plus className="size-4" />
                          Log injection
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={handleOpenProtocolDialog}
                        >
                          <Repeat className="size-4" />
                          Start new protocol
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <p className="text-xs uppercase text-muted-foreground">Schedule</p>
                        {selectedDate && scheduledDates.some((date) => isSameDay(date, selectedDate)) ? (
                          <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm">
                            <div>
                              <p className="font-medium">Scheduled injection</p>
                              <p className="text-xs text-muted-foreground">
                                {activeProtocol?.name ?? "Active protocol"}
                              </p>
                            </div>
                            <Badge variant="outline">Upcoming</Badge>
                          </div>
                        ) : selectedDate && archivedDates.some((date) => isSameDay(date, selectedDate)) ? (
                          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3 text-sm">
                            <div>
                              <p className="font-medium">Archived protocol schedule</p>
                              <p className="text-xs text-muted-foreground">Past protocol</p>
                            </div>
                            <Badge variant="outline">History</Badge>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No scheduled injections for this day.
                          </p>
                        )}
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <p className="text-xs uppercase text-muted-foreground">Logged injections</p>
                        {injectionsLoading ? (
                          <p className="text-sm text-muted-foreground">Loading logs...</p>
                        ) : logsForSelectedDate.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No logged injections for this day.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {logsForSelectedDate.map((log) => (
                              <div
                                key={log.id}
                                className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 p-3"
                              >
                                <div>
                                  <p className="text-sm font-medium">
                                    {formatNumber(log.doseMl)} mL · {formatNumber(log.doseMg)} mg
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {protocolLookup.get(log.protocolId)?.name ?? "Protocol"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {log.notes || "No notes"}
                                  </p>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleOpenLogDialog(log)}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

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
