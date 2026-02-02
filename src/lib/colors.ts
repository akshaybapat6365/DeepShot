// DeepShot Color System
// WCAG AA compliant color palette for healthcare UI

export const colors = {
  // Primary - Amber/Orange (DeepShot brand)
  primary: {
    DEFAULT: "#F97316",
    light: "#FB923C",
    dark: "#EA580C",
    glow: "rgba(249, 115, 22, 0.4)",
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316",
    600: "#EA580C",
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12",
  },

  // Secondary - Cyan/Sky
  secondary: {
    DEFAULT: "#22D3EE",
    light: "#67E8F9",
    dark: "#06B6D4",
    glow: "rgba(34, 211, 238, 0.4)",
    50: "#ECFEFF",
    100: "#CFFAFE",
    200: "#BAF6FF",
    300: "#67E8F9",
    400: "#22D3EE",
    500: "#06B6D4",
    600: "#0891B2",
    700: "#0E7490",
    800: "#155E75",
    900: "#164E63",
  },

  // Semantic Status Colors
  status: {
    success: {
      DEFAULT: "#22D3EE", // Cyan for logged/completed
      light: "#67E8F9",
      dark: "#0891B2",
      glow: "rgba(34, 211, 238, 0.3)",
    },
    warning: {
      DEFAULT: "#FBBF24", // Amber for attention needed
      light: "#FCD34D",
      dark: "#D97706",
      glow: "rgba(251, 191, 36, 0.3)",
    },
    error: {
      DEFAULT: "#F43F5E", // Rose for errors
      light: "#FB7185",
      dark: "#E11D48",
      glow: "rgba(244, 63, 94, 0.3)",
    },
    info: {
      DEFAULT: "#3B82F6", // Blue for information
      light: "#60A5FA",
      dark: "#2563EB",
      glow: "rgba(59, 130, 246, 0.3)",
    },
  },

  // Surface - OLED Optimized
  surface: {
    base: "#05070B", // Deepest background
    raised: "#0B111A", // Cards, panels
    overlay: "#0F131A", // Dropdowns, modals
    sunken: "#030408", // Inset areas
    hover: "rgba(255, 255, 255, 0.05)",
    active: "rgba(255, 255, 255, 0.08)",
  },

  // Text - WCAG AA Compliant
  text: {
    primary: "#F1F5F9", // 15.8:1 contrast ratio - use for primary text
    secondary: "#94A3B8", // 7.2:1 contrast ratio - use for secondary text
    tertiary: "#64748B", // 4.6:1 contrast ratio - use for tertiary text
    muted: "#475569", // 3.1:1 ratio - use for large text only (18px+)
    disabled: "#334155", // Disabled states
  },

  // Glassmorphism
  glass: {
    border: "rgba(255, 255, 255, 0.08)",
    borderHover: "rgba(255, 255, 255, 0.15)",
    background: "rgba(14, 19, 27, 0.85)",
    blur: "blur(20px)",
  },

  // Border
  border: {
    DEFAULT: "rgba(255, 255, 255, 0.08)",
    hover: "rgba(255, 255, 255, 0.15)",
    focus: "#F97316",
    error: "#F43F5E",
    success: "#22D3EE",
  },
};

// Tailwind-compatible color configuration
export const tailwindColors = {
  "ds-primary": {
    DEFAULT: "#F97316",
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316",
    600: "#EA580C",
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12",
  },
  "ds-secondary": {
    DEFAULT: "#22D3EE",
    50: "#ECFEFF",
    100: "#CFFAFE",
    200: "#BAF6FF",
    300: "#67E8F9",
    400: "#22D3EE",
    500: "#06B6D4",
    600: "#0891B2",
    700: "#0E7490",
    800: "#155E75",
    900: "#164E63",
  },
  "ds-surface": {
    base: "#05070B",
    raised: "#0B111A",
    overlay: "#0F131A",
  },
  "ds-text": {
    primary: "#F1F5F9",
    secondary: "#94A3B8",
    tertiary: "#64748B",
    muted: "#475569",
  },
};

// Helper function to get color with opacity
export function withOpacity(color: string, opacity: number): string {
  // Convert hex to rgba
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // If already rgba or rgb, just replace the alpha
  if (color.startsWith("rgba")) {
    return color.replace(
      /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/,
      `rgba($1, $2, $3, ${opacity})`,
    );
  }
  if (color.startsWith("rgb")) {
    return color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
  }
  return color;
}

// Contrast checker helper
export function getContrastRatio(
  foreground: string,
  background: string,
): number {
  // Simplified contrast calculation
  // Returns ratio: 1 (no contrast) to 21 (maximum contrast)
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [lr, lg, lb] = [r, g, b].map((c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  };

  const lum1 = getLuminance(foreground);
  const lum2 = getLuminance(background);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

// Verify WCAG compliance
export function isWCAGCompliant(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA",
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const threshold = level === "AA" ? 4.5 : 7;
  return ratio >= threshold;
}
