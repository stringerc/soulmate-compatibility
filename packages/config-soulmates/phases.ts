/**
 * Soulmates Phase Configuration
 * 
 * Defines feature flags and phase-based rollout system.
 * Phases: 0 (MVP) -> 1 (Explorer) -> 2 (Couple Mode) -> 3 (Resonance Lab)
 */

export type SoulmatesPhase = 0 | 1 | 2 | 3;

export type SoulmatesFeatureKey =
  | "self_profile"
  | "self_dashboard"
  | "souljourney_journaling"
  | "comp_explorer"
  | "bond_mode_basic"
  | "bond_resonance_lab";

export const PHASE_FEATURES: Record<SoulmatesPhase, SoulmatesFeatureKey[]> = {
  0: ["self_profile", "self_dashboard", "souljourney_journaling"],
  1: ["self_profile", "self_dashboard", "souljourney_journaling", "comp_explorer"],
  2: [
    "self_profile",
    "self_dashboard",
    "souljourney_journaling",
    "comp_explorer",
    "bond_mode_basic",
  ],
  3: [
    "self_profile",
    "self_dashboard",
    "souljourney_journaling",
    "comp_explorer",
    "bond_mode_basic",
    "bond_resonance_lab",
  ],
};

/**
 * Check if a feature is enabled for the given phase
 */
export function isFeatureEnabled(
  phase: SoulmatesPhase,
  feature: SoulmatesFeatureKey
): boolean {
  return PHASE_FEATURES[phase].includes(feature);
}

/**
 * Get the current soulmates phase from environment
 * Defaults to 3 (all features) if not set or invalid, since all features are implemented
 * Can be overridden via environment variable for gradual rollout
 */
export function getSoulmatesPhase(): SoulmatesPhase {
  const raw = process.env.SOULMATES_PHASE ?? process.env.NEXT_PUBLIC_SOULMATES_PHASE ?? "3";
  const n = Number(raw);
  if (n === 0 || n === 1 || n === 2 || n === 3) return n;
  return 3; // Default to Phase 3 (all features) since they're all implemented
}

/**
 * Get phase name for display
 */
export function getPhaseName(phase: SoulmatesPhase): string {
  const names: Record<SoulmatesPhase, string> = {
    0: "MVP - Solo Self-Discovery",
    1: "Phase 1 - Compatibility Explorer",
    2: "Phase 2 - Couple Mode",
    3: "Phase 3 - Resonance Lab",
  };
  return names[phase];
}

