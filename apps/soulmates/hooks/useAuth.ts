"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getAuthToken, getUserId, getUserEmail } from "@/lib/auth";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  userEmail: string | null;
}

export function useAuth(): AuthState {
  // Try NextAuth first (preferred)
  const { data: session, status } = useSession();
  
  // Fallback to JWT token auth (magic links)
  const [jwtState, setJwtState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userId: null,
    userEmail: null,
  });

  useEffect(() => {
    // Check JWT token (magic link fallback)
    const checkJwtAuth = () => {
      const token = getAuthToken();
      const userId = getUserId();
      const userEmail = getUserEmail();

      setJwtState({
        isAuthenticated: !!token && !!userId,
        isLoading: false,
        userId,
        userEmail,
      });
    };

    checkJwtAuth();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkJwtAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    
    const interval = setInterval(checkJwtAuth, 60000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Prefer NextAuth session if available
  if (status === "loading") {
    return {
      isAuthenticated: false,
      isLoading: true,
      userId: null,
      userEmail: null,
    };
  }

  if (session) {
    return {
      isAuthenticated: true,
      isLoading: false,
      userId: (session as any).userId || (session.user as any)?.id || null,
      userEmail: session.user?.email || null,
    };
  }

  // Fallback to JWT
  return jwtState;
}

