'use client';

import { useState, useEffect } from 'react';
import { STORY_SCENARIOS, CHAPTER_THEMES, getCategoryChapters, getScenariosForChapter } from '@/lib/storyScenarios';
import { Sparkles, Heart, Trophy, Star, CheckCircle2 } from 'lucide-react';

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
  const [responses, setResponses] = useState<number[]>(new Array(32).fill(0.5));
  const [confidenceScores, setConfidenceScores] = useState<number[]>(new Array(32).fill(0.5));
  const [birthdate, setBirthdate] = useState('');
  const [name, setName] = useState('');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showConfidence, setShowConfidence] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [compatibilityPower, setCompatibilityPower] = useState(0);

  const chapters = getCategoryChapters();
  const currentChapter = chapters[currentChapterIndex];
  const currentScenarios = getScenariosForChapter(currentChapter);
  const currentScenario = currentScenarios[currentScenarioIndex];
  const theme = CHAPTER_THEMES[currentChapter] || CHAPTER_THEMES[chapters[0]];

  useEffect(() => {
    // Calculate progress
    const answered = responses.filter(r => r !== 0.5).length;
    const total = 32;
    setCompatibilityPower(Math.round((answered / total) * 100));
  }, [responses]);

  const handleChoiceSelect = (choiceIndex: number) => {
    if (!currentScenario) return;
    
    const choice = currentScenario.choices[choiceIndex];
    setSelectedChoice(choiceIndex);
    
    // Update response
    const newResponses = [...responses];
    newResponses[currentScenario.index] = choice.value;
    setResponses(newResponses);
    
    // Show confidence slider
    setShowConfidence(true);
  };

  const handleConfidenceChange = (confidence: number) => {
    const newConfidence = [...confidenceScores];
    newConfidence[currentScenario.index] = confidence;
    setConfidenceScores(newConfidence);
  };

  const handleNext = () => {
    if (!currentScenario) return;
    
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
    if (!birthdate) {
      alert('Please enter a birthdate');
      return;
    }
    
    // Award completion badge
    awardBadge('complete');
    
    onComplete(responses, birthdate, name || `Person ${personNumber}`, confidenceScores);
  };

  const progress = ((currentChapterIndex + 1) / chapters.length) * 100;
  const chapterProgress = currentScenarios.length > 0 
    ? ((currentScenarioIndex + 1) / currentScenarios.length) * 100 
    : 0;
  const allAnswered = responses.every(r => r !== 0.5);
  const isLastScenario = currentChapterIndex === chapters.length - 1 && 
                         currentScenarioIndex === currentScenarios.length - 1;

  if (!currentScenario) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Love Story: Person {personNumber}
          </h2>
          <p className="text-lg text-gray-600">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birthdate (for astrology/numerology)
              </label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Story Card */}
        <div className={`bg-gradient-to-br ${theme.color} rounded-2xl shadow-2xl p-8 mb-6 text-white`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{theme.icon}</span>
            <div>
              <h3 className="text-2xl font-bold">{currentChapter}</h3>
              <p className="text-sm opacity-90">
                Scenario {currentScenarioIndex + 1} of {currentScenarios.length}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <p className="text-xl leading-relaxed">{currentScenario.storyText}</p>
          </div>

          {/* Choice Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {currentScenario.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoiceSelect(index)}
                className={`bg-white/20 backdrop-blur-sm rounded-xl p-6 text-left transition-all duration-300 hover:bg-white/30 hover:scale-105 ${
                  selectedChoice === index ? 'ring-4 ring-yellow-300 bg-white/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{choice.visualIcon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-lg mb-1">{choice.text}</p>
                    {choice.description && (
                      <p className="text-sm opacity-80">{choice.description}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Confidence Slider */}
          {showConfidence && selectedChoice !== null && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <label className="block text-sm font-medium mb-3">
                How certain are you about this choice? ({Math.round(confidenceScores[currentScenario.index] * 100)}%)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={confidenceScores[currentScenario.index]}
                onChange={(e) => handleConfidenceChange(parseFloat(e.target.value))}
                className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer accent-yellow-300"
              />
              <div className="flex justify-between text-xs mt-2 opacity-80">
                <span>Not sure</span>
                <span>Very certain</span>
              </div>
            </div>
          )}
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
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || !birthdate}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
            >
              <Heart className="w-5 h-5" />
              Complete Your Story
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

