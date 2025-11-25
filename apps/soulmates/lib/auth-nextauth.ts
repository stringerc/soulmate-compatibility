/**
 * NextAuth.js Authentication Utilities
 * Wrapper around next-auth for easier use
 */

import { getSession, signOut as nextAuthSignOut } from "next-auth/react";

export interface AuthSession {
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
  accessToken?: string;
  userId?: string;
  provider?: string;
}

/**
 * Get current session
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  if (typeof window === "undefined") return null;
  
  try {
    const session = await getSession();
    return session as AuthSession | null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getAuthSession();
  return session?.userId || session?.user?.id || null;
}

/**
 * Get current user email
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  const session = await getAuthSession();
  return session?.user?.email || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession();
  return !!session;
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  await nextAuthSignOut({ callbackUrl: "/" });
}

/**
 * Get access token (for API calls)
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getAuthSession();
  return session?.accessToken || null;
}

