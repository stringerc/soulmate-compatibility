"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logSoulmatesEvent } from "@/lib/analytics";
import { billingApi } from "@/lib/api";
import PlanBadge from "@/components/PlanBadge";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<{ tier: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load profile
        const { profileApi, billingApi } = await import("@/lib/api");
        const [profileData, subscriptionData] = await Promise.all([
          profileApi.get().catch(() => null),
          billingApi.getSubscription().catch(() => ({ tier: "FREE" })),
        ]);
        
        setProfile(profileData);
        setSubscription(subscriptionData);
        
        // Log analytics event
        if (profileData && typeof profileData === 'object' && 'id' in profileData) {
          try {
            logSoulmatesEvent({
              name: "profile_viewed_again",
              payload: { profile_id: (profileData as any).id },
            });
          } catch (e) {
            console.error("Analytics error:", e);
          }
        }
      } catch (err: any) {
        console.error("Error loading data:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
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
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
            <p className="font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Profile</p>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
            <Link 
              href="/onboarding"
              className="inline-block px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
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
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-center">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              No profile found. Complete your onboarding to get started!
            </p>
            <Link 
              href="/onboarding"
              className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold"
            >
              Start Onboarding
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                My Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Your self-discovery journey</p>
            </div>
            {subscription && (
              <PlanBadge tier={subscription.tier as "FREE" | "PLUS" | "COUPLE_PREMIUM"} />
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Primary Archetype</h2>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.primary_archetype ? (
                <span className="capitalize">{profile.primary_archetype}</span>
              ) : (
                <span className="text-gray-400">Not set</span>
              )}
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Attachment Style</h2>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.attachment_style ? (
                <span className="capitalize">{profile.attachment_style}</span>
              ) : (
                <span className="text-gray-400">Not set</span>
              )}
            </p>
          </div>
        </div>

        {profile.love_languages && profile.love_languages.length > 0 && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Love Languages</h2>
            <div className="flex flex-wrap gap-2">
              {(profile.love_languages || []).map((lang: string) => (
                <span key={lang} className="px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-lg text-gray-900 dark:text-white font-medium">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/journaling" 
            className="block p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg card-hover"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Soul Journey</h3>
            <p className="text-gray-600 dark:text-gray-400">Journal your reflections and growth</p>
          </Link>
          
          <Link 
            href="/explore" 
            className="block p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg card-hover"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Compatibility Explorer</h3>
            <p className="text-gray-600 dark:text-gray-400">Test compatibility with archetypal partners</p>
          </Link>
          
          <Link 
            href="/bonds" 
            className="block p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg card-hover"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Couple Mode</h3>
            <p className="text-gray-600 dark:text-gray-400">Connect with a partner</p>
          </Link>
          
          <Link 
            href="/lab" 
            className="block p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg card-hover"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Resonance Lab</h3>
            <p className="text-gray-600 dark:text-gray-400">Explore your resonance patterns</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

