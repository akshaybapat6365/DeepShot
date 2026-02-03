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

// Cohesive Healthcare Color Palette
// Primary: Soft Teal/Cyan - Medical, calming, professional
// Accents: Coral, Amber, Emerald, Blue, Rose, Purple - Coordinated set

export const PROTOCOL_THEMES: ProtocolTheme[] = [
  {
    key: "teal",
    name: "Teal",
    accent: "bg-[#2DD4BF]",
    accentHex: "#2DD4BF",
    accentSoft: "bg-[#2DD4BF]/20",
    accentText: "text-[#5EEAD4]",
    border: "border-[#2DD4BF]/50",
    ring: "ring-[#2DD4BF]/60",
    chip: "border-[#2DD4BF]/40 bg-[#2DD4BF]/15 text-[#5EEAD4]",
    glow: "shadow-[0_0_30px_rgba(45,212,191,0.4)]",
    gradient: "from-[#2DD4BF] to-[#14B8A6]",
  },
  {
    key: "coral",
    name: "Coral",
    accent: "bg-[#F87171]",
    accentHex: "#F87171",
    accentSoft: "bg-[#F87171]/20",
    accentText: "text-[#FCA5A5]",
    border: "border-[#F87171]/50",
    ring: "ring-[#F87171]/60",
    chip: "border-[#F87171]/40 bg-[#F87171]/15 text-[#FCA5A5]",
    glow: "shadow-[0_0_30px_rgba(248,113,113,0.4)]",
    gradient: "from-[#F87171] to-[#EF4444]",
  },
  {
    key: "amber",
    name: "Amber",
    accent: "bg-[#FBBF24]",
    accentHex: "#FBBF24",
    accentSoft: "bg-[#FBBF24]/20",
    accentText: "text-[#FCD34D]",
    border: "border-[#FBBF24]/50",
    ring: "ring-[#FBBF24]/60",
    chip: "border-[#FBBF24]/40 bg-[#FBBF24]/15 text-[#FCD34D]",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.4)]",
    gradient: "from-[#FBBF24] to-[#F59E0B]",
  },
  {
    key: "emerald",
    name: "Emerald",
    accent: "bg-[#34D399]",
    accentHex: "#34D399",
    accentSoft: "bg-[#34D399]/20",
    accentText: "text-[#6EE7B7]",
    border: "border-[#34D399]/50",
    ring: "ring-[#34D399]/60",
    chip: "border-[#34D399]/40 bg-[#34D399]/15 text-[#6EE7B7]",
    glow: "shadow-[0_0_30px_rgba(52,211,153,0.4)]",
    gradient: "from-[#34D399] to-[#10B981]",
  },
  {
    key: "blue",
    name: "Blue",
    accent: "bg-[#60A5FA]",
    accentHex: "#60A5FA",
    accentSoft: "bg-[#60A5FA]/20",
    accentText: "text-[#93C5FD]",
    border: "border-[#60A5FA]/50",
    ring: "ring-[#60A5FA]/60",
    chip: "border-[#60A5FA]/40 bg-[#60A5FA]/15 text-[#93C5FD]",
    glow: "shadow-[0_0_30px_rgba(96,165,250,0.4)]",
    gradient: "from-[#60A5FA] to-[#3B82F6]",
  },
  {
    key: "rose",
    name: "Rose",
    accent: "bg-[#FB7185]",
    accentHex: "#FB7185",
    accentSoft: "bg-[#FB7185]/20",
    accentText: "text-[#FDA4AF]",
    border: "border-[#FB7185]/50",
    ring: "ring-[#FB7185]/60",
    chip: "border-[#FB7185]/40 bg-[#FB7185]/15 text-[#FDA4AF]",
    glow: "shadow-[0_0_30px_rgba(251,113,133,0.4)]",
    gradient: "from-[#FB7185] to-[#F43F5E]",
  },
  {
    key: "purple",
    name: "Purple",
    accent: "bg-[#A78BFA]",
    accentHex: "#A78BFA",
    accentSoft: "bg-[#A78BFA]/20",
    accentText: "text-[#C4B5FD]",
    border: "border-[#A78BFA]/50",
    ring: "ring-[#A78BFA]/60",
    chip: "border-[#A78BFA]/40 bg-[#A78BFA]/15 text-[#C4B5FD]",
    glow: "shadow-[0_0_30px_rgba(167,139,250,0.4)]",
    gradient: "from-[#A78BFA] to-[#8B5CF6]",
  },
];

export const getProtocolTheme = (key?: string | null) =>
  PROTOCOL_THEMES.find((theme) => theme.key === key) ?? PROTOCOL_THEMES[0];

// Improved Opacity Presets - Better Visual Range
export const CYCLE_OPACITY_PRESETS = [
  { label: "Ghost", value: 0.15 },
  { label: "Faint", value: 0.3 },
  { label: "Subtle", value: 0.5 },
  { label: "Visible", value: 0.7 },
  { label: "Strong", value: 0.85 },
  { label: "Full", value: 1 },
];
