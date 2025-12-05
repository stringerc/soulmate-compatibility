/**
 * Retention Hooks System
 * Daily features and engagement mechanics to drive retention
 */

export interface DailyFeature {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  completed: boolean;
  completedAt?: number;
  streak?: number;
}

export interface RetentionStats {
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  lastActiveDate: number | null;
  dailyFeaturesCompleted: number;
  totalFeaturesCompleted: number;
}

/**
 * Get retention stats from localStorage
 */
export function getRetentionStats(): RetentionStats {
  if (typeof window === 'undefined') {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDaysActive: 0,
      lastActiveDate: null,
      dailyFeaturesCompleted: 0,
      totalFeaturesCompleted: 0,
    };
  }

  try {
    const stored = localStorage.getItem('soulmates_retention_stats');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load retention stats:', e);
  }

  return {
    currentStreak: 0,
    longestStreak: 0,
    totalDaysActive: 0,
    lastActiveDate: null,
    dailyFeaturesCompleted: 0,
    totalFeaturesCompleted: 0,
  };
}

/**
 * Update retention stats
 */
export function updateRetentionStats(updates: Partial<RetentionStats>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getRetentionStats();
    const updated = { ...current, ...updates };
    
    // Calculate streak
    const today = new Date().toDateString();
    const lastActive = updated.lastActiveDate 
      ? new Date(updated.lastActiveDate).toDateString()
      : null;
    
    if (lastActive !== today) {
      // New day - check if streak continues
      if (lastActive) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (lastActive === yesterdayStr) {
          // Streak continues
          updated.currentStreak = (updated.currentStreak || 0) + 1;
        } else {
          // Streak broken
          updated.currentStreak = 1;
        }
      } else {
        // First time
        updated.currentStreak = 1;
      }
      
      updated.lastActiveDate = Date.now();
      updated.totalDaysActive = (updated.totalDaysActive || 0) + 1;
    }
    
    // Update longest streak
    if (updated.currentStreak > (updated.longestStreak || 0)) {
      updated.longestStreak = updated.currentStreak;
    }
    
    localStorage.setItem('soulmates_retention_stats', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update retention stats:', e);
  }
}

/**
 * Track daily activity
 */
export function trackDailyActivity(activityType: string): void {
  updateRetentionStats({});
  
  // Log analytics
  try {
    const { logSoulmatesEvent } = require('@/lib/analytics');
    logSoulmatesEvent({
      name: 'daily_activity' as any,
      payload: {
        activity_type: activityType,
        date: new Date().toISOString().split('T')[0],
      },
    });
  } catch (e) {
    // Silently fail
  }
}

/**
 * Get daily features for today
 */
export function getDailyFeatures(): DailyFeature[] {
  const stats = getRetentionStats();
  const today = new Date().toISOString().split('T')[0];
  
  return [
    {
      id: 'daily_checkin',
      name: 'Daily Check-In',
      description: 'Visit your dashboard today',
      unlocked: true,
      completed: stats.lastActiveDate 
        ? new Date(stats.lastActiveDate).toISOString().split('T')[0] === today
        : false,
      completedAt: stats.lastActiveDate || undefined,
      streak: stats.currentStreak,
    },
    {
      id: 'explore_archetype',
      name: 'Explore an Archetype',
      description: 'Discover compatibility with a new archetype',
      unlocked: true,
      completed: false, // Would need to check exploration history
    },
    {
      id: 'journal_entry',
      name: 'Journal Entry',
      description: 'Reflect on your relationship journey',
      unlocked: true,
      completed: false, // Would need to check journal entries
    },
    {
      id: 'share_results',
      name: 'Share Your Results',
      description: 'Share your compatibility insights',
      unlocked: true,
      completed: false, // Would need to track shares
    },
  ];
}

/**
 * Complete a daily feature
 */
export function completeDailyFeature(featureId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `soulmates_daily_feature_${featureId}_${new Date().toISOString().split('T')[0]}`;
    localStorage.setItem(key, Date.now().toString());
    
    const stats = getRetentionStats();
    updateRetentionStats({
      dailyFeaturesCompleted: (stats.dailyFeaturesCompleted || 0) + 1,
      totalFeaturesCompleted: (stats.totalFeaturesCompleted || 0) + 1,
    });
    
    // Log analytics
    const { logSoulmatesEvent } = require('@/lib/analytics');
    logSoulmatesEvent({
      name: 'daily_feature_completed' as any,
      payload: {
        feature_id: featureId,
      },
    });
  } catch (e) {
    console.error('Failed to complete daily feature:', e);
  }
}

/**
 * Check if daily feature is completed
 */
export function isDailyFeatureCompleted(featureId: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const key = `soulmates_daily_feature_${featureId}_${new Date().toISOString().split('T')[0]}`;
    return !!localStorage.getItem(key);
  } catch (e) {
    return false;
  }
}

