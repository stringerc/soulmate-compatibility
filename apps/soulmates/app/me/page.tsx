"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { logSoulmatesEvent } from "@/lib/analytics";
import { billingApi } from "@/lib/api";
import PlanBadge from "@/components/PlanBadge";
import ReferralProgram from "@/components/ReferralProgram";
import { 
  Heart, 
  Sparkles, 
  TrendingUp, 
  Award, 
  Users, 
  BookOpen, 
  Zap, 
  Target,
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart3,
  Star,
  Gift,
  Share2
} from "lucide-react";

interface Profile {
  id?: string;
  primary_archetype?: string;
  attachment_style?: string;
  love_languages?: string[];
  calculated_at?: number;
}

interface DashboardStats {
  daysActive: number;
  completionRate: number;
  nextMilestone: string;
  achievementsUnlocked: number;
  totalExplorations: number;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<{ tier: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load profile
        const { profileApi, billingApi } = await import("@/lib/api");
        const [profileResponse, subscriptionData] = await Promise.all([
          profileApi.get().catch(() => null),
          billingApi.getSubscription().catch(() => ({ tier: "FREE" })),
        ]);
        
        // Extract profile from response
        let profileData = (profileResponse as any)?.profile || profileResponse;
        
        // Check localStorage as fallback
        if (typeof window !== 'undefined') {
          try {
            const localProfile = localStorage.getItem('soulmates_profile');
            if (localProfile) {
              const parsed = JSON.parse(localProfile);
              const daysSince = (Date.now() - (parsed.calculated_at || 0)) / (1000 * 60 * 60 * 24);
              if (daysSince < 7) {
                if (!profileData || 
                    profileData === null || 
                    (typeof profileData === 'object' && Object.keys(profileData).length === 0) ||
                    !profileData.primary_archetype || 
                    (parsed.calculated_at > (profileData.calculated_at || 0))) {
                  profileData = parsed;
                }
              } else {
                localStorage.removeItem('soulmates_profile');
              }
            }
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.error("Failed to load profile from localStorage:", e);
            }
          }
        }
        
        setProfile(profileData);
        setSubscription(subscriptionData);
        
        // Calculate stats from localStorage
        if (typeof window !== 'undefined' && profileData) {
          const calculatedAt = profileData.calculated_at || Date.now();
          const daysActive = Math.floor((Date.now() - calculatedAt) / (1000 * 60 * 60 * 24));
          
          // Get exploration count from localStorage
          const explorationData = localStorage.getItem('soulmates_explorations');
          const totalExplorations = explorationData ? JSON.parse(explorationData).length : 0;
          
          setStats({
            daysActive: Math.max(1, daysActive),
            completionRate: profileData.primary_archetype ? 100 : 0,
            nextMilestone: daysActive < 7 ? "Week 1 Complete" : daysActive < 30 ? "Month 1 Complete" : "Quarter 1 Complete",
            achievementsUnlocked: profileData.primary_archetype ? 1 : 0,
            totalExplorations,
          });
        }
        
