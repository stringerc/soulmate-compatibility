"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Target, 
  Zap, 
  TrendingUp,
  Calendar,
  Award
} from "lucide-react";
import {
  getDailyFeatures,
  getRetentionStats,
  completeDailyFeature,
  isDailyFeatureCompleted,
  trackDailyActivity,
} from "@/lib/retentionHooks";

export default function DailyFeatures() {
  const [features, setFeatures] = useState(getDailyFeatures());
  const [stats, setStats] = useState(getRetentionStats());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Track daily activity on mount
    trackDailyActivity('dashboard_visit');
    
    // Update stats
    setStats(getRetentionStats());
    setFeatures(getDailyFeatures());
  }, []);

  const handleFeatureClick = (featureId: string, link?: string) => {
    if (!isDailyFeatureCompleted(featureId)) {
      completeDailyFeature(featureId);
      setFeatures(getDailyFeatures());
      setStats(getRetentionStats());
    }
    if (link) {
      // Navigation handled by Link component
    }
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const completedCount = features.filter(f => f.completed).length;
  const totalCount = features.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Target className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            Daily Goals
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Complete daily activities to build your streak
          </p>
        </div>
        {stats.currentStreak > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full">
            <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="font-bold text-orange-700 dark:text-orange-300">
              {stats.currentStreak} day streak
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Today's Progress
          </span>
          <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
            {completedCount}/{totalCount} Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Daily Features List */}
      <div className="space-y-3">
        {features.map((feature) => {
          const completed = isDailyFeatureCompleted(feature.id);
          const Icon = completed ? CheckCircle2 : Circle;
          const iconColor = completed 
            ? "text-green-600 dark:text-green-400" 
            : "text-gray-400 dark:text-gray-500";

          let link = "/me";
          if (feature.id === 'explore_archetype') link = "/explore";
          if (feature.id === 'journal_entry') link = "/journaling";
          if (feature.id === 'share_results') link = "/me"; // Will handle share action

          return (
            <Link
              key={feature.id}
              href={link}
              onClick={() => handleFeatureClick(feature.id, link)}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                completed
                  ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800"
                  : "bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 hover:border-pink-300 dark:hover:border-pink-700"
              }`}
            >
              <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold mb-1 ${
                  completed 
                    ? "text-green-900 dark:text-green-100" 
                    : "text-gray-900 dark:text-white"
                }`}>
                  {feature.name}
                </h3>
                <p className={`text-sm ${
                  completed
                    ? "text-green-700 dark:text-green-300"
                    : "text-gray-600 dark:text-gray-400"
                }`}>
                  {feature.description}
                </p>
              </div>
              {feature.streak && feature.streak > 0 && (
                <div className="flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                  <Flame className="w-4 h-4" />
                  {feature.streak}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {stats.currentStreak}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Day Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalDaysActive}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Days Active</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.totalFeaturesCompleted}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Features Done</div>
          </div>
        </div>
      </div>
    </div>
  );
}

