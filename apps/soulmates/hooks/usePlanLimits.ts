"use client";

import { useState, useEffect } from "react";
import { billingApi } from "@/lib/api";

interface PlanLimits {
  tier: "FREE" | "PLUS" | "COUPLE_PREMIUM";
  canRunCompatibility: boolean;
  canCreateBond: boolean;
  canAccessLab: boolean;
  runsRemaining: number | null; // null = unlimited
  bondsRemaining: number | null; // null = unlimited
  upgradeRequired: boolean;
  loading: boolean;
  error: string | null;
}

export function usePlanLimits(bondId?: string): PlanLimits {
  const [limits, setLimits] = useState<PlanLimits>({
    tier: "FREE",
    canRunCompatibility: true,
    canCreateBond: false,
    canAccessLab: false,
    runsRemaining: 5,
    bondsRemaining: 0,
    upgradeRequired: true,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadLimits = async () => {
      try {
        const data = await billingApi.getSubscription(bondId);
        const tier = (data.tier || "FREE") as "FREE" | "PLUS" | "COUPLE_PREMIUM";

        // Calculate limits based on tier
        const maxRuns = tier === "FREE" ? 5 : null; // null = unlimited
        const maxBonds = tier === "FREE" ? 0 : tier === "PLUS" ? 1 : null;

        // TODO: Get actual usage from backend
        // For now, assume user hasn't used any
        const runsUsed = 0;
        const bondsCreated = 0;

        setLimits({
          tier,
          canRunCompatibility: maxRuns === null || runsUsed < maxRuns,
          canCreateBond: maxBonds === null || bondsCreated < maxBonds,
          canAccessLab: tier === "COUPLE_PREMIUM",
          runsRemaining: maxRuns === null ? null : maxRuns - runsUsed,
          bondsRemaining: maxBonds === null ? null : maxBonds - bondsCreated,
          upgradeRequired: tier === "FREE",
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error("Error loading plan limits:", err);
        setLimits((prev) => ({
          ...prev,
          loading: false,
          error: err.message || "Failed to load plan limits",
        }));
      }
    };

    loadLimits();
  }, [bondId]);

  return limits;
}

