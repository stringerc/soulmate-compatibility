'use client';

import { useState, useEffect } from 'react';
import { apiClient, Partner, APIKey } from '@/lib/api';
import PartnerDashboard from '@/components/partner/Dashboard';
import APIKeyManager from '@/components/partner/APIKeyManager';
import UsageAnalytics from '@/components/partner/UsageAnalytics';
import PartnerOnboarding from '@/components/partner/Onboarding';

export default function PartnerPortal() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    try {
      setLoading(true);
      // In a real app, you'd get partner ID from auth/session
      // For now, we'll use a demo flow
      const partnerId = localStorage.getItem('partner_id');
      
      if (!partnerId) {
        setShowOnboarding(true);
        setLoading(false);
        return;
      }

      const partnerData = await apiClient.getPartner(partnerId);
      setPartner(partnerData);
      
      const keys = await apiClient.listAPIKeys(partnerId);
      setAPIKeys(keys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load partner data');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (data: {
    company_name: string;
    email: string;
    tier: string;
  }) => {
    try {
      const newPartner = await apiClient.createPartner(data);
      localStorage.setItem('partner_id', newPartner.id);
      setPartner(newPartner);
      setShowOnboarding(false);
      await loadPartnerData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create partner');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading partner portal...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <PartnerOnboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-purple-600 text-white rounded-lg py-2 hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!partner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <PartnerDashboard
          partner={partner}
          apiKeys={apiKeys}
          onRefresh={loadPartnerData}
        />
        
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <APIKeyManager
            partnerId={partner.id}
            apiKeys={apiKeys}
            onRefresh={loadPartnerData}
          />
          
          <UsageAnalytics partnerId={partner.id} />
        </div>
      </div>
    </div>
  );
}

