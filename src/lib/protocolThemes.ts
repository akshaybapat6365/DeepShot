export type ProtocolTheme = {
  key: string;
  name: string;
  accent: string;
  accentHex: string;
  accentSoft: string;
  accentText: string;
  border: string;
  ring: string;
  chip: string;
  glow: string;
  gradient: string;
};

// DeepShot Color Palette - Inspired by App Icon
// Core: Amber/Orange energy (living core) with deep void blacks
// Philosophy: Warm, energetic, medical precision with cosmic depth

export const PROTOCOL_THEMES: ProtocolTheme[] = [
  {
    key: "amber",
    name: "Amber",
    accent: "bg-[#FF9500]",
    accentHex: "#FF9500",
    accentSoft: "bg-[#FF9500]/20",
    accentText: "text-[#FFB84D]",
    border: "border-[#FF9500]/50",
    ring: "ring-[#FF9500]/60",
    chip: "border-[#FF9500]/40 bg-[#FF9500]/15 text-[#FFB84D]",
    glow: "shadow-[0_0_30px_rgba(255,149,0,0.4)]",
    gradient: "from-[#FF9500] to-[#FF6D00]",
  },
  {
    key: "orange",
    name: "Orange",
    accent: "bg-[#FF6D00]",
    accentHex: "#FF6D00",
    accentSoft: "bg-[#FF6D00]/20",
    accentText: "text-[#FF9E4D]",
    border: "border-[#FF6D00]/50",
    ring: "ring-[#FF6D00]/60",
    chip: "border-[#FF6D00]/40 bg-[#FF6D00]/15 text-[#FF9E4D]",
    glow: "shadow-[0_0_30px_rgba(255,109,0,0.4)]",
    gradient: "from-[#FF6D00] to-[#E65100]",
  },
  {
    key: "coral",
    name: "Coral",
    accent: "bg-[#FF7043]",
    accentHex: "#FF7043",
    accentSoft: "bg-[#FF7043]/20",
    accentText: "text-[#FF9E80]",
    border: "border-[#FF7043]/50",
    ring: "ring-[#FF7043]/60",
    chip: "border-[#FF7043]/40 bg-[#FF7043]/15 text-[#FF9E80]",
    glow: "shadow-[0_0_30px_rgba(255,112,67,0.4)]",
    gradient: "from-[#FF7043] to-[#F4511E]",
  },
  {
    key: "gold",
    name: "Gold",
    accent: "bg-[#FFD740]",
    accentHex: "#FFD740",
    accentSoft: "bg-[#FFD740]/20",
    accentText: "text-[#FFE57F]",
    border: "border-[#FFD740]/50",
    ring: "ring-[#FFD740]/60",
    chip: "border-[#FFD740]/40 bg-[#FFD740]/15 text-[#FFE57F]",
    glow: "shadow-[0_0_30px_rgba(255,215,64,0.4)]",
    gradient: "from-[#FFD740] to-[#FFC400]",
  },
  {
    key: "rose",
    name: "Rose",
    accent: "bg-[#FF5252]",
    accentHex: "#FF5252",
    accentSoft: "bg-[#FF5252]/20",
    accentText: "text-[#FF8A80]",
    border: "border-[#FF5252]/50",
    ring: "ring-[#FF5252]/60",
    chip: "border-[#FF5252]/40 bg-[#FF5252]/15 text-[#FF8A80]",
    glow: "shadow-[0_0_30px_rgba(255,82,82,0.4)]",
    gradient: "from-[#FF5252] to-[#D32F2F]",
  },
  {
    key: "crimson",
    name: "Crimson",
    accent: "bg-[#E53935]",
    accentHex: "#E53935",
    accentSoft: "bg-[#E53935]/20",
    accentText: "text-[#EF5350]",
    border: "border-[#E53935]/50",
    ring: "ring-[#E53935]/60",
    chip: "border-[#E53935]/40 bg-[#E53935]/15 text-[#EF5350]",
    glow: "shadow-[0_0_30px_rgba(229,57,53,0.4)]",
    gradient: "from-[#E53935] to-[#C62828]",
  },
  {
    key: "sunset",
    name: "Sunset",
    accent: "bg-[#FF4081]",
    accentHex: "#FF4081",
    accentSoft: "bg-[#FF4081]/20",
    accentText: "text-[#FF80AB]",
    border: "border-[#FF4081]/50",
    ring: "ring-[#FF4081]/60",
    chip: "border-[#FF4081]/40 bg-[#FF4081]/15 text-[#FF80AB]",
    glow: "shadow-[0_0_30px_rgba(255,64,129,0.4)]",
    gradient: "from-[#FF4081] to-[#F50057]",
  },
  {
    key: "plasma",
    name: "Plasma",
    accent: "bg-[#7C4DFF]",
    accentHex: "#7C4DFF",
    accentSoft: "bg-[#7C4DFF]/20",
    accentText: "text-[#B388FF]",
    border: "border-[#7C4DFF]/50",
    ring: "ring-[#7C4DFF]/60",
    chip: "border-[#7C4DFF]/40 bg-[#7C4DFF]/15 text-[#B388FF]",
    glow: "shadow-[0_0_30px_rgba(124,77,255,0.4)]",
    gradient: "from-[#7C4DFF] to-[#651FFF]",
  },
  {
    key: "cyan",
    name: "Cyan",
    accent: "bg-[#00BCD4]",
    accentHex: "#00BCD4",
    accentSoft: "bg-[#00BCD4]/20",
    accentText: "text-[#4DD0E1]",
    border: "border-[#00BCD4]/50",
    ring: "ring-[#00BCD4]/60",
    chip: "border-[#00BCD4]/40 bg-[#00BCD4]/15 text-[#4DD0E1]",
    glow: "shadow-[0_0_30px_rgba(0,188,212,0.4)]",
    gradient: "from-[#00BCD4] to-[#00ACC1]",
  },
  {
    key: "emerald",
    name: "Emerald",
    accent: "bg-[#00C853]",
    accentHex: "#00C853",
    accentSoft: "bg-[#00C853]/20",
    accentText: "text-[#69F0AE]",
    border: "border-[#00C853]/50",
    ring: "ring-[#00C853]/60",
    chip: "border-[#00C853]/40 bg-[#00C853]/15 text-[#69F0AE]",
    glow: "shadow-[0_0_30px_rgba(0,200,83,0.4)]",
    gradient: "from-[#00C853] to-[#00B248]",
  },
];

