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
};

export const PROTOCOL_THEMES: ProtocolTheme[] = [
  {
    key: "ember",
    name: "Ember",
    accent: "bg-amber-400",
    accentSoft: "bg-amber-500/20",
    accentText: "text-amber-200",
    border: "border-amber-400/50",
    ring: "ring-amber-400/60",
    chip: "border-amber-400/40 bg-amber-500/20 text-amber-100",
    glow: "shadow-[0_0_12px_rgba(251,191,36,0.45)]",
  },
  {
    key: "sky",
    name: "Sky",
    accent: "bg-sky-400",
    accentSoft: "bg-sky-500/20",
    accentText: "text-sky-200",
    border: "border-sky-400/50",
    ring: "ring-sky-400/60",
    chip: "border-sky-400/40 bg-sky-500/20 text-sky-100",
    glow: "shadow-[0_0_12px_rgba(56,189,248,0.45)]",
  },
  {
    key: "cobalt",
    name: "Cobalt",
    accent: "bg-blue-500",
    accentSoft: "bg-blue-500/20",
    accentText: "text-blue-200",
    border: "border-blue-400/50",
    ring: "ring-blue-400/60",
    chip: "border-blue-400/40 bg-blue-500/20 text-blue-100",
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.45)]",
  },
  {
    key: "rose",
    name: "Rose",
    accent: "bg-rose-400",
    accentSoft: "bg-rose-500/20",
    accentText: "text-rose-200",
    border: "border-rose-400/50",
    ring: "ring-rose-400/60",
    chip: "border-rose-400/40 bg-rose-500/20 text-rose-100",
    glow: "shadow-[0_0_12px_rgba(251,113,133,0.45)]",
  },
  {
    key: "slate",
    name: "Slate",
    accent: "bg-slate-300",
    accentSoft: "bg-slate-400/20",
    accentText: "text-slate-200",
    border: "border-slate-300/50",
    ring: "ring-slate-300/60",
    chip: "border-slate-300/30 bg-slate-400/15 text-slate-100",
    glow: "shadow-[0_0_12px_rgba(148,163,184,0.4)]",
  },
];

export const getProtocolTheme = (key?: string | null) =>
  PROTOCOL_THEMES.find((theme) => theme.key === key) ?? PROTOCOL_THEMES[0];
