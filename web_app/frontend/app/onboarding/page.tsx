'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    primaryArchetype: '',
    attachmentStyle: '',
    loveLanguages: [] as string[],
    birthdate: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Call the new Soulmates API
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Please sign in first');
        router.push('/');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/soulmates/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          primary_archetype: formData.primaryArchetype,
          attachment_style: formData.attachmentStyle,
          love_languages: formData.loveLanguages,
          astrology_meta: formData.birthdate ? { birthdate: formData.birthdate } : undefined,
          numerology_meta: formData.birthdate ? { birthdate: formData.birthdate } : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      const result = await response.json();
      
      // Log analytics event (if analytics is available)
      try {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'onboard_completed', {
            has_archetype: !!formData.primaryArchetype,
            has_birthdate: !!formData.birthdate,
          });
        }
      } catch (e) {
        console.error('Analytics error:', e);
      }
      
      router.push('/me');
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 transition-colors duration-200">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto shadow-lg">
              <Sparkles className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Complete Your Soul Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Tell us about yourself to unlock personalized insights
          </p>
        </div>
        
        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block mb-2 font-semibold text-gray-900 dark:text-white text-lg">
                Your Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name (optional)"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:focus:border-pink-500 transition-all"
              />
            </div>

            {/* Primary Archetype */}
            <div>
              <label className="block mb-2 font-semibold text-gray-900 dark:text-white text-lg">
                Primary Archetype
              </label>
              <select
                value={formData.primaryArchetype}
                onChange={(e) => setFormData({ ...formData, primaryArchetype: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:focus:border-pink-500 transition-all"
                required
              >
                <option value="">Select your archetype...</option>
                <option value="explorer">🌍 Explorer - Adventurous and curious</option>
                <option value="builder">🏗️ Builder - Practical and goal-oriented</option>
                <option value="connector">🤝 Connector - Social and relationship-focused</option>
                <option value="thinker">🧠 Thinker - Analytical and introspective</option>
              </select>
            </div>

            {/* Attachment Style */}
            <div>
              <label className="block mb-2 font-semibold text-gray-900 dark:text-white text-lg">
                Attachment Style
              </label>
              <select
                value={formData.attachmentStyle}
                onChange={(e) => setFormData({ ...formData, attachmentStyle: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:focus:border-pink-500 transition-all"
                required
              >
                <option value="">Select your attachment style...</option>
                <option value="secure">💚 Secure - Comfortable with intimacy and independence</option>
                <option value="anxious">💛 Anxious - Seeks reassurance and closeness</option>
                <option value="avoidant">💙 Avoidant - Values independence and self-reliance</option>
              </select>
            </div>

            {/* Love Languages */}
            <div>
              <label className="block mb-3 font-semibold text-gray-900 dark:text-white text-lg">
                Love Languages
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select all that resonate with you
              </p>
              <div className="space-y-3">
                {[
                  { value: 'Words of Affirmation', icon: '💬' },
                  { value: 'Acts of Service', icon: '🤲' },
                  { value: 'Receiving Gifts', icon: '🎁' },
                  { value: 'Quality Time', icon: '⏰' },
                  { value: 'Physical Touch', icon: '🤗' },
                ].map((lang) => (
                  <label
                    key={lang.value}
                    className="flex items-center p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700 hover:bg-pink-50 dark:hover:bg-pink-900/20 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={formData.loveLanguages.includes(lang.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, loveLanguages: [...formData.loveLanguages, lang.value] });
                        } else {
                          setFormData({ ...formData, loveLanguages: formData.loveLanguages.filter(l => l !== lang.value) });
                        }
                      }}
                      className="mr-3 w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-2xl mr-3">{lang.icon}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{lang.value}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Birthdate */}
            <div>
              <label className="block mb-2 font-semibold text-gray-900 dark:text-white text-lg">
                Birthdate
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Optional - for astrology and numerology insights
              </p>
              <input
                type="date"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:focus:border-pink-500 transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-lg"
            >
              <Heart className="w-5 h-5" />
              <span>Complete Profile</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

