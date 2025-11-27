'use client';

import { useEffect, useState } from 'react';
import { Reward, getRewardAnimationClass } from '@/lib/rewardSystem';
import { Sparkles, Heart, Trophy, Star, Gift } from 'lucide-react';

interface RewardNotificationProps {
  reward: Reward;
  onDismiss: () => void;
}

export default function RewardNotification({ reward, onDismiss }: RewardNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for fade-out animation
    }, 3000);

    // Start animation
    setTimeout(() => setIsAnimating(false), 100);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (reward.animation) {
      case 'sparkle':
        return <Sparkles className="w-6 h-6" />;
      case 'heart':
        return <Heart className="w-6 h-6" />;
      case 'star':
        return <Star className="w-6 h-6" />;
      case 'badge':
        return <Trophy className="w-6 h-6" />;
      case 'confetti':
        return <Gift className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  return (
    <div
      className={`relative bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-2xl p-4 min-w-[280px] max-w-sm transform transition-all duration-300 ${
        isAnimating ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`${getRewardAnimationClass(reward.animation)} text-yellow-300`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{reward.message}</p>
          <p className="text-xs opacity-90 mt-1">
            {reward.type === 'micro' && 'Keep going!'}
            {reward.type === 'surprise' && 'Bonus reward!'}
            {reward.type === 'milestone' && 'Chapter complete!'}
            {reward.type === 'completion' && 'Journey complete!'}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

