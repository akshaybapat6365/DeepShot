import { motion } from "framer-motion";

interface AdherenceRingProps {
  scheduled: number;
  logged: number;
  size?: number;
  strokeWidth?: number;
}

export function AdherenceRing({
  scheduled,
  logged,
  size = 96,
  strokeWidth = 8,
}: AdherenceRingProps) {
  const percentage = scheduled > 0 ? Math.round((logged / scheduled) * 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="-rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F97316"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            filter: "drop-shadow(0 0 8px rgba(249, 115, 22, 0.4))",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold text-white font-display"
        >
          {percentage}%
        </motion.span>
        <span className="text-[10px] uppercase tracking-wider text-white/40">
          Adherence
        </span>
      </div>
    </div>
  );
}
