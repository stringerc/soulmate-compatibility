'use client';

import { useState, useEffect } from 'react';
import { Save, Mail, CheckCircle2, X, Loader2 } from 'lucide-react';
import { requestMagicLink, saveResults, isAuthenticated, getCurrentUser } from '@/lib/auth';

interface SaveResultsProps {
  person1Data: {
    traits: number[];
    birthdate?: string;
    name: string;
  };
  person2Data: {
    traits: number[];
    birthdate?: string;
    name: string;
  };
  compatibilityScore: number;
}

export default function SaveResults({ person1Data, person2Data, compatibilityScore }: SaveResultsProps) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        const user = await getCurrentUser();
        if (user) {
          setEmail(user.email);
        }
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleSaveClick = async () => {
    if (isAuthenticated) {
      // User is authenticated, save directly
      setStatus('saving');
      const result = await saveResults(person1Data, person2Data, compatibilityScore);
      if (result.success) {
        setStatus('saved');
        setMessage('Results saved successfully!');
        setTimeout(() => setShowModal(false), 2000);
      } else {
        setStatus('error');
        setMessage(result.message || 'Failed to save results');
      }
    } else {
      // Show modal to request magic link
      setShowModal(true);
    }
  };

  const handleRequestMagicLink = async () => {
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('sending');
    const result = await requestMagicLink(email);
    
    if (result.success) {
      setStatus('sent');
      setMessage('Magic link sent! Check your email and click the link to save your results.');
      localStorage.setItem('pending_email', email);
    } else {
      setStatus('error');
      setMessage(result.message || 'Failed to send magic link');
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setStatus('idle');
    setMessage('');
    setEmail('');
  };

  if (status === 'saved') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Results Saved!</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your compatibility results have been saved to your account. You can access them from any device.
          </p>
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleSaveClick}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
      >
        <Save className="w-5 h-5" />
        {isAuthenticated ? 'Save Results' : 'Save Results (Sign In)'}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Mail className="w-6 h-6 text-pink-500" />
                Save Your Results
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Save your compatibility results to access them from any device. We&apos;ll send you a magic link (no password required).
            </p>

            {status === 'sent' ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Magic link sent!
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Check your email and click the link to save your results. The link expires in 24 hours.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={status === 'sending'}
                  />
                </div>

                {message && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    status === 'error' 
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  }`}>
                    {message}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleRequestMagicLink}
                    disabled={status === 'sending' || !email}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Send Magic Link
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                  🔒 Privacy-first: No password required. Your data is encrypted and GDPR compliant.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

