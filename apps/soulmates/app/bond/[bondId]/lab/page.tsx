"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSoulmatesFeature } from "@/hooks/useSoulmatesFeature";
import { bondsApi } from "@/lib/api";

interface Bond {
  id: string;
  status: string;
}

interface CoupleResonanceData {
  window_start: string;
  window_end: string;
  user_a_metrics: {
    stressIndex: number;
    connectionIndex: number;
    moodAverage: number;
  };
  user_b_metrics: {
    stressIndex: number;
    connectionIndex: number;
    moodAverage: number;
  };
  correlation: {
    stressCorrelation: number;
    connectionCorrelation: number;
    moodCorrelation: number;
  };
}

export default function CoupleLabPage() {
  const params = useParams();
  const router = useRouter();
  const bondId = params.bondId as string;
  const canUseLab = useSoulmatesFeature("bond_resonance_lab");
  
  const [bond, setBond] = useState<Bond | null>(null);
  const [resonance, setResonance] = useState<CoupleResonanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [windowDays, setWindowDays] = useState(30);

  useEffect(() => {
    const loadData = async () => {
      try {
        const bondData = await bondsApi.get(bondId) as Bond;
        setBond(bondData);

        if (bondData.status !== "ACTIVE") {
          router.push(`/bond/${bondId}`);
          return;
        }

        // Load couple resonance data
        const { resonanceApi } = await import("@/lib/api");
        try {
          const data = await resonanceApi.getCouple(bondId, windowDays) as CoupleResonanceData;
          setResonance(data);
          setError(null);
        } catch (err: any) {
          console.error("Error loading couple resonance:", err);
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
                user_a_metrics: {
                  stressIndex: 0.45,
                  connectionIndex: 0.72,
                  moodAverage: 0.68,
                },
                user_b_metrics: {
                  stressIndex: 0.52,
                  connectionIndex: 0.75,
                  moodAverage: 0.71,
                },
                correlation: {
                  stressCorrelation: 0.65,
                  connectionCorrelation: 0.82,
                  moodCorrelation: 0.78,
                },
              });
            }
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (bondId && canUseLab) {
      loadData();
    }
  }, [bondId, canUseLab, windowDays, router]);

  if (!canUseLab) {
    return (
      <div className="min-h-screen p-8">
        <p>Resonance Lab is not available in the current phase.</p>
      </div>
    );
  }

  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
            <p className="font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Resonance Data</p>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={() => router.push(`/bond/${bondId}`)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Bond
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!bond || !resonance) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              No resonance data available for this bond.
            </p>
            <button
              onClick={() => router.push(`/bond/${bondId}`)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold"
            >
              Back to Bond
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Couple Resonance Lab
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
            Explore how your resonance patterns align and discover insights about your connection
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Individual Metrics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">You</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Stress</span>
                      <span className="text-sm font-semibold">
                        {(resonance.user_a_metrics.stressIndex * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${resonance.user_a_metrics.stressIndex * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Connection</span>
                      <span className="text-sm font-semibold">
                        {(resonance.user_a_metrics.connectionIndex * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${resonance.user_a_metrics.connectionIndex * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Mood</span>
                      <span className="text-sm font-semibold">
                        {(resonance.user_a_metrics.moodAverage * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${resonance.user_a_metrics.moodAverage * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Partner</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Stress</span>
                      <span className="text-sm font-semibold">
                        {(resonance.user_b_metrics.stressIndex * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${resonance.user_b_metrics.stressIndex * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Connection</span>
                      <span className="text-sm font-semibold">
                        {(resonance.user_b_metrics.connectionIndex * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${resonance.user_b_metrics.connectionIndex * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Mood</span>
                      <span className="text-sm font-semibold">
                        {(resonance.user_b_metrics.moodAverage * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${resonance.user_b_metrics.moodAverage * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Correlation Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Stress Correlation</h3>
                <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                  {(resonance.correlation.stressCorrelation * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  How your stress levels align
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Connection Correlation</h3>
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {(resonance.correlation.connectionCorrelation * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  How your connection patterns align
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Mood Correlation</h3>
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {(resonance.correlation.moodCorrelation * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  How your moods align
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Privacy Note:</strong> These metrics are aggregated and anonymized.
              No raw tasks, personal details, or sensitive information are included.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

