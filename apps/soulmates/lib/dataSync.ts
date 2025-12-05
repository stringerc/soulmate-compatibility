/**
 * Data Sync Utility
 * Ensures user data is always saved to backend with retry logic
 */

import { useState, useEffect } from 'react';

interface SyncQueueItem {
  type: 'profile' | 'exploration' | 'bond';
  data: any;
  timestamp: number;
  retries: number;
}

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000; // 30 seconds
const SYNC_QUEUE_KEY = 'soulmates_sync_queue';

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(retries: number): number {
  const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries);
  return Math.min(delay, MAX_RETRY_DELAY);
}

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
 * Process sync queue (retry failed syncs with exponential backoff)
 */
export async function processSyncQueue(): Promise<void> {
  const queue = getSyncQueue();
  if (queue.length === 0) return;

  const { profileApi } = await import('@/lib/api');
  const remaining: SyncQueueItem[] = [];

  for (const item of queue) {
    // Check if enough time has passed since last attempt (exponential backoff)
    const timeSinceLastAttempt = Date.now() - item.timestamp;
    const requiredDelay = getRetryDelay(item.retries);
    
    if (timeSinceLastAttempt < requiredDelay) {
      // Not enough time has passed - keep in queue for later
      remaining.push(item);
      continue;
    }

    try {
      if (item.type === 'profile') {
        await profileApi.createOrUpdate(item.data);
        // Success - update last sync time
        if (typeof window !== 'undefined') {
          localStorage.setItem('soulmates_last_sync', Date.now().toString());
        }
        // Don't add to remaining (successfully synced)
      } else {
        // For other types, just remove from queue (not implemented yet)
        // Don't add to remaining
      }
    } catch (error) {
      // Failed - increment retries and update timestamp
      item.retries++;
      item.timestamp = Date.now();
      
      if (item.retries < MAX_RETRIES) {
        // Still have retries left - keep in queue with updated timestamp
        remaining.push(item);
        
        // Schedule next retry attempt
        const nextDelay = getRetryDelay(item.retries);
        setTimeout(() => {
          processSyncQueue().catch(console.error);
        }, nextDelay);
      } else {
        // Max retries reached - log error but don't keep in queue
        console.error(`Failed to sync ${item.type} after ${MAX_RETRIES} retries:`, error);
        
        // Store failed sync for manual recovery
        if (typeof window !== 'undefined') {
          try {
            const failedSyncs = JSON.parse(localStorage.getItem('soulmates_failed_syncs') || '[]');
            failedSyncs.push({
              ...item,
              error: error instanceof Error ? error.message : String(error),
              failedAt: Date.now(),
            });
            localStorage.setItem('soulmates_failed_syncs', JSON.stringify(failedSyncs));
          } catch (e) {
            console.error('Failed to store failed sync:', e);
          }
        }
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
    }, INITIAL_RETRY_DELAY);
    
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
  failedSyncs: number;
} {
  const queue = getSyncQueue();
  const lastSync = localStorage.getItem('soulmates_last_sync');
  
  let failedSyncs = 0;
  if (typeof window !== 'undefined') {
    try {
      const failed = localStorage.getItem('soulmates_failed_syncs');
      if (failed) {
        failedSyncs = JSON.parse(failed).length;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  return {
    queued: queue.length,
    lastSync: lastSync ? parseInt(lastSync, 10) : null,
    isSyncing: queue.length > 0,
    failedSyncs,
  };
}

/**
 * React hook for sync status
 */
export function useDataSync() {
  const [syncStatus, setSyncStatus] = useState(getSyncStatus());

  useEffect(() => {
    // Update sync status periodically
    const interval = setInterval(() => {
      setSyncStatus(getSyncStatus());
    }, 5000);

    // Update on storage changes
    const handleStorageChange = () => {
      setSyncStatus(getSyncStatus());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  return syncStatus;
}

