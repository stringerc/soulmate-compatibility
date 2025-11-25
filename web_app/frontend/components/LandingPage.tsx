'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Shield, Zap, Users, CheckCircle2, Star, Play, ChevronDown, History, LogIn, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { isAuthenticated, getCurrentUser, signOut, requestMagicLink } from '@/lib/auth';
import SaveResults from './SaveResults';

interface LandingPageProps {
  onStartTest: () => void;
  onViewHistory?: () => void;
}

export default function LandingPage({ onStartTest, onViewHistory }: LandingPageProps) {
  const [showFAQ, setShowFAQ] = useState<string | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuth();
    
    // Also check auth when component mounts (in case token was just stored)
    const checkAuthOnMount = async () => {
      const authStatus = await isAuthenticated();
      setIsAuth(authStatus);
      if (authStatus) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    };
    
    // Check immediately and also after a short delay (for magic link redirects)
    checkAuthOnMount();
    const timeout = setTimeout(checkAuthOnMount, 500);
    
    return () => clearTimeout(timeout);
  }, []);

  const checkAuth = async () => {
    const authStatus = await isAuthenticated();
    setIsAuth(authStatus);
    if (authStatus) {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginMessage('');
    
    try {
      const result = await requestMagicLink(loginEmail);
      if (result.success) {
        // Check if email failed but link was generated as fallback
        if (result.devLink || result.backupLink) {
          const magicLink = result.devLink || result.backupLink;
          const message = result.emailFailed 
            ? `⚠️ Email delivery failed, but here's your magic link:`
            : `✅ Magic link sent! Check your email. Backup link:`;
          
          setLoginMessage(`${message}\n\n🔗 ${magicLink}`);
          
          // Create clickable link button
          setTimeout(() => {
            if (magicLink) {
              const linkButton = document.createElement('a');
              linkButton.href = magicLink;
              linkButton.target = '_blank';
              linkButton.className = 'mt-4 block w-full px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 text-center';
              linkButton.textContent = 'Click here to sign in';
              const messageDiv = document.querySelector('[data-message-container]');
              if (messageDiv) {
                messageDiv.appendChild(linkButton);
              }
            }
          }, 100);
        } else {
          setLoginMessage('✅ Magic link sent! Check your email (including spam folder).');
        }
        // Don't close modal immediately - let user see the message
        setTimeout(() => {
          setShowLoginModal(false);
          setLoginEmail('');
        }, result.devLink ? 10000 : 5000); // Keep open longer if showing link
      } else {
        setLoginMessage(result.message || 'Failed to send magic link. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginMessage('An error occurred. Please try again or check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsAuth(false);
    setUser(null);
  };

  const handleViewHistory = () => {
    if (onViewHistory) {
      onViewHistory();
    }
  };

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
      {/* Header with Login/Account */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-pink-500" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Soulmate Compatibility</span>
            </div>
            
            <div className="flex items-center gap-4">
              {isAuth && user ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.email}</span>
                  </div>
                  {onViewHistory && (
                    <button
                      onClick={handleViewHistory}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                    >
                      <History className="w-4 h-4" />
                      <span className="hidden sm:inline">View History</span>
                      <span className="sm:hidden">History</span>
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            // Close modal when clicking backdrop
            if (e.target === e.currentTarget) {
              setShowLoginModal(false);
              setLoginEmail('');
              setLoginMessage('');
            }
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sign In</h3>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginEmail('');
                  setLoginMessage('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close sign in modal"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter your email to receive a magic link. No password needed!
            </p>
            {!loginMessage && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 <strong>How it works:</strong> Enter your email below, then check your inbox for a sign-in link. Click the link to automatically sign in!
                </p>
              </div>
            )}
            <form onSubmit={handleLogin}>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
                autoComplete="email"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:focus:border-pink-500 transition-all text-base"
              />
              {loginMessage && (
                <div 
                  data-message-container
                  className={`text-sm mb-4 p-3 rounded-lg ${
                    loginMessage.includes('Check your email') || loginMessage.includes('sent') || loginMessage.includes('Magic link sent')
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : loginMessage.includes('devLink') || loginMessage.includes('not configured') || loginMessage.includes('generated') || loginMessage.includes('backup') || loginMessage.includes('Email delivery failed')
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="whitespace-pre-line font-medium mb-2">{loginMessage}</div>
                  {(loginMessage.includes('Check your email') || loginMessage.includes('sent')) && (
                    <p className="text-xs mt-2 opacity-75">
                      💡 Don&apos;t see it? Check your spam folder or try resending.
                    </p>
                  )}
                  {(loginMessage.includes('Email delivery failed') || loginMessage.includes('backup')) && (
                    <div className="text-xs mt-2 space-y-1">
                      <p className="opacity-75">
                        ⚠️ Email may not have been delivered. Use the link above to sign in.
                      </p>
                      <p className="opacity-75">
                        📧 Check Resend dashboard: https://resend.com/emails
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading || !loginEmail.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Sending Magic Link...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      ✉️ Send Magic Link
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginEmail('');
                    setLoginMessage('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <span>✅ Phase 2 Deployed</span>
          </div>
        </div>
      </section>
    </div>
  );
}

