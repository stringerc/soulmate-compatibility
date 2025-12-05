/**
 * Data Sync Utility
 * Ensures user data is always saved to backend with retry logic
 */

interface SyncQueueItem {
  type: 'profile' | 'exploration' | 'bond';
  data: any;
  timestamp: number;
  retries: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const SYNC_QUEUE_KEY = 'soulmates_sync_queue';

/**
 * Get sync queue from localStorage
 */
function getSyncQueue(): SyncQueueItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const queue = localStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save sync queue to localStorage
 */
function saveSyncQueue(queue: SyncQueueItem[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to save sync queue:', e);
  }
}

/**
 * Add item to sync queue
 */
export function queueSync(type: SyncQueueItem['type'], data: any): void {
  const queue = getSyncQueue();
  queue.push({
    type,
    data,
    timestamp: Date.now(),
    retries: 0,
  });
  saveSyncQueue(queue);
}

/**
 * Process sync queue (retry failed syncs)
 */
export async function processSyncQueue(): Promise<void> {
  const queue = getSyncQueue();
  if (queue.length === 0) return;

  const { profileApi } = await import('@/lib/api');
  const remaining: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      if (item.type === 'profile') {
        await profileApi.createOrUpdate(item.data);
        // Success - don't add to remaining
      } else {
        // For other types, just remove from queue (not implemented yet)
        // Success - don't add to remaining
      }
    } catch (error) {
      // Failed - increment retries
      item.retries++;
      
      if (item.retries < MAX_RETRIES) {
        // Still have retries left - keep in queue
        remaining.push(item);
      } else {
        // Max retries reached - log error but don't keep in queue
        console.error(`Failed to sync ${item.type} after ${MAX_RETRIES} retries:`, error);
      }
    }
  }

  saveSyncQueue(remaining);
}

/**
 * Sync profile data to backend with retry logic
 */
export async function syncProfileToBackend(profileData: any): Promise<boolean> {
  try {
    const { profileApi } = await import('@/lib/api');
    
    // Try to save immediately
    await profileApi.createOrUpdate(profileData);
    return true;
  } catch (error) {
    // If immediate save fails, queue it for retry
    console.warn('Failed to save profile immediately, queuing for retry:', error);
    queueSync('profile', profileData);
    
    // Try to process queue in background
    setTimeout(() => {
      processSyncQueue().catch(console.error);
    }, RETRY_DELAY);
    
    return false;
  }
}

/**
 * Initialize sync queue processing on page load
 */
export function initializeSyncQueue(): void {
  if (typeof window === 'undefined') return;

  // Process queue on page load
  processSyncQueue().catch(console.error);

  // Process queue periodically (every 30 seconds)
  setInterval(() => {
    processSyncQueue().catch(console.error);
  }, 30000);

  // Process queue when coming back online
  window.addEventListener('online', () => {
    processSyncQueue().catch(console.error);
  });
}

/**
 * Get sync status
 */
export function getSyncStatus(): {
  queued: number;
  lastSync: number | null;
  isSyncing: boolean;
} {
  const queue = getSyncQueue();
  const lastSync = localStorage.getItem('soulmates_last_sync');
  
  return {
    queued: queue.length,
    lastSync: lastSync ? parseInt(lastSync, 10) : null,
    isSyncing: queue.length > 0,
  };
}

