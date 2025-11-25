"use client";

import { useState, useEffect } from "react";
import { useSoulmatesFeature } from "@/hooks/useSoulmatesFeature";

export default function JournalingPage() {
  const canJournal = useSoulmatesFeature("souljourney_journaling");
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    entryType: "SELF_REFLECTION",
    title: "",
    body: "",
    tags: [] as string[],
    moodScore: undefined as number | undefined,
  });

  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true);
        setError(null);
        const { journalingApi } = await import("@/lib/api");
        const data = await journalingApi.list() as { entries?: any[] };
        setEntries(data.entries || []);
      } catch (err: any) {
        console.error("Error loading entries:", err);
        setError(err.message || "Failed to load journal entries");
      } finally {
        setLoading(false);
      }
    };
    loadEntries();
  }, []);

  if (!canJournal) {
    return (
      <div className="min-h-screen p-8">
        <p>Journaling is not available in the current phase.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const { journalingApi } = await import("@/lib/api");
      await journalingApi.create({
        entry_type: formData.entryType,
        title: formData.title,
        body: formData.body,
        tags: formData.tags,
        mood_score: formData.moodScore,
      });
      
      setShowForm(false);
      setFormData({
        entryType: "SELF_REFLECTION",
        title: "",
        body: "",
        tags: [],
        moodScore: undefined,
      });
      
      // Reload entries
      const { journalingApi: api } = await import("@/lib/api");
      const data = await api.list() as { entries?: any[] };
      setEntries(data.entries || []);
      
      // Log analytics
      try {
        const { logSoulmatesEvent } = await import("@/lib/analytics");
        logSoulmatesEvent({
          name: "souljourney_entry_created",
          payload: { 
            entry_type: formData.entryType,
            has_mood_score: formData.moodScore !== undefined,
            tags_count: formData.tags.length,
          },
        });
      } catch (e) {
        console.error("Analytics error:", e);
      }
    } catch (err: any) {
      console.error("Error creating entry:", err);
      setError(err.message || "Failed to create entry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Soul Journey
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Reflect, grow, and track your journey</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all"
          >
            {showForm ? "Cancel" : "New Entry"}
          </button>
        </div>

        {error && !showForm && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
            <p className="font-semibold text-red-800 dark:text-red-200 mb-1">Error</p>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 border rounded space-y-4">
            <div>
              <label className="block mb-2">Entry Type</label>
              <select
                value={formData.entryType}
                onChange={(e) => setFormData({ ...formData, entryType: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="SELF_REFLECTION">Self Reflection</option>
                <option value="CONFLICT">Conflict</option>
                <option value="WIN">Win</option>
                <option value="CHECKIN">Check-in</option>
                <option value="PROMPT_RESPONSE">Prompt Response</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Title (optional)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2">Body *</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full p-2 border rounded"
                rows={6}
                required
              />
            </div>

            <div>
              <label className="block mb-2">Mood Score (1-10, optional)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.moodScore || ""}
                onChange={(e) => setFormData({ ...formData, moodScore: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full p-2 border rounded"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? "Creating..." : "Create Entry"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 border rounded-lg animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
            <div key={entry.id} className="p-6 border rounded">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold">{entry.title || entry.entry_type}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{entry.body}</p>
              {entry.mood_score && (
                <p className="mt-2 text-sm">Mood: {entry.mood_score}/10</p>
              )}
            </div>
            ))}
            
            {entries.length === 0 && (
              <div className="p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center">
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  No entries yet. Start your journey!
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold"
                >
                  Create Your First Entry
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

