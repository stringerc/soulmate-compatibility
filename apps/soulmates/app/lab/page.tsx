"use client";

import { useState, useEffect } from "react";
import { useSoulmatesFeature } from "@/hooks/useSoulmatesFeature";
import UpgradePrompt from "@/components/UpgradePrompt";
import { usePlanLimits } from "@/hooks/usePlanLimits";

interface ResonanceData {
  window_start: string;
  window_end: string;
  metrics: {
    stressIndex: number;
    connectionIndex: number;
    moodAverage: number;
  };
}

export default function SoloLabPage() {
  const canUseLab = useSoulmatesFeature("bond_resonance_lab");
  const { canAccessLab, tier, upgradeRequired } = usePlanLimits();
  const [resonance, setResonance] = useState<ResonanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [windowDays, setWindowDays] = useState(30);

  useEffect(() => {
    const loadResonance = async () => {
      setLoading(true);
      try {
        // Call actual resonance API
        const { resonanceApi } = await import("@/lib/api");
        try {
          const data = await resonanceApi.getSolo(windowDays) as ResonanceData;
          setResonance(data);
          setError(null);
        } catch (err: any) {
          console.error("Error loading resonance:", err);
          // Only show error if it's not a 404 (data might not exist yet)
          if (err.message?.includes("404") || err.message?.includes("not found")) {
            setResonance(null);
            setError(null); // No error, just no data
          } else {
            setError(err.message || "Failed to load resonance data");
            // Fallback placeholder data for development
            if (process.env.NODE_ENV === "development") {
              setResonance({
                window_start: new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString(),
                window_end: new Date().toISOString(),
                metrics: {
                  stressIndex: 0.45,
                  connectionIndex: 0.72,
                  moodAverage: 0.68,
                },
              });
            }
          }
        }
      } catch (error) {
        console.error("Error loading resonance:", error);
      } finally {
        setLoading(false);
      }
    };

    if (canUseLab) {
      loadResonance();
    }
  }, [canUseLab, windowDays]);

  if (!canUseLab) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Resonance Lab</h1>
          <p className="text-gray-600">
            This feature is not available in the current phase. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  // Check plan access (Resonance Lab requires COUPLE_PREMIUM)
  if (!canAccessLab && upgradeRequired) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Resonance Lab
          </h1>
          <UpgradePrompt
            feature="resonance lab"
            recommendedPlan="couple-premium"
          />
        </div>
      </div>
    );
  }

  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Resonance Lab
            </h1>
            <select
              value={windowDays}
              onChange={(e) => setWindowDays(Number(e.target.value))}
              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Explore your resonance patterns and discover insights about your inner rhythms
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
            <p className="font-semibold text-red-800 dark:text-red-200 mb-1">Error</p>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : resonance ? (
          <div className="space-y-6">
            <div className="p-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Resonance Metrics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Stress Index</h3>
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                    {(resonance.metrics.stressIndex * 100).toFixed(0)}%
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${resonance.metrics.stressIndex * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Connection Index</h3>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-3">
                    {(resonance.metrics.connectionIndex * 100).toFixed(0)}%
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${resonance.metrics.connectionIndex * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Mood Average</h3>
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-3">
                    {(resonance.metrics.moodAverage * 100).toFixed(0)}%
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${resonance.metrics.moodAverage * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Time Window</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                {new Date(resonance.window_start).toLocaleDateString()} -{" "}
                {new Date(resonance.window_end).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                These metrics are aggregated from your SyncScript resonance data.
                No raw tasks or sensitive details are included.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              No resonance data available for this time window.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Try selecting a different time period or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

