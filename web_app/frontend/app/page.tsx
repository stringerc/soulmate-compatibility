'use client';

import { useState } from 'react';
import Questionnaire from '@/components/Questionnaire';
import Results from '@/components/Results';
import { PersonVector, ResonanceVector } from '@/lib/compatibility';

export default function Home() {
  const [person1Traits, setPerson1Traits] = useState<number[] | null>(null);
  const [person2Traits, setPerson2Traits] = useState<number[] | null>(null);
  const [person1Birthdate, setPerson1Birthdate] = useState<string>('');
  const [person2Birthdate, setPerson2Birthdate] = useState<string>('');
  const [person1Name, setPerson1Name] = useState<string>('');
  const [person2Name, setPerson2Name] = useState<string>('');
  const [step, setStep] = useState<'person1' | 'person2' | 'results'>('person1');

  const handlePerson1Complete = (traits: number[], birthdate: string, name: string) => {
    setPerson1Traits(traits);
    setPerson1Birthdate(birthdate);
    setPerson1Name(name);
    setStep('person2');
  };

  const handlePerson2Complete = (traits: number[], birthdate: string, name: string) => {
    setPerson2Traits(traits);
    setPerson2Birthdate(birthdate);
    setPerson2Name(name);
    setStep('results');
  };

  const handleReset = () => {
    setPerson1Traits(null);
    setPerson2Traits(null);
    setPerson1Birthdate('');
    setPerson2Birthdate('');
    setPerson1Name('');
    setPerson2Name('');
    setStep('person1');
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Soulmate Compatibility Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Discover your compatibility using 32-dimensional trait analysis
          </p>
        </div>

        {step === 'person1' && (
          <Questionnaire
            personNumber={1}
            onComplete={handlePerson1Complete}
          />
        )}

        {step === 'person2' && person1Traits && (
          <Questionnaire
            personNumber={2}
            onComplete={handlePerson2Complete}
          />
        )}

        {step === 'results' && person1Traits && person2Traits && (
          <Results
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
      </div>
    </main>
  );
}

