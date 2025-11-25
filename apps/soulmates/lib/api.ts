/**
 * API client for Soulmates backend
 * Handles authenticated requests with environment-driven base URL
 */

/**
 * Get API base URL with proper fallback logic
 * - Uses NEXT_PUBLIC_API_BASE_URL if set
 * - Falls back to localhost:8000 in development if NEXT_PUBLIC_USE_FASTAPI=true
 * - Otherwise uses same-origin (empty string) for Next.js API routes
 */
function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
  
  // If base URL is not set and we're in development
  if (!base && process.env.NODE_ENV === "development") {
    // Check if FastAPI backend is explicitly requested
    if (process.env.NEXT_PUBLIC_USE_FASTAPI === "true") {
      return "http://localhost:8000";
    }
    // Otherwise, use same-origin (empty string = relative paths for Next.js API routes)
    return "";
  }
  
  return base;
}

const API_BASE_URL = getApiBaseUrl();

async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  // Build full URL
  const url = API_BASE_URL 
    ? `${API_BASE_URL}${normalizedEndpoint}`
    : normalizedEndpoint; // Relative path for same-origin
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // For cookies if needed
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    // For 503 errors, include more context
    if (response.status === 503) {
      throw new Error(error.detail || error.error || "Backend service unavailable. Please try again later.");
    }
    throw new Error(error.detail || error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Profile API
export const profileApi = {
  get: () => apiRequest("/api/v1/soulmates/profile"),
  createOrUpdate: (data: any) => apiRequest("/api/v1/soulmates/profile", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};

// Journaling API
export const journalingApi = {
  list: (bondId?: string) => {
    const params = bondId ? `?bond_id=${bondId}` : "";
    return apiRequest(`/api/v1/soulmates/journaling/entries${params}`);
  },
  create: (data: any) => apiRequest("/api/v1/soulmates/journaling/entries", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};

// Compatibility API
export const compatibilityApi = {
  explore: (data: {
    target_user_id?: string;
    hypothetical_profile?: any;
    allow_astrology?: boolean;
    allow_numerology?: boolean;
  }) => apiRequest("/api/v1/soulmates/compatibility/explore", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  getForBond: (bondId: string) => 
    apiRequest(`/api/v1/soulmates/bonds/${bondId}/compatibility`),
};

// Bonds API
export const bondsApi = {
  list: (status?: string) => {
    const params = status ? `?status=${status}` : "";
    return apiRequest<{ bonds: any[] }>(`/api/v1/soulmates/bonds${params}`);
  },
  invite: (data: {
    to_user_id?: string;
    to_email?: string;
    bond_type?: string;
  }) => apiRequest("/api/v1/soulmates/bonds/invite", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  accept: (data: { invite_id?: string; invite_token?: string }) =>
    apiRequest("/api/v1/soulmates/bonds/accept", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  end: (bondId: string) =>
    apiRequest("/api/v1/soulmates/bonds/end", {
      method: "POST",
      body: JSON.stringify({ bond_id: bondId }),
    }),
  get: (bondId: string) =>
    apiRequest(`/api/v1/soulmates/bonds/${bondId}`),
};

// Billing API
export const billingApi = {
  getPlans: () => apiRequest<{ plans: any[] }>("/api/v1/soulmates/billing/plans"),
  checkout: (data: { plan_slug: string; bond_id?: string }) =>
    apiRequest<{ url: string }>("/api/v1/soulmates/billing/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getSubscription: (bondId?: string) => {
    const params = bondId ? `?bond_id=${bondId}` : "";
    return apiRequest<{ tier: string; subscription: any }>(`/api/v1/soulmates/billing/subscription${params}`);
  },
};

// Resonance API
export const resonanceApi = {
  getSolo: (windowDays: number = 30) =>
    apiRequest(`/api/v1/soulmates/resonance?window_days=${windowDays}`),
  getCouple: (bondId: string, windowDays: number = 30) =>
    apiRequest(`/api/v1/soulmates/bonds/${bondId}/resonance?window_days=${windowDays}`),
};

