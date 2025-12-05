/**
 * Social Sharing Utilities
 * Enhanced sharing features for viral growth
 */

export interface ShareableLink {
  id: string;
  type: 'partner_comparison' | 'friend_compatibility' | 'group_assessment' | 'results';
  url: string;
  expiresAt?: number;
  metadata: {
    userId?: string;
    partnerId?: string;
    groupId?: string;
    results?: any;
  };
}

/**
 * Generate shareable link for partner comparison
 */
export function generatePartnerComparisonLink(userId: string): ShareableLink {
  const linkId = `partner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://soulmates.syncscript.app';
  
  const link: ShareableLink = {
    id: linkId,
    type: 'partner_comparison',
    url: `${baseUrl}/compare?link=${linkId}`,
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    metadata: {
      userId,
    },
  };

  // Store in localStorage
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('soulmates_shareable_links') || '[]');
      existing.push(link);
      localStorage.setItem('soulmates_shareable_links', JSON.stringify(existing.slice(-50))); // Keep last 50
    } catch (e) {
      console.error('Failed to store shareable link:', e);
    }
  }

  return link;
}

/**
 * Generate shareable link for friend compatibility
 */
export function generateFriendCompatibilityLink(userId: string): ShareableLink {
  const linkId = `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://soulmates.syncscript.app';
  
  const link: ShareableLink = {
    id: linkId,
    type: 'friend_compatibility',
    url: `${baseUrl}/friend-compat?link=${linkId}`,
    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
    metadata: {
      userId,
    },
  };

  // Store in localStorage
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('soulmates_shareable_links') || '[]');
      existing.push(link);
      localStorage.setItem('soulmates_shareable_links', JSON.stringify(existing.slice(-50)));
    } catch (e) {
      console.error('Failed to store shareable link:', e);
    }
  }

  return link;
}

/**
 * Generate shareable link for group assessment
 */
export function generateGroupAssessmentLink(groupName: string, userId: string): ShareableLink {
  const linkId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://soulmates.syncscript.app';
  
  const link: ShareableLink = {
    id: linkId,
    type: 'group_assessment',
    url: `${baseUrl}/group?link=${linkId}`,
    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
    metadata: {
      userId,
      groupId: linkId,
    },
  };

  // Store in localStorage
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('soulmates_shareable_links') || '[]');
      existing.push(link);
      localStorage.setItem('soulmates_shareable_links', JSON.stringify(existing.slice(-50)));
    } catch (e) {
      console.error('Failed to store shareable link:', e);
    }
  }

  return link;
}

/**
 * Get shareable link by ID
 */
export function getShareableLink(linkId: string): ShareableLink | null {
  if (typeof window === 'undefined') return null;

  try {
    const existing = JSON.parse(localStorage.getItem('soulmates_shareable_links') || '[]');
    const link = existing.find((l: ShareableLink) => l.id === linkId);
    
    if (!link) return null;
    
    // Check expiration
    if (link.expiresAt && link.expiresAt < Date.now()) {
      return null;
    }
    
    return link;
  } catch (e) {
    console.error('Failed to get shareable link:', e);
    return null;
  }
}

/**
 * Share to native share API
 */
export async function shareViaNativeAPI(
  title: string,
  text: string,
  url: string
): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title,
      text,
      url,
    });
    return true;
  } catch (e: any) {
    // User cancelled or error
    if (e.name !== 'AbortError') {
      console.error('Share failed:', e);
    }
    return false;
  }
}

/**
 * Copy link to clipboard
 */
export async function copyLinkToClipboard(url: string): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.clipboard) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (e) {
      return false;
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (e) {
    console.error('Failed to copy to clipboard:', e);
    return false;
  }
}

/**
 * Track share event
 */
export function trackShare(platform: string, linkType: string, linkId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const { logSoulmatesEvent } = require('@/lib/analytics');
    logSoulmatesEvent({
      name: 'social_share' as any,
      payload: {
        platform,
        link_type: linkType,
        link_id: linkId,
        timestamp: Date.now(),
      },
    });
  } catch (e) {
    // Silently fail
  }
}

