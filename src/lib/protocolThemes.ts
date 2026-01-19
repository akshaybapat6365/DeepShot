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
    accent: "bg-[#F97316]",
    accentSoft: "bg-[#F97316]/20",
    accentText: "text-[#FDBA74]",
    border: "border-[#FDBA74]/60",
    ring: "ring-[#F97316]/70",
    chip: "border-[#F97316]/45 bg-[#F97316]/20 text-[#FED7AA]",
    glow: "shadow-[0_0_18px_rgba(249,115,22,0.6)]",
  },
  {
    key: "cobalt",
    name: "Cobalt",
    accent: "bg-[#3B82F6]",
    accentSoft: "bg-[#3B82F6]/20",
    accentText: "text-[#BFDBFE]",
    border: "border-[#60A5FA]/60",
    ring: "ring-[#3B82F6]/70",
    chip: "border-[#3B82F6]/45 bg-[#3B82F6]/20 text-[#DBEAFE]",
    glow: "shadow-[0_0_18px_rgba(59,130,246,0.6)]",
  },
  {
    key: "cyan",
    name: "Cyan",
    accent: "bg-[#22D3EE]",
    accentSoft: "bg-[#22D3EE]/20",
    accentText: "text-[#BAF6FF]",
    border: "border-[#22D3EE]/55",
    ring: "ring-[#22D3EE]/70",
    chip: "border-[#22D3EE]/40 bg-[#22D3EE]/20 text-[#CFFAFE]",
    glow: "shadow-[0_0_18px_rgba(34,211,238,0.55)]",
  },
  {
    key: "rose",
    name: "Rose",
    accent: "bg-[#F43F5E]",
    accentSoft: "bg-[#F43F5E]/20",
    accentText: "text-[#FDA4AF]",
    border: "border-[#FDA4AF]/60",
    ring: "ring-[#F43F5E]/70",
    chip: "border-[#F43F5E]/45 bg-[#F43F5E]/20 text-[#FECACA]",
    glow: "shadow-[0_0_18px_rgba(244,63,94,0.55)]",
  },
  {
    key: "lime",
    name: "Lime",
    accent: "bg-[#A3E635]",
    accentSoft: "bg-[#A3E635]/20",
    accentText: "text-[#D9F99D]",
    border: "border-[#A3E635]/55",
    ring: "ring-[#A3E635]/65",
    chip: "border-[#A3E635]/40 bg-[#A3E635]/20 text-[#ECFCCB]",
    glow: "shadow-[0_0_18px_rgba(163,230,53,0.5)]",
  },
  {
    key: "graphite",
    name: "Graphite",
    accent: "bg-[#94A3B8]",
    accentSoft: "bg-[#94A3B8]/18",
    accentText: "text-[#E2E8F0]",
    border: "border-[#94A3B8]/50",
    ring: "ring-[#94A3B8]/55",
    chip: "border-[#94A3B8]/35 bg-[#94A3B8]/20 text-[#E2E8F0]",
    glow: "shadow-[0_0_16px_rgba(148,163,184,0.4)]",
  },
];

export const getProtocolTheme = (key?: string | null) =>
  PROTOCOL_THEMES.find((theme) => theme.key === key) ?? PROTOCOL_THEMES[0];
