import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: "welcome",
    title: "Welcome to DeepShot",
    description: "Precision TRT tracking with a calendar built for clarity.",
    action: "Get Started",
  },
  {
    id: "cycle",
    title: "Create Your First Cycle",
    description: "Set your dosage, interval, and start date to begin tracking.",
    action: "Create Cycle",
  },
  {
    id: "log",
    title: "Log Your Injections",
    description:
      "Tap any day on the calendar to log a shot. We'll track your adherence.",
    action: "Got it",
  },
  {
    id: "insights",
    title: "Track Your Progress",
    description: "Monitor dosage trends, adherence rates, and cycle metrics.",
    action: "Start Tracking",
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }
  };

  if (!isVisible) return null;

  const currentStep = steps[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <GlassPanel
            variant="elevated"
            radius="xl"
            className="max-w-md w-full p-8 text-center"
          >
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === step
                      ? "w-8 bg-amber-500"
                      : i < step
                        ? "w-1.5 bg-amber-500/50"
                        : "w-1.5 bg-white/20",
                  )}
                />
              ))}
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-semibold text-white font-display mb-3"
            >
              {currentStep.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/60 mb-8"
            >
              {currentStep.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-xl"
                onClick={handleNext}
              >
                {currentStep.action}
              </Button>
            </motion.div>

            {step > 0 && (
              <button
                onClick={() => setIsVisible(false)}
                className="mt-4 text-sm text-white/40 hover:text-white/60"
              >
                Skip onboarding
              </button>
            )}
          </GlassPanel>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
