"use client";

import { X, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface UpgradePromptProps {
  feature: string; // "compatibility runs", "bonds", "resonance lab"
  currentUsage?: number;
  limit?: number;
  recommendedPlan: "plus" | "couple-premium";
  onDismiss?: () => void;
}

export default function UpgradePrompt({
  feature,
  currentUsage,
  limit,
  recommendedPlan,
  onDismiss,
}: UpgradePromptProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const featureMessages: Record<string, { title: string; description: string }> = {
    "compatibility runs": {
      title: "You've reached your compatibility run limit",
      description: `You've used ${currentUsage}/${limit} compatibility runs this month. Upgrade to Plus for unlimited runs and explore compatibility with unlimited partners.`,
    },
    bonds: {
      title: "Bonds require a paid plan",
      description: "Free plan doesn't include couple mode. Upgrade to Plus for 1 active bond, or Couple Premium for unlimited bonds and Resonance Lab access.",
    },
    "resonance lab": {
      title: "Resonance Lab requires Couple Premium",
      description: "Access advanced resonance insights, pattern analysis, and couple coaching features with Couple Premium.",
    },
  };

  const message = featureMessages[feature] || {
    title: "Upgrade to unlock this feature",
    description: `This feature requires a ${recommendedPlan === "plus" ? "Plus" : "Couple Premium"} plan.`,
  };

  const planName = recommendedPlan === "plus" ? "Plus" : "Couple Premium";
  const planPrice = recommendedPlan === "plus" ? "$9.99" : "$19.99";

  return (
    <div className="relative p-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-xl shadow-lg mb-6">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex-shrink-0">
          <Sparkles className="w-6 h-6 text-pink-600 dark:text-pink-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {message.title}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {message.description}
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/pricing?plan=${recommendedPlan}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Upgrade to {planName}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition"
            >
              View All Plans
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Starting at {planPrice}/month • 7-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}

