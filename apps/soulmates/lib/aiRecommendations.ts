/**
 * AI Recommendations System
 * Personalized suggestions based on user profile and behavior
 */

import { calculateCompatibility } from './compatibilityEngine';
import { ARCHETYPAL_PROFILES } from './archetypalProfiles';

export interface Recommendation {
  id: string;
  type: 'archetype' | 'feature' | 'action' | 'insight';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number; // 0-1
  metadata?: Record<string, any>;
}

export interface UserProfile {
  traits?: number[];
  primary_archetype?: string;
  attachment_style?: string;
  love_languages?: string[];
  explorationHistory?: string[];
  lastActive?: number;
}

/**
 * Get personalized archetype recommendations
 */
export function getArchetypeRecommendations(
  userProfile: UserProfile,
  limit: number = 3
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  if (!userProfile.traits || userProfile.traits.length !== 32) {
    return recommendations;
  }
  
  const explored = userProfile.explorationHistory || [];
  
  // Calculate compatibility with all archetypes
  const archetypeScores = ARCHETYPAL_PROFILES.map((profile) => {
    const compatibility = calculateCompatibility(
      userProfile.traits!,
      profile.traits
    );
    
    return {
      profile,
      score: compatibility.overall,
      explored: explored.includes(profile.id),
    };
  });

  // Sort by compatibility score (highest first)
  archetypeScores.sort((a, b) => b.score - a.score);

  // Recommend top unexplored archetypes
  const unexplored = archetypeScores.filter(a => !a.explored);
  const topUnexplored = unexplored.slice(0, limit);

  topUnexplored.forEach((item, index) => {
    recommendations.push({
      id: `archetype_${item.profile.id}`,
      type: 'archetype',
      title: `Explore ${item.profile.name}`,
      description: `You're ${Math.round(item.score * 100)}% compatible with ${item.profile.name}. Discover what makes this connection special.`,
      priority: index === 0 ? 'high' : 'medium',
      confidence: item.score,
      metadata: {
        archetypeId: item.profile.id,
        compatibilityScore: item.score,
      },
    });
  });

  return recommendations;
}

/**
 * Get feature recommendations based on user activity
 */
export function getFeatureRecommendations(
  userProfile: UserProfile
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const explored = userProfile.explorationHistory || [];

  // Recommend Couple Mode if not used
  if (!explored.includes('couple_mode')) {
    recommendations.push({
      id: 'feature_couple_mode',
      type: 'feature',
      title: 'Try Couple Mode',
      description: 'Connect with your partner and see your compatibility in real-time. Discover how you complement each other.',
      priority: 'high',
      confidence: 0.9,
      metadata: {
        feature: 'couple_mode',
        href: '/bonds',
      },
    });
  }

  // Recommend Resonance Lab if not used
  if (!explored.includes('resonance_lab')) {
    recommendations.push({
      id: 'feature_resonance_lab',
      type: 'feature',
      title: 'Explore Resonance Lab',
      description: 'Deep dive into your relationship patterns and discover insights about your connection style.',
      priority: 'medium',
      confidence: 0.8,
      metadata: {
        feature: 'resonance_lab',
        href: '/lab',
      },
    });
  }

  // Recommend Journaling if not used
  if (!explored.includes('journaling')) {
    recommendations.push({
      id: 'feature_journaling',
      type: 'feature',
      title: 'Start Your Soul Journey',
      description: 'Reflect on your compatibility insights and track your relationship growth over time.',
      priority: 'medium',
      confidence: 0.7,
      metadata: {
        feature: 'journaling',
        href: '/journaling',
      },
    });
  }

  return recommendations;
}

/**
 * Get action recommendations based on user state
 */
