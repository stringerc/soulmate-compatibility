/**
 * Archetypal Partner Profiles
 * 
 * Based on Jungian Archetypes, Attachment Theory, and Personality Research:
 * - 8 distinct archetypal profiles
 * - Each with a 32-dimensional trait vector
 * - Descriptions, strengths, challenges, and ideal matches
 */

import { Heart, Users, Brain, TrendingUp, Sparkles, Target, Shield, Zap } from 'lucide-react';

export interface ArchetypalProfile {
  id: string;
  name: string;
  archetype: string;
  attachmentStyle: string;
  loveLanguages: string[];
  traits: number[]; // 32-dimensional vector
  description: string;
  strengths: string[];
  challenges: string[];
  idealMatch: string[];
  icon: typeof Heart;
  color: string;
}

/**
 * The Guardian - High security, structured, protective
 * Attachment: Secure
 * Love Languages: Acts of Service, Quality Time
 */
const guardian: ArchetypalProfile = {
  id: 'guardian',
  name: 'The Guardian',
  archetype: 'The Guardian',
  attachmentStyle: 'Secure',
  loveLanguages: ['Acts of Service', 'Quality Time', 'Physical Touch'],
  traits: Array(32).fill(0.5).map((_, i) => {
    if (i < 5) return 0.75; // High security (Attachment)
    if (i >= 5 && i < 10) return 0.35; // Low conflict
    if (i >= 10 && i < 15) return 0.65; // Structured thinking
    if (i >= 15 && i < 20) return 0.70; // Strong values
    if (i >= 20 && i < 25) return 0.60; // Moderate social
    if (i >= 26 && i < 28) return 0.65; // Moderate intimacy
    if (i >= 29 && i < 32) return 0.80; // High structure
    return 0.5;
  }),
  description: 'Stable, reliable, and protective. Values security, tradition, and long-term commitment. Creates a safe, structured environment for relationships.',
  strengths: ['Reliable and consistent', 'Strong sense of responsibility', 'Excellent at creating stability', 'Protective and caring'],
  challenges: ['May be resistant to change', 'Can be overly cautious', 'Might struggle with spontaneity'],
  idealMatch: ['The Explorer', 'The Free Spirit', 'The Visionary'],
  icon: Shield,
  color: 'from-blue-500 to-indigo-600',
};

/**
 * The Explorer - Low security, unstructured, adventurous
 * Attachment: Avoidant
 * Love Languages: Quality Time, Physical Touch
 */
const explorer: ArchetypalProfile = {
  id: 'explorer',
  name: 'The Explorer',
  archetype: 'The Explorer',
  attachmentStyle: 'Avoidant',
  loveLanguages: ['Quality Time', 'Physical Touch', 'Words of Affirmation'],
  traits: Array(32).fill(0.5).map((_, i) => {
    if (i < 5) return 0.25; // Low security (needs freedom)
    if (i >= 5 && i < 10) return 0.30; // Low conflict (avoids it)
    if (i >= 10 && i < 15) return 0.75; // High autonomy
    if (i >= 15 && i < 20) return 0.40; // Flexible values
    if (i >= 20 && i < 25) return 0.70; // High social (adventurous)
    if (i >= 26 && i < 28) return 0.65; // Moderate intimacy
    if (i >= 29 && i < 32) return 0.20; // Low structure (spontaneous)
    return 0.5;
  }),
  description: 'Adventurous, independent, and free-spirited. Values freedom, new experiences, and personal growth. Thrives on spontaneity and exploration.',
  strengths: ['Spontaneous and exciting', 'Open to new experiences', 'Independent and self-reliant', 'Brings adventure to relationships'],
  challenges: ['May struggle with commitment', 'Can be emotionally distant', 'Might avoid deep conversations'],
  idealMatch: ['The Guardian', 'The Nurturer', 'The Anchor'],
  icon: Sparkles,
  color: 'from-purple-500 to-pink-600',
};

/**
 * The Nurturer - High social, low conflict, caring
 * Attachment: Secure/Anxious
 * Love Languages: Words of Affirmation, Acts of Service
 */
