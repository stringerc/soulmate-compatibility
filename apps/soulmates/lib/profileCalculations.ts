/**
 * Calculate Primary Archetype from 32-dimensional trait vector
 * 
 * Archetypes are determined by dominant trait patterns across dimensions:
 * - Attachment & Regulation (0-4)
 * - Conflict & Communication (5-9)
 * - Cognitive & Decision Style (10-14)
 * - Value Architecture (15-20)
 * - Social & Interpersonal Style (21-25)
 * - Sexual System (26-28)
 * - Life Structure (29-31)
 */

export type Archetype = 
  | 'The Guardian'      // High security, structured, protective
  | 'The Explorer'      // High adventure, low structure, independent
  | 'The Nurturer'      // High empathy, connection, care
  | 'The Visionary'     // High creativity, values, growth
  | 'The Harmonizer'    // Balanced, moderate, adaptable
  | 'The Catalyst'      // High change, low stability, transformative
  | 'The Anchor'        // High stability, low change, reliable
  | 'The Free Spirit';  // Low structure, high freedom, spontaneous

export type AttachmentStyle = 
  | 'Secure'
  | 'Anxious'
  | 'Avoidant'
  | 'Disorganized';

/**
 * Calculate primary archetype from traits
 */
export function calculatePrimaryArchetype(traits: number[]): Archetype {
  if (!traits || traits.length !== 32) {
    return 'The Harmonizer'; // Default balanced archetype
  }

  // Calculate dimension averages
  const attachment = traits.slice(0, 5).reduce((a, b) => a + b, 0) / 5;      // 0-4: Security, trust, regulation
  const conflict = traits.slice(5, 10).reduce((a, b) => a + b, 0) / 5;        // 5-9: Conflict handling, communication
  const cognitive = traits.slice(10, 15).reduce((a, b) => a + b, 0) / 5;      // 10-14: Decision style, thinking
  const values = traits.slice(15, 21).reduce((a, b) => a + b, 0) / 6;         // 15-20: Values, principles
  const social = traits.slice(21, 26).reduce((a, b) => a + b, 0) / 5;         // 21-25: Social style, interpersonal
  const sexual = traits.slice(26, 29).reduce((a, b) => a + b, 0) / 3;        // 26-28: Intimacy, connection
  const lifeStructure = traits.slice(29, 32).reduce((a, b) => a + b, 0) / 3; // 29-31: Structure, routine, stability

  // Archetype scoring
  const scores: Record<Archetype, number> = {
    'The Guardian': (attachment * 0.3) + (lifeStructure * 0.3) + (values * 0.2) + (social * 0.2),
    'The Explorer': (1 - lifeStructure) * 0.3 + (cognitive * 0.3) + (sexual * 0.2) + (1 - attachment) * 0.2,
    'The Nurturer': (social * 0.3) + (attachment * 0.3) + (values * 0.2) + (sexual * 0.2),
    'The Visionary': (values * 0.3) + (cognitive * 0.3) + (1 - lifeStructure) * 0.2 + (social * 0.2),
    'The Harmonizer': 1 - Math.abs(0.5 - attachment) - Math.abs(0.5 - conflict) - Math.abs(0.5 - cognitive),
    'The Catalyst': (1 - lifeStructure) * 0.3 + (conflict * 0.3) + (cognitive * 0.2) + (sexual * 0.2),
    'The Anchor': (lifeStructure * 0.3) + (attachment * 0.3) + (values * 0.2) + (1 - conflict) * 0.2,
    'The Free Spirit': (1 - lifeStructure) * 0.4 + (1 - attachment) * 0.3 + (sexual * 0.2) + (1 - values) * 0.1,
  };

  // Find highest scoring archetype
  let maxScore = -1;
  let primaryArchetype: Archetype = 'The Harmonizer';
  
  for (const [archetype, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      primaryArchetype = archetype as Archetype;
    }
  }

  return primaryArchetype;
}

/**
 * Calculate attachment style from traits
 * Based on Attachment & Regulation dimensions (0-4)
 */
export function calculateAttachmentStyle(traits: number[]): AttachmentStyle {
  if (!traits || traits.length !== 32) {
    return 'Secure'; // Default
  }

  // Attachment & Regulation dimensions (0-4)
  // These represent: security, trust, emotional regulation, need for closeness, fear of abandonment
  const attachmentTraits = traits.slice(0, 5);
  const avgAttachment = attachmentTraits.reduce((a, b) => a + b, 0) / 5;
  
  // Variance in attachment traits indicates disorganization
  const variance = attachmentTraits.reduce((sum, val) => sum + Math.pow(val - avgAttachment, 2), 0) / 5;
  const stdDev = Math.sqrt(variance);

  // High variance = disorganized
  if (stdDev > 0.3) {
    return 'Disorganized';
  }

  // Low average (< 0.3) = avoidant (low need for closeness, high independence)
  if (avgAttachment < 0.3) {
    return 'Avoidant';
  }

  // High average (> 0.7) = anxious (high need for closeness, fear of abandonment)
  if (avgAttachment > 0.7) {
    return 'Anxious';
  }

  // Moderate (0.3-0.7) = secure (balanced)
  return 'Secure';
}

/**
 * Calculate love languages from traits
 * Based on Social & Interpersonal Style (21-25) and other dimensions
 */
export function calculateLoveLanguages(traits: number[]): string[] {
  if (!traits || traits.length !== 32) {
    return [];
  }

  const languages: string[] = [];
  
  // Words of Affirmation - high in social (21-25) and cognitive (10-14)
  const wordsScore = (traits.slice(21, 26).reduce((a, b) => a + b, 0) / 5) * 0.6 +
                     (traits.slice(10, 15).reduce((a, b) => a + b, 0) / 5) * 0.4;
  if (wordsScore > 0.6) {
    languages.push('Words of Affirmation');
  }

  // Acts of Service - high in values (15-20) and attachment (0-4)
  const serviceScore = (traits.slice(15, 21).reduce((a, b) => a + b, 0) / 6) * 0.6 +
                       (traits.slice(0, 5).reduce((a, b) => a + b, 0) / 5) * 0.4;
  if (serviceScore > 0.6) {
    languages.push('Acts of Service');
  }

  // Receiving Gifts - moderate in social and values
  const giftsScore = (traits.slice(21, 26).reduce((a, b) => a + b, 0) / 5) * 0.5 +
                     (traits.slice(15, 21).reduce((a, b) => a + b, 0) / 6) * 0.5;
  if (giftsScore > 0.5 && giftsScore < 0.7) {
    languages.push('Receiving Gifts');
  }

  // Quality Time - high in attachment (0-4) and social (21-25)
  const timeScore = (traits.slice(0, 5).reduce((a, b) => a + b, 0) / 5) * 0.6 +
                    (traits.slice(21, 26).reduce((a, b) => a + b, 0) / 5) * 0.4;
  if (timeScore > 0.6) {
    languages.push('Quality Time');
  }

  // Physical Touch - high in sexual (26-28) and attachment (0-4)
  const touchScore = (traits.slice(26, 29).reduce((a, b) => a + b, 0) / 3) * 0.7 +
                     (traits.slice(0, 5).reduce((a, b) => a + b, 0) / 5) * 0.3;
  if (touchScore > 0.6) {
    languages.push('Physical Touch');
  }

  // Always return at least one (default to most common)
  if (languages.length === 0) {
    languages.push('Quality Time'); // Most common default
  }

  return languages.slice(0, 3); // Return top 3
}

