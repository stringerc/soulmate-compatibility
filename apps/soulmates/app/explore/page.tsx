"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSoulmatesFeature } from "@/hooks/useSoulmatesFeature";
import { compatibilityApi, profileApi } from "@/lib/api";
import { logSoulmatesEvent } from "@/lib/analytics";
import { 
  Sparkles, 
  Award, 
  TrendingUp, 
  Users, 
  Share2, 
  ArrowRight,
  CheckCircle2,
  Star,
  Zap,
  Heart,
  Target,
  BarChart3,
  Clock,
  Gift,
  ChevronDown,
  ChevronUp,
  Shield,
  Brain,
  Info
} from "lucide-react";
import UpgradePrompt from "@/components/UpgradePrompt";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { ARCHETYPAL_PROFILES } from "@/lib/archetypalProfiles";
import { calculateCompatibility, getCompatibilityTier } from "@/lib/compatibilityEngine";
import { 
  getExplorationStats, 
  recordExploration, 
  getRecommendedArchetypes,
  getArchetypeExplorationCount,
  type ExplorationBadge,
  type ExplorationStats
} from "@/lib/explorationTracking";
import { generateShareableMoment, shareToPlatform } from "@/lib/shareableMoments";

interface CompatibilityResult {
  success: boolean;
  snapshot: {
    id: string;
    score_overall: number;
    score_axes: Record<string, number>;
    astro_used: boolean;
    num_used: boolean;
    soulmate_flag: boolean;
    explanation_summary: string;
    explanation_details?: any;
  };
}

