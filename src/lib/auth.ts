import {
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

export async function login() {
  const provider = new GoogleAuthProvider();
  await ensurePersistence();

  try {
    await signInWithPopup(auth, provider);
    return;
  } catch (error) {
    const code = getAuthErrorCode(error);
    if (code && isPopupFallbackCode(code)) {
      if (shouldUseRedirect()) {
        await signInWithRedirect(auth, provider);
        return;
      }
      throw error;
    }
    if (shouldUseRedirect()) {
      await signInWithRedirect(auth, provider);
      return;
    }
    throw error;
  }
}

export async function logout() {
  await signOut(auth);
}

const shouldUseRedirect = () => {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent ?? "";
  const isMobile = /iphone|ipad|ipod|android/i.test(ua);
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  return isMobile || coarse;
};

const ensurePersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    await setPersistence(auth, browserSessionPersistence);
  }
};

const isPopupFallbackCode = (code: string) =>
  code === "auth/popup-blocked" ||
  code === "auth/popup-closed-by-user" ||
  code === "auth/operation-not-supported-in-this-environment" ||
  code === "auth/cancelled-popup-request";

const getAuthErrorCode = (error: unknown) => {
  if (!error || typeof error !== "object") return null;
  if ("code" in error && typeof error.code === "string") return error.code;
  return null;
};
