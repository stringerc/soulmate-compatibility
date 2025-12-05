"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StoryQuest from "@/components/StoryQuest";
import ResultsGate from "@/components/ResultsGate";
import { logSoulmatesEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/useAuth";

function OnboardingPageContent() {
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

    // Log test completion event
    try {
      const { logSoulmatesEvent } = await import("@/lib/analytics");
      logSoulmatesEvent({
        name: isAuthenticated ? "test_completed_authenticated" : "test_completed_anonymous",
        payload: {
          has_birthdate: !!birthdate,
          has_name: !!name,
          traits_count: traits.length,
        },
      });
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Analytics error:", e);
      }
    }

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
      
      // Log results gate view
      try {
        const { logSoulmatesEvent } = await import("@/lib/analytics");
        logSoulmatesEvent({
          name: "results_gate_viewed",
          payload: {},
        });
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Analytics error:", e);
        }
      }

      // Send test completion reminder email (non-blocking)
      // Try to get email from localStorage or use a placeholder
      if (typeof window !== 'undefined') {
        try {
          const userEmail = localStorage.getItem('user_email') || 
                           localStorage.getItem('temp_user_email');
          
          if (userEmail) {
            fetch("/api/v1/soulmates/emails/send", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: userEmail,
                emailType: "test_completion_reminder",
                userName: name || undefined,
              }),
            }).catch((e) => {
              // Silently fail - email sending shouldn't block flow
              if (process.env.NODE_ENV === 'development') {
                console.error("Failed to send test completion reminder:", e);
              }
            });
          }
        } catch (e) {
          // Ignore errors
        }
      }
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
      
      // Send results access email (non-blocking)
      if (typeof window !== 'undefined') {
        try {
          const userEmail = localStorage.getItem('user_email');
          if (userEmail) {
            fetch("/api/v1/soulmates/emails/send", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: userEmail,
                emailType: "results_access",
                userName: data.name || undefined,
                archetype: primaryArchetype || undefined,
              }),
            }).catch((e) => {
              // Silently fail - email sending shouldn't block flow
              if (process.env.NODE_ENV === 'development') {
                console.error("Failed to send results access email:", e);
              }
            });
          }
        } catch (e) {
          // Ignore errors
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
      // Log conversion event
      try {
        const { logSoulmatesEvent } = await import("@/lib/analytics");
        logSoulmatesEvent({
          name: "auth_after_test_completed",
          payload: {
            has_birthdate: !!testData.birthdate,
            has_name: !!testData.name,
            traits_count: testData.traits.length,
          },
        });
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Analytics error:", e);
        }
      }
      
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

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <OnboardingPageContent />
    </Suspense>
  );
}

