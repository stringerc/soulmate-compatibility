"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StoryQuest from "@/components/StoryQuest";
import ResultsGate from "@/components/ResultsGate";
import { logSoulmatesEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/useAuth";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [testCompleted, setTestCompleted] = useState(false);
  const [testData, setTestData] = useState<{
    traits: number[];
    birthdate: string;
    name: string;
    confidence: number[];
  } | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Check if we should show results (from query param or after auth)
  useEffect(() => {
    if (searchParams.get('showResults') === 'true' && testData) {
      setShowResults(true);
    }
  }, [searchParams, testData]);

  // If authenticated and test completed, show results
  useEffect(() => {
    if (isAuthenticated && testCompleted && testData && !showResults) {
      setShowResults(true);
    }
  }, [isAuthenticated, testCompleted, testData, showResults]);

  const handlePersonComplete = async (
    traits: number[],
    birthdate: string,
    name: string,
    confidence: number[]
  ) => {
    // Store test data temporarily
    const data = { traits, birthdate, name, confidence };
    setTestData(data);
    setTestCompleted(true);

    // Save to localStorage temporarily (7-day expiration)
    if (typeof window !== 'undefined') {
      try {
        const tempData = {
          ...data,
          timestamp: Date.now(),
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
        };
        localStorage.setItem('soulmates_temp_test_data', JSON.stringify(tempData));
      } catch (e) {
        console.error("Failed to save temp test data:", e);
      }
    }

    // If authenticated, proceed to save and show results
    if (isAuthenticated) {
      await saveProfileAndShowResults(data);
    } else {
      // Show results gate (requires authentication)
      setShowResults(true);
    }
  };

  const saveProfileAndShowResults = async (data: typeof testData) => {
    if (!data) return;

    try {
      // Calculate archetype and attachment style from traits
      const { 
        calculatePrimaryArchetype, 
        calculateAttachmentStyle, 
        calculateLoveLanguages 
      } = await import("@/lib/profileCalculations");
      
      const primaryArchetype = calculatePrimaryArchetype(data.traits);
      const attachmentStyle = calculateAttachmentStyle(data.traits);
      const loveLanguages = calculateLoveLanguages(data.traits);
      
      // Save profile to backend with improved sync logic
      const { profileApi } = await import("@/lib/api");
      const { syncProfileToBackend } = await import("@/lib/dataSync");
      
      const profileData = {
        traits: data.traits,
        primary_archetype: primaryArchetype,
        attachment_style: attachmentStyle,
        love_languages: loveLanguages,
        astrology_meta: data.birthdate ? { birthdate: data.birthdate } : undefined,
        numerology_meta: data.birthdate ? { birthdate: data.birthdate } : undefined,
      };

      // Try to sync to backend (with retry logic)
      let result: any = null;
      try {
        const syncSuccess = await syncProfileToBackend(profileData);
        
        if (syncSuccess) {
          try {
            result = await profileApi.get();
          } catch (e) {
            result = { profile: profileData };
          }
        } else {
          result = { profile: profileData, saved_locally: true };
        }
      } catch (error) {
        result = { profile: profileData, saved_locally: true };
      }

      // Log analytics event (deferred)
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(() => {
          try {
            logSoulmatesEvent({
              name: "onboard_completed",
              payload: {
                profile_id: result?.profile?.id,
                has_birthdate: !!data.birthdate,
                has_name: !!data.name,
                traits_count: data.traits.length,
              },
            });
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.error("Analytics error:", e);
            }
          }
        }, { timeout: 200 });
      }

      // Always store in localStorage as fallback
      if (typeof window !== 'undefined') {
        try {
          const profileToStore = {
            ...(result?.profile || {}),
            traits: data.traits,
            primary_archetype: result?.profile?.primary_archetype || primaryArchetype,
            attachment_style: result?.profile?.attachment_style || attachmentStyle,
            love_languages: result?.profile?.love_languages || loveLanguages,
            calculated_at: Date.now(),
            synced_at: result?.profile?.saved_locally ? null : Date.now(),
          };
          
          localStorage.setItem('soulmates_profile', JSON.stringify(profileToStore));
          
          if (!result?.profile?.saved_locally) {
            localStorage.setItem('soulmates_last_sync', Date.now().toString());
          }
          
          // Clear temp test data after successful save
          localStorage.removeItem('soulmates_temp_test_data');
        } catch (e) {
          console.error("Failed to store profile in localStorage:", e);
        }
      }
      
      // Redirect to dashboard
      router.push("/me");
    } catch (error) {
      console.error("Onboarding error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("authentication")) {
        // Auth error - redirect to login
        router.push(`/login?callbackUrl=${encodeURIComponent("/onboarding?showResults=true")}`);
      } else {
        // Other errors - still redirect to dashboard (profile might be saved locally)
        router.push("/me");
      }
    }
  };

  // Handle authentication callback (when user signs in from ResultsGate)
  const handleAuthenticated = async () => {
    if (testData) {
      await saveProfileAndShowResults(testData);
    }
  };

  // Load temp test data on mount (if user returns after auth)
  useEffect(() => {
    if (typeof window !== 'undefined' && isAuthenticated && !testData) {
      try {
        const tempDataStr = localStorage.getItem('soulmates_temp_test_data');
        if (tempDataStr) {
          const tempData = JSON.parse(tempDataStr);
          // Check if not expired
          if (tempData.expiresAt && Date.now() < tempData.expiresAt) {
            setTestData({
              traits: tempData.traits,
              birthdate: tempData.birthdate || '',
              name: tempData.name || '',
              confidence: tempData.confidence || [],
            });
            setTestCompleted(true);
            setShowResults(true);
          } else {
            // Expired, remove it
            localStorage.removeItem('soulmates_temp_test_data');
          }
        }
      } catch (e) {
        console.error("Failed to load temp test data:", e);
      }
    }
  }, [isAuthenticated, testData]);

  // Show results gate if test completed and not authenticated
  if (testCompleted && !isAuthenticated && showResults && testData) {
    return <ResultsGate testData={testData} onAuthenticated={handleAuthenticated} />;
  }

  // Show loading while checking auth
  if (isLoading && !testCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
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
      
      // Save profile to backend with improved sync logic
      const { profileApi } = await import("@/lib/api");
      const { syncProfileToBackend } = await import("@/lib/dataSync");
      
      const profileData = {
        traits: traits, // Save the full traits array
        primary_archetype: primaryArchetype,
        attachment_style: attachmentStyle,
        love_languages: loveLanguages,
        astrology_meta: birthdate ? { birthdate } : undefined,
        numerology_meta: birthdate ? { birthdate } : undefined,
      };

      // Try to sync to backend (with retry logic)
      let result: any = null;
      try {
        const syncSuccess = await syncProfileToBackend(profileData);
        
        if (syncSuccess) {
          // If sync succeeded, get the saved profile
          try {
            result = await profileApi.get();
          } catch (e) {
            // If get fails, create a mock result
            result = { profile: profileData };
          }
        } else {
          // Sync queued - create mock result
          result = { profile: profileData, saved_locally: true };
        }
      } catch (error) {
        // Sync failed - will be queued automatically
        result = { profile: profileData, saved_locally: true };
      }

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
            primary_archetype: result?.profile?.primary_archetype || primaryArchetype,
            attachment_style: result?.profile?.attachment_style || attachmentStyle,
            love_languages: result?.profile?.love_languages || loveLanguages,
            calculated_at: Date.now(),
            synced_at: result?.profile?.saved_locally ? null : Date.now(),
          };
          
          localStorage.setItem('soulmates_profile', JSON.stringify(profileToStore));
          
          // Update last sync time if successfully synced
          if (!result?.profile?.saved_locally) {
            localStorage.setItem('soulmates_last_sync', Date.now().toString());
          }
          
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.log("✅ Profile stored in localStorage for dashboard", {
              primary_archetype: profileToStore.primary_archetype,
              attachment_style: profileToStore.attachment_style,
              love_languages: profileToStore.love_languages,
              synced: !result?.profile?.saved_locally,
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
    <div className="min-h-screen">
      {/* StoryQuest - Interactive Story-Based Compatibility Assessment */}
      {/* No auth required - users can take the test without login */}
      <StoryQuest
        personNumber={1}
        onComplete={handlePersonComplete}
      />
    </div>
  );
}