export default function ExplorePage() {
  const canExplore = useSoulmatesFeature("comp_explorer");
  const { tier, canRunCompatibility, runsRemaining, upgradeRequired } = usePlanLimits();
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userTraits, setUserTraits] = useState<number[] | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [clientScores, setClientScores] = useState<Record<string, number>>({});
  const [explorationStats, setExplorationStats] = useState<ExplorationStats>({
    totalExplorations: 0,
    uniqueArchetypes: 0,
    explorationHistory: [],
    badges: [],
    currentStreak: 0,
    lastExplorationDate: null
  });
  const [newBadges, setNewBadges] = useState<ExplorationBadge[]>([]);
  const [showBadgeNotification, setShowBadgeNotification] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    strengths: false,
    challenges: false,
    idealMatches: false,
    traits: false
  });
  const [isClient, setIsClient] = useState(false);

  // Memoize calculations to avoid hydration issues
  const resultData = useMemo(() => {
    if (!result || !selectedPartner || !isClient) return null;
    const profile = ARCHETYPAL_PROFILES.find(p => p.id === selectedPartner);
    if (!profile) return null;
    const resultCompatibilityTier = getCompatibilityTier(result.snapshot.score_overall);
    return { profile, resultCompatibilityTier };
  }, [result, selectedPartner, isClient]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Trait dimension labels for visualization
  const traitLabels = [
    'Attachment Security', 'Conflict Style', 'Cognitive Processing',
    'Value Alignment', 'Social Orientation', 'Intimacy Depth', 'Life Structure'
  ];

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
    setExplorationStats(getExplorationStats());
  }, []);

  // Load user profile traits
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profileResponse = await profileApi.get();
        const profile = (profileResponse as any)?.profile || profileResponse;
        
        // Try localStorage fallback
        if (!profile?.traits && typeof window !== 'undefined') {
          const localProfile = localStorage.getItem('soulmates_profile');
          if (localProfile) {
            const parsed = JSON.parse(localProfile);
            if (parsed.traits && Array.isArray(parsed.traits) && parsed.traits.length === 32) {
              setUserProfile(parsed);
              setUserTraits(parsed.traits);
            }
          }
        } else if (profile?.traits && Array.isArray(profile.traits) && profile.traits.length === 32) {
          setUserProfile(profile);
          setUserTraits(profile.traits);
        }
        
        // Calculate client-side compatibility scores for all profiles
        if (profile?.traits && Array.isArray(profile.traits) && profile.traits.length === 32) {
          const scores: Record<string, number> = {};
          ARCHETYPAL_PROFILES.forEach(archetypalProfile => {
            try {
              const compatibility = calculateCompatibility(profile.traits, archetypalProfile.traits);
              scores[archetypalProfile.id] = compatibility.overall;
            } catch (e) {
              if (process.env.NODE_ENV === 'development') {
                console.error(`Error calculating compatibility for ${archetypalProfile.id}:`, e);
              }
            }
          });
          setClientScores(scores);
        } else if (typeof window !== 'undefined') {
          // Fallback: try localStorage
          const localProfile = localStorage.getItem('soulmates_profile');
          if (localProfile) {
            const parsed = JSON.parse(localProfile);
            if (parsed.traits && Array.isArray(parsed.traits) && parsed.traits.length === 32) {
              const scores: Record<string, number> = {};
              ARCHETYPAL_PROFILES.forEach(profile => {
                try {
                  const compatibility = calculateCompatibility(parsed.traits, profile.traits);
                  scores[profile.id] = compatibility.overall;
                } catch (e) {
                  if (process.env.NODE_ENV === 'development') {
                    console.error(`Error calculating compatibility for ${profile.id}:`, e);
                  }
                }
              });
              setClientScores(scores);
            }
          }
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error loading user profile:", e);
        }
      }
    };
    
    if (canExplore) {
      loadUserProfile();
      setExplorationStats(getExplorationStats());
    }
  }, [canExplore]);

  // Get recommended archetypes
  const recommendedArchetypes = useMemo(() => {
    if (!userProfile?.primary_archetype) return [];
    const exploredIds = explorationStats.explorationHistory.map(r => r.archetypeId);
    return getRecommendedArchetypes(userProfile.primary_archetype.toLowerCase(), exploredIds);
  }, [userProfile, explorationStats]);

  // Sort archetypes: recommended first, then by compatibility score
  const sortedArchetypes = useMemo(() => {
    const sorted = [...ARCHETYPAL_PROFILES].sort((a, b) => {
      const aRecommended = recommendedArchetypes.includes(a.id);
      const bRecommended = recommendedArchetypes.includes(b.id);
      if (aRecommended && !bRecommended) return -1;
      if (!aRecommended && bRecommended) return 1;
      
      const aScore = clientScores[a.id] || 0;
      const bScore = clientScores[b.id] || 0;
      return bScore - aScore;
    });
    return sorted;
  }, [recommendedArchetypes, clientScores]);

  if (!canExplore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Compatibility Explorer</h1>
          <p className="text-gray-600 dark:text-gray-400">
            This feature is not available in the current phase. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  const handleExplore = async (partnerId: string) => {
    // Check if user can run compatibility
    if (!canRunCompatibility) {
      setError("You've reached your compatibility run limit for this month. Upgrade to Plus for unlimited runs.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedPartner(partnerId);

    try {
      const partner = ARCHETYPAL_PROFILES.find((p) => p.id === partnerId);
      if (!partner) {
        throw new Error("Partner not found");
      }

      // Calculate client-side compatibility first (instant feedback)
      let clientCompatibility = null;
      if (userTraits && userTraits.length === 32) {
        try {
          clientCompatibility = calculateCompatibility(userTraits, partner.traits);
          // Show client-side result immediately
          setResult({
            success: true,
            snapshot: {
              id: `client-${partnerId}`,
              score_overall: clientCompatibility.overall,
              score_axes: {
                similarity: clientCompatibility.similarity,
                complementarity: clientCompatibility.complementarity,
                attachment: clientCompatibility.attachmentMatch,
                conflict: clientCompatibility.conflictMatch,
                social: clientCompatibility.socialMatch,
                values: clientCompatibility.valuesMatch,
              },
              astro_used: false,
              num_used: false,
              soulmate_flag: clientCompatibility.overall >= 0.85,
              explanation_summary: [
                ...clientCompatibility.strengths.map(s => `✓ ${s}`),
                ...clientCompatibility.challenges.map(c => `⚠ ${c}`),
                ...clientCompatibility.insights.map(i => `💡 ${i}`),
              ].join('\n\n'),
            },
          });

          // Record exploration
          const { newBadges: earnedBadges, stats } = recordExploration(
            partnerId,
            partner.name,
            clientCompatibility.overall
          );
          setExplorationStats(stats);
          
          if (earnedBadges.length > 0) {
            setNewBadges(earnedBadges);
            setShowBadgeNotification(true);
            setTimeout(() => setShowBadgeNotification(false), 5000);
          }
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.error("Error calculating client-side compatibility:", e);
          }
        }
      }

      // Try backend API for enhanced results (astrology, numerology)
      try {
        const data = await compatibilityApi.explore({
          hypothetical_profile: {
            traits: partner.traits,
            name: partner.name,
          },
          allow_astrology: true,
          allow_numerology: true,
        }) as CompatibilityResult;

        // Merge backend results with client-side insights
        if (clientCompatibility) {
          data.snapshot.explanation_summary = [
            ...clientCompatibility.strengths.map(s => `✓ ${s}`),
            ...clientCompatibility.challenges.map(c => `⚠ ${c}`),
            ...clientCompatibility.insights.map(i => `💡 ${i}`),
            data.snapshot.explanation_summary ? `\n\n${data.snapshot.explanation_summary}` : '',
          ].join('\n\n');
        }

        setResult(data);
      
        // Log analytics event
        try {
          logSoulmatesEvent({
            name: "comp_explorer_run",
            payload: {
              partner_id: partnerId,
              partner_name: partner.name,
              score_overall: data.snapshot?.score_overall || 0,
              soulmate_flag: data.snapshot?.soulmate_flag || false,
            },
          });
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.error("Analytics error:", e);
          }
        }
      } catch (apiError) {
        // Backend API failed, but we already have client-side results
        if (process.env.NODE_ENV === 'development') {
          console.warn("Backend API unavailable, using client-side results only:", apiError);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || "";
      if (errorMessage.includes("503") || errorMessage.includes("Service Unavailable") || errorMessage.includes("Backend service unavailable")) {
        setError("The compatibility service is currently unavailable. Please try again later.");
      } else {
        setError(err.message || "Failed to calculate compatibility");
      }
      if (process.env.NODE_ENV === 'development') {
        console.error("Compatibility exploration error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform: 'twitter' | 'facebook' | 'instagram' | 'whatsapp' | 'copy_link') => {
    if (!result) return;
    
    const score = Math.round(result.snapshot.score_overall * 100);
    const partner = ARCHETYPAL_PROFILES.find(p => p.id === selectedPartner);
    const shareMoment = generateShareableMoment('compatibility_score', { compatibilityScore: score });
    
    await shareToPlatform(platform, shareMoment);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              Compatibility Explorer
            </h1>
            <p className="text-lg md:text-xl opacity-95 drop-shadow-md mb-4">
              Discover your compatibility with 8 archetypal partners and unlock insights about your relationship patterns
            </p>
            
            {/* Stats Bar */}
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {explorationStats.totalExplorations} {explorationStats.totalExplorations === 1 ? 'exploration' : 'explorations'}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <Target className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {explorationStats.uniqueArchetypes}/8 archetypes
                </span>
              </div>
              {explorationStats.currentStreak > 0 && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Zap className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {explorationStats.currentStreak}-day streak!
                  </span>
                </div>
              )}
              {runsRemaining !== null && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Gift className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {runsRemaining} {runsRemaining === 1 ? 'run' : 'runs'} remaining
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Badge Notification */}
        {showBadgeNotification && newBadges.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white shadow-xl animate-in slide-in-from-top">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{newBadges[0].icon}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Badge Earned!</h3>
                <p className="text-lg">{newBadges[0].name}</p>
                <p className="text-sm opacity-90">{newBadges[0].description}</p>
              </div>
              <button
                onClick={() => setShowBadgeNotification(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Exploration Progress */}
        {explorationStats.totalExplorations > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-500" />
                Your Exploration Progress
              </h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {explorationStats.uniqueArchetypes}/8 explored
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(explorationStats.uniqueArchetypes / 8) * 100}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {explorationStats.badges.map(badge => (
                <div
                  key={badge.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${
                    badge.earned
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-50'
                  }`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className={`text-sm font-semibold ${badge.earned ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                      {badge.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{badge.description}</p>
                  </div>
                  {badge.earned && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade Prompt */}
        {!canRunCompatibility && upgradeRequired && (
          <UpgradePrompt
            feature="compatibility runs"
            currentUsage={runsRemaining === null ? undefined : (5 - (runsRemaining || 0))}
            limit={5}
            recommendedPlan="plus"
          />
        )}

        {/* Recommended Section */}
        {recommendedArchetypes.length > 0 && userProfile && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recommended for You
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              As a <span className="font-semibold">{userProfile.primary_archetype}</span>, these archetypes complement you best
            </p>
          </div>
        )}

        {/* Archetype Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedArchetypes.map((partner) => {
            const Icon = partner.icon;
            const isSelected = selectedPartner === partner.id;
            const isCalculating = loading && isSelected;
            const compatibilityScore = clientScores[partner.id];
            const compatibilityTier = compatibilityScore ? getCompatibilityTier(compatibilityScore) : null;
            const isRecommended = recommendedArchetypes.includes(partner.id);
            const explorationCount = getArchetypeExplorationCount(partner.id);
            const hasExplored = explorationCount > 0;
            
            return (
              <div
                key={partner.id}
                className={`group relative bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? "border-pink-500 shadow-2xl scale-105"
                    : isRecommended
                    ? "border-blue-400 dark:border-blue-600 shadow-lg hover:shadow-xl"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg"
                }`}
              >
                {/* Recommended Badge */}
                {isRecommended && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Recommended
                    </div>
                  </div>
              )}

                {/* Compatibility Score Badge */}
                {compatibilityScore !== undefined && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className={`px-3 py-1.5 rounded-full text-sm font-bold text-white shadow-lg bg-gradient-to-r ${compatibilityTier?.color || 'from-gray-400 to-gray-500'}`}>
                      {Math.round(compatibilityScore * 100)}%
                    </div>
                  </div>
                )}

                {/* Explored Badge */}
                {hasExplored && (
                  <div className="absolute bottom-2 right-2 z-10">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Explored {explorationCount}x
                    </div>
                  </div>
                )}

                <button
                  onClick={() => !loading && handleExplore(partner.id)}
                  disabled={loading}
                  className={`w-full p-6 text-left transition-all ${
                    loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {/* Icon and Name */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${
                      isSelected 
                        ? "bg-gradient-to-br from-pink-500 to-purple-600" 
                        : isRecommended
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
                    }`}>
                      <Icon className={`w-8 h-8 ${
                        isSelected || isRecommended
                          ? "text-white"
                          : "text-gray-600 dark:text-gray-400"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {partner.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {partner.archetype} • {partner.attachmentStyle}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {partner.description}
                  </p>
                  
                  {/* Love Languages */}
                  {partner.loveLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {partner.loveLanguages.slice(0, 3).map((lang) => (
                        <span key={lang} className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md">
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Teaser Text */}
                  {compatibilityScore !== undefined && !isSelected && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        {compatibilityScore >= 0.75 
                          ? `💕 Discover why you're ${Math.round(compatibilityScore * 100)}% compatible...`
                          : compatibilityScore >= 0.60
                          ? `💖 Explore your ${Math.round(compatibilityScore * 100)}% compatibility...`
                          : `🔍 See your compatibility insights...`
                        }
                      </p>
                    </div>
                  )}

                  {/* Loading State */}
                  {isCalculating && (
                    <div className="flex items-center justify-center gap-2 text-pink-600 dark:text-pink-400 mt-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-pink-600 border-t-transparent"></div>
                      <span className="text-sm font-medium">Calculating compatibility...</span>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Notice</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {resultData && resultData.profile && (
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-8 space-y-8">
            {/* Header with Share */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Compatibility Results
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {resultData.profile.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {result.snapshot.soulmate_flag && (
                  <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-white rounded-full text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Soulmate Tier!
                  </span>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    title="Share on Twitter"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleShare('copy_link')}
                    className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    title="Copy link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Archetype Profile Details - Enhanced */}
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 shadow-xl overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <resultData.profile.icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1">{resultData.profile.name}</h3>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                        {resultData.profile.archetype}
                      </span>
                      <span className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {resultData.profile.attachmentStyle} Attachment
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Full Description - Always Visible */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        About This Archetype
                      </h4>
                      <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                        <p className="text-base">
                          {resultData.profile.description}
                        </p>
                        <p className="text-sm opacity-90">
                          Understanding what it means to be {resultData.profile.name} goes beyond surface-level traits. This archetype represents a fundamental way of being in the world, shaped by deep psychological patterns, attachment styles, and core values that influence every aspect of how you love, relate, and grow.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                    {/* Strengths - Expandable */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-indigo-200 dark:border-indigo-800 overflow-hidden">
                      <button
                        onClick={() => toggleSection('strengths')}
                        className="w-full p-5 flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Core Strengths
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({resultData.profile.strengths.length} traits)
                          </span>
                        </div>
                        {expandedSections.strengths ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                      {expandedSections.strengths && (
                        <div className="px-5 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-300">
                          {resultData.profile.strengths.map((strength, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">{strength}</p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                  This strength manifests in your daily life through consistent actions and patterns. It's not just a trait you possess, but a fundamental part of how you navigate relationships, make decisions, and contribute to the world around you. Understanding this about yourself helps you recognize your value and leverage these natural abilities in meaningful ways.
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Challenges - Expandable */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-indigo-200 dark:border-indigo-800 overflow-hidden">
                      <button
                        onClick={() => toggleSection('challenges')}
                        className="w-full p-5 flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Growth Areas
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({resultData.profile.challenges.length} areas)
                          </span>
                        </div>
                        {expandedSections.challenges ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                      {expandedSections.challenges && (
                        <div className="px-5 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-300">
                          {resultData.profile.challenges.map((challenge, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                              <div className="w-5 h-5 rounded-full border-2 border-amber-600 dark:border-amber-400 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">{challenge}</p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                  Growth areas are not weaknesses—they're opportunities for deeper self-awareness and development. This challenge likely stems from your core personality patterns and can be understood as a natural extension of your strengths. By recognizing this pattern, you can develop strategies to navigate it more consciously and create more fulfilling relationships and experiences.
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Ideal Matches - Expandable */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-indigo-200 dark:border-indigo-800 overflow-hidden">
                      <button
                        onClick={() => toggleSection('idealMatches')}
                        className="w-full p-5 flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                            <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Ideal Matches
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({resultData.profile.idealMatch.length} archetypes)
                          </span>
                        </div>
                        {expandedSections.idealMatches ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                      {expandedSections.idealMatches && (
                        <div className="px-5 pb-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="bg-pink-50 dark:bg-pink-900/10 rounded-lg p-4 mb-3">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                              These archetypes complement {resultData.profile.name} best, creating balanced and harmonious relationships. Compatibility isn't about finding someone identical to you—it's about finding someone whose strengths complement your growth areas, and whose values align with your core needs.
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                              Click on any archetype below to explore your compatibility in detail.
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {resultData.profile.idealMatch.map((matchName) => {
                              const matchProfile = ARCHETYPAL_PROFILES.find(p => p.name === matchName);
                              if (!matchProfile) return null;
                              const MatchIcon = matchProfile.icon;
                              return (
                                <div
                                  key={matchName}
                                  className="flex items-center gap-3 p-4 bg-pink-50 dark:bg-pink-900/10 rounded-lg border border-pink-200 dark:border-pink-800 hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                  onClick={() => {
                                    handleExplore(matchProfile.id);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                >
                                  <div className="p-2 bg-pink-200 dark:bg-pink-800 rounded-lg">
                                    <MatchIcon className="w-5 h-5 text-pink-700 dark:text-pink-300" />
                                  </div>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {matchName}
                                  </span>
                                  <ArrowRight className="w-5 h-5 text-pink-600 dark:text-pink-400 ml-auto" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Love Languages - Always Visible */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 border border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Love Languages
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {resultData.profile.loveLanguages.map((lang, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium border border-purple-200 dark:border-purple-800"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p className="leading-relaxed">
                          Love languages represent the primary ways this archetype expresses and receives love. Understanding your love languages helps you communicate your needs more effectively and recognize when others are showing you love, even if it's not in your preferred style.
                        </p>
                        <p className="text-xs italic opacity-80">
                          Each love language represents a different pathway to emotional connection and intimacy. When you understand both your own and your partner's love languages, you can create deeper, more fulfilling relationships.
                        </p>
                      </div>
                    </div>

                    {/* Trait Dimensions - Expandable */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-indigo-200 dark:border-indigo-800 overflow-hidden">
                      <button
                        onClick={() => toggleSection('traits')}
                        className="w-full p-5 flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Trait Dimensions
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            (32 dimensions)
                          </span>
                        </div>
                        {expandedSections.traits ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                      {expandedSections.traits && (
                        <div className="px-5 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-300">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            This archetype's personality profile across 32 psychological dimensions:
                          </p>
                          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              Your personality is mapped across 32 psychological dimensions, each representing a different aspect of how you think, feel, and relate to others. These dimensions combine to create your unique archetypal profile. Understanding these dimensions helps you see the complexity and depth of your personality beyond simple labels.
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {resultData.profile.traits.map((trait, idx) => {
                              const dimension = Math.floor(idx / 4.57); // Approximate grouping
                              const dimensionLabel = traitLabels[dimension] || `Dimension ${dimension + 1}`;
                              return (
                                <div key={idx} className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {dimensionLabel}
                                    </span>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                      {Math.round(trait * 100)}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                                    <div
                                      className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                                      style={{ width: `${trait * 100}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    This dimension reflects how you typically approach this aspect of life and relationships.
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            )}

            {/* Overall Score - Enhanced */}
            <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-pink-900/20 dark:to-purple-900/20 dark:to-indigo-900/20 rounded-xl p-8 border border-pink-200 dark:border-pink-800">
              <div className="flex items-center justify-between mb-6">
                <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Overall Compatibility
                </span>
                <span className="text-6xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {(result.snapshot.score_overall * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${result.snapshot.score_overall * 100}%` }}
                />
              </div>
              {resultData.resultCompatibilityTier && (
                <p className="text-center mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {resultData.resultCompatibilityTier.label}
                </p>
              )}
            </div>

            {/* Dimension Breakdown - Enhanced */}
            {result.snapshot.score_axes && Object.keys(result.snapshot.score_axes).length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Dimension Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(result.snapshot.score_axes).map(([axis, score]) => (
                    <div 
                      key={axis} 
                      className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                          {axis.replace(/_/g, " ")}
                        </span>
                        <span className="text-lg font-bold text-pink-600 dark:text-pink-400">
                          {(score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full transition-all duration-700 shadow-sm"
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights - Enhanced */}
            {result.snapshot.explanation_summary && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Relationship Insights
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {result.snapshot.explanation_summary}
                  </p>
                </div>
              </div>
            )}

            {/* Features Used */}
            <div className="flex flex-wrap gap-3">
              {result.snapshot.astro_used && (
                <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Astrology Insights
                </span>
              )}
              {result.snapshot.num_used && (
                <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Numerology Insights
                </span>
              )}
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                Continue Exploring
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {explorationStats.uniqueArchetypes < 8 
                  ? `Explore ${8 - explorationStats.uniqueArchetypes} more archetype${8 - explorationStats.uniqueArchetypes === 1 ? '' : 's'} to unlock the Master Explorer badge!`
                  : "You've explored all archetypes! Compare your results or explore again for deeper insights."
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setResult(null);
                    setSelectedPartner(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all flex items-center gap-2"
                >
                  Explore Another
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  href="/bonds"
                  className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all"
                >
                  Try Couple Mode
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
