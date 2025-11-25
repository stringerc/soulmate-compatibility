"use client";

import { Crown, Zap, Gift } from "lucide-react";

interface PlanBadgeProps {
  tier: "FREE" | "PLUS" | "COUPLE_PREMIUM";
  className?: string;
}

export default function PlanBadge({ tier, className = "" }: PlanBadgeProps) {
  const config = {
    FREE: {
      label: "Free Plan",
      icon: Gift,
      bgColor: "bg-gray-100 dark:bg-gray-700",
      textColor: "text-gray-700 dark:text-gray-300",
      iconColor: "text-gray-600 dark:text-gray-400",
    },
    PLUS: {
      label: "Plus",
      icon: Zap,
      bgColor: "bg-pink-100 dark:bg-pink-900/30",
      textColor: "text-pink-700 dark:text-pink-300",
      iconColor: "text-pink-600 dark:text-pink-400",
    },
    COUPLE_PREMIUM: {
      label: "Couple Premium",
      icon: Crown,
      bgColor: "bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30",
      textColor: "text-purple-700 dark:text-purple-300",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  };

  const plan = config[tier];
  const Icon = plan.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${plan.bgColor} ${plan.textColor} ${className}`}
    >
      <Icon className={`w-4 h-4 ${plan.iconColor}`} />
      <span className="text-sm font-semibold">{plan.label}</span>
    </div>
  );
}

