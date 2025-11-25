"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSoulmatesFeature } from "@/hooks/useSoulmatesFeature";
import { bondsApi, journalingApi, compatibilityApi } from "@/lib/api";
import { logSoulmatesEvent } from "@/lib/analytics";

interface Bond {
  id: string;
  user_a_id: string;
  user_b_id: string;
  status: string;
  bond_type: string;
  started_at: string;
  current_label?: string;
}

interface CompatibilitySnapshot {
  score_overall: number;
  score_axes: Record<string, number>;
  explanation_summary: string;
}

export default function BondDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const bondId = params.bondId as string;
  const canUseBonds = useSoulmatesFeature("bond_mode_basic");
  
  const [bond, setBond] = useState<Bond | null>(null);
  const [compatibility, setCompatibility] = useState<CompatibilitySnapshot | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBond = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load bond data
        const bondData = await bondsApi.get(bondId);
        setBond(bondData as Bond);

        // Load compatibility snapshot for this bond
        try {
          const compatData = await compatibilityApi.getForBond(bondId) as { snapshot?: CompatibilitySnapshot };
          if (compatData.snapshot) {
            setCompatibility(compatData.snapshot);
          }
        } catch (err: any) {
          // Compatibility might not exist yet - that's okay
          if (err.message?.includes("404") || err.message?.includes("not found")) {
            console.debug("No compatibility snapshot found for bond - this is normal");
          } else {
            console.error("Error loading compatibility:", err);
          }
        }
        
        // Log analytics
        try {
          logSoulmatesEvent({
            name: "bond_dashboard_viewed",
            bondId: bondId,
          });
        } catch (e) {
          console.error("Analytics error:", e);
        }

        // Load journal entries
        try {
          const entriesData = await journalingApi.list(bondId) as { entries?: any[] };
          setEntries(entriesData.entries || []);
        } catch (err) {
          console.error("Error loading entries:", err);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load bond");
      } finally {
        setLoading(false);
      }
    };

    if (bondId && canUseBonds) {
      loadBond();
    }
  }, [bondId, canUseBonds]);

  if (!canUseBonds) {
    return (
      <div className="min-h-screen p-8">
        <p>Couple mode is not available in the current phase.</p>
      </div>
    );
  }

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

  if (error || !bond) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
            <p className="font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Bond</p>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error || "Bond not found"}</p>
            <button
              onClick={() => router.push("/bonds")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Bonds
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleEndBond = async () => {
    if (!confirm("Are you sure you want to end this bond? This action cannot be undone.")) {
      return;
    }

    try {
      await bondsApi.end(bondId);
      router.push("/bonds");
    } catch (err: any) {
      alert(err.message || "Failed to end bond");
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {bond.current_label || `${bond.bond_type} Bond`}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Started: {new Date(bond.started_at).toLocaleDateString()}
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              {bond.status}
            </span>
          </div>
          <button
            onClick={handleEndBond}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            End Bond
          </button>
        </div>

        {/* Compatibility Section */}
        {compatibility ? (
          <div className="mb-8 p-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Compatibility</h2>
            
            {/* Overall Score */}
            <div className="mb-6 p-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-semibold text-gray-900 dark:text-white">Overall Compatibility</span>
                <span className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {(compatibility.score_overall * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
                  style={{ width: `${compatibility.score_overall * 100}%` }}
                />
              </div>
            </div>

            {/* Dimension Breakdown */}
            {compatibility.score_axes && Object.keys(compatibility.score_axes).length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Dimension Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(compatibility.score_axes).map(([axis, score]) => (
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
            {compatibility.explanation_summary && (
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Insights</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {compatibility.explanation_summary}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No compatibility snapshot yet. Run a compatibility test to see your scores.
            </p>
          </div>
        )}

        {/* Shared Journal Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Shared Journal</h2>
            <button
              onClick={() => router.push(`/journaling?bond_id=${bondId}`)}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all"
            >
              Add Entry
            </button>
          </div>
          
          {entries.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                No journal entries yet. Start documenting your journey together!
              </p>
              <button
                onClick={() => router.push(`/journaling?bond_id=${bondId}`)}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold"
              >
                Create First Entry
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {entry.title || entry.entry_type?.replace(/_/g, " ")}
                      </h3>
                      <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                        {entry.entry_type?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {entry.body}
                  </p>
                  {entry.mood_score && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Mood: {entry.mood_score}/10
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => router.push(`/journaling?bond_id=${bondId}`)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Add Journal Entry
          </button>
          <button
            onClick={() => router.push(`/bond/${bondId}/lab`)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Resonance Lab
          </button>
          <button
            onClick={() => router.push(`/explore`)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg hover:from-indigo-600 hover:to-blue-700 font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Run Compatibility Test
          </button>
        </div>
      </div>
    </div>
  );
}

