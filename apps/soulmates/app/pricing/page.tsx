"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PricingCard from "@/components/PricingCard";
import { billingApi } from "@/lib/api";
import { Check, X } from "lucide-react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface Plan {
  slug: string;
  name: string;
  description: string;
  tier: string;
  max_comp_explorer_runs_per_month: number | null;
  max_active_bonds: number | null;
  includes_resonance_lab: boolean;
}

const PLAN_FEATURES = {
  free: [
    "5 compatibility runs per month",
    "Solo dashboard & profile",
    "Unlimited journaling",
    "Basic insights",
  ],
  plus: [
    "Unlimited compatibility runs",
    "1 active bond",
    "Advanced insights",
    "Priority support",
    "All Free features",
  ],
  "couple-premium": [
    "Everything in Plus",
    "Unlimited bonds",
    "Resonance Lab access",
    "Deep compatibility reports",
    "Couple coaching insights",
  ],
};

const PLAN_PRICES = {
  free: { monthly: 0, annual: 0 },
  plus: { monthly: 9.99, annual: 99 },
  "couple-premium": { monthly: 19.99, annual: 199 },
};

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    searchParams.get("plan")
  );

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await billingApi.getPlans();
        setPlans(data.plans || []);
      } catch (err: any) {
        console.error("Error loading plans:", err);
        setError("Failed to load plans. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const handlePlanSelect = async (planSlug: string) => {
    if (planSlug === "free") {
      router.push("/onboarding");
      return;
    }

    try {
      setLoading(true);
      const { url } = await billingApi.checkout({ plan_slug: planSlug });
      if (url) {
        window.location.href = url;
      } else {
        setError("Failed to create checkout session");
      }
    } catch (err: any) {
      console.error("Error creating checkout:", err);
      setError(err.message || "Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPlanFeatures = (slug: string): string[] => {
    return PLAN_FEATURES[slug as keyof typeof PLAN_FEATURES] || [];
  };

  const getPlanPrice = (slug: string) => {
    return PLAN_PRICES[slug as keyof typeof PLAN_PRICES] || { monthly: 0, annual: 0 };
  };

  if (loading && plans.length === 0) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && plans.length === 0) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sort plans: FREE, PLUS, COUPLE_PREMIUM
  const sortedPlans = [...plans].sort((a, b) => {
    const order = { FREE: 0, PLUS: 1, COUPLE_PREMIUM: 2 };
    return order[a.tier as keyof typeof order] - order[b.tier as keyof typeof order];
  });

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Start free, upgrade anytime. Cancel anytime.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {sortedPlans.map((plan, index) => {
            const features = getPlanFeatures(plan.slug);
            const price = getPlanPrice(plan.slug);
            const isHighlighted = plan.slug === "plus";

            return (
              <PricingCard
                key={plan.slug}
                plan={{
                  ...plan,
                  features,
                  price: price.monthly,
                  priceAnnual: price.annual,
                  highlighted: isHighlighted,
                }}
                onSelect={handlePlanSelect}
              />
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Compare Plans
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Feature
                  </th>
                  {sortedPlans.map((plan) => (
                    <th
                      key={plan.slug}
                      className={`px-6 py-4 text-center text-sm font-semibold ${
                        plan.slug === "plus"
                          ? "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    Compatibility Runs
                  </td>
                  {sortedPlans.map((plan) => (
                    <td key={plan.slug} className="px-6 py-4 text-center">
                      {plan.max_comp_explorer_runs_per_month === null
                        ? "Unlimited"
                        : plan.max_comp_explorer_runs_per_month}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    Active Bonds
                  </td>
                  {sortedPlans.map((plan) => (
                    <td key={plan.slug} className="px-6 py-4 text-center">
                      {plan.max_active_bonds === null
                        ? "Unlimited"
                        : plan.max_active_bonds}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    Resonance Lab
                  </td>
                  {sortedPlans.map((plan) => (
                    <td key={plan.slug} className="px-6 py-4 text-center">
                      {plan.includes_resonance_lab ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    Journaling
                  </td>
                  {sortedPlans.map((plan) => (
                    <td key={plan.slug} className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    Dashboard & Profile
                  </td>
                  {sortedPlans.map((plan) => (
                    <td key={plan.slug} className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! All paid plans come with a 7-day free trial. Cancel anytime during the trial with no charges.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We accept all major credit cards through Stripe. Your payment information is secure and encrypted.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Absolutely. You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

