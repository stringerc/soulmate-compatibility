'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { STORY_SCENARIOS, CHAPTER_THEMES, getCategoryChapters, getScenariosForChapter } from '@/lib/storyScenarios';
import { Sparkles, Heart, Trophy, Star, CheckCircle2 } from 'lucide-react';
import { trackScenarioStart, trackScenarioComplete, trackCompletion, trackDropOff, trackButtonClick } from '@/lib/analytics';

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
  
  // Load saved progress from localStorage
  const loadSavedProgress = () => {
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
  const [responses, setResponses] = useState<number[]>(
    savedProgress?.responses || new Array(TOTAL_SCENARIOS).fill(0.5)
  );
  const [confidenceScores, setConfidenceScores] = useState<number[]>(
    savedProgress?.confidenceScores || new Array(TOTAL_SCENARIOS).fill(0.5)
  );
  const [birthdate, setBirthdate] = useState(savedProgress?.birthdate || '');
  const [name, setName] = useState(savedProgress?.name || '');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(savedProgress?.currentChapterIndex || 0);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(savedProgress?.currentScenarioIndex || 0);
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
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
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
      const answered = responses.filter(r => r !== 0.5).length;
      if (answered < TOTAL_SCENARIOS) {
        trackDropOff(personNumber, currentChapterIndex, currentScenarioIndex, 'component_unmount');
      }
    };
  }, [responses, TOTAL_SCENARIOS, currentChapterIndex, currentScenarioIndex, personNumber]);

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
    if (!currentScenario) return;
    
    // CRITICAL FIX: Ensure current response is saved before navigating
    if (selectedChoice !== null) {
      const choice = currentScenario.choices[selectedChoice];
      const newResponses = [...responses];
      // Ensure array is the right size
      while (newResponses.length < TOTAL_SCENARIOS) {
        newResponses.push(0.5);
      }
      // Save the current response
      if (currentScenario.index >= 0 && currentScenario.index < TOTAL_SCENARIOS) {
        newResponses[currentScenario.index] = choice.value;
        setResponses(newResponses);
      }
      
      // Also ensure confidence is saved (use current value or default to 0.5)
      const newConfidence = [...confidenceScores];
      while (newConfidence.length < TOTAL_SCENARIOS) {
        newConfidence.push(0.5);
      }
      if (currentScenario.index >= 0 && currentScenario.index < TOTAL_SCENARIOS) {
        // Use current confidence or keep existing if already set
        if (newConfidence[currentScenario.index] === 0.5 && showConfidence) {
          // Confidence was shown but might not be set, keep 0.5 as default
        }
        setConfidenceScores(newConfidence);
      }
    }
    
    trackButtonClick('Continue Story', `chapter_${currentChapterIndex}_scenario_${currentScenarioIndex}`);
    
    // Check if we've completed all scenarios in this chapter
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

  const handleSubmit = () => {
    trackButtonClick('Complete Your Story', `chapter_${currentChapterIndex}_scenario_${currentScenarioIndex}`);
    
    // CRITICAL FIX: Save current scenario response if selected but not yet saved
    let finalResponses = [...responses];
    if (currentScenario && selectedChoice !== null) {
      // Ensure array is correct size
      while (finalResponses.length < TOTAL_SCENARIOS) {
        finalResponses.push(0.5);
      }
      // Save the current response
      if (currentScenario.index >= 0 && currentScenario.index < TOTAL_SCENARIOS) {
        finalResponses[currentScenario.index] = currentScenario.choices[selectedChoice].value;
      }
    }
    
    // Double-check completion status with better validation
    const answeredCountCheck = finalResponses.filter(r => r !== 0.5 && r !== undefined && r !== null).length;
    const allAnsweredCheck = answeredCountCheck === TOTAL_SCENARIOS && finalResponses.length === TOTAL_SCENARIOS;
    
    if (!allAnsweredCheck) {
      // Show which scenarios are missing with better debugging
      const unansweredIndices: number[] = [];
      finalResponses.forEach((r, idx) => {
        if (r === 0.5 || r === undefined || r === null) {
          unansweredIndices.push(idx);
        }
      });
      
      // Find which chapters/scenarios are unanswered
      const unansweredScenarios = unansweredIndices.map(idx => {
        const scenario = STORY_SCENARIOS[idx];
        return scenario ? `${scenario.chapter} - Scenario ${idx + 1}` : `Scenario ${idx + 1}`;
      });
      
      console.warn('Completion validation failed:');
      console.warn('- Unanswered scenario indices:', unansweredIndices);
      console.warn('- Responses array length:', finalResponses.length);
      console.warn('- Total scenarios:', TOTAL_SCENARIOS);
      console.warn('- Answered count:', answeredCountCheck);
      console.warn('- Current scenario index:', currentScenario?.index);
      console.warn('- Selected choice:', selectedChoice);
      console.warn('- Responses:', finalResponses);
      
      // Offer to complete anyway if user is at last scenario and has answered most
      if (isLastScenario && answeredCountCheck >= TOTAL_SCENARIOS - 3) {
        const proceed = confirm(
          `You've answered ${answeredCountCheck} of ${TOTAL_SCENARIOS} scenarios.\n\n` +
          `Missing: ${unansweredScenarios.slice(0, 3).join(', ')}${unansweredScenarios.length > 3 ? '...' : ''}\n\n` +
          `Would you like to complete anyway? Missing scenarios will use default values.`
        );
        if (proceed) {
          // Fill missing with default values and proceed
          unansweredIndices.forEach(idx => {
            finalResponses[idx] = 0.5; // Default neutral value
          });
          // Update state and continue
          setResponses(finalResponses);
        } else {
          return;
        }
      } else {
        alert(
          `Please answer all ${TOTAL_SCENARIOS} scenarios before completing.\n\n` +
          `You've answered ${answeredCountCheck} of ${TOTAL_SCENARIOS} scenarios.\n\n` +
          `Missing: ${unansweredScenarios.slice(0, 5).join(', ')}${unansweredScenarios.length > 5 ? '...' : ''}`
        );
        return;
      }
    }
    
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
    
    onComplete(finalResponses, birthdate || '', name || `Person ${personNumber}`, confidenceScores);
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
  // More robust completion checking
  const answeredCount = useMemo(() => {
    return responses.filter(r => r !== 0.5 && r !== undefined && r !== null).length;
  }, [responses]);
  
  const allAnswered = useMemo(() => {
    // Check that we have exactly TOTAL_SCENARIOS responses and all are answered
    if (responses.length !== TOTAL_SCENARIOS) {
      console.warn(`Response array length mismatch: ${responses.length} vs ${TOTAL_SCENARIOS}`);
      return false;
    }
    return answeredCount === TOTAL_SCENARIOS;
  }, [responses, answeredCount, TOTAL_SCENARIOS]);
  
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

  if (!currentScenario) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 transition-colors duration-200">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Person ${personNumber}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Birthdate <span className="text-gray-500 dark:text-gray-400 text-xs">(optional - for astrology/numerology)</span>
              </label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="Select birthdate for enhanced features"
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
                <label className="block text-sm font-medium mb-3 drop-shadow-sm">
                  How certain are you about this choice? ({Math.round(confidenceScores[currentScenario.index] * 100)}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={confidenceScores[currentScenario.index]}
                  onChange={(e) => handleConfidenceChange(parseFloat(e.target.value))}
                  className="w-full h-3 bg-white/30 rounded-lg appearance-none cursor-pointer accent-yellow-300 shadow-inner"
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
            className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all flex items-center gap-2"
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
                    </div>
                  )}
                  {allAnswered && responses.length !== TOTAL_SCENARIOS && (
                    <p className="text-yellow-600 dark:text-yellow-400">
                      ⚠️ Response array mismatch detected
                    </p>
                  )}
                  {!birthdate && allAnswered && (
                    <p className="text-yellow-600 dark:text-yellow-400">
                      💡 Birthdate optional - add for astrology/numerology features
                    </p>
                  )}
                </div>
              )}
              <button
                onClick={handleSubmit}
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
    </div>
  );
}

