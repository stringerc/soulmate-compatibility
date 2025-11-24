'use client';

import { useState } from 'react';
import { Book, Code, Key, Zap, Shield, TrendingUp } from 'lucide-react';

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = {
    'getting-started': {
      title: 'Getting Started',
      icon: Zap,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-3">Quick Start</h3>
            <p className="text-gray-600 mb-4">
              Get started with the Soulmate Compatibility API in minutes.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Create a partner account</li>
              <li>Generate an API key</li>
              <li>Make your first API call</li>
            </ol>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Base URL</h4>
            <code className="text-sm bg-white px-3 py-1 rounded border">
              {process.env.NEXT_PUBLIC_API_URL || 'https://api.soulmates.syncscript.app'}
            </code>
          </div>
        </div>
      ),
    },
    'authentication': {
      title: 'Authentication',
      icon: Key,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-3">API Key Authentication</h3>
            <p className="text-gray-600 mb-4">
              All API requests require authentication using an API key in the header.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-2">Header Format</h4>
              <code className="text-sm bg-white px-3 py-1 rounded border block">
                X-API-Key: sk_live_your_api_key_here
              </code>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Security Note:</strong> Keep your API keys secure. Never expose them in client-side code or public repositories.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    'endpoints': {
      title: 'API Endpoints',
      icon: Code,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-3">Calculate Compatibility</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">POST</span>
                <code className="text-sm">/api/v1/compatibility/calculate</code>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Calculate compatibility between two people.
              </p>
              
              <h4 className="font-semibold mb-2">Request Body</h4>
              <pre className="bg-white rounded p-3 text-xs overflow-x-auto">
{`{
  "person1": {
    "traits": [0.5, 0.6, ...] // 32D vector
  },
  "person2": {
    "traits": [0.5, 0.6, ...] // 32D vector
  },
  "resonance": [0.5, 0.5, ...], // Optional 7D vector
  "include_numerology": false,
  "include_astrology": false
}`}
              </pre>
              
              <h4 className="font-semibold mb-2 mt-4">Response</h4>
              <pre className="bg-white rounded p-3 text-xs overflow-x-auto">
{`{
  "compatibility_score": 0.87,
  "trait_compatibility": 0.85,
  "resonance_compatibility": 0.90,
  "total_compatibility": 0.87,
  "dimension_breakdown": {...},
  "timestamp": "2024-12-24T...",
  "request_id": "..."
}`}
              </pre>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-3">Batch Calculate</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">POST</span>
                <code className="text-sm">/api/v1/compatibility/batch</code>
              </div>
              <p className="text-sm text-gray-600">
                Calculate compatibility for multiple pairs (up to 100).
              </p>
            </div>
          </div>
        </div>
      ),
    },
    'rate-limits': {
      title: 'Rate Limits',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-3">Tier-Based Rate Limits</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Tier</th>
                    <th className="border p-3 text-left">Per Minute</th>
                    <th className="border p-3 text-left">Per Day</th>
                    <th className="border p-3 text-left">Batch Limit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-3 font-semibold">Starter</td>
                    <td className="border p-3">60</td>
                    <td className="border p-3">10,000</td>
                    <td className="border p-3">10 pairs</td>
                  </tr>
                  <tr>
                    <td className="border p-3 font-semibold">Professional</td>
                    <td className="border p-3">300</td>
                    <td className="border p-3">100,000</td>
                    <td className="border p-3">50 pairs</td>
                  </tr>
                  <tr>
                    <td className="border p-3 font-semibold">Enterprise</td>
                    <td className="border p-3">1,000</td>
                    <td className="border p-3">1,000,000</td>
                    <td className="border p-3">100 pairs</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Rate Limit Headers:</strong> Responses include X-RateLimit-Remaining and X-RateLimit-Reset headers.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    'examples': {
      title: 'Code Examples',
      icon: Book,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-3">JavaScript/TypeScript</h3>
            <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">
{`const response = await fetch(
  'https://api.soulmates.syncscript.app/api/v1/compatibility/calculate',
  {
    method: 'POST',
    headers: {
      'X-API-Key': 'sk_live_your_api_key',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      person1: { traits: [0.5] * 32 },
      person2: { traits: [0.6] * 32 },
    }),
  }
);

const data = await response.json();
console.log(data.compatibility_score);`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-3">Python</h3>
            <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">
{`import requests

response = requests.post(
    'https://api.soulmates.syncscript.app/api/v1/compatibility/calculate',
    headers={
        'X-API-Key': 'sk_live_your_api_key',
        'Content-Type': 'application/json',
    },
    json={
        'person1': {'traits': [0.5] * 32},
        'person2': {'traits': [0.6] * 32},
    }
)

data = response.json()
print(data['compatibility_score'])`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-3">cURL</h3>
            <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">
{`curl -X POST \\
  https://api.soulmates.syncscript.app/api/v1/compatibility/calculate \\
  -H "X-API-Key: sk_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "person1": {"traits": [0.5, 0.6, ...]},
    "person2": {"traits": [0.5, 0.6, ...]}
  }'`}
            </pre>
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">API Documentation</h1>
          <p className="text-gray-600">
            Complete guide to using the Soulmate Compatibility API
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 sticky top-4">
              <h2 className="font-bold text-gray-900 mb-4">Sections</h2>
              <nav className="space-y-2">
                {Object.entries(sections).map(([key, section]) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveSection(key)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition ${
                        activeSection === key
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {sections[activeSection as keyof typeof sections]?.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

