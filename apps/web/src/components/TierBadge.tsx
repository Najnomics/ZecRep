"use client";

interface TierBadgeProps {
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  size?: "sm" | "md" | "lg";
}

const tierConfig = {
  BRONZE: { emoji: "🥉", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30" },
  SILVER: { emoji: "🥈", color: "text-gray-300", bg: "bg-gray-300/10", border: "border-gray-300/30" },
  GOLD: { emoji: "🥇", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30" },
  PLATINUM: { emoji: "💎", color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/30" },
};

export function TierBadge({ tier, size = "md" }: TierBadgeProps) {
  const config = tierConfig[tier];
  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "text-base px-3 py-1.5",
    lg: "text-lg px-4 py-2",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.border} ${config.bg} ${config.color} ${sizeClasses[size]} font-medium`}
    >
      <span>{config.emoji}</span>
      <span>{tier}</span>
    </span>
  );
}

