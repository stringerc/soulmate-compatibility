/**
 * B2B API Client
 * Client-side API wrapper for partner portal
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Partner {
  id: string;
  company_name: string;
  email: string;
  tier: 'starter' | 'professional' | 'enterprise' | 'research';
  status: 'active' | 'suspended' | 'cancelled' | 'trial';
  created_at: string;
  updated_at: string;
}

export interface APIKey {
  id: string;
  name: string;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

export interface APIKeyCreateResponse {
  api_key: string;
  name: string;
  created_at: string;
  warning: string;
}

export interface UsageStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time: number;
  endpoints: Record<string, number>;
  status_codes: Record<number, number>;
}

export interface CompatibilityRequest {
  person1: {
    traits: number[];
  };
  person2: {
    traits: number[];
  };
  resonance?: number[];
  include_numerology?: boolean;
  include_astrology?: boolean;
  birthdate1?: string;
  birthdate2?: string;
}

export interface CompatibilityResponse {
  compatibility_score: number;
  trait_compatibility: number;
  resonance_compatibility: number;
  total_compatibility: number;
  dimension_breakdown: Record<string, number>;
  numerology_score?: number;
  astrology_score?: number;
  timestamp: string;
  request_id: string;
}

class APIClient {
  private baseURL: string;
  private apiKey: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    // Load API key from localStorage if available
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('api_key');
    }
  }

  setAPIKey(key: string) {
    this.apiKey = key;
    if (typeof window !== 'undefined') {
      localStorage.setItem('api_key', key);
    }
  }

  clearAPIKey() {
    this.apiKey = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('api_key');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Partner Management
  async createPartner(data: {
    company_name: string;
    email: string;
    tier?: string;
    ip_whitelist?: string[];
  }): Promise<Partner> {
    return this.request<Partner>('/api/v1/partners/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPartner(partnerId: string): Promise<Partner> {
    return this.request<Partner>(`/api/v1/partners/${partnerId}`);
  }

  // API Key Management
  async createAPIKey(partnerId: string, name: string): Promise<APIKeyCreateResponse> {
    return this.request<APIKeyCreateResponse>(
      `/api/v1/partners/${partnerId}/api-keys`,
      {
        method: 'POST',
        body: JSON.stringify({ name }),
      }
    );
  }

  async listAPIKeys(partnerId: string): Promise<APIKey[]> {
    return this.request<APIKey[]>(`/api/v1/partners/${partnerId}/api-keys`);
  }

  async revokeAPIKey(partnerId: string, keyId: string): Promise<void> {
    await this.request(`/api/v1/partners/${partnerId}/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  }

  // Compatibility API
  async calculateCompatibility(
    request: CompatibilityRequest
  ): Promise<CompatibilityResponse> {
    return this.request<CompatibilityResponse>('/api/v1/compatibility/calculate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async batchCalculateCompatibility(
    requests: CompatibilityRequest[]
  ): Promise<{ results: CompatibilityResponse[]; count: number; timestamp: string }> {
    return this.request('/api/v1/compatibility/batch', {
      method: 'POST',
      body: JSON.stringify({ pairs: requests }),
    });
  }

  // Usage Analytics (via Next.js API route)
  async getUsageStats(
    partnerId: string,
    startDate?: string,
    endDate?: string
  ): Promise<UsageStats> {
    const params = new URLSearchParams();
    params.append('partner_id', partnerId);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return this.request<UsageStats>(
      `/api/partner/usage?${params.toString()}`
    );
  }
}

export const apiClient = new APIClient();

