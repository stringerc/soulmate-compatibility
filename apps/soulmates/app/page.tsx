import Link from 'next/link'
import { Heart, User, Search, Users, ArrowRight, Sparkles, Check, Zap, Shield } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Soulmates
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-2">
            Self-discovery and compatibility exploration
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-500 mb-8">
            Discover yourself, explore compatibility, and deepen your relationships
          </p>
          
          {/* Primary CTA Button */}
          <div className="mb-12">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5" />
              Start Your Free Compatibility Test
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/onboarding" 
            className="group block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 card-hover"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <User className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Get Started</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Complete your soul profile and begin your journey</p>
          </Link>
          
          <Link 
            href="/me" 
            className="group block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 card-hover"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">My Dashboard</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">View your profile, insights, and growth</p>
          </Link>
          
          <Link 
            href="/explore" 
            className="group block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 card-hover"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Search className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Compatibility Explorer</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Test compatibility with archetypal partners</p>
          </Link>
          
          <Link 
            href="/bonds" 
            className="group block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 card-hover"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Couple Mode</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Connect with a partner and explore together</p>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-16 mb-16">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Everything You Need
          </h2>
          <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">
            Discover yourself, explore compatibility, and deepen your relationships
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg w-fit mb-4">
                <User className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Self-Discovery</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Complete the 32-dimension compatibility test to understand your attachment style, values, and relationship patterns.
              </p>
            </div>
            
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-fit mb-4">
                <Search className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Compatibility Explorer</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Test compatibility with archetypal partners or real people. Get detailed insights into your connection potential.
              </p>
            </div>
            
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg w-fit mb-4">
                <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Couple Mode</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with your partner, explore together, and track your relationship journey with shared journaling.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mt-16 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Start free, upgrade when you're ready
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* FREE Plan */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Free</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  5 compatibility runs/month
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Solo dashboard
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Unlimited journaling
                </li>
              </ul>
              <Link
                href="/onboarding"
                className="block w-full text-center py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Get Started
              </Link>
            </div>

            {/* PLUS Plan */}
            <div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl shadow-xl border-2 border-pink-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Plus</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">$9.99</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Unlimited compatibility runs
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  1 active bond
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Advanced insights
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Priority support
                </li>
              </ul>
              <Link
                href="/pricing?plan=plus"
                className="block w-full text-center py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition shadow-lg"
              >
                Start Free Trial
              </Link>
            </div>

            {/* COUPLE PREMIUM Plan */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Couple Premium</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">$19.99</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Everything in Plus
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Unlimited bonds
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Resonance Lab
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Deep reports
                </li>
              </ul>
              <Link
                href="/pricing?plan=couple-premium"
                className="block w-full text-center py-2 px-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg hover:from-indigo-600 hover:to-blue-700 transition"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-semibold"
            >
              View Full Pricing Details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

