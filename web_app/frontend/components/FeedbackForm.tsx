'use client';

import { useState } from 'react';
import { X, Send, Star, MessageSquare, Bug, Lightbulb, Heart } from 'lucide-react';

interface FeedbackFormProps {
  onClose?: () => void;
  context?: {
    page: string;
    step?: string;
    compatibilityScore?: number;
  };
}

type FeedbackType = 'general' | 'bug' | 'feature' | 'compliment';

export default function FeedbackForm({ onClose, context }: FeedbackFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    try {
      const feedbackData = {
        type: feedbackType,
        rating,
        message: message.trim(),
        email: email.trim() || undefined,
        context: {
          page: context?.page || 'unknown',
          step: context?.step,
          compatibilityScore: context?.compatibilityScore,
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : '',
        },
      };

      // Send to API endpoint
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setMessage('');
          setEmail('');
          setRating(null);
          onClose?.();
        }, 2000);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypes = [
    { id: 'general' as FeedbackType, label: 'General', icon: MessageSquare, color: 'blue' },
    { id: 'bug' as FeedbackType, label: 'Bug Report', icon: Bug, color: 'red' },
    { id: 'feature' as FeedbackType, label: 'Feature Request', icon: Lightbulb, color: 'purple' },
    { id: 'compliment' as FeedbackType, label: 'Compliment', icon: Heart, color: 'pink' },
  ];

  if (!isOpen && !submitted) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center gap-2"
        aria-label="Provide feedback"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="hidden sm:inline font-semibold">Feedback</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Thank You!
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your feedback helps us improve the experience for everyone.
            </p>
          </div>
        ) : (
          <>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Share Your Feedback
              </h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onClose?.();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close feedback form"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  What type of feedback is this?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {feedbackTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFeedbackType(type.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          feedbackType === type.id
                            ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${
                          feedbackType === type.id
                            ? `text-${type.color}-600 dark:text-${type.color}-400`
                            : 'text-gray-400 dark:text-gray-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          feedbackType === type.id
                            ? `text-${type.color}-700 dark:text-${type.color}-300`
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  How would you rate your experience?
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          rating && star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        } hover:text-yellow-400`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Your feedback *
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Tell us what you think..."
                />
              </div>

              {/* Email (Optional) */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email (optional - for follow-up)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="your@email.com"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onClose?.();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!message.trim() || isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

