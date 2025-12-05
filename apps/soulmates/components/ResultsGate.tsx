"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Lock, ArrowRight, CheckCircle2, Heart, Users, BarChart3, Gift } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ResultsGateProps {
  testData: {
    traits: number[];
    birthdate?: string;
    name?: string;
    confidence: number[];
  };
  onAuthenticated?: () => void;
}

export default function ResultsGate({ testData, onAuthenticated }: ResultsGateProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    if (!isLoading) {
      setIsChecking(false);
      if (isAuthenticated && onAuthenticated) {
        // User is authenticated, proceed to results
        onAuthenticated();
      }
    }
  }, [isAuthenticated, isLoading, onAuthenticated]);

  // If user becomes authenticated, proceed
  useEffect(() => {
    if (isAuthenticated && !isChecking && onAuthenticated) {
      onAuthenticated();
    }
  }, [isAuthenticated, isChecking, onAuthenticated]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // This should trigger onAuthenticated, but just in case, show a redirect message
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Preparing your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Your Compatibility Profile is Ready! 🎉
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            We've calculated your unique compatibility profile
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-500">
            Sign in to unlock your complete results
          </p>
        </div>

        {/* Value Proposition */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            What You'll Get
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Your Archetype</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Discover your unique compatibility archetype and what it means for your relationships
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex-shrink-0">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Attachment Style</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Understand how you form and maintain relationships
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex-shrink-0">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Love Languages</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Learn how you express and receive love
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Compatibility Scores</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  See detailed compatibility breakdowns and insights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits List */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            Sign in to unlock:
          </h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span>See your complete archetype and attachment style</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span>Discover your love languages</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span>Save your profile for future reference</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span>Access the compatibility explorer</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span>Track your relationship journey</span>
            </li>
          </ul>
        </div>

        {/* Social Proof */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Join <span className="font-semibold text-pink-600 dark:text-pink-400">10,000+</span> users discovering their compatibility
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4">
          <Link
            href={`/login?callbackUrl=${encodeURIComponent("/onboarding?showResults=true")}`}
            className="block w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            Sign In to See Results
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href={`/signup?callbackUrl=${encodeURIComponent("/onboarding?showResults=true")}`}
            className="block w-full px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-lg font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Create Account
          </Link>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your test responses are saved locally. Sign in to save them permanently to your account.
          </p>
        </div>
      </div>
    </div>
  );
}