export const getProtocolTheme = (key?: string | null) =>
  PROTOCOL_THEMES.find((theme) => theme.key === key) ?? PROTOCOL_THEMES[0];

// Opacity Presets for Cycle Layering
export const CYCLE_OPACITY_PRESETS = [
  { label: "Ghost", value: 0.15 },
  { label: "Faint", value: 0.3 },
  { label: "Subtle", value: 0.5 },
  { label: "Visible", value: 0.7 },
  { label: "Strong", value: 0.85 },
  { label: "Full", value: 1 },
];

// DeepShot Brand Colors - Matching Icon
export const BRAND_COLORS = {
  // Core Living Core (from icon)
  core: {
    light: "#FFF9C4",
    mid: "#FFD740",
    main: "#FF6D00",
    dark: "#BF360C",
  },
  // Deep Void (from icon)
  void: {
    50: "#1A1A1A",
    100: "#141414",
    200: "#0F0F0F",
    300: "#0A0A0A",
    400: "#050505",
    500: "#000000",
  },
  // Accent Palette
  accent: {
    amber: "#FF9500",
    orange: "#FF6D00",
    coral: "#FF7043",
    gold: "#FFD740",
    rose: "#FF5252",
  },
};

// UI Semantic Colors
export const SEMANTIC_COLORS = {
  success: "#00C853",
  warning: "#FFAB00",
  error: "#FF5252",
  info: "#00BCD4",
};
