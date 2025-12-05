"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, TrendingUp, Target, Lightbulb, ArrowRight, Zap } from "lucide-react";
import { getAllRecommendations, Recommendation } from "@/lib/aiRecommendations";
import { useAuth } from "@/hooks/useAuth";

interface AIRecommendationsProps {
  userProfile?: {
    traits?: number[];
    primary_archetype?: string;
    attachment_style?: string;
    love_languages?: string[];
  };
}

export default function AIRecommendations({ userProfile }: AIRecommendationsProps) {
  const { isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !userProfile?.traits) {
      setLoading(false);
      return;
    }

    // Get exploration history from localStorage
    const explorationHistory = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('soulmates_explorations') || '[]').map((e: any) => e.archetypeId)
      : [];

    const profile = {
      ...userProfile,
      explorationHistory,
      lastActive: typeof window !== 'undefined'
        ? parseInt(localStorage.getItem('soulmates_last_active') || Date.now().toString(), 10)
        : Date.now(),
    };

    const recs = getAllRecommendations(profile, 5);
    setRecommendations(recs);
    setLoading(false);
  }, [isAuthenticated, userProfile]);

  const getIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'archetype':
        return <Sparkles className="w-5 h-5" />;
      case 'feature':
        return <Zap className="w-5 h-5" />;
      case 'action':
        return <Target className="w-5 h-5" />;
      case 'insight':
        return <Lightbulb className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'from-pink-500 to-rose-500';
      case 'medium':
        return 'from-purple-500 to-indigo-500';
      case 'low':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Personalized Recommendations
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tailored suggestions based on your profile
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => {
          const href = rec.metadata?.href || '#';
          const isLink = href !== '#';

          const content = (
            <div className={`p-4 rounded-xl border-2 transition-all ${
              rec.priority === 'high'
                ? 'bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-800'
                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${getPriorityColor(rec.priority)} flex-shrink-0`}>
                  {getIcon(rec.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {rec.title}
                    </h3>
                    {rec.priority === 'high' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {rec.description}
                  </p>
                  {isLink && (
                    <div className="flex items-center gap-1 text-sm font-medium text-pink-600 dark:text-pink-400">
                      Explore
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {Math.round(rec.confidence * 100)}% match
                </div>
              </div>
            </div>
          );

          return isLink ? (
            <Link key={rec.id} href={href} className="block">
              {content}
            </Link>
          ) : (
            <div key={rec.id}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

