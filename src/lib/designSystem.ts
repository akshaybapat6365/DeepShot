// DeepShot Design System - Comprehensive Color Palette
// Based on modern healthcare/medical app design principles

export const COLORS = {
  // Base
  background: "#000000",
  surface: "#0A0A0A",
  surfaceElevated: "#111111",

  // Primary - Medical Teal
  primary: {
    50: "#F0FDFA",
    100: "#CCFBF1",
    200: "#99F6E4",
    300: "#5EEAD4",
    400: "#2DD4BF",
    500: "#14B8A6",
    600: "#0D9488",
    700: "#0F766E",
    800: "#115E59",
    900: "#134E4A",
  },

  // Accent Colors - Coordinated Medical Palette
  accent: {
    coral: {
      main: "#F87171",
      light: "#FCA5A5",
      dark: "#EF4444",
      glow: "rgba(248,113,113,0.5)",
    },
    amber: {
      main: "#F59E0B",
      light: "#FCD34D",
      dark: "#D97706",
      glow: "rgba(245,158,11,0.5)",
    },
    emerald: {
      main: "#10B981",
      light: "#6EE7B7",
      dark: "#059669",
      glow: "rgba(16,185,129,0.5)",
    },
    blue: {
      main: "#3B82F6",
      light: "#93C5FD",
      dark: "#2563EB",
      glow: "rgba(59,130,246,0.5)",
    },
    violet: {
      main: "#8B5CF6",
      light: "#C4B5FD",
      dark: "#7C3AED",
      glow: "rgba(139,92,246,0.5)",
    },
    rose: {
      main: "#FB7185",
      light: "#FDA4AF",
      dark: "#F43F5E",
      glow: "rgba(251,113,133,0.5)",
    },
  },

  // Semantic
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Text
  text: {
    primary: "#FFFFFF",
    secondary: "rgba(255,255,255,0.7)",
    tertiary: "rgba(255,255,255,0.5)",
    muted: "rgba(255,255,255,0.3)",
  },

  // Border
  border: {
    subtle: "rgba(255,255,255,0.06)",
    light: "rgba(255,255,255,0.1)",
    medium: "rgba(255,255,255,0.15)",
    strong: "rgba(255,255,255,0.2)",
  },
};

// Opacity Scale - Dramatic Range for Visibility
export const OPACITY_SCALE = {
  invisible: 0,
  ghost: 0.1,
  faint: 0.25,
  subtle: 0.4,
  visible: 0.6,
  prominent: 0.8,
  full: 1,
};

// Cycle Theme Configuration
export const CYCLE_THEMES = [
  {
    key: "teal",
    name: "Teal",
    color: COLORS.primary[400],
    glow: COLORS.primary[200],
  },
  {
    key: "coral",
    name: "Coral",
    color: COLORS.accent.coral.main,
    glow: COLORS.accent.coral.light,
  },
  {
    key: "amber",
    name: "Amber",
    color: COLORS.accent.amber.main,
    glow: COLORS.accent.amber.light,
  },
  {
    key: "emerald",
    name: "Emerald",
    color: COLORS.accent.emerald.main,
    glow: COLORS.accent.emerald.light,
  },
  {
    key: "blue",
    name: "Blue",
    color: COLORS.accent.blue.main,
    glow: COLORS.accent.blue.light,
  },
  {
    key: "violet",
    name: "Violet",
    color: COLORS.accent.violet.main,
    glow: COLORS.accent.violet.light,
  },
  {
    key: "rose",
    name: "Rose",
    color: COLORS.accent.rose.main,
    glow: COLORS.accent.rose.light,
  },
];

export const getCycleTheme = (key?: string | null) =>
  CYCLE_THEMES.find((theme) => theme.key === key) ?? CYCLE_THEMES[0];
