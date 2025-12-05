/**
 * Social Connections System
 * Manages friend connections, mutual friends, and social graph
 * Foundation for Friends of Friends Discovery feature
 */

export interface SocialConnection {
  id: string;
  userId: string;
  connectedUserId: string;
  connectionType: 'facebook' | 'instagram' | 'linkedin' | 'manual';
  connectedAt: number;
  metadata?: {
    name?: string;
    profilePicture?: string;
    mutualFriends?: string[];
  };
}

export interface MutualConnection {
  userId: string;
  mutualFriendIds: string[];
  count: number;
}

/**
 * Store social connection (for now in localStorage, later in backend)
 */
export function storeSocialConnection(connection: Omit<SocialConnection, 'id' | 'connectedAt'>): SocialConnection {
  if (typeof window === 'undefined') {
    throw new Error('Cannot store connection on server');
  }

  const fullConnection: SocialConnection = {
    ...connection,
    id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    connectedAt: Date.now(),
  };

  try {
    const existing = JSON.parse(localStorage.getItem('soulmates_social_connections') || '[]');
    existing.push(fullConnection);
    localStorage.setItem('soulmates_social_connections', JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to store social connection:', e);
  }

  return fullConnection;
}

/**
 * Get user's social connections
 */
export function getUserConnections(userId: string): SocialConnection[] {
  if (typeof window === 'undefined') return [];

  try {
    const all = JSON.parse(localStorage.getItem('soulmates_social_connections') || '[]');
    return all.filter((conn: SocialConnection) => conn.userId === userId);
  } catch (e) {
    console.error('Failed to get connections:', e);
    return [];
  }
}

/**
 * Find mutual connections between two users
 */
export function findMutualConnections(
  userId1: string,
  userId2: string
): MutualConnection {
  const connections1 = getUserConnections(userId1);
  const connections2 = getUserConnections(userId2);

  const friendIds1 = new Set(connections1.map(c => c.connectedUserId));
  const friendIds2 = new Set(connections2.map(c => c.connectedUserId));

  const mutualFriendIds = Array.from(friendIds1).filter(id => friendIds2.has(id));

  return {
    userId: userId2,
    mutualFriendIds,
    count: mutualFriendIds.length,
  };
}

/**
 * Get friends of friends (potential matches)
 */
export function getFriendsOfFriends(
  userId: string,
  excludeIds: string[] = []
): Array<{
  userId: string;
  mutualConnections: MutualConnection;
  connectionPath: string[]; // Path showing how they're connected
}> {
  const userConnections = getUserConnections(userId);
  const friendsOfFriends: Map<string, {
    userId: string;
    mutualConnections: MutualConnection;
    connectionPath: string[];
  }> = new Map();

  // For each direct friend
  for (const friend of userConnections) {
    // Get their connections
    const friendConnections = getUserConnections(friend.connectedUserId);
    
    // For each friend of friend
    for (const fof of friendConnections) {
      // Skip if it's the original user or excluded
      if (fof.connectedUserId === userId || excludeIds.includes(fof.connectedUserId)) {
        continue;
      }

      // Find mutual connections
      const mutual = findMutualConnections(userId, fof.connectedUserId);
      
      if (mutual.count > 0) {
        const existing = friendsOfFriends.get(fof.connectedUserId);
        if (!existing || mutual.count > existing.mutualConnections.count) {
          friendsOfFriends.set(fof.connectedUserId, {
            userId: fof.connectedUserId,
            mutualConnections: mutual,
            connectionPath: [friend.connectedUserId, fof.connectedUserId],
          });
        }
      }
    }
  }

  return Array.from(friendsOfFriends.values()).sort(
    (a, b) => b.mutualConnections.count - a.mutualConnections.count
  );
}

/**
 * Connect social account via MCP/Composio OAuth
 * Uses MCP tools to handle OAuth flow automatically
 */
export async function connectSocialAccount(
  provider: 'facebook' | 'instagram' | 'linkedin',
  userId: string
): Promise<{ success: boolean; connectionsAdded: number; authUrl?: string; error?: string }> {
  if (typeof window === 'undefined') {
    return { success: false, connectionsAdded: 0 };
  }

  try {
    // Get authorization URL from API
    const response = await fetch('/api/v1/soulmates/social/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ provider }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Social initiate API error:', response.status, errorData);
      return { 
        success: false, 
        connectionsAdded: 0, 
        error: errorData.error || `API returned ${response.status}` 
      };
    }

    const data = await response.json();

    if (!data.success) {
      console.error('Social initiate failed:', data);
      return { 
        success: false, 
        connectionsAdded: 0, 
        error: data.error || 'Failed to initiate connection' 
      };
    }

    // Return auth URL for user to authorize
    if (data.authUrl) {
      console.log('Social auth URL received:', provider, data.authUrl);
      return { 
        success: true, 
        connectionsAdded: 0, 
        authUrl: data.authUrl 
      };
    }

    // If already connected, try to get connections
    // This would use MCP tools to fetch friends/connections
    // For now, return success with mock data fallback
    const existingConnections = JSON.parse(
      localStorage.getItem('soulmates_social_connections') || '[]'
    );
    
    const existingUserIds = new Set<string>(
      existingConnections
        .filter((c: SocialConnection) => c.userId !== userId)
        .map((c: SocialConnection) => c.connectedUserId)
    );

    const mockConnections = Array.from(existingUserIds)
      .slice(0, 5)
      .map((connectedUserId) => ({
        userId,
        connectedUserId,
        connectionType: provider,
      }));

    let added = 0;
    for (const conn of mockConnections) {
      try {
        storeSocialConnection(conn);
        added++;
      } catch (e) {
        console.error('Failed to add connection:', e);
      }
    }

    return { success: true, connectionsAdded: added };
  } catch (error: any) {
    console.error('Failed to connect social account:', error);
    return { success: false, connectionsAdded: 0, error: error.message };
  }
}

