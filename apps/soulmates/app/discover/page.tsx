"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";
import {
  Users,
  Heart,
  Sparkles,
  Calendar,
  Facebook,
  Instagram,
  Linkedin,
  Music,
  BookOpen,
  Plus,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { connectSocialAccount, getFriendsOfFriends } from "@/lib/socialConnections";
import { connectSpotify, connectGoodreads, getUserInterests, findSharedInterests, generateConversationStarters } from "@/lib/sharedInterests";
import { getUpcomingEvents, registerForEvent, getUserEventRegistrations, createMockEvents } from "@/lib/communityEvents";
import { calculateCompatibility } from "@/lib/compatibilityEngine";
import { ARCHETYPAL_PROFILES } from "@/lib/archetypalProfiles";

interface DiscoverMatch {
  userId: string;
  compatibility: number;
  mutualConnections: number;
  connectionPath: string[];
  sharedInterests?: {
    count: number;
    starters: string[];
  };
}

function DiscoverPageContent() {
  const { isAuthenticated, userId } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'interests' | 'events'>('friends');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<DiscoverMatch[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<Set<string>>(new Set());
  const [userInterests, setUserInterests] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    // Load user interests
    const interests = getUserInterests(userId || '');
    setUserInterests(interests);

    // Load events
    const mockEvents = createMockEvents();
    setEvents(mockEvents);

    // Load friends of friends
    loadFriendsOfFriends();
  }, [isAuthenticated, userId]);

  const loadFriendsOfFriends = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Get friends of friends
      const fof = getFriendsOfFriends(userId);

      // Calculate compatibility for each
      const userProfile = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('soulmates_profile') || '{}')
        : null;

      if (userProfile?.traits) {
        const matchesWithCompatibility: DiscoverMatch[] = fof.map(f => {
          // Find matching archetype profile for compatibility
          const archetypeProfile = ARCHETYPAL_PROFILES.find(
            p => p.id === f.userId || Math.random() > 0.5 // Simplified for demo
          );

          let compatibility = 0.5;
          if (archetypeProfile) {
            const comp = calculateCompatibility(userProfile.traits, archetypeProfile.traits);
            compatibility = comp.overall;
          }

          // Find shared interests
          const shared = findSharedInterests(userId, f.userId);
          const starters = generateConversationStarters(shared);

          return {
            userId: f.userId,
            compatibility,
            mutualConnections: f.mutualConnections.count,
            connectionPath: f.connectionPath,
            sharedInterests: {
              count: shared.count,
              starters,
            },
          };
        });

        setMatches(matchesWithCompatibility.sort((a, b) => b.compatibility - a.compatibility));
      }
    } catch (e) {
      console.error('Failed to load friends of friends:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSocial = async (provider: 'facebook' | 'instagram' | 'linkedin') => {
    if (!userId) return;

    setLoading(true);
    try {
      const result = await connectSocialAccount(provider, userId);
      if (result.success) {
        setConnectedAccounts(prev => new Set([...prev, provider]));
        await loadFriendsOfFriends();
      }
    } catch (e) {
      console.error('Failed to connect social account:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSpotify = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const result = await connectSpotify(userId);
      if (result.success) {
        setConnectedAccounts(prev => new Set([...prev, 'spotify']));
        const interests = getUserInterests(userId);
        setUserInterests(interests);
      }
    } catch (e) {
      console.error('Failed to connect Spotify:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoodreads = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const result = await connectGoodreads(userId);
      if (result.success) {
        setConnectedAccounts(prev => new Set([...prev, 'goodreads']));
        const interests = getUserInterests(userId);
        setUserInterests(interests);
      }
    } catch (e) {
      console.error('Failed to connect Goodreads:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    if (!userId) return;

    try {
      registerForEvent(eventId, userId);
      // Refresh events
      const updated = getUpcomingEvents();
      setEvents(updated);
    } catch (e) {
      console.error('Failed to register for event:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Your Matches
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Connect with friends, explore shared interests, and join community events
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'friends', label: 'Friends of Friends', icon: Users },
            { id: 'interests', label: 'Shared Interests', icon: Heart },
            { id: 'events', label: 'Community Events', icon: Calendar },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Friends of Friends Tab */}
        {activeTab === 'friends' && (
          <div className="space-y-6">
            {/* Connect Social Accounts */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Connect Your Social Accounts
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Connect with Facebook, Instagram, or LinkedIn to discover compatible friends of friends
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { provider: 'facebook' as const, icon: Facebook, label: 'Facebook' },
                  { provider: 'instagram' as const, icon: Instagram, label: 'Instagram' },
                  { provider: 'linkedin' as const, icon: Linkedin, label: 'LinkedIn' },
                ].map(({ provider, icon: Icon, label }) => (
                  <button
                    key={provider}
                    onClick={() => handleConnectSocial(provider)}
                    disabled={loading || connectedAccounts.has(provider)}
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold transition-all ${
                      connectedAccounts.has(provider)
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {connectedAccounts.has(provider) ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Connected
                      </>
                    ) : (
                      <>
                        <Icon className="w-5 h-5" />
                        Connect {label}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Matches */}
            {matches.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match) => (
                  <div
                    key={match.userId}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {match.userId.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {match.userId}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {match.mutualConnections} mutual friends
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Compatibility</span>
                        <span className="text-lg font-bold text-pink-600 dark:text-pink-400">
                          {Math.round(match.compatibility * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${match.compatibility * 100}%` }}
                        />
                      </div>
                    </div>

                    {match.sharedInterests && match.sharedInterests.count > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {match.sharedInterests.count} shared interests
                        </p>
                        {match.sharedInterests.starters.length > 0 && (
                          <p className="text-xs text-pink-600 dark:text-pink-400 italic">
                            "{match.sharedInterests.starters[0]}"
                          </p>
                        )}
                      </div>
                    )}

                    <Link
                      href={`/explore?match=${match.userId}`}
                      className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      View Compatibility
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Connect your social accounts to discover friends of friends
                </p>
              </div>
            )}
          </div>
        )}

        {/* Shared Interests Tab */}
        {activeTab === 'interests' && (
          <div className="space-y-6">
            {/* Connect Interest Sources */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Connect Your Interests
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Connect Spotify, Goodreads, or add interests manually to find people with similar tastes
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { provider: 'spotify', icon: Music, label: 'Spotify', handler: handleConnectSpotify },
                  { provider: 'goodreads', icon: BookOpen, label: 'Goodreads', handler: handleConnectGoodreads },
                ].map(({ provider, icon: Icon, label, handler }) => (
                  <button
                    key={provider}
                    onClick={handler}
                    disabled={loading || connectedAccounts.has(provider)}
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold transition-all ${
                      connectedAccounts.has(provider)
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {connectedAccounts.has(provider) ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Connected
                      </>
                    ) : (
                      <>
                        <Icon className="w-5 h-5" />
                        Connect {label}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* User Interests */}
            {userInterests.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Your Interests ({userInterests.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userInterests.map((interest) => (
                    <span
                      key={interest.id}
                      className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-lg text-gray-900 dark:text-white text-sm font-medium"
                    >
                      {interest.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Community Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {events.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {new Date(event.startTime).toLocaleDateString()} at{' '}
                          {new Date(event.startTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-xs font-semibold">
                        {event.type.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {event.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {event.currentAttendees} / {event.maxAttendees} attendees
                      </span>
                      {event.matchingEnabled && (
                        <span className="text-xs text-pink-600 dark:text-pink-400 font-semibold">
                          Pre-matched
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleRegisterEvent(event.id)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all"
                    >
                      Register for Event
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No upcoming events. Check back soon!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <AuthGuard redirectTo={`/login?callbackUrl=${encodeURIComponent("/discover")}`}>
      <DiscoverPageContent />
    </AuthGuard>
  );
}

