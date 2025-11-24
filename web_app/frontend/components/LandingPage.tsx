'use client';

import { useState } from 'react';
import { ArrowRight, Shield, Zap, Users, CheckCircle2, Star, Play, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface LandingPageProps {
  onStartTest: () => void;
  onViewHistory?: () => void;
}

export default function LandingPage({ onStartTest, onViewHistory }: LandingPageProps) {
  const [showFAQ, setShowFAQ] = useState<string | null>(null);

  const faqs = [
    {
      id: '1',
      question: 'Is this just another zodiac/numerology calculator?',
      answer: "No! We&apos;re fundamentally different. We TEST whether astrology/numerology work before including them. If they don&apos;t improve predictions, we discard them automatically."
    },
    {
      id: '2',
      question: 'How accurate is this compared to other tests?',
      answer: 'Our system is more accurate because: 32 dimensions vs. typical 5-10, 7 relationship dynamics, empirical validation, and mathematical models that predict 6 real relationship outcomes.'
    },
    {
      id: '3',
      question: 'What makes this "scientific"?',
      answer: 'We use hypothesis testing, ablation studies, controlled simulations, cross-validation, and statistical significance thresholds. All methods are documented and reproducible.'
    },
    {
      id: '4',
      question: 'How long does it take?',
      answer: '32 scenarios × ~30 seconds each = ~16 minutes total. Progress is saved, so you can complete it in multiple sessions.'
    },
    {
      id: '5',
      question: 'Is my data private?',
      answer: 'Yes! All calculations happen in your browser (client-side). We don\'t store personal information. Birthdate is optional and only used for astrology/numerology features if you choose to include them.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Trust Bar */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <span className="inline-flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy-First
          </span>
          <span className="mx-4">|</span>
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            No Sign-Up Required
          </span>
          <span className="mx-4">|</span>
          <span className="inline-flex items-center gap-2">
            <Star className="w-4 h-4" />
            Free Forever
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Discover Your Soulmate Compatibility Through{' '}
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Science, Not Guesswork
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4">
            The only compatibility calculator that actually <strong>TESTS</strong> whether astrology works.
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
            32-dimensional personality analysis + empirical validation = real insights.
          </p>
          
          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={onStartTest}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Start Your Free Compatibility Test
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-6 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Learn How It Works
            </button>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              32 Dimensions vs. Typical 5-10
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Empirically Tested
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Takes ~16 Minutes
            </span>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Most Compatibility Tests Just Guess. We Actually Test.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Traditional compatibility calculators assume astrology and numerology work. But what if they don&apos;t? 
              We built a system that scientifically tests every feature before including it—only keeping what 
              actually improves predictions.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Traditional Tests</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Assume astrology works</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Our Approach</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Test before including</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Take the Interactive Story Quest
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                32 engaging scenarios (not boring questions). Beautiful visual cards with themes. ~16 minutes total, can pause anytime.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Get Your Compatibility Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                32-dimensional personality breakdown. 7 relationship dynamics (resonance). Mathematical compatibility score.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                See What Actually Matters
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Empirical testing of astrology/numerology. Only features that improve predictions are included. Clear, actionable insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose Us
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: 'Privacy-First', desc: 'All calculations happen in your browser. No data stored.' },
              { icon: Zap, title: 'Progress Persistence', desc: 'Never lose your progress—auto-save after each scenario.' },
              { icon: Users, title: 'Detailed Breakdown', desc: 'See exactly where you align and differ across 32 dimensions.' },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <feature.icon className="w-12 h-12 text-pink-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => setShowFAQ(showFAQ === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      showFAQ === faq.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {showFAQ === faq.id && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-pink-500 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Discover Your Compatibility?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Join thousands of users exploring their relationships through science
          </p>
          <button
            onClick={onStartTest}
            className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
          >
            Start Your Free Test Now
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-pink-100 text-sm">
            <span>✅ No sign-up required</span>
            <span>✅ Free forever</span>
            <span>✅ Takes ~16 minutes</span>
            <span>✅ Privacy-first</span>
          </div>
        </div>
      </section>
    </div>
  );
}

