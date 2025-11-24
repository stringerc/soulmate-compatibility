'use client';

import { useMemo, useState } from 'react';
import {
  totalCompatibility,
  calculateDimensionAlignments,
  numerologyCompatibility,
  astrologyCompatibility,
  PersonVector,
  ResonanceVector,
} from '@/lib/compatibility';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Heart, RotateCcw, Share2, Download, Copy, CheckCircle2 } from 'lucide-react';

interface ShareableResultsProps {
  person1: {
    traits: number[];
    birthdate: string;
    name: string;
  };
  person2: {
    traits: number[];
    birthdate: string;
    name: string;
  };
  onReset: () => void;
}

export default function ShareableResults({ person1, person2, onReset }: ShareableResultsProps) {
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const p1: PersonVector = { traits: person1.traits };
    const p2: PersonVector = { traits: person2.traits };
    
    // Default resonance (neutral)
    const resonance: ResonanceVector = { metrics: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] };
    
    const compatibility = totalCompatibility(p1, p2, resonance);
    const alignments = calculateDimensionAlignments(p1, p2);
    
    const numerology = person1.birthdate && person2.birthdate
      ? numerologyCompatibility(person1.birthdate, person2.birthdate)
      : null;
    
    const astrology = person1.birthdate && person2.birthdate
      ? astrologyCompatibility(person1.birthdate, person2.birthdate)
      : null;
    
    return {
      compatibility,
      alignments,
      numerology,
      astrology,
    };
  }, [person1, person2]);

  const dimensionData = [
    { name: 'Attachment', value: result.alignments.attachment },
    { name: 'Conflict', value: result.alignments.conflict },
    { name: 'Cognitive', value: result.alignments.cognitive },
    { name: 'Values', value: result.alignments.values },
    { name: 'Social', value: result.alignments.social },
    { name: 'Sexual', value: result.alignments.sexual },
    { name: 'Life Structure', value: result.alignments.lifeStructure },
  ];

  const soulmateTier = result.compatibility.s_hat >= 0.7;
  const percentile = Math.min(100, Math.max(0, result.compatibility.s_hat * 100));

  // Generate compatibility type
  const compatibilityType = useMemo(() => {
    const score = result.compatibility.s_hat;
    if (score >= 0.8) return { name: 'Soulmate Match', icon: '✨', color: 'from-pink-600 to-purple-600' };
    if (score >= 0.7) return { name: 'Deep Connection', icon: '💕', color: 'from-purple-600 to-indigo-600' };
    if (score >= 0.6) return { name: 'Strong Compatibility', icon: '🤝', color: 'from-blue-600 to-cyan-600' };
    if (score >= 0.5) return { name: 'Good Match', icon: '💝', color: 'from-green-600 to-emerald-600' };
    return { name: 'Exploring Compatibility', icon: '🌱', color: 'from-yellow-600 to-orange-600' };
  }, [result.compatibility.s_hat]);

  const handleShare = async () => {
    const shareData = {
      title: `${person1.name || 'Person 1'} & ${person2.name || 'Person 2'} - Compatibility Results`,
      text: `We're ${Math.round(result.compatibility.s_hat * 100)}% compatible! Find your compatibility at soulmates.syncscript.app`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const text = `${person1.name || 'Person 1'} & ${person2.name || 'Person 2'} are ${Math.round(result.compatibility.s_hat * 100)}% compatible!\n\nFind your compatibility at soulmates.syncscript.app`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateShareableImage = () => {
    // Create a canvas for shareable image
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#ec4899');
    gradient.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);
    
    // Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${person1.name || 'Person 1'} & ${person2.name || 'Person 2'}`, 600, 200);
    
    // Score
    ctx.font = 'bold 120px Arial';
    ctx.fillText(`${Math.round(result.compatibility.s_hat * 100)}%`, 600, 350);
    
    // Type
    ctx.font = '36px Arial';
    ctx.fillText(compatibilityType.name, 600, 450);
    
    // URL
    ctx.font = '24px Arial';
    ctx.fillText('soulmates.syncscript.app', 600, 550);
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'compatibility-result.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  const COLORS = ['#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Shareable Card */}
        <div className={`bg-gradient-to-br ${compatibilityType.color} rounded-2xl shadow-2xl p-8 mb-8 text-white text-center relative overflow-hidden`}>
          {/* Dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 to-gray-900/20 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="text-6xl mb-4 drop-shadow-lg">{compatibilityType.icon}</div>
            <h2 className="text-4xl font-bold mb-2 drop-shadow-md">{compatibilityType.name}</h2>
            <p className="text-xl mb-4 drop-shadow-sm">
              {person1.name || 'Person 1'} & {person2.name || 'Person 2'}
            </p>
            <div className="text-7xl font-bold mb-4 drop-shadow-lg">
              {Math.round(result.compatibility.s_hat * 100)}%
            </div>
            <p className="text-lg opacity-95 drop-shadow-sm">
              {soulmateTier ? (
                <span className="flex items-center justify-center gap-2">
                  <Heart className="w-6 h-6 fill-current drop-shadow-md" />
                  <span>Soulmate Tier Match!</span>
                </span>
              ) : (
                `Percentile: ${Math.round(percentile)}th`
              )}
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Trait Compatibility</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Trait Alignment</span>
                <span className="font-semibold">{Math.round(result.compatibility.c_traits * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-pink-500 h-2 rounded-full transition-all"
                  style={{ width: `${result.compatibility.c_traits * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Resonance Compatibility</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Interaction Harmony</span>
                <span className="font-semibold">{Math.round(result.compatibility.c_res * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${result.compatibility.c_res * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dimension Breakdown Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Dimension Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dimensionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 1]} />
              <Tooltip formatter={(value: number) => `${Math.round(value * 100)}%`} />
              <Bar dataKey="value" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Theory Features */}
        {(result.numerology !== null || result.astrology !== null) && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Additional Insights</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {result.numerology !== null && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Numerology Compatibility</h4>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(result.numerology * 100)}%
                  </div>
                </div>
              )}
              {result.astrology !== null && (
                <div className="bg-pink-50 rounded-lg p-4">
                  <h4 className="font-semibold text-pink-900 mb-2">Astrology Compatibility</h4>
                  <div className="text-2xl font-bold text-pink-600">
                    {Math.round(result.astrology * 100)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Share Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-center">Share Your Results</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleShare}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
            <button
              onClick={copyToClipboard}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={generateShareableImage}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Image
            </button>
            <button
              onClick={onReset}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

