'use client';

import { useState, useEffect } from 'react';
import { Clock, Trash2, Eye, Loader2 } from 'lucide-react';
import { getSavedResults, SavedResult } from '@/lib/auth';
import ShareableResults from './ShareableResults';

interface ResultHistoryProps {
  onLoadResult: (person1: any, person2: any) => void;
}

export default function ResultHistory({ onLoadResult }: ResultHistoryProps) {
  const [results, setResults] = useState<SavedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<SavedResult | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    try {
      const saved = await getSavedResults();
      setResults(saved);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = (result: SavedResult) => {
    setSelectedResult(result);
    onLoadResult(result.person1Data, result.person2Data);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading results...</span>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center p-8 text-gray-600 dark:text-gray-400">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No saved results yet.</p>
        <p className="text-sm mt-2">Complete a compatibility test and save your results to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Your Saved Results ({results.length})
      </h3>
      
      {results.map((result) => (
        <div
          key={result.id}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {Math.round(result.compatibilityScore * 100)}%
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {result.person1Data.name} & {result.person2Data.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(result.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleViewResult(result)}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

