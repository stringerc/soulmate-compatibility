"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Sparkles, ArrowRight, Zap, Crown } from "lucide-react";
import { billingApi } from "@/lib/api";
import PlanBadge from "@/components/PlanBadge";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<{ tier: string; plan_name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        // Wait a moment for webhook to process
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        const data = await billingApi.getSubscription();
        setSubscription(data);
      } catch (err) {
        console.error("Error verifying subscription:", err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      verifySubscription();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const getPlanFeatures = (tier: string) => {
    switch (tier) {
      case "PLUS":
        return [
          "Unlimited compatibility runs",
          "1 active bond",
          "Advanced insights",
          "Priority support",
        ];
      case "COUPLE_PREMIUM":
        return [
          "Everything in Plus",
          "Unlimited bonds",
          "Resonance Lab access",
          "Deep compatibility reports",
          "Couple coaching insights",
        ];
      default:
        return [];
    }
  };

  const getPlanIcon = (tier: string) => {
    return tier === "COUPLE_PREMIUM" ? Crown : Zap;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  const tier = subscription?.tier || "FREE";
  const features = getPlanFeatures(tier);
  const Icon = getPlanIcon(tier);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to {subscription?.plan_name || "Plus"}!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Your subscription is now active
            </p>
          </div>

          {/* Plan Badge */}
          {tier !== "FREE" && (
            <div className="mb-8 flex justify-center">
              <PlanBadge tier={tier as "PLUS" | "COUPLE_PREMIUM"} />
            </div>
          )}

          {/* Features List */}
          {features.length > 0 && (
            <div className="mb-8 text-left bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  What's Included
                </h2>
              </div>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTAs */}
          <div className="space-y-4">
            <Link
              href="/me"
              className="block w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/explore"
              className="block w-full px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-semibold transition"
            >
              Start Exploring Compatibility
            </Link>
          </div>

          {/* Help Text */}
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Need help?{" "}
            <Link href="/help" className="text-pink-600 dark:text-pink-400 hover:underline">
              Visit our help center
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

