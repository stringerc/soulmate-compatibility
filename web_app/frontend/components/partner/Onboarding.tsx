'use client';

import { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (data: {
    company_name: string;
    email: string;
    tier: string;
  }) => void;
}

export default function PartnerOnboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    tier: 'starter',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!formData.company_name || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onComplete(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Soulmate Compatibility API
            </h1>
            <p className="text-gray-600 mb-8">
              Get started with our B2B compatibility API. Join hundreds of partners using our platform.
            </p>
            <button
              onClick={() => setStep(2)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg px-8 py-3 hover:from-purple-600 hover:to-pink-600 transition flex items-center gap-2 mx-auto"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Company Info */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Your Company Name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Tier
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="starter">Starter - $5K/month</option>
                  <option value="professional">Professional - $25K/month</option>
                  <option value="enterprise">Enterprise - Custom</option>
                  <option value="research">Research - Custom</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.company_name || !formData.email}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg py-2 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Complete</h2>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Company Name</p>
                  <p className="font-semibold text-gray-900">{formData.company_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{formData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plan Tier</p>
                  <p className="font-semibold text-gray-900 capitalize">{formData.tier}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg py-2 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

