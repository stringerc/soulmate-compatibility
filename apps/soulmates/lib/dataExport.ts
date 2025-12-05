/**
 * Data Export Utility
 * Allows users to export their complete profile data as JSON
 */

export interface ExportableData {
  profile: {
    id?: string;
    primary_archetype?: string;
    attachment_style?: string;
    love_languages?: string[];
    traits?: number[];
    calculated_at?: number;
    [key: string]: any;
  };
  explorationHistory?: {
    totalExplorations: number;
    uniqueArchetypes: number;
    currentStreak: number;
    explorationHistory: Array<{
      archetypeId: string;
      timestamp: number;
    }>;
  };
  bonds?: any[];
  journalEntries?: any[];
  subscription?: {
    tier: string;
    [key: string]: any;
  };
  exportedAt: string;
  exportedBy: string;
  version: string;
}

/**
 * Export user data to JSON file
 */
export async function exportUserData(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Export can only be called in browser');
  }

  // Collect all user data
  const data: ExportableData = {
    profile: {},
    exportedAt: new Date().toISOString(),
    exportedBy: 'user',
    version: '1.0.0',
  };

  // Load profile from localStorage
  try {
    const localProfile = localStorage.getItem('soulmates_profile');
    if (localProfile) {
      data.profile = JSON.parse(localProfile);
    }
  } catch (e) {
    console.error('Failed to load profile from localStorage:', e);
  }

  // Load exploration history
  try {
    const explorationData = localStorage.getItem('soulmates_explorations');
    if (explorationData) {
      const explorations = JSON.parse(explorationData);
      const uniqueArchetypes = new Set(explorations.map((e: any) => e.archetypeId)).size;
      
      // Calculate streak
      let currentStreak = 0;
      if (explorations.length > 0) {
        const sorted = explorations.sort((a: any, b: any) => b.timestamp - a.timestamp);
        let lastDate = new Date(sorted[0].timestamp);
        lastDate.setHours(0, 0, 0, 0);
        
        for (const exp of sorted) {
          const expDate = new Date(exp.timestamp);
          expDate.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor((lastDate.getTime() - expDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 0 || daysDiff === 1) {
            if (daysDiff === 1) currentStreak++;
            lastDate = expDate;
          } else {
            break;
          }
        }
      }

      data.explorationHistory = {
        totalExplorations: explorations.length,
        uniqueArchetypes,
        currentStreak,
        explorationHistory: explorations,
      };
    }
  } catch (e) {
    console.error('Failed to load exploration history:', e);
  }

  // Try to load from backend API
  try {
    const { profileApi, billingApi } = await import('@/lib/api');
    
    // Get profile from backend
    try {
      const backendProfile = await profileApi.get();
      if (backendProfile) {
        const profileData = (backendProfile as any)?.profile || backendProfile;
        // Merge backend data (prefer backend if it exists)
        data.profile = {
          ...data.profile,
          ...profileData,
          // Keep traits from localStorage if backend doesn't have them
          traits: profileData.traits || data.profile.traits,
        };
      }
    } catch (e) {
      // Backend unavailable, use localStorage data
      console.warn('Backend profile unavailable, using localStorage data');
    }

    // Get subscription from backend
    try {
      const subscription = await billingApi.getSubscription();
      data.subscription = subscription as any;
    } catch (e) {
      // Subscription unavailable, skip
    }
  } catch (e) {
    console.error('Failed to load data from backend:', e);
  }

  // Create and download file
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `soulmates-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import user data from JSON file
 */
export async function importUserData(file: File): Promise<ExportableData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as ExportableData;
        
        // Validate data structure
        if (!data.profile) {
          throw new Error('Invalid data format: missing profile');
        }
        
        resolve(data);
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Restore user data from imported JSON
 */
export async function restoreUserData(data: ExportableData): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Restore can only be called in browser');
  }

  // Restore profile to localStorage
  if (data.profile) {
    const profileToStore = {
      ...data.profile,
      calculated_at: data.profile.calculated_at || Date.now(),
      restored_at: Date.now(),
    };
    localStorage.setItem('soulmates_profile', JSON.stringify(profileToStore));
  }

  // Restore exploration history
  if (data.explorationHistory?.explorationHistory) {
    localStorage.setItem('soulmates_explorations', JSON.stringify(data.explorationHistory.explorationHistory));
  }

  // Try to sync to backend
  try {
    const { profileApi } = await import('@/lib/api');
    if (data.profile && data.profile.traits) {
      await profileApi.createOrUpdate({
        traits: data.profile.traits,
        primary_archetype: data.profile.primary_archetype,
        attachment_style: data.profile.attachment_style,
        love_languages: data.profile.love_languages,
      });
    }
  } catch (e) {
    console.warn('Failed to sync restored data to backend:', e);
    // Data is still in localStorage, so user can continue
  }
}

