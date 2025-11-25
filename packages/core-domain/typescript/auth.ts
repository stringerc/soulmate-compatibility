/**
 * Auth utilities
 * Bridges different auth solutions (JWT, Auth0, etc.)
 */

export interface User {
  id: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
}

/**
 * Get current user from session
 * Works with JWT, Auth0, or other auth solutions
 */
export async function getCurrentUser(): Promise<User | null> {
  // Try JWT first (existing implementation)
  try {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (!token) return null;

      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        return await response.json();
      }
    }
  } catch (error) {
    console.debug("[auth] JWT auth failed, trying Auth0...", error);
  }

  // TODO: Add Auth0 support if AUTH0_ISSUER_BASE_URL is set
  // if (process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL) {
  //   const session = await getSession();
  //   if (session?.user) {
  //     return {
  //       id: session.user.sub,
  //       email: session.user.email,
  //       createdAt: session.user.created_at,
  //     };
  //   }
  // }

  return null;
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Authentication required");
  }
  return user;
}

