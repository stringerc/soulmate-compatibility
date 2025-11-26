"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowRight, Sparkles, Chrome } from "lucide-react";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/me";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if Google provider is available
      const providers = await fetch("/api/auth/providers").then(r => r.json());
      
      if (!providers.google) {
        setError("Google Sign-In is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local");
        setLoading(false);
        return;
      }
      
      // Use window.location for redirect (most reliable)
      window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;
      
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(err.message || "Failed to sign in with Google. Please check your Google OAuth credentials in .env.local");
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Mark as sent immediately (so button changes to "Resend" right away)
    if (!linkSent) {
      setLinkSent(true);
    }

    try {
      const response = await fetch("/api/v1/soulmates/auth/magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email,
          callback_url: callbackUrl 
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage = data.detail || data.error || `Server error (${response.status})`;
        
        // Provide helpful message for service unavailable
        if (response.status === 503) {
          throw new Error("Authentication service is temporarily unavailable. Please try Google Sign-In instead, or try again in a moment.");
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setSuccess(true);
      
      // In development, show the dev link if provided
      if (data.dev_link && process.env.NODE_ENV === 'development') {
        console.log("🔗 Development magic link:", data.dev_link);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Provide user-friendly error messages
      let errorMessage = err.message || "Failed to send magic link. Please try again.";
      
      if (err.message?.includes("fetch failed") || err.message?.includes("NetworkError")) {
        errorMessage = "Unable to connect to the server. Please check your internet connection and try again, or use Google Sign-In.";
      } else if (err.message?.includes("503") || err.message?.includes("unavailable")) {
        errorMessage = err.message; // Use the specific message we set
      }
      
      setError(errorMessage);
      // Keep linkSent as true so they can still resend
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-pink-600 dark:text-pink-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Soulmates
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to continue your journey
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-8">
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mb-6 px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <Chrome className="w-5 h-5" />
            {loading ? "Signing in..." : "Sign in with Google"}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Magic Link Form */}
          <form onSubmit={handleMagicLink} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">Sign-in Error</p>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">{error}</p>
                {error.includes("google") && (
                  <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded border border-red-300 dark:border-red-700">
                    <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-2">Common fixes:</p>
                    <ul className="text-xs text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                      <li>Make sure redirect URI is added in Google Console: <code className="bg-red-200 dark:bg-red-800 px-1 rounded">http://localhost:3000/api/auth/callback/google</code></li>
                      <li>Restart dev server after updating credentials</li>
                      <li>Check that Client ID matches: <code className="bg-red-200 dark:bg-red-800 px-1 rounded">739263757591-f5mrjkesqg66pno8ni2oj5e1j0spn61h</code></li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {linkSent && success && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-green-800 dark:text-green-200 font-semibold mb-1">
                      Magic link sent!
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Check your email at <strong>{email}</strong>. The link expires in 15 minutes.
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Didn't receive it? Click "Resend Magic Link" below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Sending...
                </>
              ) : linkSent ? (
                <>
                  <Mail className="w-5 h-5" />
                  Resend Magic Link
                </>
              ) : (
                <>
                  Send Magic Link
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-semibold"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
