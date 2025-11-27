/**
 * Compatibility Calculation Engine
 * 
 * Research-based algorithms for calculating relationship compatibility:
 * - Cosine Similarity: Measures trait vector similarity (0-1 scale)
 * - Complementary Matching: Opposites attract (e.g., Introvert + Extravert)
 * - Dimension-Specific Matching: Attachment, Conflict, Social styles
 * - Hybrid Model: Combines similarity + complementarity
 */

export interface CompatibilityScore {
  overall: number;
  similarity: number;
  complementarity: number;
  attachmentMatch: number;
  conflictMatch: number;
  socialMatch: number;
  valuesMatch: number;
  strengths: string[];
  challenges: string[];
  insights: string[];
}

/**
 * Calculate cosine similarity between two trait vectors
 * Returns a value between 0 and 1 (1 = identical, 0 = orthogonal)
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) {
    return 0.5; // Default neutral if vectors don't match
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0.5;

  return dotProduct / denominator;
}

/**
 * Calculate complementarity score (opposites attract)
 * Higher score when traits are complementary (e.g., high + low = good match)
 */
function calculateComplementarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) {
    return 0.5;
  }

  let complementaritySum = 0;
  for (let i = 0; i < vecA.length; i++) {
    // Complementarity: distance from 0.5 indicates how "opposite" they are
    // We want moderate complementarity (not too similar, not too opposite)
    const diff = Math.abs(vecA[i] - vecB[i]);
    // Ideal complementarity is around 0.3-0.4 difference
    const idealDiff = 0.35;
    const complementarity = 1 - Math.abs(diff - idealDiff) / idealDiff;
    complementaritySum += Math.max(0, complementarity);
  }

  return complementaritySum / vecA.length;
}

/**
 * Calculate average of a trait range
 */
function getAverage(traits: number[], start: number, end: number): number {
  const slice = traits.slice(start, end + 1);
  if (slice.length === 0) return 0.5;
  return slice.reduce((sum, val) => sum + val, 0) / slice.length;
}

/**
 * Match attachment styles (first 5 traits)
 * Secure attachment prefers secure partners, but can work with others
 */
function matchAttachmentStyles(vecA: number[], vecB: number[]): number {
  const attachmentA = getAverage(vecA, 0, 4);
  const attachmentB = getAverage(vecB, 0, 4);

  // Both secure (0.3-0.7 range) = high match
  if (attachmentA >= 0.3 && attachmentA <= 0.7 && attachmentB >= 0.3 && attachmentB <= 0.7) {
    return 0.9;
  }

  // One secure, one anxious/avoidant = moderate match
  if ((attachmentA >= 0.3 && attachmentA <= 0.7) || (attachmentB >= 0.3 && attachmentB <= 0.7)) {
    return 0.7;
  }

  // Both anxious or both avoidant = lower match (similar issues)
  if ((attachmentA > 0.7 && attachmentB > 0.7) || (attachmentA < 0.3 && attachmentB < 0.3)) {
    return 0.5;
  }

  // Anxious + Avoidant = challenging but potentially complementary
  return 0.6;
}

/**
 * Match conflict resolution styles (traits 5-9)
 * Lower conflict scores = better communication
 */
function matchConflictStyles(vecA: number[], vecB: number[]): number {
  const conflictA = getAverage(vecA, 5, 9);
  const conflictB = getAverage(vecB, 5, 9);

  // Both low conflict = excellent
  if (conflictA < 0.4 && conflictB < 0.4) {
    return 0.95;
  }

  // One low, one moderate = good
  if ((conflictA < 0.4 && conflictB < 0.6) || (conflictB < 0.4 && conflictA < 0.6)) {
    return 0.8;
  }

  // Both high conflict = challenging
  if (conflictA > 0.6 && conflictB > 0.6) {
    return 0.4;
  }

  // Moderate levels = okay
  return 0.65;
}

/**
 * Match social styles (traits 21-25)
 * Similar social preferences = better match
 */
function matchSocialStyles(vecA: number[], vecB: number[]): number {
  const socialA = getAverage(vecA, 21, 25);
  const socialB = getAverage(vecB, 21, 25);

  const diff = Math.abs(socialA - socialB);
  
  // Very similar (within 0.2) = high match
  if (diff < 0.2) {
    return 0.9;
  }

  // Moderate difference (0.2-0.4) = good match
  if (diff < 0.4) {
    return 0.75;
  }

  // Large difference (>0.4) = challenging but potentially complementary
  return 0.6;
}

/**
 * Match values (traits 15-20)
 * Similar values = stronger foundation
 */
function matchValues(vecA: number[], vecB: number[]): number {
  const valuesA = getAverage(vecA, 15, 20);
  const valuesB = getAverage(vecB, 15, 20);

  const diff = Math.abs(valuesA - valuesB);
  
  // Very similar values = excellent
  if (diff < 0.15) {
    return 0.95;
  }

  // Similar values = good
  if (diff < 0.3) {
    return 0.8;
  }

  // Different values = challenging
  return 0.5;
}

/**
 * Identify relationship strengths based on compatibility
 */
