/**
 * Exploration Tracking System
 * Tracks user exploration history, badges, and progress
 */

export interface ExplorationRecord {
  archetypeId: string;
  archetypeName: string;
  exploredAt: number;
  compatibilityScore: number;
  insightsViewed: boolean;
}

export interface ExplorationStats {
  totalExplorations: number;
  uniqueArchetypes: number;
  explorationHistory: ExplorationRecord[];
  badges: ExplorationBadge[];
  currentStreak: number;
  lastExplorationDate: number | null;
}

export interface ExplorationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: number;
}

const STORAGE_KEY = 'soulmates_explorations';
const BADGES: ExplorationBadge[] = [
  {
    id: 'first_exploration',
    name: 'First Steps',
    description: 'Explored your first archetype',
    icon: '🌱',
    earned: false,
  },
  {
    id: 'curious_mind',
    name: 'Curious Mind',
    description: 'Explored 3 different archetypes',
    icon: '🔍',
    earned: false,
  },
  {
    id: 'compatibility_explorer',
    name: 'Compatibility Explorer',
    description: 'Explored 5 different archetypes',
    icon: '🎯',
    earned: false,
  },
  {
    id: 'master_explorer',
    name: 'Master Explorer',
    description: 'Explored all 8 archetypes',
    icon: '⭐',
    earned: false,
  },
  {
    id: 'deep_diver',
    name: 'Deep Diver',
    description: 'Explored the same archetype 3+ times',
    icon: '💎',
    earned: false,
  },
  {
    id: 'variety_seeker',
    name: 'Variety Seeker',
    description: 'Explored archetypes from all categories',
    icon: '🎨',
    earned: false,
  },
];

/**
 * Get exploration stats from localStorage
 */
export function getExplorationStats(): ExplorationStats {
  if (typeof window === 'undefined') {
    return {
      totalExplorations: 0,
      uniqueArchetypes: 0,
      explorationHistory: [],
      badges: BADGES.map(b => ({ ...b })),
      currentStreak: 0,
      lastExplorationDate: null,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        totalExplorations: 0,
        uniqueArchetypes: 0,
        explorationHistory: [],
        badges: BADGES.map(b => ({ ...b })),
        currentStreak: 0,
        lastExplorationDate: null,
      };
    }

    const data = JSON.parse(stored);
    return {
      totalExplorations: data.totalExplorations || 0,
      uniqueArchetypes: data.uniqueArchetypes || 0,
      explorationHistory: data.explorationHistory || [],
      badges: data.badges || BADGES.map(b => ({ ...b })),
      currentStreak: data.currentStreak || 0,
      lastExplorationDate: data.lastExplorationDate || null,
    };
  } catch (e) {
    return {
      totalExplorations: 0,
      uniqueArchetypes: 0,
      explorationHistory: [],
      badges: BADGES.map(b => ({ ...b })),
      currentStreak: 0,
      lastExplorationDate: null,
    };
  }
}

/**
 * Record an exploration
 */
export function recordExploration(
  archetypeId: string,
  archetypeName: string,
  compatibilityScore: number
): { newBadges: ExplorationBadge[]; stats: ExplorationStats } {
  const stats = getExplorationStats();
  const now = Date.now();
  const today = new Date(now).toDateString();
  const lastDate = stats.lastExplorationDate 
    ? new Date(stats.lastExplorationDate).toDateString()
    : null;

  // Check streak
  let newStreak = stats.currentStreak;
  if (lastDate === today) {
    // Already explored today, no streak change
  } else if (lastDate === new Date(now - 86400000).toDateString()) {
    // Explored yesterday, continue streak
    newStreak = stats.currentStreak + 1;
  } else {
    // Streak broken
    newStreak = 1;
  }

  // Add exploration record
  const newRecord: ExplorationRecord = {
    archetypeId,
    archetypeName,
    exploredAt: now,
    compatibilityScore,
    insightsViewed: false,
  };

  const updatedHistory = [...stats.explorationHistory, newRecord];
  const uniqueArchetypes = new Set(updatedHistory.map(r => r.archetypeId)).size;

  // Check for new badges
  const newBadges: ExplorationBadge[] = [];
  const updatedBadges = stats.badges.map(badge => {
    let earned = badge.earned;

    switch (badge.id) {
      case 'first_exploration':
        if (!earned && updatedHistory.length >= 1) {
          earned = true;
          newBadges.push({ ...badge, earned: true, earnedAt: now });
        }
        break;
      case 'curious_mind':
        if (!earned && uniqueArchetypes >= 3) {
          earned = true;
          newBadges.push({ ...badge, earned: true, earnedAt: now });
        }
        break;
      case 'compatibility_explorer':
        if (!earned && uniqueArchetypes >= 5) {
          earned = true;
          newBadges.push({ ...badge, earned: true, earnedAt: now });
        }
        break;
      case 'master_explorer':
        if (!earned && uniqueArchetypes >= 8) {
          earned = true;
          newBadges.push({ ...badge, earned: true, earnedAt: now });
        }
        break;
      case 'deep_diver':
        if (!earned) {
          const archetypeCounts = updatedHistory.reduce((acc, r) => {
            acc[r.archetypeId] = (acc[r.archetypeId] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          if (Object.values(archetypeCounts).some(count => count >= 3)) {
            earned = true;
            newBadges.push({ ...badge, earned: true, earnedAt: now });
          }
        }
        break;
    }

    return { ...badge, earned };
  });

  // Save updated stats
  const updatedStats: ExplorationStats = {
    totalExplorations: updatedHistory.length,
    uniqueArchetypes,
    explorationHistory: updatedHistory,
    badges: updatedBadges,
    currentStreak: newStreak,
    lastExplorationDate: now,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStats));
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to save exploration stats:', e);
    }
  }

  return { newBadges, stats: updatedStats };
}

/**
 * Get recommended archetypes based on exploration history
 */
export function getRecommendedArchetypes(
  userArchetype: string | null,
  exploredIds: string[]
): string[] {
  // If user has an archetype, recommend complementary ones
  if (userArchetype) {
    const recommendations: Record<string, string[]> = {
      'guardian': ['explorer', 'free_spirit', 'visionary'],
      'explorer': ['guardian', 'nurturer', 'anchor'],
      'nurturer': ['explorer', 'visionary', 'catalyst'],
      'visionary': ['nurturer', 'anchor', 'guardian'],
      'free_spirit': ['anchor', 'guardian', 'nurturer'],
      'anchor': ['free_spirit', 'explorer', 'visionary'],
      'catalyst': ['harmonizer', 'nurturer', 'guardian'],
      'harmonizer': ['catalyst', 'visionary', 'explorer'],
    };

    return recommendations[userArchetype.toLowerCase()] || [];
  }

  // Otherwise, recommend unexplored archetypes
  const allIds = ['guardian', 'explorer', 'nurturer', 'visionary', 'free_spirit', 'anchor', 'catalyst', 'harmonizer'];
  return allIds.filter(id => !exploredIds.includes(id)).slice(0, 3);
}

/**
 * Get exploration count for an archetype
 */
export function getArchetypeExplorationCount(archetypeId: string): number {
  const stats = getExplorationStats();
  return stats.explorationHistory.filter(r => r.archetypeId === archetypeId).length;
}

