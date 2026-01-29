import { LogIn, Plus, Syringe, Calendar, TrendingUp, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";

type SignedOutScreenProps = {
  onLogin: () => void;
};

export function SignedOutScreen({ onLogin }: SignedOutScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="relative max-w-5xl w-full">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/30 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-20 right-12 h-64 w-64 rounded-full bg-accent/30 blur-[140px]" />

        <div className="relative grid gap-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-[#0b0e13]/75 to-[#0b0e13]/90 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.55)] md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          {/* Hero */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="size-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/30 flex items-center justify-center shadow-[0_0_80px_rgba(59,130,246,0.35)]">
                  <img src="/deepshot-icon.svg" alt="" className="size-12" />
                </div>
                <div className="absolute -bottom-2 -right-2 size-7 rounded-full bg-accent flex items-center justify-center shadow-[0_0_16px_rgba(34,211,238,0.5)]">
                  <Syringe className="size-3.5 text-accent-foreground" />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-primary/80">Protocol Intelligence</p>
                <h1 className="text-3xl md:text-4xl font-semibold font-display">DeepShot</h1>
              </div>
            </div>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Track every cycle with clarity. Visualize schedules, stay on pace, and keep
              your lab insights organized in one place.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <Calendar className="size-5 text-primary mb-2" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Schedule</p>
                <p className="text-sm font-medium">See every dose</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <TrendingUp className="size-5 text-accent mb-2" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Insights</p>
                <p className="text-sm font-medium">Spot trends fast</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <Shield className="size-5 text-emerald-400 mb-2" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Private</p>
                <p className="text-sm font-medium">Secure by design</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full gap-2 h-12 text-base shadow-[0_0_24px_rgba(59,130,246,0.45)]"
                onClick={onLogin}
              >
                <LogIn className="size-4" />
                Continue with Google
              </Button>
              <p className="text-xs text-muted-foreground">
                Your data is stored securely and never shared.
              </p>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-primary/20 to-transparent p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Cycle Signals</p>
              <p className="text-lg font-semibold mt-2">Color-coded calendars</p>
              <p className="text-sm text-muted-foreground mt-2">
                Every protocol is mapped to a unique color so you can scan patterns at a glance.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-accent/20 to-transparent p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-accent/80">Adherence</p>
              <p className="text-lg font-semibold mt-2">Stay on rhythm</p>
              <p className="text-sm text-muted-foreground mt-2">
                Track logged vs scheduled injections with instant visual feedback.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Lab Companion</p>
              <p className="text-lg font-semibold mt-2">Blood work in context</p>
              <p className="text-sm text-muted-foreground mt-2">
                Keep lab values alongside your cycle history to spot correlations faster.
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Get Started</p>
              <p className="text-sm text-muted-foreground mt-2">Sign in to build your first cycle.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type NoActiveCycleScreenProps = {
  onCreate: () => void;
};

export function NoActiveCycleScreen({ onCreate }: NoActiveCycleScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Illustration */}
        <div className="relative mx-auto w-fit">
          <div className="size-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-white/10 flex items-center justify-center">
            <Syringe className="size-10 text-primary/60" />
          </div>
          <div className="absolute -top-2 -right-2 size-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse">
            <Plus className="size-4 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div>
          <h2 className="text-xl font-bold font-display">Create Your First Cycle</h2>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            Set up your TRT protocol to start tracking injections and monitoring your schedule.
          </p>
        </div>

        {/* Steps preview */}
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">1</div>
            <div>
              <p className="text-sm font-medium">Set your dose</p>
              <p className="text-xs text-muted-foreground">mL per injection & concentration</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">2</div>
            <div>
              <p className="text-sm font-medium">Choose your schedule</p>
              <p className="text-xs text-muted-foreground">Daily, EOD, twice weekly, etc.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">3</div>
            <div>
              <p className="text-sm font-medium">Start tracking</p>
              <p className="text-xs text-muted-foreground">Log injections & monitor adherence</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button
          size="lg"
          className="w-full gap-2 h-12 text-base shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          onClick={onCreate}
        >
          <Plus className="size-5" />
          Create Your First Cycle
        </Button>
      </div>
    </div>
  );
}
