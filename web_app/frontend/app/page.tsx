'use client';

import { useState } from 'react';
import StoryQuest from '@/components/StoryQuest';
import ShareableResults from '@/components/ShareableResults';

export default function Home() {
  const [person1Traits, setPerson1Traits] = useState<number[] | null>(null);
  const [person2Traits, setPerson2Traits] = useState<number[] | null>(null);
  const [person1Birthdate, setPerson1Birthdate] = useState<string>('');
  const [person2Birthdate, setPerson2Birthdate] = useState<string>('');
  const [person1Name, setPerson1Name] = useState<string>('');
  const [person2Name, setPerson2Name] = useState<string>('');
  const [person1Confidence, setPerson1Confidence] = useState<number[]>([]);
  const [person2Confidence, setPerson2Confidence] = useState<number[]>([]);
  const [step, setStep] = useState<'person1' | 'person2' | 'results'>('person1');

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
    setStep('person1');
  };

  return (
    <main className="min-h-screen">
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

