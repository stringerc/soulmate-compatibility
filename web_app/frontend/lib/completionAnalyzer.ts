/**
 * Completion Analyzer for StoryQuest
 * 
 * This utility analyzes completion state and identifies issues before submission.
 * Can be used both in development and production for debugging.
 */

import { STORY_SCENARIOS } from './storyScenarios';

export interface CompletionAnalysis {
  totalScenarios: number;
  answeredCount: number;
  unansweredIndices: number[];
  unansweredScenarios: Array<{ index: number; chapter: string; category: string }>;
  arraySizeCorrect: boolean;
  canComplete: boolean;
  issues: string[];
  recommendations: string[];
}

export function analyzeCompletion(responses: number[]): CompletionAnalysis {
  const TOTAL_SCENARIOS = STORY_SCENARIOS.length;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check array size
  const arraySizeCorrect = responses.length === TOTAL_SCENARIOS;
  if (!arraySizeCorrect) {
    issues.push(`Response array size mismatch: ${responses.length} vs ${TOTAL_SCENARIOS}`);
    recommendations.push('Response array should be resized to match TOTAL_SCENARIOS');
  }

  // Find unanswered scenarios
  const unansweredIndices: number[] = [];
  responses.forEach((response, index) => {
    // A response is considered "answered" if it's not 0.5 (default), undefined, or null
    if (response === 0.5 || response === undefined || response === null) {
      unansweredIndices.push(index);
    }
  });

  const answeredCount = TOTAL_SCENARIOS - unansweredIndices.length;

  // Map unanswered indices to scenario details
  const unansweredScenarios = unansweredIndices.map(index => {
    const scenario = STORY_SCENARIOS[index];
    return {
      index,
      chapter: scenario?.chapter || 'Unknown',
      category: scenario?.category || 'Unknown',
    };
  });

  // Check for invalid response values
  responses.forEach((response, index) => {
    if (response !== undefined && response !== null && response !== 0.5) {
      if (response < 0 || response > 1) {
        issues.push(`Invalid response value at index ${index}: ${response} (should be 0-1)`);
      }
    }
  });

  // Determine if completion is possible
  const canComplete = arraySizeCorrect && answeredCount === TOTAL_SCENARIOS;

  // Generate recommendations
  if (!canComplete) {
    if (unansweredIndices.length > 0) {
      recommendations.push(
        `Answer ${unansweredIndices.length} remaining scenario${unansweredIndices.length !== 1 ? 's' : ''}`
      );
      
      // Group by chapter for easier navigation
      const byChapter = unansweredScenarios.reduce((acc, s) => {
        if (!acc[s.chapter]) acc[s.chapter] = [];
        acc[s.chapter].push(s.index);
        return acc;
      }, {} as Record<string, number[]>);

      Object.entries(byChapter).forEach(([chapter, indices]) => {
        recommendations.push(`  - ${chapter}: ${indices.length} scenario(s) at index${indices.length !== 1 ? 'es' : ''} ${indices.join(', ')}`);
      });
    }

    if (!arraySizeCorrect) {
      recommendations.push('Fix array size mismatch before proceeding');
    }
  }

  return {
    totalScenarios: TOTAL_SCENARIOS,
    answeredCount,
    unansweredIndices,
    unansweredScenarios,
    arraySizeCorrect,
    canComplete,
    issues,
    recommendations,
  };
}

/**
 * Validates that all scenarios have been answered correctly
 */
export function validateCompletion(responses: number[]): { valid: boolean; errors: string[] } {
  const analysis = analyzeCompletion(responses);
  const errors: string[] = [];

  if (!analysis.arraySizeCorrect) {
    errors.push(`Array size mismatch: expected ${analysis.totalScenarios}, got ${responses.length}`);
  }

  if (analysis.unansweredIndices.length > 0) {
    errors.push(
      `${analysis.unansweredIndices.length} scenario(s) unanswered: ${analysis.unansweredIndices.join(', ')}`
    );
  }

  analysis.issues.forEach(issue => errors.push(issue));

  return {
    valid: analysis.canComplete && errors.length === 0,
    errors,
  };
}

/**
 * Auto-fills missing responses with default values (for edge cases)
 */
export function autoFillMissingResponses(responses: number[], confidenceScores: number[]): {
  responses: number[];
  confidenceScores: number[];
  filledCount: number;
} {
  const TOTAL_SCENARIOS = STORY_SCENARIOS.length;
  const filledResponses = [...responses];
  const filledConfidence = [...confidenceScores];

  // Ensure arrays are correct size
  while (filledResponses.length < TOTAL_SCENARIOS) {
    filledResponses.push(0.5);
  }
  while (filledConfidence.length < TOTAL_SCENARIOS) {
    filledConfidence.push(0.5);
  }

  // Fill missing responses
  let filledCount = 0;
  filledResponses.forEach((response, index) => {
    if (response === 0.5 || response === undefined || response === null) {
      filledResponses[index] = 0.5; // Default neutral value
      filledConfidence[index] = 0.5; // Default confidence
      filledCount++;
    }
  });

  return {
    responses: filledResponses,
    confidenceScores: filledConfidence,
    filledCount,
  };
}

