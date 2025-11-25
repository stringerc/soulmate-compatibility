/**
 * React hook for checking if a soulmates feature is enabled
 */

import { getSoulmatesPhase, isFeatureEnabled, SoulmatesFeatureKey } from "@soulmates/config";

export function useSoulmatesFeature(feature: SoulmatesFeatureKey): boolean {
  const phase = getSoulmatesPhase();
  return isFeatureEnabled(phase, feature);
}

