import { useSyncExternalStore, useCallback } from "react";

const ONBOARDING_KEY = "deepshot_onboarding_complete";

function getKey(userId: string) {
  return `${ONBOARDING_KEY}_${userId}`;
}

function getSnapshot(userId: string | undefined): boolean | null {
  if (!userId) return null;
  return localStorage.getItem(getKey(userId)) === "true";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useOnboarding(userId: string | undefined) {
  const hasCompletedOnboarding = useSyncExternalStore(
    subscribe,
    () => getSnapshot(userId),
    () => getSnapshot(userId)
  );

  const completeOnboarding = useCallback(() => {
    if (!userId) return;
    localStorage.setItem(getKey(userId), "true");
    window.dispatchEvent(new Event("storage"));
  }, [userId]);

  const resetOnboarding = useCallback(() => {
    if (!userId) return;
    localStorage.removeItem(getKey(userId));
    window.dispatchEvent(new Event("storage"));
  }, [userId]);

  return {
    hasCompletedOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
}
