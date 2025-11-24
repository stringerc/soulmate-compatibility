'use client';

import { useMemo } from 'react';
import {
  totalCompatibility,
  calculateDimensionAlignments,
  numerologyCompatibility,
  astrologyCompatibility,
  PersonVector,
  ResonanceVector,
} from '@/lib/compatibility';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Heart, RotateCcw, Share2 } from 'lucide-react';

interface ResultsProps {
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

export default function Results({ person1, person2, onReset }: ResultsProps) {
  // Default resonance (neutral)
  const resonance: ResonanceVector = { metrics: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] };

  const result = useMemo(() => {
    const p1: PersonVector = { traits: person1.traits };
    const p2: PersonVector = { traits: person2.traits };
    
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

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const COLORS = ['#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Compatibility Results
        </h2>
        <p className="text-lg text-gray-600">
          {person1.name || 'Person 1'} & {person2.name || 'Person 2'}
        </p>
      </div>

      {/* Overall Score */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg p-6 text-white text-center">
          <div className="text-sm font-medium mb-2">Overall Compatibility Score</div>
          <div className="text-5xl font-bold mb-2">
            {Math.round(result.compatibility.s_hat * 100)}%
          </div>
          <div className="text-sm opacity-90">
            {soulmateTier ? (
              <span className="flex items-center justify-center space-x-2">
                <Heart className="w-5 h-5 fill-current" />
                <span>Soulmate Tier Match!</span>
              </span>
            ) : (
              `Percentile: ${Math.round(percentile)}th`
            )}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
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

        <div>
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
      <div className="mb-8">
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
        <div className="mb-8">
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

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleShare}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
        >
          <Share2 className="w-5 h-5" />
          <span>Share Results</span>
        </button>
        <button
          onClick={onReset}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 flex items-center space-x-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Start Over</span>
        </button>
      </div>
    </div>
  );
}

