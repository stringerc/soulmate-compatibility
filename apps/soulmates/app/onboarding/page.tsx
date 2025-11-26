"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StoryQuest from "@/components/StoryQuest";
import { logSoulmatesEvent } from "@/lib/analytics";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
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
    // Double-check authentication before saving
    if (!isAuthenticated) {
      alert("You must be signed in to save your profile. Redirecting to login...");
      router.push(`/login?callbackUrl=${encodeURIComponent("/onboarding")}`);
      return;
    }

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
      // Check if it's an auth error
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("authentication")) {
        alert("Your session has expired. Please sign in again.");
        router.push(`/login?callbackUrl=${encodeURIComponent("/onboarding")}`);
      } else {
        alert("Failed to save profile. Please try again.");
      }
    }
  };

  return (
    <AuthGuard redirectTo={`/login?callbackUrl=${encodeURIComponent("/onboarding")}`}>
      <div className="min-h-screen">
        {/* StoryQuest - Interactive Story-Based Compatibility Assessment */}
        <StoryQuest
          personNumber={1}
          onComplete={handlePersonComplete}
        />
      </div>
    </AuthGuard>
  );
}

