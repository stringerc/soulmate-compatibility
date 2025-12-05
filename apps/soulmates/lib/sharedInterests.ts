/**
 * Shared Interests System
 * Manages user interests from various sources (Spotify, Goodreads, Instagram, manual)
 * Foundation for Shared Interests Integration feature
 */

export interface Interest {
  id: string;
  type: 'music' | 'book' | 'movie' | 'hobby' | 'activity' | 'topic';
  name: string;
  source: 'spotify' | 'goodreads' | 'instagram' | 'manual';
  metadata?: {
    artist?: string;
    genre?: string;
    year?: number;
    rating?: number;
  };
}

export interface UserInterests {
  userId: string;
  interests: Interest[];
  lastUpdated: number;
}

/**
 * Store user interests
 */
export function storeUserInterests(userId: string, interests: Interest[]): UserInterests {
  if (typeof window === 'undefined') {
    throw new Error('Cannot store interests on server');
  }

  const userInterests: UserInterests = {
    userId,
    interests,
    lastUpdated: Date.now(),
  };

  try {
    localStorage.setItem(`soulmates_interests_${userId}`, JSON.stringify(userInterests));
  } catch (e) {
    console.error('Failed to store interests:', e);
  }

  return userInterests;
}

/**
 * Get user interests
 */
export function getUserInterests(userId: string): Interest[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(`soulmates_interests_${userId}`);
    if (!stored) return [];
    
    const userInterests: UserInterests = JSON.parse(stored);
    return userInterests.interests || [];
  } catch (e) {
    console.error('Failed to get interests:', e);
    return [];
  }
}

/**
 * Find shared interests between two users
 */
export function findSharedInterests(
  userId1: string,
  userId2: string
): {
  shared: Interest[];
  count: number;
  byType: Record<string, Interest[]>;
} {
  const interests1 = getUserInterests(userId1);
  const interests2 = getUserInterests(userId2);

  // Create maps for quick lookup
  const interests1Map = new Map(
    interests1.map(i => [i.name.toLowerCase(), i])
  );
  const interests2Map = new Map(
    interests2.map(i => [i.name.toLowerCase(), i])
  );

  // Find shared interests
  const shared: Interest[] = [];
  const byType: Record<string, Interest[]> = {};

  for (const [name, interest] of interests1Map) {
    if (interests2Map.has(name)) {
      shared.push(interest);
      
      if (!byType[interest.type]) {
        byType[interest.type] = [];
      }
      byType[interest.type].push(interest);
    }
  }

  return {
    shared,
    count: shared.length,
    byType,
  };
}

/**
 * Generate conversation starters based on shared interests
 */
export function generateConversationStarters(
  sharedInterests: ReturnType<typeof findSharedInterests>
): string[] {
  const starters: string[] = [];

  if (sharedInterests.count === 0) {
    return starters;
  }

  // Music interests
  if (sharedInterests.byType.music && sharedInterests.byType.music.length > 0) {
    const music = sharedInterests.byType.music[0];
    starters.push(
      `I see we both love ${music.name}! What's your favorite song by them?`
    );
  }

  // Book interests
  if (sharedInterests.byType.book && sharedInterests.byType.book.length > 0) {
    const book = sharedInterests.byType.book[0];
    starters.push(
      `You've read ${book.name} too! What did you think of it?`
    );
  }

  // Hobby interests
  if (sharedInterests.byType.hobby && sharedInterests.byType.hobby.length > 0) {
    const hobby = sharedInterests.byType.hobby[0];
    starters.push(
      `I also enjoy ${hobby.name}! Want to plan something together?`
    );
  }

  // Activity interests
  if (sharedInterests.byType.activity && sharedInterests.byType.activity.length > 0) {
    const activity = sharedInterests.byType.activity[0];
    starters.push(
      `We both like ${activity.name}! Have you tried [related activity]?`
    );
  }

  // Generic starter
  if (starters.length === 0 && sharedInterests.shared.length > 0) {
    starters.push(
      `We have ${sharedInterests.count} shared interests! Want to explore them together?`
    );
  }

  return starters;
}

/**
 * Simulate connecting Spotify account
 */
export async function connectSpotify(userId: string): Promise<{ success: boolean; interestsAdded: number }> {
  // In production, this would:
  // 1. Initiate Spotify OAuth flow
  // 2. Get user's top artists/tracks from Spotify API
  // 3. Convert to interests
  // 4. Store in backend

  // Mock data for development
  const mockMusicInterests: Interest[] = [
    {
      id: `spotify_${Date.now()}_1`,
      type: 'music',
      name: 'Indie Rock',
      source: 'spotify',
      metadata: { genre: 'Indie Rock' },
    },
    {
      id: `spotify_${Date.now()}_2`,
      type: 'music',
      name: 'The Beatles',
      source: 'spotify',
      metadata: { artist: 'The Beatles', genre: 'Rock' },
    },
  ];

  const existing = getUserInterests(userId);
  const newInterests = [...existing, ...mockMusicInterests];
  storeUserInterests(userId, newInterests);

  return { success: true, interestsAdded: mockMusicInterests.length };
}

/**
 * Simulate connecting Goodreads account
 */
export async function connectGoodreads(userId: string): Promise<{ success: boolean; interestsAdded: number }> {
  // Mock data for development
  const mockBookInterests: Interest[] = [
    {
      id: `goodreads_${Date.now()}_1`,
      type: 'book',
      name: 'Sapiens',
      source: 'goodreads',
      metadata: { rating: 5 },
    },
    {
      id: `goodreads_${Date.now()}_2`,
      type: 'book',
      name: 'The Seven Husbands of Evelyn Hugo',
      source: 'goodreads',
      metadata: { rating: 4 },
    },
  ];

  const existing = getUserInterests(userId);
  const newInterests = [...existing, ...mockBookInterests];
  storeUserInterests(userId, newInterests);

  return { success: true, interestsAdded: mockBookInterests.length };
}

/**
 * Add manual interest
 */
export function addManualInterest(
  userId: string,
  interest: Omit<Interest, 'id' | 'source'>
): Interest {
  const fullInterest: Interest = {
    ...interest,
    id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    source: 'manual',
  };

  const existing = getUserInterests(userId);
  storeUserInterests(userId, [...existing, fullInterest]);

  return fullInterest;
}

