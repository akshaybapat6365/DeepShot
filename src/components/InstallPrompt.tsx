import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "deepshot_install_dismissed";

function getIsDismissed(): boolean {
  return localStorage.getItem(DISMISSED_KEY) === "true";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  
  const dismissed = useSyncExternalStore(
    subscribe,
    getIsDismissed,
    () => false
  );

  useEffect(() => {
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem(DISMISSED_KEY, "true");
    window.dispatchEvent(new Event("storage"));
  }, []);

  if (dismissed || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
      >
        <div className="bg-card border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Download className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Install DeepShot</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add to home screen for quick access
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0"
              onClick={handleDismiss}
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleDismiss}
            >
              Not now
            </Button>
            <Button size="sm" className="flex-1" onClick={handleInstall}>
              Install
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
