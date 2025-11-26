"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

function AuthCallbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setError("No token provided");
        return;
      }

      try {
        const response = await fetch(`/api/v1/soulmates/auth/verify?token=${token}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Invalid token");
        }

        const data = await response.json();
        
        // Store token and user info
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", data.token);
          if (data.user?.email) {
            localStorage.setItem("user_email", data.user.email);
          }
        }

        setStatus("success");
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
          router.push("/me");
        }, 1000);
      } catch (err: any) {
        console.error("Token verification error:", err);
        setStatus("error");
        setError(err.message || "Failed to verify token");
      }
    };

    verifyToken();
  }, [token, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying your magic link...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verification Failed
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Success!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackPageContent />
    </Suspense>
  );
}

