export const formatAuthError = (error: unknown) => {
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
