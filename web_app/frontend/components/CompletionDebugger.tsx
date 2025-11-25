/**
 * Completion Debugger Component
 * 
 * Shows real-time completion status and allows force completion.
 * Visible in development or when user is stuck.
 */

'use client';

import { useState } from 'react';
import { analyzeCompletion } from '@/lib/completionAnalyzer';
import { STORY_SCENARIOS } from '@/lib/storyScenarios';

interface CompletionDebuggerProps {
  responses: number[];
  onForceComplete: () => void;
}

export default function CompletionDebugger({ responses, onForceComplete }: CompletionDebuggerProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded
  const analysis = analyzeCompletion(responses);

  // Always show if there are unanswered scenarios (even if canComplete is true due to edge cases)
  if (analysis.unansweredIndices.length === 0 && analysis.canComplete) {
    return null; // Don't show if everything is complete
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border-2 border-red-500 rounded-lg shadow-2xl p-4 max-w-md z-[10000]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
          🔍 Completion Debugger
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      <div className="mb-3">
        <p className="text-sm font-semibold">
          Status: {analysis.answeredCount} / {analysis.totalScenarios} answered
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Missing: {analysis.unansweredIndices.length} scenario(s)
        </p>
      </div>

      {isExpanded && (
        <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
          <div className="text-xs">
            <p className="font-semibold mb-1">Missing Scenario Indices:</p>
            <div className="flex flex-wrap gap-1">
              {analysis.unansweredIndices.map(idx => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded text-red-700 dark:text-red-300"
                >
                  {idx}
                </span>
              ))}
            </div>
          </div>

          {analysis.unansweredScenarios.length > 0 && (
            <div className="text-xs">
              <p className="font-semibold mb-1">Missing Scenarios:</p>
              <ul className="list-disc list-inside space-y-1">
                {analysis.unansweredScenarios.slice(0, 10).map(s => (
                  <li key={s.index} className="text-gray-600 dark:text-gray-400">
                    Index {s.index}: {s.chapter}
                  </li>
                ))}
                {analysis.unansweredScenarios.length > 10 && (
                  <li className="text-gray-500">... and {analysis.unansweredScenarios.length - 10} more</li>
                )}
              </ul>
            </div>
          )}

          {analysis.issues.length > 0 && (
            <div className="text-xs">
              <p className="font-semibold text-yellow-600 dark:text-yellow-400 mb-1">Issues:</p>
              <ul className="list-disc list-inside">
                {analysis.issues.map((issue, i) => (
                  <li key={i} className="text-yellow-700 dark:text-yellow-300">{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onForceComplete}
          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          ⚡ Force Complete
        </button>
        <button
          onClick={() => {
            console.log('Completion Analysis:', analysis);
            console.log('Responses Array:', responses);
            console.log('Missing Indices:', analysis.unansweredIndices);
            alert('Completion data logged to console (F12)');
          }}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
        >
          📋 Log to Console
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Force Complete will auto-fill missing scenarios with neutral values (0.5)
      </p>
    </div>
  );
}

