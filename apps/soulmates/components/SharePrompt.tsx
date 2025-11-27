'use client';

import { useState } from 'react';
import { ShareableMoment, shareToPlatform } from '@/lib/shareableMoments';
import { Share2, Twitter, Facebook, Instagram, MessageCircle, Copy, X } from 'lucide-react';

interface SharePromptProps {
  shareableMoment: ShareableMoment;
  onDismiss: () => void;
}

export default function SharePrompt({ shareableMoment, onDismiss }: SharePromptProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState<string | null>(null);

  const handleShare = async (platform: ShareableMoment['platforms'][number]) => {
    setSharing(platform);
    const success = await shareToPlatform(platform, shareableMoment);
    setSharing(null);
    
    if (success && platform === 'copy_link') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    
    if (success) {
      // Small delay before dismissing to show success
      setTimeout(() => {
        onDismiss();
      }, 500);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5" />;
      case 'copy_link':
        return <Copy className="w-5 h-5" />;
      default:
        return <Share2 className="w-5 h-5" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'Twitter';
      case 'facebook':
        return 'Facebook';
      case 'instagram':
        return 'Instagram';
      case 'whatsapp':
        return 'WhatsApp';
      case 'copy_link':
        return copied ? 'Copied!' : 'Copy Link';
      default:
        return 'Share';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Share Your Journey! 🎉
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {shareableMoment.content.description}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close share prompt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {shareableMoment.content.title}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {shareableMoment.platforms.map((platform) => (
            <button
              key={platform}
              onClick={() => handleShare(platform)}
              disabled={sharing === platform}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                sharing === platform
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : platform === 'copy_link' && copied
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {getPlatformIcon(platform)}
              <span>{getPlatformName(platform)}</span>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          Help others discover their compatibility! 💕
        </p>
      </div>
    </div>
  );
}

