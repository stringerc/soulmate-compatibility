"use client";

import { useState, useEffect, useMemo } from "react";
import { useSoulmatesFeature } from "@/hooks/useSoulmatesFeature";
import { compatibilityApi, profileApi } from "@/lib/api";
import { logSoulmatesEvent } from "@/lib/analytics";
import { Sparkles } from "lucide-react";
import UpgradePrompt from "@/components/UpgradePrompt";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { ARCHETYPAL_PROFILES } from "@/lib/archetypalProfiles";
import { calculateCompatibility, getCompatibilityTier } from "@/lib/compatibilityEngine";

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

// Profiles are now imported from archetypalProfiles.ts

export default function ExplorePage() {
  const canExplore = useSoulmatesFeature("comp_explorer");
  const { tier, canRunCompatibility, runsRemaining, upgradeRequired } = usePlanLimits();
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userTraits, setUserTraits] = useState<number[] | null>(null);
  const [clientScores, setClientScores] = useState<Record<string, number>>({});

  // Load user profile traits
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profileResponse = await profileApi.get();
        const profile = (profileResponse as any)?.profile || profileResponse;
        if (profile?.traits && Array.isArray(profile.traits) && profile.traits.length === 32) {
          setUserTraits(profile.traits);
          
          // Calculate client-side compatibility scores for all profiles
          const scores: Record<string, number> = {};
          ARCHETYPAL_PROFILES.forEach(archetypalProfile => {
            try {
              const compatibility = calculateCompatibility(profile.traits, archetypalProfile.traits);
              scores[archetypalProfile.id] = compatibility.overall;
            } catch (e) {
              console.error(`Error calculating compatibility for ${archetypalProfile.id}:`, e);
            }
          });
          setClientScores(scores);
        } else {
          // Fallback: try localStorage
          if (typeof window !== 'undefined') {
            const localProfile = localStorage.getItem('soulmates_profile');
            if (localProfile) {
              const parsed = JSON.parse(localProfile);
              if (parsed.traits && Array.isArray(parsed.traits) && parsed.traits.length === 32) {
                setUserTraits(parsed.traits);
                
                // Calculate client-side compatibility scores
                const scores: Record<string, number> = {};
                ARCHETYPAL_PROFILES.forEach(profile => {
                  try {
                    const compatibility = calculateCompatibility(parsed.traits, profile.traits);
                    scores[profile.id] = compatibility.overall;
                  } catch (e) {
                    console.error(`Error calculating compatibility for ${profile.id}:`, e);
                  }
                });
                setClientScores(scores);
              }
            }
          }
        }
      } catch (e) {
        console.error("Error loading user profile:", e);
      }
    };
    
    if (canExplore) {
      loadUserProfile();
    }
  }, [canExplore]);

  if (!canExplore) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Compatibility Explorer</h1>
          <p className="text-gray-600">
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
        } catch (e) {
          console.error("Error calculating client-side compatibility:", e);
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
          console.error("Analytics error:", e);
        }
      } catch (apiError) {
        // Backend API failed, but we already have client-side results
        console.warn("Backend API unavailable, using client-side results only:", apiError);
        // Client-side result is already set above, so we can continue
      }
    } catch (err: any) {
      // Check if it's a 503 (backend unavailable) error
      const errorMessage = err.message || "";
      if (errorMessage.includes("503") || errorMessage.includes("Service Unavailable") || errorMessage.includes("Backend service unavailable")) {
        setError("The compatibility service is currently unavailable. Please make sure the backend server is running, or try again later.");
      } else {
        setError(err.message || "Failed to calculate compatibility");
      }
      console.error("Compatibility exploration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Compatibility Explorer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Test your compatibility with archetypal partners to understand your relationship patterns and discover what works for you.
          </p>
          {runsRemaining !== null && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {runsRemaining} {runsRemaining === 1 ? "run" : "runs"} remaining this month
            </p>
          )}
        </div>

        {/* Upgrade Prompt */}
        {!canRunCompatibility && upgradeRequired && (
          <UpgradePrompt
            feature="compatibility runs"
            currentUsage={runsRemaining === null ? undefined : (5 - (runsRemaining || 0))}
            limit={5}
            recommendedPlan="plus"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {ARCHETYPAL_PROFILES.map((partner) => {
            const Icon = partner.icon;
            const isSelected = selectedPartner === partner.id;
            const isCalculating = loading && isSelected;
            const compatibilityScore = clientScores[partner.id];
            const tier = compatibilityScore ? getCompatibilityTier(compatibilityScore) : null;
            
            return (
              <button
                key={partner.id}
                onClick={() => !loading && handleExplore(partner.id)}
                disabled={loading}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all text-left relative ${
                  isSelected
                    ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20 shadow-lg scale-105"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {/* Compatibility Score Badge */}
                {compatibilityScore !== undefined && (
                  <div className="absolute top-2 right-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${tier?.color || 'from-gray-400 to-gray-500'} text-white`}>
                      {Math.round(compatibilityScore * 100)}%
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected 
                      ? "bg-pink-100 dark:bg-pink-900/40" 
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isSelected 
                        ? "text-pink-600 dark:text-pink-400" 
                        : "text-gray-600 dark:text-gray-400"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {partner.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {partner.archetype} • {partner.attachmentStyle}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {partner.description}
                </p>
                
                {/* Love Languages */}
                {partner.loveLanguages.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {partner.loveLanguages.slice(0, 2).map((lang) => (
                      <span key={lang} className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                        {lang}
                      </span>
                    ))}
                  </div>
                )}

                {isCalculating && (
                  <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-600 border-t-transparent"></div>
                    <span className="text-sm font-medium">Calculating...</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Service Unavailable</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">{error}</p>
                {error.includes("backend server") && (
                  <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-300 dark:border-yellow-700">
                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-1">To start the backend server:</p>
                    <code className="text-xs text-yellow-900 dark:text-yellow-100 block bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded">
                      cd web_app/backend && uvicorn app:app --reload
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8 p-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Compatibility Results
              </h2>
              {result.snapshot.soulmate_flag && (
                <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-white rounded-full text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Soulmate Tier!
                </span>
              )}
            </div>

            {/* Overall Score */}
            <div className="mb-8 p-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  Overall Compatibility
                </span>
                <span className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {(result.snapshot.score_overall * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${result.snapshot.score_overall * 100}%` }}
                />
              </div>
            </div>

            {/* Dimension Breakdown */}
            {result.snapshot.score_axes && Object.keys(result.snapshot.score_axes).length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Dimension Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.snapshot.score_axes).map(([axis, score]) => (
                    <div 
                      key={axis} 
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {axis.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
                          {(score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700"
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            {result.snapshot.explanation_summary && (
              <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Insights
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {result.snapshot.explanation_summary}
                </p>
              </div>
            )}

            {/* Features Used */}
            <div className="flex flex-wrap gap-3">
              {result.snapshot.astro_used && (
                <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Astrology
                </span>
              )}
              {result.snapshot.num_used && (
                <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Numerology
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

