'use client';

import { useState, useEffect } from 'react';
import StoryQuest from '@/components/StoryQuest';
import ShareableResults from '@/components/ShareableResults';
import LandingPage from '@/components/LandingPage';
import ThemeToggle from '@/components/ThemeToggle';
import FeedbackForm from '@/components/FeedbackForm';

export default function Home() {
  const [person1Traits, setPerson1Traits] = useState<number[] | null>(null);
  const [person2Traits, setPerson2Traits] = useState<number[] | null>(null);
  const [person1Birthdate, setPerson1Birthdate] = useState<string>('');
  const [person2Birthdate, setPerson2Birthdate] = useState<string>('');
  const [person1Name, setPerson1Name] = useState<string>('');
  const [person2Name, setPerson2Name] = useState<string>('');
  const [person1Confidence, setPerson1Confidence] = useState<number[]>([]);
  const [person2Confidence, setPerson2Confidence] = useState<number[]>([]);
  const [step, setStep] = useState<'landing' | 'person1' | 'person2' | 'results' | 'history'>('landing');
  
  // Check if landing page should be shown (feature flag)
  const showLandingPage = process.env.NEXT_PUBLIC_ENABLE_LANDING_PAGE !== 'false';
  
  useEffect(() => {
    // If landing page is disabled or user has already started, skip landing
    if (!showLandingPage || person1Traits) {
      setStep('person1');
    }
    
    // Handle magic link authentication
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      // Extract token from hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const token = params.get('token');
      
      if (token) {
        localStorage.setItem('auth_token', token);
        // Clear URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [showLandingPage, person1Traits]);

  const handlePerson1Complete = (traits: number[], birthdate: string, name: string, confidence: number[]) => {
    setPerson1Traits(traits);
    setPerson1Birthdate(birthdate);
    setPerson1Name(name);
    setPerson1Confidence(confidence);
    setStep('person2');
  };

  const handlePerson2Complete = (traits: number[], birthdate: string, name: string, confidence: number[]) => {
    setPerson2Traits(traits);
    setPerson2Birthdate(birthdate);
    setPerson2Name(name);
    setPerson2Confidence(confidence);
    setStep('results');
  };

  const handleReset = () => {
    setPerson1Traits(null);
    setPerson2Traits(null);
    setPerson1Birthdate('');
    setPerson2Birthdate('');
    setPerson1Name('');
    setPerson2Name('');
    setPerson1Confidence([]);
    setPerson2Confidence([]);
    setStep(showLandingPage ? 'landing' : 'person1');
  };

  const handleStartTest = () => {
    setStep('person1');
  };

  return (
    <main className="min-h-screen">
      {/* Theme Toggle - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Feedback Form */}
      <FeedbackForm
        context={{
          page: step,
          step: step === 'results' ? 'results' : step === 'person2' ? 'person2' : step === 'person1' ? 'person1' : 'landing',
          compatibilityScore: step === 'results' && person1Traits && person2Traits
            ? 0.85 // Calculate actual score if needed
            : undefined,
        }}
      />

      {step === 'landing' && showLandingPage && (
        <LandingPage onStartTest={handleStartTest} />
      )}

      {step === 'person1' && (
        <StoryQuest
          personNumber={1}
          onComplete={handlePerson1Complete}
        />
      )}

      {step === 'person2' && person1Traits && (
        <StoryQuest
          personNumber={2}
          onComplete={handlePerson2Complete}
        />
      )}

      {step === 'results' && person1Traits && person2Traits && (
        <ShareableResults
          person1={{
            traits: person1Traits,
            birthdate: person1Birthdate,
            name: person1Name,
          }}
          person2={{
            traits: person2Traits,
            birthdate: person2Birthdate,
            name: person2Name,
          }}
          onReset={handleReset}
        />
      )}
    </main>
  );
}

