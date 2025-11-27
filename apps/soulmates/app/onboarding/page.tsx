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
      // Calculate archetype and attachment style from traits
      const { 
        calculatePrimaryArchetype, 
        calculateAttachmentStyle, 
        calculateLoveLanguages 
      } = await import("@/lib/profileCalculations");
      
      const primaryArchetype = calculatePrimaryArchetype(traits);
      const attachmentStyle = calculateAttachmentStyle(traits);
      const loveLanguages = calculateLoveLanguages(traits);
      
      // Save profile to backend (with timeout)
      const { profileApi } = await import("@/lib/api");
      
      // Use Promise.race to add timeout
      const savePromise = profileApi.createOrUpdate({
        traits: traits, // Save the full traits array
        primary_archetype: primaryArchetype,
        attachment_style: attachmentStyle,
        love_languages: loveLanguages,
        astrology_meta: birthdate ? { birthdate } : undefined,
        numerology_meta: birthdate ? { birthdate } : undefined,
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timeout")), 10000)
      );
      
      const result = await Promise.race([savePromise, timeoutPromise]) as any;

      // Log analytics event (deferred)
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(() => {
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
        }, { timeout: 200 });
      }

      // Always store in localStorage as fallback (even if backend saved successfully)
      if (typeof window !== 'undefined') {
        try {
          const profileToStore = {
            ...(result?.profile || {}),
            traits: traits,
            primary_archetype: result?.profile?.primary_archetype || (await import("@/lib/profileCalculations")).calculatePrimaryArchetype(traits),
            attachment_style: result?.profile?.attachment_style || (await import("@/lib/profileCalculations")).calculateAttachmentStyle(traits),
            love_languages: result?.profile?.love_languages || (await import("@/lib/profileCalculations")).calculateLoveLanguages(traits),
            calculated_at: Date.now(),
          };
          
          localStorage.setItem('soulmates_profile', JSON.stringify(profileToStore));
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.log("✅ Profile stored in localStorage for dashboard", {
              primary_archetype: profileToStore.primary_archetype,
              attachment_style: profileToStore.attachment_style,
              love_languages: profileToStore.love_languages,
            });
          }
        } catch (e) {
          console.error("Failed to store profile in localStorage:", e);
        }
      }
      
      // Show success message if saved locally (only log in development)
      if (result?.profile?.saved_locally && process.env.NODE_ENV === 'development') {
        console.log("Profile saved locally (backend unavailable)");
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
      } else if (errorMessage.includes("timeout")) {
        // Timeout - still allow user to continue
        console.warn("Profile save timed out, but allowing user to continue");
        router.push("/me");
      } else {
        // For other errors, still redirect (profile might be saved locally)
        console.warn("Profile save error, but allowing user to continue:", errorMessage);
        router.push("/me");
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

