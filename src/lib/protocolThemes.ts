export type ProtocolTheme = {
  key: string;
  name: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  border: string;
  ring: string;
  chip: string;
  glow: string;
  gradient: string;
};

export const PROTOCOL_THEMES: ProtocolTheme[] = [
  {
    key: "amber",
    name: "Amber Gold",
    accent: "bg-amber-500",
    accentSoft: "bg-amber-500/20",
    accentText: "text-amber-400",
    border: "border-amber-500/50",
    ring: "ring-amber-500/60",
    chip: "border-amber-500/40 bg-amber-500/15 text-amber-300",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.35)]",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    key: "emerald",
    name: "Emerald",
    accent: "bg-emerald-500",
    accentSoft: "bg-emerald-500/20",
    accentText: "text-emerald-400",
    border: "border-emerald-500/50",
    ring: "ring-emerald-500/60",
    chip: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.35)]",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    key: "sapphire",
    name: "Sapphire",
    accent: "bg-blue-500",
    accentSoft: "bg-blue-500/20",
    accentText: "text-blue-400",
    border: "border-blue-500/50",
    ring: "ring-blue-500/60",
    chip: "border-blue-500/40 bg-blue-500/15 text-blue-300",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.35)]",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    key: "violet",
    name: "Royal Violet",
    accent: "bg-violet-500",
    accentSoft: "bg-violet-500/20",
    accentText: "text-violet-400",
    border: "border-violet-500/50",
    ring: "ring-violet-500/60",
    chip: "border-violet-500/40 bg-violet-500/15 text-violet-300",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.35)]",
    gradient: "from-violet-400 to-purple-500",
  },
  {
    key: "rose",
    name: "Rose Gold",
    accent: "bg-rose-500",
    accentSoft: "bg-rose-500/20",
    accentText: "text-rose-400",
    border: "border-rose-500/50",
    ring: "ring-rose-500/60",
    chip: "border-rose-500/40 bg-rose-500/15 text-rose-300",
    glow: "shadow-[0_0_30px_rgba(244,63,94,0.35)]",
    gradient: "from-rose-400 to-pink-500",
  },
  {
    key: "cyan",
    name: "Cyan",
    accent: "bg-cyan-500",
    accentSoft: "bg-cyan-500/20",
    accentText: "text-cyan-400",
    border: "border-cyan-500/50",
    ring: "ring-cyan-500/60",
    chip: "border-cyan-500/40 bg-cyan-500/15 text-cyan-300",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.35)]",
    gradient: "from-cyan-400 to-sky-500",
  },
  {
    key: "slate",
    name: "Graphite",
    accent: "bg-slate-500",
    accentSoft: "bg-slate-500/20",
    accentText: "text-slate-400",
    border: "border-slate-500/50",
    ring: "ring-slate-500/60",
    chip: "border-slate-500/40 bg-slate-500/15 text-slate-300",
    glow: "shadow-[0_0_30px_rgba(100,116,139,0.3)]",
    gradient: "from-slate-400 to-zinc-500",
  },
];

export const getProtocolTheme = (key?: string | null) =>
  PROTOCOL_THEMES.find((theme) => theme.key === key) ?? PROTOCOL_THEMES[0];

// Opacity presets for cycle visibility
export const CYCLE_OPACITY_PRESETS = [
  { label: "Ghost", value: 0.15 },
  { label: "Faint", value: 0.3 },
  { label: "Subtle", value: 0.5 },
  { label: "Visible", value: 0.7 },
  { label: "Full", value: 1 },
];
