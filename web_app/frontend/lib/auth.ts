/**
 * Authentication Utilities
 * Privacy-first magic link authentication
 * 
 * Research: Magic links preferred by 67% of users (Auth0, 2024)
 */

export interface User {
  id: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
}

export interface SavedResult {
  id: string;
  person1Data: {
    traits: number[];
    birthdate?: string;
    name: string;
  };
  person2Data: {
    traits: number[];
    birthdate?: string;
    name: string;
  };
  compatibilityScore: number;
  createdAt: string;
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    
    // Verify token with backend
    const response = await fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch {
    return false;
  }
};

interface MagicLinkResponse {
  success: boolean;
  message: string;
  devLink?: string;
  backupLink?: string;
  emailFailed?: boolean;
  emailId?: string;
  warning?: string;
  errorDetails?: any;
}

/**
 * Request magic link
 */
export const requestMagicLink = async (email: string): Promise<MagicLinkResponse> => {
  try {
    const response = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    // Log for debugging
    if (data.devLink || data.backupLink) {
      console.log('[AUTH] Magic link (dev/backup mode):', data.devLink || data.backupLink);
    }
    if (data.emailId) {
      console.log('[AUTH] Email sent successfully, ID:', data.emailId);
    }
    
    return data;
  } catch (error) {
    console.error('[AUTH] Magic link request failed:', error);
    return {
      success: false,
      message: 'Failed to send magic link. Please check your connection and try again.',
    };
  }
};

/**
 * Save results to user account
 */
export const saveResults = async (
  person1Data: SavedResult['person1Data'],
  person2Data: SavedResult['person2Data'],
  compatibilityScore: number
): Promise<{ success: boolean; resultId?: string; message?: string }> => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return {
        success: false,
        message: 'Please sign in to save your results',
      };
    }
    
    const response = await fetch('/api/results/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        person1Data,
        person2Data,
        compatibilityScore,
      }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Failed to save results. Please try again.',
    };
  }
};

/**
 * Get saved results for current user
 */
export const getSavedResults = async (): Promise<SavedResult[]> => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return [];
    
    const response = await fetch('/api/results/list', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.results || [];
  } catch {
    return [];
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    const response = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) return null;
    
    return await response.json();
  } catch {
    return null;
  }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_email');
  window.location.href = '/';
};

