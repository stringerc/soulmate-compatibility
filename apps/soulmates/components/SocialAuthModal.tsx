"use client";

import { X, ExternalLink } from "lucide-react";

interface SocialAuthModalProps {
  provider: 'facebook' | 'instagram' | 'linkedin' | 'spotify';
  authUrl: string;
  onClose: () => void;
  onComplete: () => void;
}

export default function SocialAuthModal({
  provider,
  authUrl,
  onClose,
  onComplete,
}: SocialAuthModalProps) {
  const providerNames: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    spotify: 'Spotify',
  };

  const handleAuthorize = () => {
    // Open in new window
    const authWindow = window.open(
      authUrl,
      `${provider}_auth`,
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    // Poll for window close (user completed auth)
    const pollTimer = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(pollTimer);
        // Wait a moment for callback to process
        setTimeout(() => {
          onComplete();
          onClose();
        }, 1000);
      }
    }, 500);

    // Cleanup after 5 minutes
    setTimeout(() => {
      clearInterval(pollTimer);
      if (!authWindow?.closed) {
        authWindow?.close();
      }
    }, 5 * 60 * 1000);
  };

  // Ensure modal is visible
  if (!authUrl) {
    console.error('[SocialAuthModal] No authUrl provided');
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" style={{ position: 'fixed' }}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Connect {providerNames[provider]}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Authorize {providerNames[provider]} to discover friends and shared interests
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            <strong>Steps to connect:</strong>
          </p>
          <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
            <li>Click the button below to open the authorization page</li>
            <li>Grant access with your {providerNames[provider]} account</li>
            <li>Close the window after authorization</li>
            <li>Your connection will be saved automatically</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAuthorize}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            Authorize {providerNames[provider]}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-all"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href={authUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-pink-600 dark:text-pink-400 hover:underline break-all"
          >
            {authUrl}
          </a>
        </div>
      </div>
    </div>
  );
}

