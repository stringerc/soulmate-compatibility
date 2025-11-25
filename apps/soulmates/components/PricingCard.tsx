"use client";

import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PricingCardProps {
  plan: {
    slug: string;
    name: string;
    description: string;
    tier: string;
    price?: number;
    priceAnnual?: number;
    features: string[];
    highlighted?: boolean;
  };
  onSelect?: (planSlug: string) => void;
}

export default function PricingCard({ plan, onSelect }: PricingCardProps) {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(plan.slug);
    } else {
      // Default: redirect to checkout
      window.location.href = `/pricing?plan=${plan.slug}`;
    }
  };

  const isFree = plan.tier === "FREE";
  const priceDisplay = isFree 
    ? "Free" 
    : plan.price 
      ? `$${plan.price}/mo` 
      : "Contact us";

  return (
    <div
      className={`relative p-8 rounded-2xl border-2 transition-all ${
        plan.highlighted
          ? "border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 shadow-2xl scale-105"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl"
      }`}
    >
      {plan.highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {plan.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {plan.description}
        </p>
        <div className="mb-4">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {priceDisplay}
          </span>
          {plan.priceAnnual && (
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
              or ${plan.priceAnnual}/year
            </span>
          )}
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSelect}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
          plan.highlighted
            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
            : isFree
            ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
            : "bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700"
        }`}
      >
        {isFree ? (
          "Get Started"
        ) : (
          <span className="flex items-center justify-center">
            Start Free Trial
            <ArrowRight className="w-4 h-4 ml-2" />
          </span>
        )}
      </button>
    </div>
  );
}

