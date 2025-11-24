'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { Play, Copy, CheckCircle2, AlertCircle } from 'lucide-react';

export default function APITestPage() {
  const [apiKey, setAPIKey] = useState('');
  const [person1Traits, setPerson1Traits] = useState<number[]>(new Array(32).fill(0.5));
  const [person2Traits, setPerson2Traits] = useState<number[]>(new Array(32).fill(0.5));
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      apiClient.setAPIKey(apiKey);
      const response = await apiClient.calculateCompatibility({
        person1: { traits: person1Traits },
        person2: { traits: person2Traits },
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API request failed');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Testing Interface</h1>
          <p className="text-gray-600">
            Test the compatibility API with your API key
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Request</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setAPIKey(e.target.value)}
                placeholder="sk_live_..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Person 1 Traits (32 values, 0-1)
              </label>
              <textarea
                value={JSON.stringify(person1Traits)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    if (Array.isArray(parsed) && parsed.length === 32) {
                      setPerson1Traits(parsed);
                    }
                  } catch {}
                }}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm"
                placeholder="[0.5, 0.6, ...]"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Person 2 Traits (32 values, 0-1)
              </label>
              <textarea
                value={JSON.stringify(person2Traits)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    if (Array.isArray(parsed) && parsed.length === 32) {
                      setPerson2Traits(parsed);
                    }
                  } catch {}
                }}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm"
                placeholder="[0.5, 0.6, ...]"
              />
            </div>

            <button
              onClick={handleTest}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg py-3 px-6 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Testing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Test API
                </>
              )}
            </button>
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Response</h2>
              {result && (
                <button
                  onClick={copyResult}
                  className="text-purple-600 hover:text-purple-800"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">Error</span>
                </div>
                <p className="text-sm text-red-700 mt-2">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Compatibility Score</h3>
                  <div className="text-3xl font-bold text-purple-600">
                    {(result.compatibility_score * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trait Compatibility:</span>
                    <span className="font-semibold">{(result.trait_compatibility * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resonance Compatibility:</span>
                    <span className="font-semibold">{(result.resonance_compatibility * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Compatibility:</span>
                    <span className="font-semibold">{(result.total_compatibility * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700">
                    Full Response JSON
                  </summary>
                  <pre className="mt-2 bg-white rounded p-3 text-xs overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {!result && !error && (
              <div className="text-center py-12 text-gray-500">
                <p>Enter your API key and click "Test API" to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

