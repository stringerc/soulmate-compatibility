/**
 * Resonance Analysis Engine
 * 
 * Analyzes relationship resonance patterns:
 * - Emotional Resonance: Shared emotional experiences
 * - Cognitive Resonance: Similar thinking patterns
 * - Behavioral Resonance: Aligned actions and habits
 * - Spiritual Resonance: Shared values and beliefs
 */

export interface ResonanceAnalysis {
  emotionalResonance: number;
  cognitiveResonance: number;
  behavioralResonance: number;
  spiritualResonance: number;
  overallResonance: number;
  patterns: {
    strengths: string[];
    challenges: string[];
    recommendations: string[];
  };
}

/**
 * Calculate emotional resonance from trait vectors
 * Based on Attachment & Regulation dimensions (0-4)
 */
function calculateEmotionalResonance(
  traitsA: number[],
  traitsB: number[]
): number {
  if (traitsA.length !== 32 || traitsB.length !== 32) return 0.5;

  const attachmentA = traitsA.slice(0, 5);
  const attachmentB = traitsB.slice(0, 5);

  // Calculate similarity in attachment patterns
  let similaritySum = 0;
  for (let i = 0; i < 5; i++) {
    const diff = Math.abs(attachmentA[i] - attachmentB[i]);
    similaritySum += 1 - diff; // Closer = higher similarity
  }

  return similaritySum / 5;
}

/**
 * Calculate cognitive resonance from trait vectors
 * Based on Cognitive & Decision Style dimensions (10-14)
 */
function calculateCognitiveResonance(
  traitsA: number[],
  traitsB: number[]
): number {
  if (traitsA.length !== 32 || traitsB.length !== 32) return 0.5;

  const cognitiveA = traitsA.slice(10, 15);
  const cognitiveB = traitsB.slice(10, 15);

  let similaritySum = 0;
  for (let i = 0; i < 5; i++) {
    const diff = Math.abs(cognitiveA[i] - cognitiveB[i]);
    similaritySum += 1 - diff;
  }

  return similaritySum / 5;
}

/**
 * Calculate behavioral resonance from trait vectors
 * Based on Life Structure dimensions (29-31)
 */
function calculateBehavioralResonance(
  traitsA: number[],
  traitsB: number[]
): number {
  if (traitsA.length !== 32 || traitsB.length !== 32) return 0.5;

  const structureA = traitsA.slice(29, 32);
  const structureB = traitsB.slice(29, 32);

  let similaritySum = 0;
  for (let i = 0; i < 3; i++) {
    const diff = Math.abs(structureA[i] - structureB[i]);
    similaritySum += 1 - diff;
  }

  return similaritySum / 3;
}

/**
 * Calculate spiritual resonance from trait vectors
 * Based on Value Architecture dimensions (15-20)
 */
function calculateSpiritualResonance(
  traitsA: number[],
  traitsB: number[]
): number {
  if (traitsA.length !== 32 || traitsB.length !== 32) return 0.5;

  const valuesA = traitsA.slice(15, 21);
  const valuesB = traitsB.slice(15, 21);

  let similaritySum = 0;
  for (let i = 0; i < 6; i++) {
    const diff = Math.abs(valuesA[i] - valuesB[i]);
    similaritySum += 1 - diff;
  }

  return similaritySum / 6;
}

/**
 * Generate resonance insights
 */
function generateResonanceInsights(
  emotional: number,
  cognitive: number,
  behavioral: number,
  spiritual: number
): {
  strengths: string[];
  challenges: string[];
  recommendations: string[];
} {
  const strengths: string[] = [];
  const challenges: string[] = [];
  const recommendations: string[] = [];

  if (emotional >= 0.75) {
    strengths.push("Strong emotional connection and understanding");
  } else if (emotional < 0.5) {
    challenges.push("Different emotional needs may require communication");
    recommendations.push("Practice active listening and emotional validation");
  }

  if (cognitive >= 0.75) {
    strengths.push("Similar thinking patterns and decision-making styles");
  } else if (cognitive < 0.5) {
    challenges.push("Different cognitive styles may lead to misunderstandings");
    recommendations.push("Take time to understand each other's perspectives");
  }

  if (behavioral >= 0.75) {
    strengths.push("Aligned daily habits and life structures");
  } else if (behavioral < 0.5) {
    challenges.push("Different routines may require compromise");
    recommendations.push("Find common ground in daily activities");
  }

  if (spiritual >= 0.75) {
    strengths.push("Shared core values and life principles");
  } else if (spiritual < 0.5) {
    challenges.push("Different values may need discussion");
    recommendations.push("Have open conversations about what matters most");
  }

  if (strengths.length === 0) {
    strengths.push("Potential for growth and learning together");
  }

  if (challenges.length === 0) {
    challenges.push("Minor adjustments may be needed as you grow");
  }

  if (recommendations.length === 0) {
    recommendations.push("Continue nurturing your connection");
  }

  return { strengths, challenges, recommendations };
}

/**
 * Main resonance analysis function
 * 
 * @param traitsA - 32-dimensional trait vector for person A
 * @param traitsB - 32-dimensional trait vector for person B
 * @returns Comprehensive resonance analysis
 */
export function analyzeResonance(
  traitsA: number[],
  traitsB: number[]
): ResonanceAnalysis {
  if (traitsA.length !== 32 || traitsB.length !== 32) {
    throw new Error("Trait vectors must be 32 dimensions");
  }

  const emotional = calculateEmotionalResonance(traitsA, traitsB);
  const cognitive = calculateCognitiveResonance(traitsA, traitsB);
  const behavioral = calculateBehavioralResonance(traitsA, traitsB);
  const spiritual = calculateSpiritualResonance(traitsA, traitsB);

  // Weighted overall resonance
  const overall = (
    emotional * 0.3 +
    cognitive * 0.25 +
    behavioral * 0.2 +
    spiritual * 0.25
  );

  const patterns = generateResonanceInsights(
    emotional,
    cognitive,
    behavioral,
    spiritual
  );

  return {
    emotionalResonance: Math.max(0, Math.min(1, emotional)),
    cognitiveResonance: Math.max(0, Math.min(1, cognitive)),
    behavioralResonance: Math.max(0, Math.min(1, behavioral)),
    spiritualResonance: Math.max(0, Math.min(1, spiritual)),
    overallResonance: Math.max(0, Math.min(1, overall)),
    patterns,
  };
}

/**
 * Get resonance tier based on overall score
 */
export function getResonanceTier(score: number): {
  tier: 'high' | 'moderate' | 'low';
  label: string;
  color: string;
} {
  if (score >= 0.75) {
    return { tier: 'high', label: 'High Resonance', color: 'from-green-400 to-emerald-500' };
  }
  if (score >= 0.5) {
    return { tier: 'moderate', label: 'Moderate Resonance', color: 'from-yellow-400 to-orange-500' };
  }
  return { tier: 'low', label: 'Low Resonance', color: 'from-red-400 to-rose-500' };
}

