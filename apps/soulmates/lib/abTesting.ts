/**
 * A/B Testing Utility
 * For testing different value propositions and messaging
 */

export type ABTestVariant = 'A' | 'B' | 'C' | 'D';

export interface ABTestConfig {
  testName: string;
  variants: ABTestVariant[];
  weights?: number[]; // Probability weights for each variant (default: equal)
  storageKey: string;
}

/**
 * Get or assign A/B test variant for a user
 */
export function getABTestVariant(config: ABTestConfig): ABTestVariant {
  if (typeof window === 'undefined') return 'A';

  try {
    // Check if user already has a variant assigned
    const stored = localStorage.getItem(config.storageKey);
    if (stored && config.variants.includes(stored as ABTestVariant)) {
      return stored as ABTestVariant;
    }

    // Assign new variant based on weights
    const weights = config.weights || config.variants.map(() => 1 / config.variants.length);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    let selectedVariant: ABTestVariant = config.variants[0];
    for (let i = 0; i < config.variants.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedVariant = config.variants[i];
        break;
      }
    }

    // Store variant for consistency
    localStorage.setItem(config.storageKey, selectedVariant);
    return selectedVariant;
  } catch (e) {
    console.error('Error in A/B test assignment:', e);
    return 'A'; // Default fallback
  }
}

/**
 * Track A/B test conversion
 */
export function trackABTestConversion(
  testName: string,
  variant: ABTestVariant,
  conversionEvent: string
): void {
  if (typeof window === 'undefined') return;

  try {
    // Use advanced analytics for better tracking
    const { trackABTestConversion: trackAdvanced } = require('@/lib/advancedAnalytics');
    trackAdvanced(testName, variant, conversionEvent);
  } catch (e) {
    // Fallback to basic analytics
    try {
      const { logSoulmatesEvent } = require('@/lib/analytics');
      logSoulmatesEvent({
        name: 'ab_test_conversion' as any,
        payload: {
          test_name: testName,
          variant,
          conversion_event: conversionEvent,
        },
      });
    } catch (e2) {
      // Silently fail
    }
  }
}

/**
 * ResultsGate A/B Test Configuration
 */
export const RESULTS_GATE_AB_TEST: ABTestConfig = {
  testName: 'results_gate_value_proposition',
  variants: ['A', 'B', 'C'],
  weights: [0.33, 0.33, 0.34], // Equal distribution
  storageKey: 'soulmates_ab_results_gate',
};

/**
 * Get ResultsGate variant
 */
export function getResultsGateVariant(): ABTestVariant {
  return getABTestVariant(RESULTS_GATE_AB_TEST);
}

