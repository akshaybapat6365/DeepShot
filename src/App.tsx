import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { toJpeg } from "html-to-image";
import { toast } from "sonner";

import { CycleListDialog } from "@/components/CycleListDialog";
import { BloodWorkDialog } from "@/components/BloodWorkDialog";
import { InstallPrompt } from "@/components/InstallPrompt";
import { NotificationCenter } from "@/components/NotificationCenter";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { SettingsDialog } from "@/components/SettingsDialog";
import { AppHeader } from "@/components/layout/AppHeader";
import { CalendarPanel } from "@/components/calendar/CalendarPanel";
import { CycleSidebar } from "@/components/cycles/CycleSidebar";
import { DashboardContent } from "@/components/layout/DashboardContent";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { MobileNav } from "@/components/layout/MobileNav";
import { PullToRefreshIndicator } from "@/components/layout/PullToRefreshIndicator";
import { InjectionDialog } from "@/components/InjectionDialog";
import { ProtocolDialog } from "@/components/ProtocolDialog";
import {
  NoActiveCycleScreen,
  SignedOutScreen,
} from "@/components/layout/EmptyStates";
import { useAuth } from "@/hooks/useAuth";
import { useActiveMetrics } from "@/hooks/useActiveMetrics";
import { useCalendarData } from "@/hooks/useCalendarData";
import { type Injection, useInjections } from "@/hooks/useInjections";
import { useInsightsData } from "@/hooks/useInsightsData";
import { useOptimisticInjections } from "@/hooks/useOptimisticInjections";
import { type Protocol, useProtocols } from "@/hooks/useProtocols";
import { useProtocolLayers } from "@/hooks/useProtocolLayers";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useNotifications } from "@/hooks/useNotifications";
import { type BloodWork, useBloodWork } from "@/hooks/useBloodWork";
import { formatAuthError } from "@/lib/authErrors";
import { login, logout } from "@/lib/auth";
import {
  ensureUserDocument,
  restoreInjection,
  restoreProtocol,
  setActiveProtocol,
  trashInjection,
  trashProtocol,
  deleteBloodWork,
} from "@/lib/firestore";
import { formatExportDate, startOfDay } from "@/lib/date";

