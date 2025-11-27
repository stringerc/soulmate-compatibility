'use client';

import { useState, useEffect, useRef, useMemo, useId } from 'react';
import { STORY_SCENARIOS, CHAPTER_THEMES, getCategoryChapters, getScenariosForChapter } from '@/lib/storyScenarios';
import { Sparkles, Heart, Trophy, Star, CheckCircle2 } from 'lucide-react';
import { trackScenarioStart, trackScenarioComplete, trackCompletion, trackDropOff, trackButtonClick } from '@/lib/analytics';
import { analyzeCompletion, validateCompletion, autoFillMissingResponses } from '@/lib/completionAnalyzer';
import { performDeepAnalysis, generateFixScript } from '@/lib/deepCompletionAnalysis';
import CompletionDebugger from './CompletionDebugger';
import { useToast } from './Toast';

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
  
  // Toast notifications
  const { showToast, ToastComponent } = useToast();
  
  // Load saved progress from localStorage
  const loadSavedProgress = () => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          // Check if saved data is recent (within 7 days)
          const daysSince = (Date.now() - (data.timestamp || 0)) / (1000 * 60 * 60 * 24);
          if (daysSince < 7) {
            return data;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load saved progress:', e);
    }
    return null;
  };

  const savedProgress = loadSavedProgress();
  
  // Get chapters first to validate indices (only on client side)
  let initialChapters: string[] = [];
  let validatedChapterIndex = 0;
  let validatedScenarioIndex = 0;
  
  if (typeof window !== 'undefined') {
    try {
      initialChapters = getCategoryChapters();
      validatedChapterIndex = savedProgress?.currentChapterIndex != null && 
        savedProgress.currentChapterIndex >= 0 && 
        savedProgress.currentChapterIndex < initialChapters.length
        ? savedProgress.currentChapterIndex 
        : 0;
      
      const initialChapter = initialChapters[validatedChapterIndex] || initialChapters[0];
      const initialScenarios = initialChapter ? getScenariosForChapter(initialChapter) : [];
      validatedScenarioIndex = savedProgress?.currentScenarioIndex != null &&
        savedProgress.currentScenarioIndex >= 0 &&
        savedProgress.currentScenarioIndex < initialScenarios.length
        ? savedProgress.currentScenarioIndex
        : 0;
    } catch (e) {
      console.warn('Error validating saved progress:', e);
      validatedChapterIndex = 0;
      validatedScenarioIndex = 0;
    }
  }
  
  const [responses, setResponses] = useState<number[]>(
    savedProgress?.responses || new Array(TOTAL_SCENARIOS).fill(0.5)
  );
  const [confidenceScores, setConfidenceScores] = useState<number[]>(
    savedProgress?.confidenceScores || new Array(TOTAL_SCENARIOS).fill(0.5)
  );
  const [birthdate, setBirthdate] = useState(savedProgress?.birthdate || '');
  const [name, setName] = useState(savedProgress?.name || '');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(validatedChapterIndex);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(validatedScenarioIndex);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showConfidence, setShowConfidence] = useState(false);
  const [badges, setBadges] = useState<Badge[]>(savedProgress?.badges || []);
  const [compatibilityPower, setCompatibilityPower] = useState(0);
  const [showResumePrompt, setShowResumePrompt] = useState(!!savedProgress);
  
  // Track time spent on current scenario
  const scenarioStartTime = useRef<number>(Date.now());
  const lastScenarioIndex = useRef<number>(currentScenarioIndex);

  // Memoize expensive calculations
  const chapters = useMemo(() => getCategoryChapters(), []);
  const currentChapter = useMemo(() => {
    if (chapters.length === 0) return null;
    return chapters[currentChapterIndex] || chapters[0] || null;
  }, [chapters, currentChapterIndex]);
  const currentScenarios = useMemo(() => {
    if (!currentChapter) return [];
    return getScenariosForChapter(currentChapter);
  }, [currentChapter]);
  const currentScenario = useMemo(() => {
    if (currentScenarios.length === 0) return null;
    return currentScenarios[currentScenarioIndex] || currentScenarios[0] || null;
  }, [currentScenarios, currentScenarioIndex]);
  const theme = useMemo(() => {
    if (!currentChapter || chapters.length === 0) {
      // Fallback to first chapter theme if available
      const firstChapter = chapters[0];
      return firstChapter ? CHAPTER_THEMES[firstChapter] : { color: 'from-pink-500 to-purple-500', icon: '🌅' };
    }
    return CHAPTER_THEMES[currentChapter] || CHAPTER_THEMES[chapters[0]] || { color: 'from-pink-500 to-purple-500', icon: '🌅' };
  }, [currentChapter, chapters]);

  // Save progress to localStorage after each change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const progressData = {
          responses,
          confidenceScores,
          birthdate,
          name,
          currentChapterIndex,
          currentScenarioIndex,
          badges,
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
      }
    } catch (e) {
      console.warn('Failed to save progress:', e);
    }
  }, [responses, confidenceScores, birthdate, name, currentChapterIndex, currentScenarioIndex, badges, STORAGE_KEY]);

  useEffect(() => {
    // Calculate progress
    const answered = responses.filter(r => r !== 0.5).length;
    setCompatibilityPower(Math.round((answered / TOTAL_SCENARIOS) * 100));
  }, [responses, TOTAL_SCENARIOS]);

  // Track scenario changes
  useEffect(() => {
    if (currentScenario) {
      // Track completion of previous scenario
      if (lastScenarioIndex.current !== currentScenarioIndex) {
        const timeSpent = Date.now() - scenarioStartTime.current;
        trackScenarioComplete(lastScenarioIndex.current, currentChapter || '', timeSpent);
      }
      
      // Track start of new scenario
      scenarioStartTime.current = Date.now();
      lastScenarioIndex.current = currentScenarioIndex;
      trackScenarioStart(currentScenario.index, currentChapter || '');
    }
  }, [currentScenario, currentScenarioIndex, currentChapterIndex]);

  // Track drop-off on unmount
  useEffect(() => {
    return () => {
      const answered = responses.filter(r => r !== 0.5).length;
      if (answered < TOTAL_SCENARIOS) {
        trackDropOff(personNumber, currentScenarioIndex, currentChapter || '', 'component_unmount');
      }
    };
  }, [responses, TOTAL_SCENARIOS, currentChapterIndex, currentScenarioIndex, personNumber, currentChapter]);

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
    
    // Immediate UI updates (non-blocking)
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
    
    // Validate scenario index (quick check)
    if (currentScenario.index < 0 || currentScenario.index >= TOTAL_SCENARIOS) {
      console.error(`[handleNext] Invalid scenario index: ${currentScenario.index}`);
      return;
    }
    
    // Save the current response
    newResponses[currentScenario.index] = choice.value;
    
    // Save confidence (use current value or default to 0.5)
    const currentConfidence = confidenceScores[currentScenario.index];
    newConfidence[currentScenario.index] = currentConfidence !== undefined && currentConfidence !== 0.5 
      ? currentConfidence 
      : 0.5;
    
    // Update state immediately (synchronous)
    setResponses(newResponses);
    setConfidenceScores(newConfidence);
    
    // Navigate immediately (non-blocking)
    if (currentScenarioIndex < currentScenarios.length - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
    } else {
      // Move to next chapter
      if (currentChapterIndex < chapters.length - 1) {
        setCurrentChapterIndex(currentChapterIndex + 1);
        setCurrentScenarioIndex(0);
        // Award badge for completing chapter (deferred)
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          requestIdleCallback(() => {
            awardBadge(`chapter-${currentChapterIndex + 1}`);
          }, { timeout: 100 });
        }
      }
    }
    
    // Reset for next scenario
    setSelectedChoice(null);
    setShowConfidence(false);
    
    // Defer heavy operations (localStorage, analytics, logging)
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        try {
          const progressData = {
            responses: newResponses,
            confidenceScores: newConfidence,
            birthdate,
            name,
            currentChapterIndex,
            currentScenarioIndex,
            badges,
            timestamp: Date.now(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
          
          // Log completion analysis for debugging
          const analysis = analyzeCompletion(newResponses);
          console.log(`[handleNext] Scenario ${currentScenario.index} saved. Progress: ${analysis.answeredCount}/${analysis.totalScenarios}`);
        } catch (e) {
          console.error('[handleNext] Failed to save progress:', e);
        }
        
        trackButtonClick('Continue Story', `chapter_${currentChapterIndex}_scenario_${currentScenarioIndex}`);
      }, { timeout: 100 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        try {
          const progressData = {
            responses: newResponses,
            confidenceScores: newConfidence,
            birthdate,
            name,
            currentChapterIndex,
            currentScenarioIndex,
            badges,
            timestamp: Date.now(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
        } catch (e) {
          console.error('[handleNext] Failed to save progress:', e);
        }
      }, 0);
    }
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
    const analysis = analyzeCompletion(responses);
    const confirmed = confirm(
      `Force complete will auto-fill ${analysis.unansweredIndices.length} missing scenario(s) with neutral values (0.5).\n\n` +
      `Missing indices: ${analysis.unansweredIndices.join(', ')}\n\n` +
      `This will allow you to complete the assessment. Continue?`
    );
    
    if (!confirmed) return;
    
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
    
    // Update state
    setResponses(autoFilled.responses);
    setConfidenceScores(autoFilled.confidenceScores);
    
    // Save to localStorage immediately
    try {
      if (typeof window !== 'undefined') {
        const progressData = {
          responses: autoFilled.responses,
          confidenceScores: autoFilled.confidenceScores,
          birthdate,
          name,
          currentChapterIndex,
          currentScenarioIndex,
          badges,
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
      }
    } catch (e) {
      console.error('Failed to save after force complete:', e);
    }
    
    // Immediately proceed with completion
    setTimeout(() => {
      handleSubmit(true); // Pass force flag
    }, 200);
  };

  const handleSubmit = (forceComplete: boolean = false) => {
    // Defer heavy operations to prevent INP blocking
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        trackButtonClick('Complete Your Story', `chapter_${currentChapterIndex}_scenario_${currentScenarioIndex}`);
      }, { timeout: 100 });
    } else {
      setTimeout(() => {
        trackButtonClick('Complete Your Story', `chapter_${currentChapterIndex}_scenario_${currentScenarioIndex}`);
      }, 0);
    }
    
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
      }
    }
    
    // Defer heavy analysis operations
    const processCompletion = () => {
      // Use completion analyzer for robust validation
      const analysis = analyzeCompletion(finalResponses);
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
          // Show toast instead of alert for better UX
          const missingCount = analysis.unansweredIndices.length;
          showToast(
            `Please answer all ${analysis.totalScenarios} scenarios. You've answered ${analysis.answeredCount} of ${analysis.totalScenarios}. ${missingCount} scenario${missingCount !== 1 ? 's' : ''} remaining.`,
            'warning'
          );
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
      
      // Birthdate is now optional - show toast instead of confirm
      if (!birthdate) {
        showToast('Birthdate is optional but enables astrology/numerology features. Continuing without it.', 'info');
      }
      
      // Award completion badge
      awardBadge('complete');
      
      // Track completion (deferred)
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(() => {
          const finalAnsweredCount = finalResponses.filter(r => r !== 0.5 && r !== undefined && r !== null).length;
          trackCompletion(personNumber, true, TOTAL_SCENARIOS, finalAnsweredCount);
        }, { timeout: 200 });
      }
      
      // Clear saved progress on completion (deferred)
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(() => {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (e) {
            console.warn('Failed to clear saved progress:', e);
          }
        }, { timeout: 100 });
      }
      
      // Use final arrays for completion
      onComplete(finalResponses, birthdate || '', name || `Person ${personNumber}`, finalConfidence);
    };
    
    // Defer processing to prevent blocking
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(processCompletion, { timeout: 50 });
    } else {
      setTimeout(processCompletion, 0);
    }
  };

  const handleResume = () => {
    setShowResumePrompt(false);
    // Progress already loaded in state
  };

  const handleStartFresh = () => {
    setShowResumePrompt(false);
    // Clear saved progress
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
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
  const completionAnalysis = useMemo(() => {
    return analyzeCompletion(responses);
  }, [responses]);
  
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

  // Show loading state if scenarios aren't ready yet
  if (!currentScenario || chapters.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your story...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 transition-colors duration-200">
      {ToastComponent}
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
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Compatibility Power: {compatibilityPower}%
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Chapter {currentChapterIndex + 1} of {chapters.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
                className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-md"
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{badge.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={nameInputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name (optional)
              </label>
              <input
                id={nameInputId}
                name={`person-${personNumber}-name`}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onInvalid={(e) => {
                  e.preventDefault();
                  const target = e.target as HTMLInputElement;
                  if (target.validity.valueMissing) {
                    showToast('Name is optional, but please enter a valid name if provided.', 'info');
                  } else if (target.validity.tooShort) {
                    showToast('Name must be at least 2 characters long.', 'warning');
                  } else if (target.validity.patternMismatch) {
                    showToast('Please enter a valid name.', 'warning');
                  }
                }}
                placeholder={`Person ${personNumber}`}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                onInvalid={(e) => {
                  e.preventDefault();
                  const target = e.target as HTMLInputElement;
                  if (target.validity.valueMissing) {
                    showToast('Birthdate is optional, but please enter a valid date if provided.', 'info');
                  } else if (target.validity.badInput) {
                    showToast('Please enter a valid date format (YYYY-MM-DD).', 'warning');
                  } else if (target.validity.rangeOverflow) {
                    showToast('Please enter a date in the past.', 'warning');
                  } else if (target.validity.rangeUnderflow) {
                    showToast('Please enter a valid birthdate.', 'warning');
                  }
                }}
                max={new Date().toISOString().split('T')[0]} // Prevent future dates
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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

            {/* Confidence Slider */}
            {showConfidence && selectedChoice !== null && (
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-lg relative z-10">
                <label htmlFor={confidenceSliderId} className="block text-sm font-medium mb-3 drop-shadow-sm">
                  How certain are you about this choice? ({Math.round((confidenceScores[currentScenario.index] || 0.5) * 100)}%)
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
                  className="w-full h-3 bg-white/30 rounded-lg appearance-none cursor-pointer accent-yellow-300 shadow-inner"
                  aria-label={`Confidence level for this choice: ${Math.round((confidenceScores[currentScenario.index] || 0.5) * 100)}%`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round((confidenceScores[currentScenario.index] || 0.5) * 100)}
                />
                <div className="flex justify-between text-xs mt-2 opacity-95 drop-shadow-sm">
                  <span>Not sure</span>
                  <span>Very certain</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentChapterIndex === 0 && currentScenarioIndex === 0}
            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
          >
            ← Previous
          </button>

          {!isLastScenario ? (
            <button
              onClick={handleNext}
              disabled={selectedChoice === null}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
            >
              Continue Story →
            </button>
          ) : (
            <div className="flex flex-col items-end gap-2">
              {!canComplete && (
                <div className="text-sm text-red-600 dark:text-red-400 text-right max-w-xs">
                  {!allAnswered && (
                    <div className="mb-1">
                      <p className="font-semibold">
                        ⚠️ {remainingScenarios} scenario{remainingScenarios !== 1 ? 's' : ''} remaining
                      </p>
                      <p className="text-xs mt-1 opacity-75">
                        ({answeredCount} of {TOTAL_SCENARIOS} completed)
                      </p>
                      {completionAnalysis.unansweredIndices.length > 0 && completionAnalysis.unansweredIndices.length <= 5 && (
                        <p className="text-xs mt-1 opacity-75">
                          Missing: {completionAnalysis.unansweredIndices.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                  {!completionAnalysis.arraySizeCorrect && (
                    <p className="text-yellow-600 dark:text-yellow-400">
                      ⚠️ Response array mismatch detected
                    </p>
                  )}
                  {completionAnalysis.issues.length > 0 && (
                    <div className="text-xs mt-1 opacity-75">
                      {completionAnalysis.issues.slice(0, 2).map((issue, i) => (
                        <p key={i}>{issue}</p>
                      ))}
                    </div>
                  )}
                  {!birthdate && allAnswered && (
                    <p className="text-yellow-600 dark:text-yellow-400">
                      💡 Birthdate optional - add for astrology/numerology features
                    </p>
                  )}
                </div>
              )}
              <button
                onClick={() => handleSubmit(false)}
                disabled={!canComplete}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold relative"
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
        </div>
      </div>

      {/* Completion Debugger - Always show when not complete */}
      {!canComplete && (
        <CompletionDebugger
          responses={responses}
          onForceComplete={handleForceComplete}
        />
      )}
      
      {/* Deep Analysis Button - Always visible for debugging */}
      <button
        onClick={() => {
          const analysis = performDeepAnalysis(responses, STORAGE_KEY);
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
          
          // Show in alert too
          alert(
            `Deep Analysis Complete!\n\n` +
            `Total Scenarios: ${analysis.totalScenarios}\n` +
            `Answered: ${analysis.answeredScenarios.length}\n` +
            `Unanswered: ${analysis.unansweredScenarios.length}\n` +
            `Array Length: ${analysis.responsesArray.length} (should be ${analysis.totalScenarios})\n\n` +
            `Unanswered Indices: ${analysis.unansweredScenarios.join(', ')}\n\n` +
            `Check browser console (F12) for full details.`
          );
        }}
        className="fixed bottom-4 left-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg z-[10000] text-sm font-semibold"
        title="Run deep analysis and log to console"
      >
        🔍 Deep Analysis
      </button>
      
      {/* Reset Progress Button */}
      <button
        onClick={() => {
          const confirmed = confirm(
            'This will clear all saved progress and reset to the beginning.\n\n' +
            'Are you sure you want to reset?'
          );
          if (!confirmed) return;
          
          try {
            if (typeof window !== 'undefined') {
              localStorage.removeItem(STORAGE_KEY);
              // Reload page to reset state
              window.location.reload();
            }
          } catch (e) {
            console.error('Failed to clear localStorage:', e);
            alert('Failed to clear progress. Please clear browser data manually.');
          }
        }}
        className="fixed bottom-4 left-48 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg z-[10000] text-sm font-semibold"
        title="Clear saved progress and start fresh"
      >
        🔄 Reset Progress
      </button>
    </div>
  );
}
