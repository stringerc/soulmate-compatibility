/**
 * Authentication utilities for Soulmates frontend
 * Handles JWT token decoding and user ID extraction
 */

/**
 * Get current user ID from JWT token stored in localStorage
 * 
 * @returns User ID string or null if token is invalid/missing
 */
export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") {
    // Server-side rendering - return null
    return null;
  }

  const token = localStorage.getItem("auth_token");
  if (!token) {
    return null;
  }

  try {
    // JWT tokens have 3 parts: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("Invalid JWT token format");
      return null;
    }

    // Decode the payload (base64url encoded)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    
    // Try different common JWT claim names for user ID
    const userId = payload.sub || 
                   payload.user_id || 
                   payload.id || 
                   payload.userId ||
                   payload.user?.id ||
                   null;

    return userId ? String(userId) : null;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
}

/**
 * Get current user email from JWT token
 * 
 * @returns Email string or null if token is invalid/missing
 */
export function getCurrentUserEmail(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("auth_token");
  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.email || payload.user_email || null;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * 
 * @returns true if valid token exists, false otherwise
 */
export function isAuthenticated(): boolean {
  return getCurrentUserId() !== null;
}

/**
 * Get full JWT token
 * 
 * @returns JWT token string or null
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("auth_token");
}

/**
 * Get user ID from token
 */
export function getUserId(): string | null {
  return getCurrentUserId();
}

/**
 * Get user email from token
 */
export function getUserEmail(): string | null {
  return getCurrentUserEmail();
}

/**
 * Sign out user
 */
export function signOut(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_email");
  window.location.href = "/";
}