const nurturer: ArchetypalProfile = {
  id: 'nurturer',
  name: 'The Nurturer',
  archetype: 'The Nurturer',
  attachmentStyle: 'Secure',
  loveLanguages: ['Words of Affirmation', 'Acts of Service', 'Quality Time'],
  traits: Array(32).fill(0.5).map((_, i) => {
    if (i < 5) return 0.65; // Moderate-high security
    if (i >= 5 && i < 10) return 0.25; // Low conflict (peaceful)
    if (i >= 10 && i < 15) return 0.55; // Balanced thinking
    if (i >= 15 && i < 20) return 0.70; // Strong values (caring)
    if (i >= 20 && i < 25) return 0.80; // High social (nurturing)
    if (i >= 26 && i < 28) return 0.70; // High intimacy
    if (i >= 29 && i < 32) return 0.60; // Moderate structure
    return 0.5;
  }),
  description: 'Caring, empathetic, and supportive. Values emotional connection, harmony, and helping others. Creates a warm, nurturing environment.',
  strengths: ['Highly empathetic and caring', 'Excellent at emotional support', 'Creates harmony and peace', 'Strong communication skills'],
  challenges: ['May prioritize others over self', 'Can struggle with boundaries', 'Might avoid conflict'],
  idealMatch: ['The Explorer', 'The Visionary', 'The Catalyst'],
  icon: Heart,
  color: 'from-pink-500 to-rose-600',
};

/**
 * The Visionary - High values, high cognitive, innovative
 * Attachment: Secure
 * Love Languages: Words of Affirmation, Quality Time
 */
const visionary: ArchetypalProfile = {
  id: 'visionary',
  name: 'The Visionary',
  archetype: 'The Visionary',
  attachmentStyle: 'Secure',
  loveLanguages: ['Words of Affirmation', 'Quality Time', 'Acts of Service'],
  traits: Array(32).fill(0.5).map((_, i) => {
    if (i < 5) return 0.60; // Moderate security
    if (i >= 5 && i < 10) return 0.45; // Moderate conflict
    if (i >= 10 && i < 15) return 0.80; // High cognitive (analytical)
    if (i >= 15 && i < 20) return 0.85; // Very strong values
    if (i >= 20 && i < 25) return 0.55; // Moderate social
    if (i >= 26 && i < 28) return 0.50; // Moderate intimacy
    if (i >= 29 && i < 32) return 0.65; // Moderate-high structure
    return 0.5;
  }),
  description: 'Innovative, idealistic, and forward-thinking. Values growth, purpose, and making a difference. Brings vision and inspiration to relationships.',
  strengths: ['Creative and innovative', 'Strong sense of purpose', 'Excellent at long-term planning', 'Inspiring and motivating'],
  challenges: ['May be overly idealistic', 'Can struggle with practical details', 'Might prioritize goals over relationships'],
  idealMatch: ['The Nurturer', 'The Anchor', 'The Guardian'],
  icon: Zap,
  color: 'from-yellow-500 to-orange-600',
};

/**
 * The Free Spirit - Low structure, high social, spontaneous
 * Attachment: Avoidant/Disorganized
 * Love Languages: Quality Time, Physical Touch
 */
const freeSpirit: ArchetypalProfile = {
  id: 'free_spirit',
  name: 'The Free Spirit',
  archetype: 'The Free Spirit',
  attachmentStyle: 'Avoidant',
  loveLanguages: ['Quality Time', 'Physical Touch', 'Words of Affirmation'],
  traits: Array(32).fill(0.5).map((_, i) => {
    if (i < 5) return 0.30; // Low security (needs freedom)
    if (i >= 5 && i < 10) return 0.40; // Moderate conflict
    if (i >= 10 && i < 15) return 0.70; // High autonomy
    if (i >= 15 && i < 20) return 0.45; // Flexible values
    if (i >= 20 && i < 25) return 0.85; // Very high social
    if (i >= 26 && i < 28) return 0.70; // High intimacy
    if (i >= 29 && i < 32) return 0.15; // Very low structure
    return 0.5;
  }),
  description: 'Spontaneous, social, and unconstrained. Values freedom, fun, and living in the moment. Brings energy and excitement to relationships.',
  strengths: ['Fun and spontaneous', 'Highly social and engaging', 'Brings energy and excitement', 'Open-minded and flexible'],
  challenges: ['May struggle with routine', 'Can be unreliable', 'Might avoid commitment'],
  idealMatch: ['The Anchor', 'The Guardian', 'The Nurturer'],
  icon: Sparkles,
  color: 'from-cyan-500 to-blue-600',
};

/**
 * The Anchor - High structure, moderate values, practical
 * Attachment: Secure
 * Love Languages: Acts of Service, Receiving Gifts
 */
