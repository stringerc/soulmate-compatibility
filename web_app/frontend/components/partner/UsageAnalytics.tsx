'use client';

import { useState, useEffect } from 'react';
import { apiClient, UsageStats } from '@/lib/api';
import { BarChart3, TrendingUp, Clock, AlertCircle } from 'lucide-react';

interface UsageAnalyticsProps {
  partnerId: string;
}

export default function UsageAnalytics({ partnerId }: UsageAnalyticsProps) {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadStats();
  }, [partnerId, timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endDate = new Date().toISOString();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));
      
      const data = await apiClient.getUsageStats(
        partnerId,
        startDate.toISOString(),
        endDate
      );
      setStats(data);
    } catch (err) {
      // If endpoint doesn't exist yet, show placeholder
      setStats({
        total_requests: 0,
        successful_requests: 0,
        failed_requests: 0,
        average_response_time: 0,
        endpoints: {},
        status_codes: {},
      });
      setError('Usage analytics endpoint not yet implemented');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Usage Analytics</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const successRate = stats.total_requests > 0
    ? ((stats.successful_requests / stats.total_requests) * 100).toFixed(1)
    : '0';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Usage Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
          className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">Total Requests</p>
          <BarChart3 className="w-5 h-5 text-purple-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.total_requests.toLocaleString()}</p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">Success Rate</p>
          <TrendingUp className="w-5 h-5 text-green-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">Avg Response Time</p>
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {stats.average_response_time > 0
            ? `${stats.average_response_time.toFixed(0)}ms`
            : 'N/A'}
        </p>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">Failed Requests</p>
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.failed_requests.toLocaleString()}</p>
      </div>
    </div>

      {/* Endpoints Breakdown */}
      {Object.keys(stats.endpoints).length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Endpoints</h3>
          <div className="space-y-2">
            {Object.entries(stats.endpoints).map(([endpoint, count]) => (
              <div key={endpoint} className="flex items-center justify-between text-sm">
                <code className="text-gray-600">{endpoint}</code>
                <span className="font-semibold text-gray-900">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

