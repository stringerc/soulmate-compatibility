"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StoryQuest from "@/components/StoryQuest";
import { logSoulmatesEvent } from "@/lib/analytics";

export default function OnboardingPage() {
  const router = useRouter();
  const [personTraits, setPersonTraits] = useState<number[] | null>(null);
  const [personBirthdate, setPersonBirthdate] = useState<string>('');
  const [personName, setPersonName] = useState<string>('');
  const [personConfidence, setPersonConfidence] = useState<number[]>([]);

  const handlePersonComplete = async (
    traits: number[],
    birthdate: string,
    name: string,
    confidence: number[]
  ) => {
    setPersonTraits(traits);
    setPersonBirthdate(birthdate);
    setPersonName(name);
    setPersonConfidence(confidence);

    try {
      // Save profile to backend
      const { profileApi } = await import("@/lib/api");
      const result = await profileApi.createOrUpdate({
        astrology_meta: birthdate ? { birthdate } : undefined,
        numerology_meta: birthdate ? { birthdate } : undefined,
      }) as any;

          // Log analytics event
          try {
            logSoulmatesEvent({
              name: "onboard_completed",
              payload: {
                profile_id: result?.profile?.id,
                has_birthdate: !!birthdate,
                has_name: !!name,
                traits_count: traits.length,
              },
            });
          } catch (e) {
            console.error("Analytics error:", e);
          }

      // Redirect to dashboard
      router.push("/me");
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen">
      {/* StoryQuest - Interactive Story-Based Compatibility Assessment */}
      <StoryQuest
        personNumber={1}
        onComplete={handlePersonComplete}
      />
    </div>
  );
}

