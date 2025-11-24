'use client';

import { Partner, APIKey } from '@/lib/api';
import { CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';

interface DashboardProps {
  partner: Partner;
  apiKeys: APIKey[];
  onRefresh: () => void;
}

export default function PartnerDashboard({ partner, apiKeys }: DashboardProps) {
  const activeKeys = apiKeys.filter(key => !key.revoked_at).length;
  const tierColors = {
    starter: 'bg-blue-100 text-blue-800',
    professional: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-indigo-100 text-indigo-800',
    research: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{partner.company_name}</h1>
            <p className="text-gray-600 mt-1">{partner.email}</p>
          </div>
          <div className="text-right">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${tierColors[partner.tier]}`}>
              {partner.tier.charAt(0).toUpperCase() + partner.tier.slice(1)}
            </span>
            <p className="text-sm text-gray-500 mt-2">
              Status: <span className="font-semibold">{partner.status}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Keys</p>
              <p className="text-2xl font-bold text-gray-900">{activeKeys}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{partner.status}</p>
            </div>
            <div className={`rounded-full p-3 ${
              partner.status === 'active' ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {partner.status === 'active' ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tier</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{partner.tier}</p>
            </div>
            <div className="bg-indigo-100 rounded-full p-3">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(partner.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-pink-100 rounded-full p-3">
              <Clock className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg py-3 px-6 hover:from-purple-600 hover:to-pink-600 transition">
            Create API Key
          </button>
          <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg py-3 px-6 hover:from-indigo-600 hover:to-purple-600 transition">
            View Documentation
          </button>
          <button className="bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg py-3 px-6 hover:from-pink-600 hover:to-red-600 transition">
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}

