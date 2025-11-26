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
      // Check if any OAuth provider is available
      const providersResponse = await fetch("/api/auth/providers");
      if (!providersResponse.ok) {
        throw new Error("Unable to check authentication providers");
      }
      
      const providers = await providersResponse.json();
      
      // Check for Auth0 first (preferred), then Google
      if (providers.auth0) {
        window.location.href = `/api/auth/signin/auth0?callbackUrl=${encodeURIComponent(callbackUrl)}`;
        return;
      } else if (providers.google) {
        window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;
        return;
      }
      
      // No OAuth providers available
      setError(
        "OAuth sign-in is not configured. " +
        "Please configure either Auth0 (AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_DOMAIN) " +
        "or Google OAuth (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) in your environment variables. " +
        "For now, please use the magic link option below."
      );
      setLoading(false);
      
    } catch (err: any) {
      console.error("OAuth sign-in error:", err);
      setError(
        err.message || 
        "Failed to initialize sign-in. Please try the magic link option below, or contact support if the issue persists."
      );
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
          {/* OAuth Sign In Button (Google or Auth0) */}
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
                onChange={(e) => {
                  // Use requestIdleCallback to defer non-critical updates
                  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
                    requestIdleCallback(() => {
                      setEmail(e.target.value);
                    }, { timeout: 100 });
                  } else {
                    setEmail(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  // Handle Enter key immediately (no deferral)
                  if (e.key === 'Enter' && !loading) {
                    e.preventDefault();
                    handleMagicLink(e as any);
                  }
                }}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">Sign-in Error</p>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">{error}</p>
                {(error.includes("OAuth") || error.includes("not configured")) && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-300 dark:border-yellow-700">
                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-2">💡 Alternative:</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Use the magic link option below to sign in with your email. This works even when OAuth is not configured.
                    </p>
                  </div>
                )}
                {error.includes("unavailable") && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-300 dark:border-blue-700">
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Try this:</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      The authentication service is temporarily unavailable. Please try again in a moment, or use Google Sign-In above.
                    </p>
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
