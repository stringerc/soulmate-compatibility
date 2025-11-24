'use client';

import { useState } from 'react';
import { apiClient, APIKey, APIKeyCreateResponse } from '@/lib/api';
import { Key, Copy, Trash2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

interface APIKeyManagerProps {
  partnerId: string;
  apiKeys: APIKey[];
  onRefresh: () => void;
}

export default function APIKeyManager({ partnerId, apiKeys, onRefresh }: APIKeyManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<APIKeyCreateResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a name for the API key');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createAPIKey(partnerId, newKeyName);
      setNewKey(response);
      apiClient.setAPIKey(response.api_key);
      setNewKeyName('');
      setShowCreateModal(false);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.revokeAPIKey(partnerId, keyId);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">API Keys</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg px-4 py-2 hover:from-purple-600 hover:to-pink-600 transition"
        >
          + Create Key
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* New Key Display */}
      {newKey && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-green-800">New API Key Created</h3>
            <button
              onClick={() => setNewKey(null)}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-green-700 mb-2">{newKey.warning}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white border border-green-200 rounded px-3 py-2 text-sm font-mono">
              {newKey.api_key}
            </code>
            <button
              onClick={() => copyToClipboard(newKey.api_key)}
              className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="space-y-3">
        {apiKeys.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No API keys yet. Create your first key to get started.</p>
        ) : (
          apiKeys.map((key) => (
            <div
              key={key.id}
              className={`border rounded-lg p-4 ${
                key.revoked_at ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${
                    key.revoked_at ? 'bg-gray-200' : 'bg-purple-100'
                  }`}>
                    <Key className={`w-5 h-5 ${
                      key.revoked_at ? 'text-gray-500' : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{key.name}</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(key.created_at).toLocaleDateString()}
                      {key.last_used_at && (
                        <> • Last used: {new Date(key.last_used_at).toLocaleDateString()}</>
                      )}
                    </p>
                    {key.revoked_at && (
                      <p className="text-sm text-red-600 mt-1">
                        Revoked: {new Date(key.revoked_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                {!key.revoked_at && (
                  <button
                    onClick={() => handleRevokeKey(key.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Revoke key"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New API Key</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Name
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production Key"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewKeyName('');
                  setError(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg py-2 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

