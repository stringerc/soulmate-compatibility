"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Share2, Copy, CheckCircle2, Users, ArrowRight } from "lucide-react";
import { generatePartnerComparisonLink, copyLinkToClipboard, trackShare } from "@/lib/socialSharing";
import { useAuth } from "@/hooks/useAuth";

export default function PartnerComparison() {
  const { isAuthenticated } = useAuth();
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerateLink = async () => {
    if (!isAuthenticated) {
      alert("Please sign in to generate a partner comparison link");
      return;
    }

    setLoading(true);
    try {
      // Get user ID from localStorage
      const userId = typeof window !== 'undefined' 
        ? localStorage.getItem('user_id') || ''
        : '';
      
      const shareableLink = generatePartnerComparisonLink(userId);
      setLink(shareableLink.url);
      trackShare('partner_comparison', 'partner_comparison', shareableLink.id);
    } catch (e) {
      console.error('Failed to generate link:', e);
      alert('Failed to generate link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!link) return;

    const success = await copyLinkToClipboard(link);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="text-center">
          <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Compare with Your Partner
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sign in to generate a link to share with your partner and compare your compatibility
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all"
          >
            Sign In
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Compare with Your Partner
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Generate a shareable link to invite your partner. Both of you will complete the assessment and see your compatibility side-by-side.
          </p>
        </div>
      </div>

      {!link ? (
        <button
          onClick={handleGenerateLink}
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Generating...
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" />
              Generate Partner Link
            </>
          )}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-green-900 dark:text-green-100">
                Link Generated!
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mb-3">
              Share this link with your partner. They'll complete the assessment and you'll see your compatibility results together.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={link}
                readOnly
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-500" />
                How It Works
              </h4>
              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                <li>Share the link with your partner</li>
                <li>They complete the assessment</li>
                <li>View your compatibility side-by-side</li>
                <li>Discover insights together</li>
              </ol>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-purple-500" />
                What You'll See
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>Compatibility percentage</li>
                <li>Dimension-by-dimension breakdown</li>
                <li>Strengths and growth areas</li>
                <li>Personalized insights</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