export function getActionRecommendations(
  userProfile: UserProfile
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const lastActive = userProfile.lastActive || Date.now();
  const daysSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);

  // Recommend retaking test if profile is old
  if (daysSinceActive > 90) {
    recommendations.push({
      id: 'action_retake_test',
      type: 'action',
      title: 'Update Your Profile',
      description: 'People change over time. Retake the assessment to see how your compatibility profile has evolved.',
      priority: 'high',
      confidence: 0.85,
      metadata: {
        action: 'retake_test',
        href: '/onboarding',
      },
    });
  }

  // Recommend sharing if high compatibility found
  if (userProfile.primary_archetype) {
    recommendations.push({
      id: 'action_share_results',
      type: 'action',
      title: 'Share Your Results',
      description: 'Help friends discover their compatibility! Share your journey and invite them to take the test.',
      priority: 'medium',
      confidence: 0.75,
      metadata: {
        action: 'share',
      },
    });
  }

  return recommendations;
}

/**
 * Get insight recommendations based on profile analysis
 */
export function getInsightRecommendations(
  userProfile: UserProfile
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Analyze attachment style for insights
  if (userProfile.attachment_style) {
    if (userProfile.attachment_style.toLowerCase().includes('anxious')) {
      recommendations.push({
        id: 'insight_attachment_anxious',
        type: 'insight',
        title: 'Understanding Anxious Attachment',
        description: 'Your attachment style suggests you value close connections. Learn how to communicate your needs effectively.',
        priority: 'high',
        confidence: 0.9,
        metadata: {
          insight_type: 'attachment_style',
          href: '/lab',
        },
      });
    }

    if (userProfile.attachment_style.toLowerCase().includes('avoidant')) {
      recommendations.push({
        id: 'insight_attachment_avoidant',
        type: 'insight',
        title: 'Understanding Avoidant Attachment',
        description: 'Your attachment style shows you value independence. Discover how to balance autonomy with connection.',
        priority: 'high',
        confidence: 0.9,
        metadata: {
          insight_type: 'attachment_style',
          href: '/lab',
        },
      });
    }
  }

  // Analyze love languages
  if (userProfile.love_languages && userProfile.love_languages.length > 0) {
    recommendations.push({
      id: 'insight_love_languages',
      type: 'insight',
      title: 'Express Your Love Languages',
      description: `Your primary love languages are ${userProfile.love_languages.slice(0, 2).join(' and ')}. Learn how to communicate love in ways that resonate.`,
      priority: 'medium',
      confidence: 0.8,
      metadata: {
        insight_type: 'love_languages',
        href: '/me',
      },
    });
  }

  return recommendations;
}

/**
 * Get all recommendations for a user
 */
export function getAllRecommendations(
  userProfile: UserProfile,
  limit: number = 5
): Recommendation[] {
  const allRecommendations: Recommendation[] = [
    ...getArchetypeRecommendations(userProfile, 2),
    ...getFeatureRecommendations(userProfile),
    ...getActionRecommendations(userProfile),
    ...getInsightRecommendations(userProfile),
  ];

  // Sort by priority and confidence
  allRecommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.confidence - a.confidence;
  });

  return allRecommendations.slice(0, limit);
}

/**
 * Get personalized match suggestions
 */
export function getMatchSuggestions(
  userProfile: UserProfile,
  allProfiles: UserProfile[],
  limit: number = 5
): Recommendation[] {
  const suggestions: Recommendation[] = [];

  if (!userProfile.traits || userProfile.traits.length !== 32) {
    return suggestions;
  }

  // Calculate compatibility with all profiles
  const matches = allProfiles
    .filter(profile => profile.traits && profile.traits.length === 32)
    .map(profile => {
      const compatibility = calculateCompatibility(
        userProfile.traits!,
        profile.traits!
      );

      return {
        profile,
        compatibility: compatibility.overall,
      };
    })
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, limit);

  matches.forEach((match, index) => {
    suggestions.push({
      id: `match_${match.profile.primary_archetype || index}`,
      type: 'archetype',
      title: `Compatible Match: ${match.profile.primary_archetype || 'Unknown'}`,
      description: `You're ${Math.round(match.compatibility * 100)}% compatible. Explore what makes this connection special.`,
      priority: match.compatibility > 0.8 ? 'high' : 'medium',
      confidence: match.compatibility,
      metadata: {
        compatibilityScore: match.compatibility,
        archetype: match.profile.primary_archetype,
        href: '/explore',
      },
    });
  });

  return suggestions;
}

