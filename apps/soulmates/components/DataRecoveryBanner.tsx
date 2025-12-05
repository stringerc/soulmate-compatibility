"use client";

import { useState, useEffect } from "react";
import { AlertCircle, X, Download, RefreshCw } from "lucide-react";
import Link from "next/link";

interface DataRecoveryBannerProps {
  profile: any;
  onExport?: () => void;
  onSync?: () => void;
}

export default function DataRecoveryBanner({ profile, onExport, onSync }: DataRecoveryBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [onlyLocalStorage, setOnlyLocalStorage] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !profile) return;

    // Check if data is only in localStorage
    const localProfile = localStorage.getItem('soulmates_profile');
    const lastSync = localStorage.getItem('soulmates_last_sync');
    
    if (localProfile && (!lastSync || !profile.id)) {
      setOnlyLocalStorage(true);
    }

    // Check if dismissed in this session
    const dismissedKey = `data_recovery_banner_dismissed_${Date.now().toDateString()}`;
    if (sessionStorage.getItem(dismissedKey)) {
      setDismissed(true);
    }
  }, [profile]);

  if (dismissed || !onlyLocalStorage) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Your data is only saved locally
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
            Your profile data is currently only stored in this browser. To prevent data loss, we recommend:
          </p>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 mb-4 space-y-2 list-disc list-inside">
            <li>Export your data as a backup</li>
            <li>Sync to your account for cross-device access</li>
            <li>Make sure you're logged in when completing assessments</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            {onExport && (
              <button
                onClick={onExport}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Export My Data
              </button>
            )}
            {onSync && (
              <button
                onClick={onSync}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Sync to Account
              </button>
            )}
            <Link
              href="/pricing"
              className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-yellow-600 text-yellow-800 dark:text-yellow-200 rounded-lg font-medium transition-colors hover:bg-yellow-50 dark:hover:bg-yellow-900/30 text-sm"
            >
              Learn More
            </Link>
          </div>
        </div>
        <button
          onClick={() => {
            setDismissed(true);
            sessionStorage.setItem(`data_recovery_banner_dismissed_${new Date().toDateString()}`, 'true');
          }}
          className="flex-shrink-0 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