function identifyStrengths(vecA: number[], vecB: number[]): string[] {
  const strengths: string[] = [];
  
  const attachmentMatch = matchAttachmentStyles(vecA, vecB);
  const conflictMatch = matchConflictStyles(vecA, vecB);
  const socialMatch = matchSocialStyles(vecA, vecB);
  const valuesMatch = matchValues(vecA, vecB);

  if (attachmentMatch >= 0.8) {
    strengths.push("Strong emotional connection and security");
  }
  if (conflictMatch >= 0.8) {
    strengths.push("Excellent communication and conflict resolution");
  }
  if (socialMatch >= 0.8) {
    strengths.push("Compatible social styles and energy levels");
  }
  if (valuesMatch >= 0.8) {
    strengths.push("Shared core values and life goals");
  }

  const complementarity = calculateComplementarity(vecA, vecB);
  if (complementarity >= 0.7) {
    strengths.push("Complementary traits create balance");
  }

  if (strengths.length === 0) {
    strengths.push("Potential for growth and learning together");
  }

  return strengths;
}

/**
 * Identify relationship challenges based on compatibility
 */
function identifyChallenges(vecA: number[], vecB: number[]): string[] {
  const challenges: string[] = [];
  
  const attachmentMatch = matchAttachmentStyles(vecA, vecB);
  const conflictMatch = matchConflictStyles(vecA, vecB);
  const socialMatch = matchSocialStyles(vecA, vecB);
  const valuesMatch = matchValues(vecA, vecB);

  if (attachmentMatch < 0.6) {
    challenges.push("Different attachment styles may require understanding");
  }
  if (conflictMatch < 0.6) {
    challenges.push("Conflict resolution styles may need alignment");
  }
  if (socialMatch < 0.6) {
    challenges.push("Different social needs may require compromise");
  }
  if (valuesMatch < 0.6) {
    challenges.push("Core values differences may need discussion");
  }

  const similarity = cosineSimilarity(vecA, vecB);
  if (similarity < 0.4) {
    challenges.push("Very different personalities may require extra effort");
  } else if (similarity > 0.9) {
    challenges.push("Very similar personalities may lack excitement");
  }

  if (challenges.length === 0) {
    challenges.push("Minor adjustments may be needed as you grow together");
  }

  return challenges;
}

/**
 * Generate insights based on compatibility analysis
 */
function generateInsights(vecA: number[], vecB: number[]): string[] {
  const insights: string[] = [];
  
  const similarity = cosineSimilarity(vecA, vecB);
  const complementarity = calculateComplementarity(vecA, vecB);
  const attachmentMatch = matchAttachmentStyles(vecA, vecB);

  if (similarity > 0.7 && complementarity > 0.6) {
    insights.push("You share core similarities while bringing complementary strengths");
  } else if (similarity > 0.7) {
    insights.push("You're very similar - focus on maintaining individual growth");
  } else if (complementarity > 0.7) {
    insights.push("Your differences create balance - embrace your unique strengths");
  }

  if (attachmentMatch >= 0.8) {
    insights.push("Strong emotional foundation supports long-term connection");
  }

  const socialA = getAverage(vecA, 21, 25);
  const socialB = getAverage(vecB, 21, 25);
  if (Math.abs(socialA - socialB) > 0.4) {
    insights.push("Different social needs - plan time together and apart");
  }

  return insights;
}

/**
 * Main compatibility calculation function
 * 
 * @param userTraits - 32-dimensional trait vector for user
 * @param partnerTraits - 32-dimensional trait vector for partner
 * @returns Comprehensive compatibility score with insights
 */
export function calculateCompatibility(
  userTraits: number[],
  partnerTraits: number[]
): CompatibilityScore {
  // Ensure vectors are the correct length
  if (userTraits.length !== 32 || partnerTraits.length !== 32) {
    throw new Error("Trait vectors must be 32 dimensions");
  }

  // Calculate individual components
  const similarity = cosineSimilarity(userTraits, partnerTraits);
  const complementarity = calculateComplementarity(userTraits, partnerTraits);
  const attachmentMatch = matchAttachmentStyles(userTraits, partnerTraits);
  const conflictMatch = matchConflictStyles(userTraits, partnerTraits);
  const socialMatch = matchSocialStyles(userTraits, partnerTraits);
  const valuesMatch = matchValues(userTraits, partnerTraits);

  // Weighted overall score
  // Research-based weights: similarity and values are most important
  const overallScore = (
    similarity * 0.25 +
    complementarity * 0.20 +
    attachmentMatch * 0.20 +
    conflictMatch * 0.15 +
    socialMatch * 0.10 +
    valuesMatch * 0.10
  );

  // Generate insights
  const strengths = identifyStrengths(userTraits, partnerTraits);
  const challenges = identifyChallenges(userTraits, partnerTraits);
  const insights = generateInsights(userTraits, partnerTraits);

  return {
    overall: Math.max(0, Math.min(1, overallScore)), // Clamp between 0 and 1
    similarity,
    complementarity,
    attachmentMatch,
    conflictMatch,
    socialMatch,
    valuesMatch,
    strengths,
    challenges,
    insights,
  };
}

/**
 * Get compatibility tier based on overall score
 */
export function getCompatibilityTier(score: number): {
  tier: 'soulmate' | 'excellent' | 'good' | 'moderate' | 'challenging';
  label: string;
  color: string;
} {
  if (score >= 0.85) {
    return { tier: 'soulmate', label: 'Soulmate Tier', color: 'from-yellow-400 to-pink-500' };
  }
  if (score >= 0.75) {
    return { tier: 'excellent', label: 'Excellent Match', color: 'from-green-400 to-emerald-500' };
  }
  if (score >= 0.65) {
    return { tier: 'good', label: 'Good Match', color: 'from-blue-400 to-cyan-500' };
  }
  if (score >= 0.50) {
    return { tier: 'moderate', label: 'Moderate Match', color: 'from-orange-400 to-amber-500' };
  }
  return { tier: 'challenging', label: 'Challenging Match', color: 'from-red-400 to-rose-500' };
}