const anchor: ArchetypalProfile = {
  id: 'anchor',
  name: 'The Anchor',
  archetype: 'The Anchor',
  attachmentStyle: 'Secure',
  loveLanguages: ['Acts of Service', 'Receiving Gifts', 'Quality Time'],
  traits: Array(32).fill(0.5).map((_, i) => {
    if (i < 5) return 0.70; // High security
    if (i >= 5 && i < 10) return 0.40; // Low-moderate conflict
    if (i >= 10 && i < 15) return 0.60; // Structured thinking
    if (i >= 15 && i < 20) return 0.55; // Moderate values (practical)
    if (i >= 20 && i < 25) return 0.50; // Moderate social
    if (i >= 26 && i < 28) return 0.55; // Moderate intimacy
    if (i >= 29 && i < 32) return 0.85; // Very high structure
    return 0.5;
  }),
  description: 'Stable, practical, and dependable. Values structure, reliability, and getting things done. Provides a solid foundation for relationships.',
  strengths: ['Highly reliable and dependable', 'Excellent at organization', 'Provides stability', 'Practical and grounded'],
  challenges: ['May be resistant to change', 'Can be overly rigid', 'Might struggle with spontaneity'],
  idealMatch: ['The Free Spirit', 'The Explorer', 'The Visionary'],
  icon: Target,
  color: 'from-green-500 to-emerald-600',
};

/**
 * The Catalyst - High conflict, high values, drives change
 * Attachment: Anxious/Disorganized
 * Love Languages: Words of Affirmation, Quality Time
 */
const catalyst: ArchetypalProfile = {
  id: 'catalyst',
  name: 'The Catalyst',
  archetype: 'The Catalyst',
  attachmentStyle: 'Anxious',
  loveLanguages: ['Words of Affirmation', 'Quality Time', 'Physical Touch'],
  traits: Array(32).fill(0.5).map((_, i) => {
    if (i < 5) return 0.40; // Moderate-low security
    if (i >= 5 && i < 10) return 0.75; // High conflict (drives change)
    if (i >= 10 && i < 15) return 0.65; // High cognitive
    if (i >= 15 && i < 20) return 0.80; // Very strong values
    if (i >= 20 && i < 25) return 0.60; // Moderate-high social
    if (i >= 26 && i < 28) return 0.65; // Moderate-high intimacy
    if (i >= 29 && i < 32) return 0.50; // Moderate structure
    return 0.5;
  }),
  description: 'Passionate, driven, and change-oriented. Values growth, authenticity, and pushing boundaries. Brings intensity and transformation to relationships.',
  strengths: ['Passionate and intense', 'Drives growth and change', 'Authentic and honest', 'Strong convictions'],
  challenges: ['May create conflict', 'Can be emotionally intense', 'Might struggle with compromise'],
  idealMatch: ['The Harmonizer', 'The Nurturer', 'The Guardian'],
  icon: TrendingUp,
  color: 'from-red-500 to-orange-600',
};

/**
 * The Harmonizer - Balanced across all dimensions
 * Attachment: Secure
 * Love Languages: All five (balanced)
 */
const harmonizer: ArchetypalProfile = {
  id: 'harmonizer',
  name: 'The Harmonizer',
  archetype: 'The Harmonizer',
  attachmentStyle: 'Secure',
  loveLanguages: ['Words of Affirmation', 'Acts of Service', 'Quality Time', 'Physical Touch', 'Receiving Gifts'],
  traits: Array(32).fill(0.5).map((_, i) => {
    // Balanced across all dimensions (slight variations for realism)
    if (i < 5) return 0.55; // Moderate-high security
    if (i >= 5 && i < 10) return 0.45; // Moderate conflict
    if (i >= 10 && i < 15) return 0.52; // Balanced thinking
    if (i >= 15 && i < 20) return 0.58; // Moderate-high values
    if (i >= 20 && i < 25) return 0.55; // Moderate social
    if (i >= 26 && i < 28) return 0.53; // Moderate intimacy
    if (i >= 29 && i < 32) return 0.52; // Moderate structure
    return 0.5;
  }),
  description: 'Balanced, adaptable, and harmonious. Values connection, growth, and finding middle ground. Creates peace and balance in relationships.',
  strengths: ['Highly adaptable', 'Excellent at compromise', 'Creates harmony', 'Balanced approach to life'],
  challenges: ['May struggle with strong opinions', 'Can be indecisive', 'Might avoid taking strong stands'],
  idealMatch: ['The Catalyst', 'The Visionary', 'The Explorer'],
  icon: Heart,
  color: 'from-indigo-500 to-purple-600',
};

/**
 * Export all archetypal profiles
 */
export const ARCHETYPAL_PROFILES: ArchetypalProfile[] = [
  guardian,
  explorer,
  nurturer,
  visionary,
  freeSpirit,
  anchor,
  catalyst,
  harmonizer,
];

/**
 * Get profile by ID
 */
export function getProfileById(id: string): ArchetypalProfile | undefined {
  return ARCHETYPAL_PROFILES.find(p => p.id === id);
}

/**
 * Get profiles by archetype
 */
export function getProfilesByArchetype(archetype: string): ArchetypalProfile[] {
  return ARCHETYPAL_PROFILES.filter(p => p.archetype === archetype);
}

