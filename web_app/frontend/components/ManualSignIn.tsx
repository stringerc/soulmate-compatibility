'use client';

import { useState } from 'react';
import { LogIn, Copy, Check } from 'lucide-react';

interface ManualSignInProps {
  email: string;
  token: string;
  onComplete: () => void;
}

export default function ManualSignIn({ email, token, onComplete }: ManualSignInProps) {
  const [copied, setCopied] = useState(false);
  const [enteredToken, setEnteredToken] = useState('');

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyToken = () => {
    if (enteredToken === token) {
      // Redirect to verify endpoint
      window.location.href = `/api/auth/verify-magic-link?token=${token}`;
    } else {
      alert('Invalid token. Please check and try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <LogIn className="w-6 h-6 text-pink-500" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Manual Sign In</h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Your email client blocked the magic link. Use this secure method instead:
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Email:
            </label>
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
              {email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Security Token:
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg font-mono text-sm text-gray-900 dark:text-white break-all">
                {token}
              </div>
              <button
                onClick={handleCopyToken}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
                title="Copy token"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
              <strong>Option 1:</strong> Click the button below to sign in automatically
            </p>
            <button
              onClick={() => window.location.href = `/api/auth/verify-magic-link?token=${token}`}
              className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg transition-all font-medium"
            >
              Sign In Now
            </button>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
              <strong>Option 2:</strong> Copy the token above and paste it when prompted
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onComplete}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