function App() {
  const { user, loading: authLoading, error: authError } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const { protocols, loading: protocolsLoading } = useProtocols(
    user?.uid,
    refreshKey
  );
  const { injections, loading: injectionsLoading } = useInjections(
    user?.uid,
    refreshKey
  );
  const hasLogs = injections.length > 0;
  const { bloodWork } = useBloodWork(user?.uid, refreshKey);
  const { optimisticInjections, addOptimistic, resolveOptimistic } =
    useOptimisticInjections();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { settings: userSettings } = useUserSettings(user?.uid);
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding(user?.uid);

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
  const [mobileView, setMobileView] = useState<"calendar" | "cycles" | "insights">(
    "calendar"
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [bloodWorkDialogOpen, setBloodWorkDialogOpen] = useState(false);
  const [editingBloodWork, setEditingBloodWork] = useState<BloodWork | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const { pullDistance, refreshing, bind } = usePullToRefresh(mainRef, {
    enabled: isMobile && Boolean(user),
    onRefresh: async () => {
      setRefreshKey((prev) => prev + 1);
      await new Promise((resolve) => setTimeout(resolve, 600));
    },
  });

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

  const injectionsClean = useMemo(
    () => injections.filter((injection) => !injection.isTrashed),
    [injections]
  );
  const trashedInjections = useMemo(
    () => injections.filter((injection) => injection.isTrashed),
    [injections]
  );

  const mergedInjections = useMemo(
    () => [...optimisticInjections, ...injectionsClean],
    [optimisticInjections, injectionsClean]
  );

  const {
    trashedProtocols,
    visibleProtocols,
    orderedProtocols,
    protocolLookup,
    activeProtocol,
    toggleProtocolVisibility,
  } = useProtocolLayers(protocols);

  const focusActiveEnabled = focusActive && !!activeProtocol;

  const {
    activeLastLog,
    nextInjectionDate,
    nextInjectionWithinRange,
    daysRemaining,
    mgPerInjection,
    mgPerWeek,
  } = useActiveMetrics({
    activeProtocol,
    injections: mergedInjections,
  });

  const {
    monthGrid,
    scheduleByDate,
    loggedSummary,
    logsByDate,
    monthStats,
    selectedKey,
    selectedLogs,
    selectedScheduledProtocols,
    selectedStatus,
    selectedDose,
    isSelectedPast,
    protocolDoseMap,
  } = useCalendarData({
    viewDate,
    selectedDate,
    protocols: orderedProtocols,
    visibleProtocols,
    injections: mergedInjections,
    protocolLookup,
    firstInjectionDate: injections.length > 0 
      ? injections.reduce((earliest, inj) => 
          inj.date < earliest ? inj.date : earliest, 
          injections[0].date
        )
      : null,
    hasLogs,
  });

  const insights = useInsightsData({
    injections: mergedInjections,
    monthStats,
  });

  const { notificationCount, missedCount } = useNotifications({
    activeProtocol,
    nextInjectionDate,
    daysRemaining,
    monthStats,
    currentStreak: insights.streakData?.currentStreak ?? 0,
    hasLogs,
  });

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

  const handleOpenBloodWorkDialog = (bw?: BloodWork) => {
    setEditingBloodWork(bw ?? null);
    setBloodWorkDialogOpen(true);
  };

  const handleBloodWorkDialogChange = (open: boolean) => {
    setBloodWorkDialogOpen(open);
    if (!open) {
      setEditingBloodWork(null);
    }
  };

  const handleDeleteBloodWork = async (bw: BloodWork) => {
    if (!user) return;
    try {
      await deleteBloodWork({ uid: user.uid, bloodWorkId: bw.id });
      toast.success("Blood work deleted.");
    } catch {
      toast.error("Could not delete blood work.");
    }
  };

  if (authLoading || protocolsLoading || injectionsLoading) {
    return <LoadingScreen />;
  }

  const calendarProps: ComponentProps<typeof CalendarPanel> = {
    calendarRef,
    viewDate,
    onPrev: () => shiftMonth(-1),
    onNext: () => shiftMonth(1),
    onToday: jumpToToday,
    onExport: handleExportCalendar,
    monthStats,
    activeProtocol,
    orderedProtocols,
    visibleProtocols,
    focusActiveEnabled,
    onSetActive: handleSetActiveCycle,
    isMobile,
    hasLogs,
    monthGrid,
    scheduleByDate,
    logsByDate,
    loggedSummary,
    selectedDate,
    protocolLookup,
    protocolDoseMap,
    onSelectDate: handleSelectDate,
    today,
    onPrevMonth: () => shiftMonth(-1),
    onNextMonth: () => shiftMonth(1),
  };

  const cyclesProps: ComponentProps<typeof CycleSidebar> = {
    activeProtocol: activeProtocol!,
    activeLastLog,
    nextInjectionDate,
    nextInjectionWithinRange,
    daysRemaining,
    mgPerInjection,
    mgPerWeek,
    orderedProtocols,
    visibleProtocols,
    focusActiveEnabled,
    showTrash,
    trashedProtocols,
    trashedInjections,
    selectedDate,
    selectedStatus,
    selectedDose,
    selectedKey,
    selectedScheduledProtocols,
    selectedLogs,
    isSelectedPast,
    protocolLookup,
    hasLogs,
    onToggleFocus: () => setFocusActive((prev) => !prev),
    onToggleTrash: () => setShowTrash((prev) => !prev),
    onOpenNewCycle: handleOpenNewCycle,
    onSetActive: handleSetActiveCycle,
    onToggleVisibility: toggleProtocolVisibility,
    onEdit: handleEditCycle,
    onTrash: handleTrashProtocol,
    onRestoreProtocol: handleRestoreProtocol,
    onRestoreInjection: handleRestoreInjection,
    onEditLog: (log) => handleOpenLogDialog(log),
    onTrashLog: handleTrashInjection,
  };

  const insightsProps = {
    trendData: insights.trendData,
    weeklyData: insights.weeklyData,
    monthlyData: insights.monthlyData,
    heatmap: insights.heatmap,
    adherence: insights.adherence,
    streakData: insights.streakData,
    bloodWork,
    onAddBloodWork: () => handleOpenBloodWorkDialog(),
    onEditBloodWork: handleOpenBloodWorkDialog,
    onDeleteBloodWork: handleDeleteBloodWork,
  };

  return (
    <div className="min-h-screen app-shell text-foreground flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
      >
        Skip to content
      </a>
      <AppHeader
        user={user}
        activeProtocol={activeProtocol}
        onLogin={handleLogin}
        onOpenLog={() => handleOpenLogDialog()}
        onOpenCycles={handleOpenCycleList}
        onOpenNewCycle={handleOpenNewCycle}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        notificationCount={notificationCount}
      />

      <main
        id="main-content"
        ref={mainRef}
        className={`flex-1 min-h-0 flex flex-col overflow-auto relative ${
          isMobile && user && activeProtocol ? "pb-24" : ""
        }`}
        {...(isMobile ? bind : {})}
      >
        {isMobile && <PullToRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} />}
        {!user ? (
          <SignedOutScreen onLogin={handleLogin} />
        ) : user && hasCompletedOnboarding === false && !activeProtocol ? (
          <OnboardingWizard
            onComplete={completeOnboarding}
            onCreateCycle={handleOpenNewCycle}
          />
        ) : !activeProtocol ? (
          <NoActiveCycleScreen onCreate={handleOpenNewCycle} />
        ) : (
          <div className="flex-1 min-h-0 p-3 md:p-4">
            <DashboardContent
              isMobile={isMobile}
              mobileView={mobileView}
              calendarProps={calendarProps}
              cyclesProps={cyclesProps}
              insightsProps={insightsProps}
            />
          </div>
        )}
      </main>

      {isMobile && user && activeProtocol && (
        <MobileNav value={mobileView} onChange={setMobileView} />
      )}

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
        onOptimisticLog={addOptimistic}
        onOptimisticResolve={resolveOptimistic}
      />

      <ProtocolDialog
        open={protocolDialogOpen}
        onOpenChange={setProtocolDialogOpen}
        uid={user?.uid}
        mode={protocolDialogMode}
        initialProtocol={
          editingProtocol ?? (protocolDialogMode === "edit" ? activeProtocol : null)
        }
        defaultStartDate={selectedDate}
      />

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={user}
        settings={userSettings}
        onLogout={handleLogout}
        protocols={protocols}
        injections={injections}
        protocolLookup={protocolLookup}
      />

      <NotificationCenter
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        activeProtocol={activeProtocol}
        nextInjectionDate={nextInjectionDate}
        daysRemaining={daysRemaining}
        missedCount={missedCount}
        currentStreak={insights.streakData?.currentStreak ?? 0}
        onLogInjection={() => handleOpenLogDialog()}
      />

      <BloodWorkDialog
        open={bloodWorkDialogOpen}
        onOpenChange={handleBloodWorkDialogChange}
        uid={user?.uid}
        initialBloodWork={editingBloodWork}
      />

      <InstallPrompt />
    </div>
  );
}

export default App;
