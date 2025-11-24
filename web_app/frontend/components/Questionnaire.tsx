'use client';

import { useState } from 'react';
import { QUESTIONS, CATEGORIES } from '@/lib/questions';
import { Heart } from 'lucide-react';

interface QuestionnaireProps {
  personNumber: number;
  onComplete: (traits: number[], birthdate: string, name: string) => void;
}

export default function Questionnaire({ personNumber, onComplete }: QuestionnaireProps) {
  const [responses, setResponses] = useState<number[]>(new Array(32).fill(0.5));
  const [birthdate, setBirthdate] = useState('');
  const [name, setName] = useState('');
  const [currentCategory, setCurrentCategory] = useState(0);

  const handleResponseChange = (index: number, value: number) => {
    const newResponses = [...responses];
    newResponses[index] = value;
    setResponses(newResponses);
  };

  const handleSubmit = () => {
    if (!birthdate) {
      alert('Please enter a birthdate');
      return;
    }
    onComplete(responses, birthdate, name || `Person ${personNumber}`);
  };

  const currentCategoryQuestions = QUESTIONS.filter(
    q => q.category === CATEGORIES[currentCategory]
  );

  const progress = ((currentCategory + 1) / CATEGORIES.length) * 100;
  const allAnswered = responses.every(r => r !== 0.5);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Person {personNumber} - Compatibility Assessment
        </h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600">
          Category {currentCategory + 1} of {CATEGORIES.length}: {CATEGORIES[currentCategory]}
        </p>
      </div>

      <div className="mb-6">
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

      <div className="mb-6">
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

      <div className="space-y-6 mb-6">
        {currentCategoryQuestions.map((question) => (
          <div key={question.index} className="border-b border-gray-200 pb-4">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              {question.question}
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500 w-20">Disagree</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={responses[question.index]}
                onChange={(e) => handleResponseChange(question.index, parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <span className="text-xs text-gray-500 w-20 text-right">Agree</span>
            </div>
            <div className="mt-2 text-xs text-gray-400 text-center">
              {Math.round(responses[question.index] * 100)}%
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentCategory(Math.max(0, currentCategory - 1))}
          disabled={currentCategory === 0}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>

        {currentCategory < CATEGORIES.length - 1 ? (
          <button
            onClick={() => setCurrentCategory(currentCategory + 1)}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            Next Category
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || !birthdate}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Heart className="w-5 h-5" />
            <span>Calculate Compatibility</span>
          </button>
        )}
      </div>
    </div>
  );
}

