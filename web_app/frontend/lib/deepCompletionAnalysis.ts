/**
 * Deep Completion Analysis
 * 
 * Comprehensive analysis tool to diagnose completion tracking issues.
 * This will help identify exactly why scenarios aren't being tracked.
 */

import { STORY_SCENARIOS } from './storyScenarios';

export interface DeepAnalysisResult {
  timestamp: string;
  totalScenarios: number;
  responsesArray: {
    length: number;
    correctLength: boolean;
    values: Array<{ index: number; value: number; isAnswered: boolean; scenario?: string }>;
  };
  answeredScenarios: number[];
  unansweredScenarios: number[];
  scenarioMapping: Array<{
    globalIndex: number;
    chapter: string;
    category: string;
    hasResponse: boolean;
    responseValue: number;
  }>;
  issues: Array<{
    severity: 'error' | 'warning' | 'info';
    message: string;
    details?: any;
  }>;
  recommendations: string[];
  localStorageData: {
    exists: boolean;
    timestamp?: number;
    responsesLength?: number;
    confidenceLength?: number;
  };
}

export function performDeepAnalysis(responses: number[], localStorageKey: string): DeepAnalysisResult {
  const TOTAL_SCENARIOS = STORY_SCENARIOS.length;
  const issues: DeepAnalysisResult['issues'] = [];
  const recommendations: string[] = [];
  
  // Check localStorage
  let localStorageData: DeepAnalysisResult['localStorageData'] = {
    exists: false,
  };
  
  try {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      localStorageData = {
        exists: true,
        timestamp: parsed.timestamp,
        responsesLength: parsed.responses?.length,
        confidenceLength: parsed.confidenceScores?.length,
      };
    }
  } catch (e) {
    issues.push({
      severity: 'warning',
      message: 'Failed to read localStorage',
      details: e,
    });
  }
  
  // Analyze responses array
  const responsesArray = {
    length: responses.length,
    correctLength: responses.length === TOTAL_SCENARIOS,
    values: responses.map((value, index) => ({
      index,
      value,
      isAnswered: value !== 0.5 && value !== undefined && value !== null,
      scenario: STORY_SCENARIOS[index]?.chapter || 'Unknown',
    })),
  };
  
  if (!responsesArray.correctLength) {
    issues.push({
      severity: 'error',
      message: `Response array length mismatch: ${responses.length} vs ${TOTAL_SCENARIOS}`,
      details: {
        actual: responses.length,
        expected: TOTAL_SCENARIOS,
        difference: TOTAL_SCENARIOS - responses.length,
      },
    });
    recommendations.push(`Resize responses array to ${TOTAL_SCENARIOS} elements`);
  }
  
  // Find answered/unanswered scenarios
  const answeredScenarios: number[] = [];
  const unansweredScenarios: number[] = [];
  
  responses.forEach((value, index) => {
    const isAnswered = value !== 0.5 && value !== undefined && value !== null;
    if (isAnswered) {
      answeredScenarios.push(index);
    } else {
      unansweredScenarios.push(index);
    }
  });
  
  // Check for invalid values
  responses.forEach((value, index) => {
    if (value !== undefined && value !== null && value !== 0.5) {
      if (value < 0 || value > 1) {
        issues.push({
          severity: 'error',
          message: `Invalid response value at index ${index}: ${value} (should be 0-1)`,
        });
      }
    }
  });
  
  // Map scenarios
  const scenarioMapping = STORY_SCENARIOS.map((scenario, index) => ({
    globalIndex: scenario.index,
    chapter: scenario.chapter,
    category: scenario.category,
    hasResponse: index < responses.length,
    responseValue: index < responses.length ? responses[index] : undefined,
  }));
  
  // Check for index mismatches
  scenarioMapping.forEach((mapping, arrayIndex) => {
    if (mapping.globalIndex !== arrayIndex) {
      issues.push({
        severity: 'error',
        message: `Scenario index mismatch at array position ${arrayIndex}: expected ${arrayIndex}, got ${mapping.globalIndex}`,
      });
    }
  });
  
  // Check localStorage consistency
  if (localStorageData.exists) {
    if (localStorageData.responsesLength !== responses.length) {
      issues.push({
        severity: 'warning',
        message: `localStorage responses length (${localStorageData.responsesLength}) doesn't match current responses length (${responses.length})`,
      });
      recommendations.push('Clear localStorage and reload to sync state');
    }
  }
  
  // Generate recommendations
  if (unansweredScenarios.length > 0) {
    recommendations.push(`Answer ${unansweredScenarios.length} remaining scenario(s) at indices: ${unansweredScenarios.join(', ')}`);
  }
  
  if (responses.length < TOTAL_SCENARIOS) {
    recommendations.push(`Extend responses array to ${TOTAL_SCENARIOS} elements`);
  }
  
  if (localStorageData.exists && localStorageData.responsesLength !== TOTAL_SCENARIOS) {
    recommendations.push('Clear saved progress and start fresh');
  }
  
  return {
    timestamp: new Date().toISOString(),
    totalScenarios: TOTAL_SCENARIOS,
    responsesArray,
    answeredScenarios,
    unansweredScenarios,
    scenarioMapping,
    issues,
    recommendations,
    localStorageData,
  };
}

export function generateFixScript(analysis: DeepAnalysisResult): string {
  const fixes: string[] = [];
  
  if (!analysis.responsesArray.correctLength) {
    fixes.push(`// Fix array length
const fixedResponses = [...responses];
while (fixedResponses.length < ${analysis.totalScenarios}) {
  fixedResponses.push(0.5);
}
setResponses(fixedResponses);`);
  }
  
  if (analysis.unansweredScenarios.length > 0) {
    fixes.push(`// Fill missing scenarios
analysis.unansweredScenarios.forEach(idx => {
  fixedResponses[idx] = 0.5;
});`);
  }
  
  return fixes.join('\n\n');
}

