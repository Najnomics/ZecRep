"use client";

import { TierBadge } from "./TierBadge.js";
import { TIER_CONFIG } from "../lib/constants.js";

interface TierStatusProps {
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | null;
  score: number | null;
  loading?: boolean;
}

export function TierStatus({ tier, score, loading }: TierStatusProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded mb-2" />
        <div className="h-4 w-24 bg-white/10 rounded" />
      </div>
    );
  }

  if (!tier) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-slate-400 mb-2">No tier assigned</p>
        <p className="text-sm text-slate-500">
          Submit a proof to receive your ZecRep badge
        </p>
      </div>
    );
  }

  const config = TIER_CONFIG[tier];

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <TierBadge tier={tier} size="lg" />
        {score !== null && (
          <div className="text-right">
            <p className="text-sm text-slate-400">Score</p>
            <p className="text-2xl font-semibold text-white">{score}</p>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Volume Range</span>
          <span className="text-white">{config.range}</span>
        </div>
        
        <div className="pt-4 border-t border-white/10">
          <p className="text-sm font-medium text-white mb-2">Tier Benefits</p>
          <ul className="space-y-1 text-sm text-slate-300">
            {tier === "BRONZE" && (
              <>
                <li>• 5% fee rebates</li>
                <li>• 1.25x governance power</li>
                <li>• 1.125x yield multiplier</li>
              </>
            )}
            {tier === "SILVER" && (
              <>
                <li>• 10% fee rebates</li>
                <li>• +5% LTV boost</li>
                <li>• 1.5x governance power</li>
                <li>• 1.25x yield multiplier</li>
              </>
            )}
            {tier === "GOLD" && (
              <>
                <li>• 20% fee rebates</li>
                <li>• +10% LTV boost</li>
                <li>• 2x governance power</li>
                <li>• 1.5x yield multiplier</li>
                <li>• VIP liquidation protection</li>
              </>
            )}
            {tier === "PLATINUM" && (
              <>
                <li>• 30% fee rebates</li>
                <li>• +20% LTV boost</li>
                <li>• 3x governance power</li>
                <li>• 2x yield multiplier</li>
                <li>• Institutional APIs</li>
                <li>• Revenue sharing</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

