'use client';

import { useState, useEffect, useRef, useMemo, useId } from 'react';
import { STORY_SCENARIOS, CHAPTER_THEMES, getCategoryChapters, getScenariosForChapter } from '@/lib/storyScenarios';
import { Sparkles, Heart, Trophy, Star, CheckCircle2 } from 'lucide-react';
import { trackScenarioStart, trackScenarioComplete, trackCompletion, trackDropOff, trackButtonClick } from '@/lib/analytics';
import { analyzeCompletion, validateCompletion, autoFillMissingResponses } from '@/lib/completionAnalyzer';
import { performDeepAnalysis, generateFixScript } from '@/lib/deepCompletionAnalysis';
import CompletionDebugger from './CompletionDebugger';

interface StoryQuestProps {
  personNumber: number;
  onComplete: (traits: number[], birthdate: string, name: string, confidenceScores: number[]) => void;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
}

export default function StoryQuest({ personNumber, onComplete }: StoryQuestProps) {
  // Use actual scenario count from STORY_SCENARIOS
  const TOTAL_SCENARIOS = STORY_SCENARIOS.length;
  const STORAGE_KEY = `soulmate-progress-${personNumber}`;
  
  // Generate unique IDs for form accessibility
  const nameInputId = useId();
  const birthdateInputId = useId();
  const confidenceSliderId = useId();
  
  // Initialize state with defaults (no localStorage access during SSR)
  const [responses, setResponses] = useState<number[]>(
    new Array(TOTAL_SCENARIOS).fill(0.5)
  );
  const [confidenceScores, setConfidenceScores] = useState<number[]>(
    new Array(TOTAL_SCENARIOS).fill(0.5)
  );
  const [birthdate, setBirthdate] = useState('');
  const [name, setName] = useState('');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showConfidence, setShowConfidence] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [compatibilityPower, setCompatibilityPower] = useState(0);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load saved progress from localStorage after mount (client-side only)
  useEffect(() => {
    setIsMounted(true);
    
    // Load saved progress
    const loadSavedProgress = () => {
      if (typeof window === 'undefined') return null;
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          // Check if saved data is recent (within 7 days)
          const daysSince = (Date.now() - (data.timestamp || 0)) / (1000 * 60 * 60 * 24);
          if (daysSince < 7) {
            return data;
          }
        }
      } catch (e) {
        console.warn('Failed to load saved progress:', e);
      }
      return null;
    };

    const savedProgress = loadSavedProgress();
    if (savedProgress) {
      const savedResponses = savedProgress.responses || new Array(TOTAL_SCENARIOS).fill(0.5);
      setResponses(savedResponses);
      setConfidenceScores(savedProgress.confidenceScores || new Array(TOTAL_SCENARIOS).fill(0.5));
      setBirthdate(savedProgress.birthdate || '');
      setName(savedProgress.name || '');
      setCurrentChapterIndex(savedProgress.currentChapterIndex || 0);
      setCurrentScenarioIndex(savedProgress.currentScenarioIndex || 0);
      setBadges(savedProgress.badges || []);
      // Restore answered scenarios: any response that's not default 0.5 OR was explicitly saved
      // For backward compatibility, check if response exists and array is correct size
      const restoredAnswered = new Set<number>();
      savedResponses.forEach((response: number, index: number) => {
        // If response exists and array is correct size, consider it answered
        // This handles the case where user selected 0.5 (valid answer)
        if (response !== undefined && response !== null && index < TOTAL_SCENARIOS) {
          restoredAnswered.add(index);
        }
      });
      // Also check savedAnsweredScenarios if it exists (for new saves)
      if (savedProgress.answeredScenarios && Array.isArray(savedProgress.answeredScenarios)) {
        savedProgress.answeredScenarios.forEach((idx: number) => restoredAnswered.add(idx));
      }
      setAnsweredScenarios(restoredAnswered);
      setShowResumePrompt(true);
    }
  }, [STORAGE_KEY, TOTAL_SCENARIOS]);
  
  // Track time spent on current scenario
  const scenarioStartTime = useRef<number>(Date.now());
  const lastScenarioIndex = useRef<number>(currentScenarioIndex);

  // Memoize expensive calculations
  const chapters = useMemo(() => getCategoryChapters(), []);
  const currentChapter = useMemo(() => chapters[currentChapterIndex], [chapters, currentChapterIndex]);
  const currentScenarios = useMemo(() => getScenariosForChapter(currentChapter), [currentChapter]);
  const currentScenario = useMemo(() => currentScenarios[currentScenarioIndex], [currentScenarios, currentScenarioIndex]);
  const theme = useMemo(() => CHAPTER_THEMES[currentChapter] || CHAPTER_THEMES[chapters[0]], [currentChapter, chapters]);

  // Save progress to localStorage after each change
  useEffect(() => {
    try {
      const progressData = {
        responses,
        confidenceScores,
        birthdate,
        name,
        currentChapterIndex,
        currentScenarioIndex,
        badges,
        answeredScenarios: Array.from(answeredScenarios), // Save answered scenarios
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
    } catch (e) {
      console.warn('Failed to save progress:', e);
    }
  }, [responses, confidenceScores, birthdate, name, currentChapterIndex, currentScenarioIndex, badges, answeredScenarios, STORAGE_KEY]);

  useEffect(() => {
    // Calculate progress using answeredScenarios (more accurate)
    const answered = answeredScenarios.size;
    setCompatibilityPower(Math.round((answered / TOTAL_SCENARIOS) * 100));
  }, [answeredScenarios, TOTAL_SCENARIOS]);

  // Track scenario changes
  useEffect(() => {
    if (currentScenario) {
      // Track completion of previous scenario
      if (lastScenarioIndex.current !== currentScenarioIndex) {
        const timeSpent = Date.now() - scenarioStartTime.current;
        trackScenarioComplete(lastScenarioIndex.current, currentChapterIndex, timeSpent);
      }
      
      // Track start of new scenario
      scenarioStartTime.current = Date.now();
      lastScenarioIndex.current = currentScenarioIndex;
      trackScenarioStart(currentScenario.index, currentChapterIndex);
    }
  }, [currentScenario, currentScenarioIndex, currentChapterIndex]);

  // Track drop-off on unmount
  useEffect(() => {
    return () => {
      const answered = answeredScenarios.size;
      if (answered < TOTAL_SCENARIOS) {
        trackDropOff(personNumber, currentChapterIndex, currentScenarioIndex, 'component_unmount');
      }
    };
  }, [answeredScenarios, TOTAL_SCENARIOS, currentChapterIndex, currentScenarioIndex, personNumber]);

  const handleChoiceSelect = (choiceIndex: number) => {
    if (!currentScenario) return;
    
    const choice = currentScenario.choices[choiceIndex];
    setSelectedChoice(choiceIndex);
    
    // Update response - ensure array is correct size
    const newResponses = [...responses];
    // Ensure array is the right size
    while (newResponses.length < TOTAL_SCENARIOS) {
      newResponses.push(0.5);
    }
    // Update the specific scenario response
    if (currentScenario.index >= 0 && currentScenario.index < TOTAL_SCENARIOS) {
      newResponses[currentScenario.index] = choice.value;
      setResponses(newResponses);
      // Mark this scenario as answered (regardless of value, even if 0.5)
      setAnsweredScenarios(prev => new Set(prev).add(currentScenario.index));
    } else {
      console.error(`Invalid scenario index: ${currentScenario.index} (should be 0-${TOTAL_SCENARIOS - 1})`);
    }
    
    // Show confidence slider
    setShowConfidence(true);
  };

  const handleConfidenceChange = (confidence: number) => {
    if (!currentScenario) return;
    
    const newConfidence = [...confidenceScores];
    // Ensure array is the right size
    while (newConfidence.length < TOTAL_SCENARIOS) {
      newConfidence.push(0.5);
    }
    // Update the specific scenario confidence
    if (currentScenario.index >= 0 && currentScenario.index < TOTAL_SCENARIOS) {
      newConfidence[currentScenario.index] = confidence;
      setConfidenceScores(newConfidence);
    } else {
      console.error(`Invalid scenario index for confidence: ${currentScenario.index}`);
    }
  };

  const handleNext = () => {
    if (!currentScenario || selectedChoice === null) {
      console.warn('[handleNext] Cannot proceed: no scenario or choice selected');
      return;
    }
    
    // CRITICAL FIX: Ensure current response is saved before navigating
    const choice = currentScenario.choices[selectedChoice];
    const newResponses = [...responses];
    const newConfidence = [...confidenceScores];
    
    // Ensure arrays are the right size
    while (newResponses.length < TOTAL_SCENARIOS) {
      newResponses.push(0.5);
    }
    while (newConfidence.length < TOTAL_SCENARIOS) {
      newConfidence.push(0.5);
    }
    
    // Validate scenario index
    if (currentScenario.index < 0 || currentScenario.index >= TOTAL_SCENARIOS) {
      console.error(`[handleNext] Invalid scenario index: ${currentScenario.index} (should be 0-${TOTAL_SCENARIOS - 1})`);
      alert(`Error: Invalid scenario index. Please refresh the page.`);
      return;
    }
    
    // Save the current response
    newResponses[currentScenario.index] = choice.value;
    
    // Save confidence (use current value or default to 0.5)
    const currentConfidence = confidenceScores[currentScenario.index];
    newConfidence[currentScenario.index] = currentConfidence !== undefined && currentConfidence !== 0.5 
      ? currentConfidence 
      : 0.5;
    
    // Mark this scenario as answered (CRITICAL: even if value is 0.5)
    const updatedAnsweredScenarios = new Set(answeredScenarios);
    updatedAnsweredScenarios.add(currentScenario.index);
    setAnsweredScenarios(updatedAnsweredScenarios);
    
    // Update state immediately (synchronous) - minimal work
    setResponses(newResponses);
    setConfidenceScores(newConfidence);
    
    // INP FIX: Defer heavy work (localStorage, analysis) to prevent blocking UI
    // Use requestIdleCallback if available, otherwise setTimeout
    const saveProgress = () => {
      try {
        const progressData = {
          responses: newResponses,
          confidenceScores: newConfidence,
          birthdate,
          name,
          currentChapterIndex,
          currentScenarioIndex,
          badges,
          answeredScenarios: Array.from(updatedAnsweredScenarios), // Save updated answered scenarios
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
        
        // Log completion analysis for debugging (deferred)
        const analysis = analyzeCompletion(newResponses, updatedAnsweredScenarios);
        console.log(`[handleNext] Scenario ${currentScenario.index} saved. Progress: ${analysis.answeredCount}/${analysis.totalScenarios}`);
        if (analysis.unansweredIndices.length > 0) {
          console.log(`[handleNext] Missing scenarios: ${analysis.unansweredIndices.join(', ')}`);
        }
      } catch (e) {
        console.error('[handleNext] Failed to save progress:', e);
      }
    };
    
    // Defer heavy work to improve INP
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(saveProgress, { timeout: 100 });
    } else {
      setTimeout(saveProgress, 0);
    }
    
    // Track button click (lightweight, can be synchronous)
    trackButtonClick('Continue Story', `chapter_${currentChapterIndex}_scenario_${currentScenarioIndex}`);
    
    // Navigation (synchronous, but lightweight)
    if (currentScenarioIndex < currentScenarios.length - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
    } else {
      // Move to next chapter
      if (currentChapterIndex < chapters.length - 1) {
        setCurrentChapterIndex(currentChapterIndex + 1);
        setCurrentScenarioIndex(0);
        // Award badge for completing chapter
        awardBadge(`chapter-${currentChapterIndex + 1}`);
      }
    }
    
    // Reset for next scenario
    setSelectedChoice(null);
    setShowConfidence(false);
  };

  const handlePrevious = () => {
    if (currentScenarioIndex > 0) {
      setCurrentScenarioIndex(currentScenarioIndex - 1);
    } else if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      const prevScenarios = getScenariosForChapter(chapters[currentChapterIndex - 1]);
      setCurrentScenarioIndex(prevScenarios.length - 1);
    }
    setSelectedChoice(null);
    setShowConfidence(false);
  };

  const awardBadge = (badgeId: string) => {
    const badgeNames: Record<string, { name: string; icon: string }> = {
      'chapter-1': { name: 'First Steps', icon: '🌱' },
      'chapter-2': { name: 'Trust Builder', icon: '🤝' },
      'chapter-3': { name: 'Decision Maker', icon: '🎯' },
      'chapter-4': { name: 'Value Seeker', icon: '💎' },
      'chapter-5': { name: 'Social Butterfly', icon: '🦋' },
      'chapter-6': { name: 'Intimate Explorer', icon: '💕' },
      'chapter-7': { name: 'Life Architect', icon: '🏗️' },
      'complete': { name: 'Soulmate Seeker', icon: '✨' }
    };
    
    if (badgeNames[badgeId] && !badges.find(b => b.id === badgeId)) {
      setBadges([...badges, { id: badgeId, ...badgeNames[badgeId], earned: true }]);
    }
  };

  const handleForceComplete = () => {
    // Defer all heavy work to prevent blocking UI (fixes INP issue)
    setTimeout(() => {
      const analysis = analyzeCompletion(responses, answeredScenarios);
      
      // Defer confirm dialog
      setTimeout(() => {
        const confirmed = confirm(
          `Force complete will auto-fill ${analysis.unansweredIndices.length} missing scenario(s) with neutral values (0.5).\n\n` +
          `Missing indices: ${analysis.unansweredIndices.join(', ')}\n\n` +
          `This will allow you to complete the assessment. Continue?`
        );
        
        if (!confirmed) return;
        
        // Defer heavy processing
        requestIdleCallback(() => {
          // Auto-fill missing responses
          const autoFilled = autoFillMissingResponses(responses, confidenceScores);
          
          console.log('[Force Complete] Before:', {
            responsesLength: responses.length,
            answeredCount: analysis.answeredCount,
            unansweredIndices: analysis.unansweredIndices,
          });
          
          console.log('[Force Complete] After:', {
            responsesLength: autoFilled.responses.length,
            filledCount: autoFilled.filledCount,
          });
          
          // Update state (batched)
          setResponses(autoFilled.responses);
          setConfidenceScores(autoFilled.confidenceScores);
          // Mark all scenarios as answered (force complete)
          setAnsweredScenarios(new Set(Array.from({ length: TOTAL_SCENARIOS }, (_, i) => i)));
          
          // Defer localStorage write
          setTimeout(() => {
            try {
              const progressData = {
                responses: autoFilled.responses,
                confidenceScores: autoFilled.confidenceScores,
                birthdate,
                name,
                currentChapterIndex,
                currentScenarioIndex,
                badges,
                answeredScenarios: Array.from({ length: TOTAL_SCENARIOS }, (_, i) => i), // All answered
                timestamp: Date.now(),
              };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
            } catch (e) {
              console.error('Failed to save after force complete:', e);
            }
            
            // Proceed with completion (deferred)
            setTimeout(() => {
              handleSubmit(true); // Pass force flag
            }, 0);
          }, 0);
        }, { timeout: 100 });
      }, 0);
    }, 0);
  };

  const handleSubmit = (forceComplete: boolean = false) => {
    trackButtonClick('Complete Your Story', `chapter_${currentChapterIndex}_scenario_${currentScenarioIndex}`);
    
    // CRITICAL FIX: Save current scenario response if selected but not yet saved
    let finalResponses = [...responses];
    let finalConfidence = [...confidenceScores];
    
    // Ensure arrays are correct size
    while (finalResponses.length < TOTAL_SCENARIOS) {
      finalResponses.push(0.5);
    }
    while (finalConfidence.length < TOTAL_SCENARIOS) {
      finalConfidence.push(0.5);
    }
    
    // Save the current scenario response if selected (user might be on last scenario)
    if (currentScenario && selectedChoice !== null) {
      if (currentScenario.index >= 0 && currentScenario.index < TOTAL_SCENARIOS) {
        finalResponses[currentScenario.index] = currentScenario.choices[selectedChoice].value;
        // Ensure confidence is set (use existing or default to 0.5)
        if (finalConfidence[currentScenario.index] === 0.5 && showConfidence) {
          finalConfidence[currentScenario.index] = confidenceScores[currentScenario.index] || 0.5;
        }
        // Mark as answered
        setAnsweredScenarios(prev => new Set(prev).add(currentScenario.index));
      }
    }
    
    // Use completion analyzer for robust validation
    // Get current answeredScenarios state (may be stale, but better than nothing)
    const currentAnsweredSet = new Set(answeredScenarios);
    // Also add current scenario if selected
    if (currentScenario && selectedChoice !== null) {
      currentAnsweredSet.add(currentScenario.index);
    }
    const analysis = analyzeCompletion(finalResponses, currentAnsweredSet);
    const validation = validateCompletion(finalResponses);
    
    console.log('[handleSubmit] Completion Analysis:', {
      totalScenarios: analysis.totalScenarios,
      answeredCount: analysis.answeredCount,
      unansweredCount: analysis.unansweredIndices.length,
      canComplete: analysis.canComplete,
      issues: analysis.issues,
      forceComplete,
    });
    
    // If force complete or auto-fill conditions met, proceed
    if (!analysis.canComplete && !forceComplete) {
      // Auto-fill if user is on last scenario and has answered most scenarios (28+)
      if (isLastScenario && analysis.answeredCount >= TOTAL_SCENARIOS - 4) {
        console.log(`[handleSubmit] Auto-filling ${analysis.unansweredIndices.length} missing scenarios (user answered ${analysis.answeredCount}/${analysis.totalScenarios})`);
        const autoFilled = autoFillMissingResponses(finalResponses, finalConfidence);
        finalResponses = autoFilled.responses;
        finalConfidence = autoFilled.confidenceScores;
        
        // Update state
        setResponses(finalResponses);
        setConfidenceScores(finalConfidence);
        
        // Log auto-fill
        console.log(`[handleSubmit] Auto-filled ${autoFilled.filledCount} scenarios with default values`);
      } else {
        // Show detailed error message with force complete option
        const errorMessage = [
          `Please answer all ${analysis.totalScenarios} scenarios before completing.`,
          ``,
          `You've answered ${analysis.answeredCount} of ${analysis.totalScenarios} scenarios.`,
          `Missing ${analysis.unansweredIndices.length} scenario(s): ${analysis.unansweredIndices.slice(0, 5).join(', ')}${analysis.unansweredIndices.length > 5 ? '...' : ''}`,
          ``,
          `Tip: Use the "Force Complete" button (bottom right) to auto-fill missing scenarios.`,
        ].join('\n');
        
        alert(errorMessage);
        console.error('[handleSubmit] Validation failed:', validation.errors);
        return;
      }
    }
    
    // If force complete, auto-fill any remaining missing scenarios
    if (forceComplete) {
      const autoFilled = autoFillMissingResponses(finalResponses, finalConfidence);
      finalResponses = autoFilled.responses;
      finalConfidence = autoFilled.confidenceScores;
      setResponses(finalResponses);
      setConfidenceScores(finalConfidence);
    }
    
    // Update state with final values
    setResponses(finalResponses);
    setConfidenceScores(finalConfidence);
    
    // Birthdate is now optional - show warning but allow completion
    if (!birthdate) {
      const proceed = confirm(
        'Birthdate is optional but needed for astrology/numerology features.\n\n' +
        'Would you like to continue without birthdate?'
      );
      if (!proceed) {
        return;
      }
    }
    
    // Award completion badge
    awardBadge('complete');
    
    // Track completion
    const finalAnsweredCount = finalResponses.filter(r => r !== 0.5 && r !== undefined && r !== null).length;
    trackCompletion(personNumber, true, TOTAL_SCENARIOS, finalAnsweredCount);
    
    // Clear saved progress on completion
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear saved progress:', e);
    }
    
    // Use final arrays for completion
    onComplete(finalResponses, birthdate || '', name || `Person ${personNumber}`, finalConfidence);
  };

  const handleResume = () => {
    setShowResumePrompt(false);
    // Progress already loaded in state
  };

  const handleStartFresh = () => {
    setShowResumePrompt(false);
    // Clear saved progress
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear saved progress:', e);
    }
    // Reset to defaults
    setResponses(new Array(TOTAL_SCENARIOS).fill(0.5));
    setConfidenceScores(new Array(TOTAL_SCENARIOS).fill(0.5));
    setBirthdate('');
    setName('');
    setCurrentChapterIndex(0);
    setCurrentScenarioIndex(0);
    setBadges([]);
  };

  // Memoize progress calculations
  const progress = useMemo(() => ((currentChapterIndex + 1) / chapters.length) * 100, [currentChapterIndex, chapters.length]);
  const chapterProgress = useMemo(() => 
    currentScenarios.length > 0 
      ? ((currentScenarioIndex + 1) / currentScenarios.length) * 100 
      : 0,
    [currentScenarios.length, currentScenarioIndex]
  );
  // More robust completion checking using completion analyzer
  // CRITICAL FIX: Use answeredScenarios to properly detect completion
  const completionAnalysis = useMemo(() => {
    // Pass answeredScenarios to analyzeCompletion for accurate tracking
    const analysis = analyzeCompletion(responses, answeredScenarios);
    return analysis;
  }, [responses, answeredScenarios]);
  
  const answeredCount = useMemo(() => {
    return completionAnalysis.answeredCount;
  }, [completionAnalysis]);
  
  const allAnswered = useMemo(() => {
    return completionAnalysis.canComplete;
  }, [completionAnalysis]);
  
  const isLastScenario = useMemo(() => 
    currentChapterIndex === chapters.length - 1 && 
    currentScenarioIndex === currentScenarios.length - 1,
    [currentChapterIndex, chapters.length, currentScenarioIndex, currentScenarios.length]
  );
  
  // Calculate completion status for user feedback
  const remainingScenarios = useMemo(() => {
    const remaining = TOTAL_SCENARIOS - answeredCount;
    return Math.max(0, remaining); // Ensure non-negative
  }, [TOTAL_SCENARIOS, answeredCount]);
  
  // Birthdate is now optional - only require all scenarios to be answered
  const canComplete = useMemo(() => {
    return allAnswered && responses.length === TOTAL_SCENARIOS;
  }, [allAnswered, responses.length, TOTAL_SCENARIOS]);

  // Prevent hydration mismatch by ensuring consistent initial render
  if (!isMounted || !currentScenario) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Love Story: Person {personNumber}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Discover your compatibility through an interactive journey
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* Resume Prompt */}
        {showResumePrompt && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📍 Resume Your Journey?
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  We found saved progress from a previous session. You were at Chapter {currentChapterIndex + 1}, Scenario {currentScenarioIndex + 1}.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleResume}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Resume Where I Left Off
                  </button>
                  <button
                    onClick={handleStartFresh}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Start Fresh
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowResumePrompt(false)}
                className="ml-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                aria-label="Close resume prompt"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Love Story: Person {personNumber}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover your compatibility through an interactive journey
          </p>
        </div>

        {/* Progress Visualization */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Compatibility Power: {compatibilityPower}%
            </span>
            <span className="text-sm text-gray-600">
              Chapter {currentChapterIndex + 1} of {chapters.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`bg-gradient-to-r ${theme.color} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${chapterProgress}%` }}
            />
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            {badges.map(badge => (
              <div
                key={badge.id}
                className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md"
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-sm font-medium text-gray-700">{badge.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={nameInputId} className="block text-sm font-medium text-gray-700 mb-2">
                Name (optional)
              </label>
              <input
                id={nameInputId}
                name={`person-${personNumber}-name`}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Person ${personNumber}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                aria-label={`Name for Person ${personNumber} (optional)`}
              />
            </div>
            <div>
              <label htmlFor={birthdateInputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Birthdate <span className="text-gray-500 dark:text-gray-400 text-xs">(optional - for astrology/numerology)</span>
              </label>
              <input
                id={birthdateInputId}
                name={`person-${personNumber}-birthdate`}
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="Select birthdate for enhanced features"
                aria-label={`Birthdate for Person ${personNumber} (optional - enables astrology and numerology features)`}
              />
              {!birthdate && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  💡 Adding your birthdate enables astrology and numerology compatibility features
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Story Card */}
        <div className={`bg-gradient-to-br ${theme.color} rounded-2xl shadow-2xl p-8 mb-6 text-white relative overflow-hidden`}>
          {/* Dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 to-gray-900/20 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl drop-shadow-lg">{theme.icon}</span>
              <div>
                <h3 className="text-2xl font-bold drop-shadow-md">{currentChapter}</h3>
                <p className="text-sm opacity-95 drop-shadow-sm">
                  Scenario {currentScenarioIndex + 1} of {currentScenarios.length}
                </p>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
              <p className="text-xl leading-relaxed font-medium drop-shadow-md">{currentScenario.storyText}</p>
            </div>

            {/* Choice Cards */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {currentScenario.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoiceSelect(index)}
                  className={`bg-white/25 backdrop-blur-md rounded-xl p-6 text-left transition-all duration-300 hover:bg-white/35 hover:scale-105 border border-white/30 shadow-lg ${
                    selectedChoice === index ? 'ring-4 ring-yellow-300 bg-white/40 shadow-xl' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl drop-shadow-md">{choice.visualIcon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-lg mb-1 drop-shadow-sm">{choice.text}</p>
                      {choice.description && (
                        <p className="text-sm opacity-90 drop-shadow-sm">{choice.description}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Confidence Slider - Compact inline version that doesn't push content */}
            {showConfidence && selectedChoice !== null && (
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-lg relative z-10">
                <label htmlFor={confidenceSliderId} className="block text-xs font-medium mb-2 drop-shadow-sm">
                  How certain? ({Math.round((confidenceScores[currentScenario.index] || 0.5) * 100)}%)
                </label>
                <input
                  id={confidenceSliderId}
                  name={`confidence-scenario-${currentScenario.index}`}
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={confidenceScores[currentScenario.index] || 0.5}
                  onChange={(e) => handleConfidenceChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-yellow-300 shadow-inner"
                  aria-label={`Confidence level for this choice: ${Math.round((confidenceScores[currentScenario.index] || 0.5) * 100)}%`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round((confidenceScores[currentScenario.index] || 0.5) * 100)}
                />
                <div className="flex justify-between text-xs mt-1 opacity-95 drop-shadow-sm">
                  <span>Not sure</span>
                  <span>Very certain</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Previous Button - Inline with content */}
        <div className="mb-6">
          <button
            onClick={handlePrevious}
            disabled={currentChapterIndex === 0 && currentScenarioIndex === 0}
            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 font-semibold shadow-md"
          >
            ← Previous
          </button>
        </div>
      </div>

      {/* Floating Action Button - Always visible, fixed at bottom right */}
      {!isLastScenario ? (
        <button
          onClick={handleNext}
          disabled={selectedChoice === null}
          className="fixed bottom-6 right-6 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-2xl hover:shadow-3xl z-[10001] text-lg animate-pulse disabled:animate-none"
          title={selectedChoice === null ? "Select an answer to continue" : "Continue to next scenario"}
        >
          Continue Story →
        </button>
      ) : (
        <div className="fixed bottom-6 right-6 z-[10001] flex flex-col items-end gap-3">
          {!canComplete && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 border-2 border-red-200 dark:border-red-800 max-w-xs">
              {!allAnswered && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  <p className="font-semibold mb-1">
                    ⚠️ {remainingScenarios} scenario{remainingScenarios !== 1 ? 's' : ''} remaining
                  </p>
                  <p className="text-xs opacity-75">
                    ({answeredCount} of {TOTAL_SCENARIOS} completed)
                  </p>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => handleSubmit(false)}
            disabled={!canComplete}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-2xl hover:shadow-3xl text-lg"
            title={!canComplete ? (!allAnswered ? `${remainingScenarios} scenarios remaining` : 'Birthdate required') : 'Complete your compatibility assessment'}
            aria-label={!canComplete ? (!allAnswered ? `${remainingScenarios} scenarios remaining` : 'Birthdate required') : 'Complete your compatibility assessment'}
          >
            {canComplete ? (
              <>
                <Heart className="w-5 h-5" />
                Complete Your Story
              </>
            ) : (
              <>
                <span className="text-xl">🚫</span>
                Complete Your Story
              </>
            )}
          </button>
        </div>
      )}

      {/* Completion Debugger - Always show when not complete */}
      {!canComplete && (
        <CompletionDebugger
          responses={responses}
          answeredScenarios={answeredScenarios}
          onForceComplete={handleForceComplete}
        />
      )}
      
      {/* Deep Analysis Button - Always visible for debugging */}
      <button
        onClick={() => {
          // Defer heavy work to prevent blocking UI (improves INP)
          const runAnalysis = () => {
            const analysis = performDeepAnalysis(responses, STORAGE_KEY);
            
            // Batch console logs to reduce overhead
            setTimeout(() => {
              console.log('=== DEEP COMPLETION ANALYSIS ===');
              console.log(analysis);
              console.log('=== RESPONSES ARRAY ===');
              console.log('Length:', responses.length);
              console.log('Values:', responses);
              console.log('=== ANSWERED SCENARIOS ===');
              console.log('Indices:', analysis.answeredScenarios);
              console.log('=== UNANSWERED SCENARIOS ===');
              console.log('Indices:', analysis.unansweredScenarios);
              console.log('=== ISSUES ===');
              analysis.issues.forEach(issue => {
                console[issue.severity === 'error' ? 'error' : 'warn'](`[${issue.severity.toUpperCase()}] ${issue.message}`, issue.details || '');
              });
              console.log('=== RECOMMENDATIONS ===');
              analysis.recommendations.forEach(rec => console.log('-', rec));
              
              // Show in alert too (defer to avoid blocking)
              setTimeout(() => {
                alert(
                  `Deep Analysis Complete!\n\n` +
                  `Total Scenarios: ${analysis.totalScenarios}\n` +
                  `Answered: ${analysis.answeredScenarios.length}\n` +
                  `Unanswered: ${analysis.unansweredScenarios.length}\n` +
                  `Array Length: ${analysis.responsesArray.length} (should be ${analysis.totalScenarios})\n\n` +
                  `Unanswered Indices: ${analysis.unansweredScenarios.join(', ')}\n\n` +
                  `Check browser console (F12) for full details.`
                );
              }, 0);
            }, 0);
          };
          
          // Use requestIdleCallback if available, otherwise setTimeout
          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(runAnalysis, { timeout: 100 });
          } else {
            setTimeout(runAnalysis, 0);
          }
        }}
        className="fixed bottom-4 left-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg z-[10000] text-sm font-semibold transition-colors"
        title="Run deep analysis and log to console"
      >
        🔍 Deep Analysis
      </button>
      
      {/* Reset Progress Button */}
      <button
        onClick={() => {
          // Defer confirm to avoid blocking UI
          setTimeout(() => {
            const confirmed = confirm(
              'This will clear all saved progress and reset to the beginning.\n\n' +
              'Are you sure you want to reset?'
            );
            if (!confirmed) return;
            
            try {
              localStorage.removeItem(STORAGE_KEY);
              // Reload page to reset state
              window.location.reload();
            } catch (e) {
              console.error('Failed to clear localStorage:', e);
              alert('Failed to clear progress. Please clear browser data manually.');
            }
          }, 0);
        }}
        className="fixed bottom-4 left-48 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg z-[10000] text-sm font-semibold transition-colors"
        title="Clear saved progress and start fresh"
      >
        🔄 Reset Progress
      </button>
    </div>
  );
}

