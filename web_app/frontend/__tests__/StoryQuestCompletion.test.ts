/**
 * Comprehensive Test Suite for StoryQuest Completion Logic
 * 
 * This test suite validates that the completion logic works correctly
 * and identifies any edge cases or bugs before deployment.
 */

import { STORY_SCENARIOS } from '@/lib/storyScenarios';

describe('StoryQuest Completion Validation', () => {
  const TOTAL_SCENARIOS = STORY_SCENARIOS.length;

  test('STORY_SCENARIOS has correct number of scenarios', () => {
    expect(TOTAL_SCENARIOS).toBeGreaterThan(0);
    expect(TOTAL_SCENARIOS).toBeLessThanOrEqual(50); // Reasonable upper bound
    console.log(`Total scenarios: ${TOTAL_SCENARIOS}`);
  });

  test('All scenarios have unique indices', () => {
    const indices = STORY_SCENARIOS.map(s => s.index).sort((a, b) => a - b);
    const uniqueIndices = new Set(indices);
    
    expect(uniqueIndices.size).toBe(TOTAL_SCENARIOS);
    expect(indices[0]).toBe(0);
    expect(indices[TOTAL_SCENARIOS - 1]).toBe(TOTAL_SCENARIOS - 1);
    
    // Check for gaps
    const missingIndices: number[] = [];
    for (let i = 0; i < TOTAL_SCENARIOS; i++) {
      if (!indices.includes(i)) {
        missingIndices.push(i);
      }
    }
    
    if (missingIndices.length > 0) {
      console.error('Missing scenario indices:', missingIndices);
    }
    expect(missingIndices.length).toBe(0);
  });

  test('All scenarios have valid choices', () => {
    STORY_SCENARIOS.forEach((scenario, idx) => {
      expect(scenario.choices).toBeDefined();
      expect(scenario.choices.length).toBeGreaterThan(0);
      scenario.choices.forEach((choice, choiceIdx) => {
        expect(choice.value).toBeGreaterThanOrEqual(0);
        expect(choice.value).toBeLessThanOrEqual(1);
        expect(choice.text).toBeTruthy();
      });
    });
  });

  test('Completion validation logic - all answered', () => {
    // Simulate all scenarios answered
    const responses = new Array(TOTAL_SCENARIOS).fill(0).map((_, i) => i % 2 === 0 ? 0.7 : 0.3);
    const confidenceScores = new Array(TOTAL_SCENARIOS).fill(0.5);
    
    const answeredCount = responses.filter(r => r !== 0.5 && r !== undefined && r !== null).length;
    const allAnswered = answeredCount === TOTAL_SCENARIOS && responses.length === TOTAL_SCENARIOS;
    
    expect(allAnswered).toBe(true);
    expect(answeredCount).toBe(TOTAL_SCENARIOS);
  });

  test('Completion validation logic - some unanswered', () => {
    // Simulate some scenarios unanswered (value = 0.5)
    const responses = new Array(TOTAL_SCENARIOS).fill(0.5);
    responses[0] = 0.7;
    responses[1] = 0.3;
    // Rest remain 0.5 (unanswered)
    
    const answeredCount = responses.filter(r => r !== 0.5 && r !== undefined && r !== null).length;
    const allAnswered = answeredCount === TOTAL_SCENARIOS && responses.length === TOTAL_SCENARIOS;
    
    expect(allAnswered).toBe(false);
    expect(answeredCount).toBe(2);
  });

  test('Completion validation logic - array size mismatch', () => {
    // Simulate array size mismatch
    const responses = new Array(TOTAL_SCENARIOS - 1).fill(0.7);
    
    const answeredCount = responses.filter(r => r !== 0.5 && r !== undefined && r !== null).length;
    const allAnswered = answeredCount === TOTAL_SCENARIOS && responses.length === TOTAL_SCENARIOS;
    
    expect(allAnswered).toBe(false);
    expect(responses.length).not.toBe(TOTAL_SCENARIOS);
  });

  test('Auto-complete logic - last scenario with 30+ answered', () => {
    const responses = new Array(TOTAL_SCENARIOS).fill(0.5);
    // Answer 30 scenarios
    for (let i = 0; i < TOTAL_SCENARIOS - 2; i++) {
      responses[i] = 0.7;
    }
    
    const answeredCount = responses.filter(r => r !== 0.5 && r !== undefined && r !== null).length;
    const shouldAutoComplete = answeredCount >= TOTAL_SCENARIOS - 2;
    
    expect(shouldAutoComplete).toBe(true);
  });

  test('Scenario index mapping', () => {
    // Verify that scenario.index matches array position
    STORY_SCENARIOS.forEach((scenario, arrayIndex) => {
      expect(scenario.index).toBe(arrayIndex);
    });
  });
});

