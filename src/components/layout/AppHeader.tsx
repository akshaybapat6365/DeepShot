import {
  Bell,
  Layers,
  LogIn,
  Plus,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { User } from "firebase/auth";

import type { Protocol } from "@/hooks/useProtocols";

type AppHeaderProps = {
  user: User | null;
  activeProtocol: Protocol | null;
  onLogin: () => void;
  onOpenLog: () => void;
  onOpenCycles: () => void;
  onOpenNewCycle: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  notificationCount: number;
};

export function AppHeader({
  user,
  activeProtocol,
  onLogin,
  onOpenLog,
  onOpenCycles,
  onOpenSettings,
  onOpenNotifications,
  notificationCount,
}: AppHeaderProps) {
  return (
    <header className="shrink-0 sticky top-0 z-20 border-b border-white/10 bg-[#0b0e13]/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 md:px-6">
        <div className="flex items-center gap-2">
          <img src="/deepshot-icon.svg" alt="" className="size-7" />
          <span className="text-sm font-semibold font-display tracking-wide">DeepShot</span>
        </div>

        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              <Button
                size="sm"
                className="h-8 gap-1.5 shadow-[0_0_16px_rgba(59,130,246,0.35)]"
                onClick={onOpenLog}
                disabled={!activeProtocol}
              >
                <Plus className="size-3.5" />
                <span className="hidden sm:inline text-xs">Log</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={onOpenCycles}
              >
                <Layers className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 relative text-muted-foreground hover:text-foreground"
                onClick={onOpenNotifications}
                aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount})` : ""}`}
              >
                <Bell className="size-3.5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={onOpenSettings}
                aria-label="Settings"
              >
                <Settings className="size-3.5" />
              </Button>
            </>
          ) : (
            <Button size="sm" className="h-8 gap-1.5" onClick={onLogin}>
              <LogIn className="size-3.5" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
