export function OrganicShapes({ className }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      <div
        className="blob absolute w-[500px] h-[500px] bg-gradient-to-br from-[#FF9500]/30 to-[#FF6D00]/20"
        style={{ top: "-10%", left: "-10%" }}
      />
      <div
        className="blob absolute w-[400px] h-[400px] bg-gradient-to-br from-[#8B5CF6]/20 to-[#7C3AED]/10"
        style={{
          bottom: "-5%",
          right: "-5%",
          animationDelay: "-5s",
        }}
      />
      <div
        className="blob absolute w-[300px] h-[300px] bg-gradient-to-br from-[#10B981]/20 to-[#059669]/10"
        style={{
          top: "40%",
          right: "10%",
          animationDelay: "-10s",
        }}
      />
    </div>
  );
}
