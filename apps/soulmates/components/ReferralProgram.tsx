'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Gift, Users } from 'lucide-react';
import { useToast } from './Toast';

interface ReferralProgramProps {
  userId?: string;
}

export default function ReferralProgram({ userId }: ReferralProgramProps) {
  const [referralCode, setReferralCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    // Generate or load referral code
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('soulmates_referral_code');
      if (stored) {
        setReferralCode(stored);
      } else {
        // Generate a simple referral code
        const code = userId 
          ? `SOUL-${userId.slice(0, 8).toUpperCase()}`
          : `SOUL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        setReferralCode(code);
        localStorage.setItem('soulmates_referral_code', code);
      }

      // Load referral count
      const count = localStorage.getItem('soulmates_referral_count');
      if (count) {
        setReferralCount(parseInt(count, 10));
      }
    }
  }, [userId]);

  const handleCopy = async () => {
    if (!referralCode) return;
    
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://soulmates.syncscript.app'}?ref=${referralCode}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('Referral link copied! Share it with friends!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast('Failed to copy link. Please try again.', 'error');
    }
  };

  const getRewardTier = () => {
    if (referralCount >= 10) return { tier: 'Lifetime Premium', unlocked: true };
    if (referralCount >= 5) return { tier: 'Couple Mode Early Access', unlocked: true };
    if (referralCount >= 3) return { tier: 'Advanced Compatibility', unlocked: true };
    if (referralCount >= 1) return { tier: 'Premium Insights', unlocked: true };
    return { tier: 'Premium Insights', unlocked: false, next: 1 };
  };

  const rewardTier = getRewardTier();

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-pink-200 dark:border-pink-800">
      {ToastComponent}
      <div className="flex items-start gap-4">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg p-3">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Invite Friends & Earn Rewards! 🎁
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Share your referral link and unlock exclusive features as your friends join!
          </p>

          {/* Referral Code */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Referral Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={referralCode ? `${typeof window !== 'undefined' ? window.location.origin : 'https://soulmates.syncscript.app'}?ref=${referralCode}` : 'Generating...'}
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg transition-all flex items-center gap-2 font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Referral Stats */}
          <div className="flex items-center gap-4 mb-4 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-500" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Referrals</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{referralCount}</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">Current Reward</p>
              <p className={`text-sm font-semibold ${rewardTier.unlocked ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                {rewardTier.unlocked ? `✓ ${rewardTier.tier}` : `${rewardTier.tier} (${rewardTier.next} more)`}
              </p>
            </div>
          </div>

          {/* Reward Tiers */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Reward Tiers:</p>
            <div className="space-y-1 text-xs">
              <div className={`flex items-center gap-2 ${referralCount >= 1 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                {referralCount >= 1 ? '✓' : '○'} 1 referral: Premium Insights (1 month)
              </div>
              <div className={`flex items-center gap-2 ${referralCount >= 3 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                {referralCount >= 3 ? '✓' : '○'} 3 referrals: Advanced Compatibility features
              </div>
              <div className={`flex items-center gap-2 ${referralCount >= 5 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                {referralCount >= 5 ? '✓' : '○'} 5 referrals: Couple Mode early access
              </div>
              <div className={`flex items-center gap-2 ${referralCount >= 10 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                {referralCount >= 10 ? '✓' : '○'} 10 referrals: Lifetime premium features
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

