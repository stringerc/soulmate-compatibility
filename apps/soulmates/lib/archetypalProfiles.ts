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
  description: `The Guardian represents a deeply rooted need for security, stability, and protection in relationships. If you identify with this archetype, you likely find comfort in predictability and structure. You're the person others turn to in times of crisis because you have an innate ability to create safety and order out of chaos.

Your attachment style is secure, meaning you feel comfortable with intimacy and independence. You don't fear abandonment or being too close to others. Instead, you naturally create an environment where both you and your partner can thrive. This security comes from a fundamental trust in yourself and in the reliability of your relationships.

In relationships, you value tradition and long-term commitment. You're not interested in casual connections—you seek depth, meaning, and permanence. You express love through acts of service, showing your care by taking care of practical needs, creating routines, and building a life together that feels solid and dependable.

Your protective nature means you're always looking out for your partner's wellbeing. You anticipate needs, plan for the future, and create buffers against life's uncertainties. This isn't about control—it's about creating a foundation where both partners can feel safe to be vulnerable, grow, and explore.

However, your need for structure can sometimes make you resistant to change. You might struggle with spontaneity or feel anxious when plans are disrupted. This is because your sense of security is tied to predictability. Learning to embrace some flexibility while maintaining your core need for stability is a key growth area for you.

Understanding this archetype helps you recognize that your desire for security isn't a limitation—it's a gift. You create the kind of relationships that others long for: stable, reliable, and deeply committed. Your challenge is learning to balance your need for structure with the reality that life is inherently unpredictable, and that some of the most beautiful moments come from unexpected places.`,
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
  description: `The Explorer is driven by an insatiable curiosity about life, relationships, and the world. If you identify with this archetype, you likely feel most alive when you're discovering something new—whether that's a new place, a new idea, or a new way of connecting with someone.

Your attachment style tends toward avoidant, which means you value your independence highly. This isn't because you don't care about relationships—quite the opposite. You care so deeply that you need space to process your feelings and maintain your sense of self. You might find that too much closeness feels suffocating, while the right amount of space allows you to love more fully.

Freedom isn't just a preference for you—it's a fundamental need. You thrive when you can make your own choices, follow your own path, and maintain your autonomy within relationships. This doesn't mean you're incapable of commitment; it means you need a partner who understands that your independence is part of who you are, not a rejection of them.

In relationships, you bring excitement, spontaneity, and a sense of adventure. You're the one who suggests trying new restaurants, taking weekend trips, or exploring new ways of being together. You help your partner see the world through fresh eyes and remind them that life is meant to be lived, not just managed.

However, your need for freedom can sometimes make commitment feel challenging. You might struggle with feeling trapped or constrained, even in healthy relationships. This often comes from a fear that commitment means losing yourself or giving up your ability to explore and grow. Learning that true intimacy can actually enhance your freedom rather than limit it is a key growth area.

Your emotional distance isn't about not caring—it's about needing time and space to process your feelings. You might not always express your emotions immediately, but when you do, they're deeply felt. Your challenge is learning to communicate your needs for space while also showing your partner that you're present and engaged.

Understanding this archetype helps you recognize that your need for exploration and independence is a strength, not a flaw. You bring vitality, growth, and excitement to relationships. Your challenge is finding partners who can appreciate your need for space while also creating enough connection to build something meaningful together.`,
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
  description: `The Nurturer is defined by an extraordinary capacity for empathy, care, and emotional support. If you identify with this archetype, you likely find deep fulfillment in helping others feel seen, heard, and valued. You're the person friends call when they need someone to listen, the partner who remembers the little things that matter, and the one who creates warmth and comfort wherever you go.

Your attachment style is secure, meaning you're comfortable with both intimacy and independence. You can be close to others without losing yourself, and you can give space without feeling rejected. This security allows you to be fully present for others because you're not constantly worried about your own needs being met.

In relationships, you create a nurturing environment where your partner feels safe to be vulnerable, express their feelings, and grow. You have an almost intuitive understanding of what others need, often before they even know themselves. This comes from your deep capacity for empathy—you can feel what others are feeling and respond with genuine care and understanding.

You express love through words of affirmation, acts of service, and quality time. You're the one who leaves encouraging notes, remembers important dates, and creates moments of connection. Your love language is about making others feel valued, supported, and deeply cared for.

However, your tendency to prioritize others can sometimes lead you to neglect your own needs. You might find yourself giving so much that you forget to receive, or you might struggle to set boundaries because saying no feels like you're letting someone down. Learning to care for yourself with the same depth you care for others is a crucial growth area.

Your desire for harmony can sometimes make you avoid conflict, even when it's necessary. You might suppress your own needs or feelings to keep the peace, which can lead to resentment over time. Learning that healthy conflict can actually strengthen relationships and that your needs are just as important as others' is essential for your growth.

Understanding this archetype helps you recognize that your capacity for care and empathy is a profound gift. You create the kind of relationships where people feel truly seen and valued. Your challenge is learning to extend that same care and compassion to yourself, and to recognize that setting boundaries and expressing your own needs doesn't make you less caring—it makes you more whole.`,
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
  description: `The Visionary sees possibilities where others see limitations, dreams of what could be, and has an unwavering commitment to growth and purpose. If you identify with this archetype, you're likely driven by big ideas, meaningful goals, and a desire to make a difference in the world. You're not content with the status quo—you're always thinking about how things could be better, more meaningful, or more aligned with your values.

Your attachment style is secure, which means you can balance your big dreams with the practical needs of relationships. You don't see your vision as separate from your relationships—instead, you seek partners who can share in your dreams and support your growth while also pursuing their own.

In relationships, you bring inspiration, purpose, and a sense of possibility. You help your partner see their own potential, dream bigger, and align their life with their values. You're the one who suggests starting a business together, planning meaningful trips, or working toward shared goals that matter.

You express love through words of affirmation and quality time, but especially through shared vision and purpose. You want a partner who understands your dreams and can be part of them. You're not looking for someone to complete you—you're looking for someone to grow with, to build something meaningful with, to change the world with.

However, your focus on the future and big ideas can sometimes make you overlook the present moment or the practical details of daily life. You might struggle with the mundane aspects of relationships—the day-to-day maintenance, the small gestures, the quiet moments. Learning to find meaning and beauty in the ordinary, not just the extraordinary, is a key growth area.

Your idealism can sometimes make you impatient with reality. When relationships don't match your vision, you might feel disappointed or frustrated. You might also prioritize your goals over relationship needs, not because you don't care, but because your sense of purpose is so strong. Learning to balance your vision with the reality of relationships and the needs of your partner is essential.

Understanding this archetype helps you recognize that your ability to see possibilities and create vision is a powerful gift. You inspire others to dream bigger and live more purposefully. Your challenge is learning to ground your vision in the present moment, to find meaning in the everyday, and to remember that the most important change you can make is often in the quality of your relationships, right here, right now.`,
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
  description: `The Free Spirit lives fully in the present moment, embraces spontaneity, and brings infectious energy to every interaction. If you identify with this archetype, you likely find joy in the unexpected, thrive in social settings, and resist anything that feels constraining or routine. You're the life of the party, the one who says yes to adventures, and the person who reminds others that life is meant to be lived with enthusiasm and joy.

Your attachment style tends toward avoidant, which means you value your freedom and independence highly. You might find that too much structure or expectation feels suffocating. You need space to be yourself, to follow your impulses, and to live in the moment without too much planning or constraint.

In relationships, you bring excitement, spontaneity, and a sense of fun. You're the one who suggests last-minute road trips, tries new experiences, and keeps things interesting. You help your partner remember that life doesn't always have to be serious or planned—sometimes the best moments come from saying yes to the unexpected.

You express love through quality time and physical touch, especially in spontaneous, fun ways. You might not be the most reliable when it comes to plans, but you're incredibly present when you're with someone. Your love language is about shared experiences, laughter, and living in the moment together.

However, your need for freedom and spontaneity can sometimes make commitment feel challenging. You might struggle with routine, reliability, or long-term planning. This isn't because you don't care—it's because structure and predictability can feel like they're limiting your ability to be fully alive and present. Learning that commitment and freedom can coexist, and that some structure can actually enhance your ability to be spontaneous, is a key growth area.

Your social nature means you might have many connections but struggle with depth. You might avoid difficult conversations or emotional intimacy because they feel heavy or constraining. Learning to balance your need for fun and lightness with the depth that comes from vulnerability and difficult conversations is essential for meaningful relationships.

Understanding this archetype helps you recognize that your ability to live in the moment and bring joy to others is a beautiful gift. You remind people that life is meant to be enjoyed, not just managed. Your challenge is learning that true freedom comes not from avoiding commitment, but from choosing commitments that align with who you are, and that the deepest joy often comes from the connections you build over time, not just the moments you share in the present.`,
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
  description: `The Anchor is the steady, reliable foundation that others can depend on. If you identify with this archetype, you likely find satisfaction in creating order, following through on commitments, and being someone others can count on. You're the person who shows up, does what needs to be done, and creates stability through your consistent, practical approach to life.

Your attachment style is secure, which means you're comfortable with both intimacy and independence. You don't need constant reassurance or excessive space—you can be close to others while maintaining your own sense of self. This security allows you to be a stable presence for others because you're not constantly managing your own anxiety or needs.

In relationships, you provide a solid foundation. You're the one who remembers to pay bills, plans practical details, and creates routines that make life run smoothly. You express love through acts of service and receiving gifts—you show you care by taking care of practical needs and you feel loved when others notice and appreciate your efforts.

You value structure and reliability because they create predictability and reduce stress. You're not rigid for the sake of being rigid—you're organized because it allows you and your partner to focus on what matters rather than constantly managing chaos. Your practical nature means you're excellent at problem-solving, planning, and creating systems that work.

However, your need for structure can sometimes make you resistant to change or spontaneity. You might struggle when plans are disrupted or when your partner wants to do something unplanned. This isn't because you don't want to have fun—it's because unpredictability can feel stressful when your sense of security is tied to having things organized and under control.

Your practical focus can sometimes make you overlook the emotional or romantic aspects of relationships. You might focus so much on getting things done that you forget to create moments of connection, play, or romance. Learning to balance your practical nature with emotional presence and spontaneity is a key growth area.

Understanding this archetype helps you recognize that your ability to create stability and reliability is a profound gift. You provide the foundation that allows others to feel safe, supported, and able to take risks. Your challenge is learning to balance your need for structure with flexibility, to find joy in spontaneity as well as routine, and to remember that relationships need both practical support and emotional connection to thrive.`,
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
  description: `The Catalyst is a force for transformation, growth, and authentic change. If you identify with this archetype, you're likely driven by a deep need for authenticity, growth, and pushing beyond comfort zones—both your own and others'. You're not interested in surface-level connections or maintaining the status quo. You want relationships that challenge you, help you grow, and push you to become more fully yourself.

Your attachment style tends toward anxious, which means you might have a heightened sensitivity to relationship dynamics and a strong need for connection and reassurance. This isn't a weakness—it's a reflection of how deeply you care and how important relationships are to you. You feel things intensely, and you're not afraid to express those feelings or to push for the depth and authenticity you crave.

In relationships, you bring intensity, passion, and a commitment to growth. You're the one who wants to talk about difficult things, who pushes for honesty even when it's uncomfortable, and who believes that conflict can be transformative if handled with care and intention. You don't shy away from intensity—you embrace it as a pathway to deeper connection.

You express love through words of affirmation and quality time, especially meaningful conversations and shared growth experiences. You want a partner who can match your intensity, who isn't afraid of difficult conversations, and who is committed to their own growth as much as you are to yours.

However, your drive for growth and change can sometimes create conflict or intensity that others find overwhelming. You might push for change or honesty in ways that feel too much, too fast, or too intense. Learning to balance your need for growth with your partner's pace and needs is a crucial growth area.

Your emotional intensity can sometimes make you struggle with compromise or accepting things as they are. You might have strong convictions and find it difficult to let go of things that feel important to you. Learning that not every battle needs to be fought, and that sometimes acceptance and compromise are forms of growth, is essential.

Understanding this archetype helps you recognize that your passion, intensity, and commitment to growth are powerful gifts. You create relationships that are deeply authentic and transformative. Your challenge is learning to channel your intensity in ways that create connection rather than overwhelm, to balance your need for growth with acceptance of what is, and to remember that the most profound transformations often happen gradually, through patience and care, not just through pushing and intensity.`,
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
  description: `The Harmonizer represents a rare ability to find balance, create peace, and adapt to different situations and people. If you identify with this archetype, you likely have a natural gift for seeing multiple perspectives, finding common ground, and creating harmony in your relationships and environments. You're the person others turn to when they need someone who can understand different viewpoints and help find solutions that work for everyone.

Your attachment style is secure, which means you're comfortable with both intimacy and independence. You can be close to others without losing yourself, and you can give space without feeling rejected. This security, combined with your natural adaptability, allows you to connect with a wide variety of people and create harmony in diverse situations.

In relationships, you create a sense of balance and peace. You're excellent at compromise, seeing your partner's perspective, and finding ways to meet both your needs. You don't need to always be right or have things your way—you genuinely want to find solutions that work for both of you. This creates relationships that feel safe, balanced, and mutually supportive.

You express love through all five love languages, which means you're adaptable in how you show and receive love. You can meet your partner where they are and adjust your approach based on what they need. This flexibility makes you an excellent partner for many different archetypes.

However, your desire for harmony and balance can sometimes make you struggle with strong opinions or taking firm stands. You might find yourself adapting so much to others' needs that you lose touch with your own. You might avoid conflict even when it's necessary, or you might struggle to know what you really want because you're so focused on what others need.

Your adaptability can sometimes make you seem indecisive or like you don't have strong convictions. This isn't because you don't care—it's because you can genuinely see multiple valid perspectives and struggle to choose one over another. Learning to develop and express your own strong opinions while still maintaining your ability to see others' perspectives is a key growth area.

Understanding this archetype helps you recognize that your ability to create harmony and find balance is a profound gift. You create relationships that feel safe, peaceful, and mutually supportive. Your challenge is learning to balance your natural adaptability with developing your own strong sense of self, to recognize when harmony is worth maintaining and when it's worth risking conflict for something important, and to remember that your own needs and desires are just as valid as others'.`,
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