        // Log analytics
        if (profileData && typeof profileData === 'object' && 'id' in profileData) {
          try {
            logSoulmatesEvent({
              name: "profile_viewed_again",
              payload: { profile_id: (profileData as any).id },
            });
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.error("Analytics error:", e);
            }
          }
        }
      } catch (err: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error loading data:", err);
        }
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Memoized quick actions
  const quickActions = useMemo(() => [
    {
      title: "Explore Compatibility",
      description: "Test compatibility with archetypal partners",
      href: "/explore",
      icon: Users,
      color: "from-pink-500 to-rose-500",
      badge: subscription?.tier === "FREE" ? "Free" : null,
    },
    {
      title: "Couple Mode",
      description: "Connect with your partner",
      href: "/bonds",
      icon: Heart,
      color: "from-purple-500 to-indigo-500",
      badge: subscription?.tier === "FREE" ? "Upgrade" : null,
    },
    {
      title: "Resonance Lab",
      description: "Deep dive into your patterns",
      href: "/lab",
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
      badge: subscription?.tier === "FREE" ? "Upgrade" : null,
    },
    {
      title: "Soul Journey",
      description: "Journal your reflections",
      href: "/journaling",
      icon: BookOpen,
      color: "from-green-500 to-emerald-500",
      badge: null,
    },
  ], [subscription?.tier]);

  // Memoized recommendations
  const recommendations = useMemo(() => {
    if (!profile?.primary_archetype) return [];
    
    const recs = [];
    if (subscription?.tier === "FREE") {
      recs.push({
        title: "Unlock Couple Mode",
        description: "Connect with your partner and see your compatibility",
        action: "Upgrade to Plus",
        href: "/pricing",
        icon: Heart,
      });
    }
    if (!stats?.totalExplorations || stats.totalExplorations < 3) {
      recs.push({
        title: "Explore More Archetypes",
        description: "Discover compatibility with different partner types",
        action: "Start Exploring",
        href: "/explore",
        icon: Sparkles,
      });
    }
    if (stats && stats.daysActive < 7) {
      recs.push({
        title: "Complete Your First Week",
        description: "Return daily to unlock new insights",
        action: "View Progress",
        href: "/journaling",
        icon: Target,
      });
    }
    return recs;
  }, [profile, subscription, stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
            <p className="font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Profile</p>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
            <Link 
              href="/onboarding"
              className="inline-block px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Complete Onboarding
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="p-8 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-center shadow-xl">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-pink-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Your Journey
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Complete your compatibility assessment to unlock personalized insights
            </p>
            <Link 
              href="/onboarding"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Start Your Free Compatibility Test
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Welcome Message */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">
                  Welcome Back! ✨
                </h1>
                <p className="text-lg md:text-xl opacity-95 drop-shadow-md">
                  Continue your self-discovery journey
                </p>
              </div>
              {subscription && (
                <div className="flex-shrink-0">
                  <PlanBadge tier={subscription.tier as "FREE" | "PLUS" | "COUPLE_PREMIUM"} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-pink-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Days Active</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.daysActive}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Achievements</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.achievementsUnlocked}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Explorations</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalExplorations}</p>
            </div>
          </div>
        )}

        {/* Profile Insights */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Primary Archetype Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Archetype</h2>
              </div>
              {profile.primary_archetype ? (
                <div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {profile.primary_archetype}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your unique compatibility profile based on your responses
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">Complete your assessment to discover your archetype</p>
                  <Link 
                    href="/onboarding"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    Start Assessment
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Attachment Style & Love Languages */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attachment Style</h3>
                </div>
                {profile.attachment_style ? (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                    {profile.attachment_style}
                  </p>
                ) : (
                  <p className="text-gray-400">Not set</p>
                )}
              </div>

              {profile.love_languages && profile.love_languages.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Gift className="w-5 h-5 text-pink-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Love Languages</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.love_languages.map((lang: string, idx: number) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-lg text-gray-900 dark:text-white font-medium text-sm"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations Sidebar */}
          <div className="space-y-6">
            {recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended</h3>
                </div>
                <div className="space-y-4">
                  {recommendations.slice(0, 2).map((rec, idx) => (
                    <Link
                      key={idx}
                      href={rec.href}
                      className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <rec.icon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {rec.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {rec.description}
                          </p>
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            {rec.action}
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Referral Program */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <ReferralProgram userId={profile?.id} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
            <Link 
              href="/explore"
              className="text-sm font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <Link
                key={idx}
                href={action.href}
                className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {action.description}
                  </p>
                  {action.badge && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      {action.badge}
                    </span>
                  )}
                  <div className="mt-4 flex items-center text-pink-600 dark:text-pink-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Progress Milestone */}
        {stats && stats.daysActive > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Next Milestone: {stats.nextMilestone}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Keep exploring to unlock new insights and achievements
                </p>
              </div>
              <Link
                href="/journaling"
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 font-semibold transition-all flex items-center gap-2"
              >
                View Progress
                <TrendingUp className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
