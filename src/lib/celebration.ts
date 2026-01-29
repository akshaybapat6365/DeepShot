export const canAnimate = () =>
  typeof window !== "undefined" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const triggerCelebration = async () => {
  if (!canAnimate()) return;
  const { default: confetti } = await import("canvas-confetti");
  confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 35,
    origin: { y: 0.8 },
    colors: ["#F97316", "#FDBA74", "#22D3EE", "#94A3B8"],
  });
};
