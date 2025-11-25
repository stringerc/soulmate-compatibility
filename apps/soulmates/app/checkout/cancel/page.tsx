"use client";

import Link from "next/link";
import { XCircle, ArrowLeft, Sparkles } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-8 text-center">
          {/* Cancel Icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Checkout Cancelled
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No charges were made
            </p>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You cancelled the checkout process. Your subscription was not updated.
          </p>

          {/* CTAs */}
          <div className="space-y-4">
            <Link
              href="/pricing"
              className="block w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              View Plans Again
            </Link>
            <Link
              href="/me"
              className="block w-full px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-semibold transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>

          {/* Help Text */}
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Questions?{" "}
            <Link href="/help" className="text-pink-600 dark:text-pink-400 hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

