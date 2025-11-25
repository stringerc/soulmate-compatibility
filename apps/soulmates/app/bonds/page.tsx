"use client";

import { useState, useEffect, useRef } from "react";
import { useSoulmatesFeature } from "@/hooks/useSoulmatesFeature";
import { bondsApi } from "@/lib/api";
import { logSoulmatesEvent } from "@/lib/analytics";
import UpgradePrompt from "@/components/UpgradePrompt";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import Link from "next/link";

interface Bond {
  id: string;
  user_a_id: string;
  user_b_id: string;
  status: string;
  bond_type: string;
  started_at: string;
  current_label?: string;
}

export default function BondsPage() {
  const canUseBonds = useSoulmatesFeature("bond_mode_basic");
  const { canCreateBond, bondsRemaining, tier, upgradeRequired } = usePlanLimits();
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    to_email: "",
    to_user_id: "",
    bond_type: "ROMANTIC",
  });
  const [error, setError] = useState<string | null>(null);
  
  // Cancellation ref to prevent state updates after unmount (React StrictMode fix)
  const cancelledRef = useRef(false);

  useEffect(() => {
    // Reset cancellation flag
    cancelledRef.current = false;
    
    // Early return if feature disabled
    if (!canUseBonds) {
      setLoading(false);
      return;
    }

    async function loadBonds() {
      try {
        setLoading(true);
        setError(null);
        
        const data = await bondsApi.list();
        
        // Check if component is still mounted before updating state
        if (!cancelledRef.current) {
          setBonds(data.bonds || []);
        }
      } catch (err: any) {
        if (!cancelledRef.current) {
          console.error("Error loading bonds:", err);
          setError(err.message || "Failed to load bonds");
        }
      } finally {
        if (!cancelledRef.current) {
          setLoading(false);
        }
      }
    }
    
    loadBonds();

    // Cleanup function - set cancellation flag on unmount
    return () => {
      cancelledRef.current = true;
    };
  }, [canUseBonds]); // Only re-fetch if feature flag changes

  if (!canUseBonds) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Couple Mode</h1>
          <p className="text-gray-600">
            Couple mode will unlock once your solo profile is complete and Phase 2 is enabled.
          </p>
        </div>
      </div>
    );
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await bondsApi.invite({
        to_email: inviteData.to_email || undefined,
        to_user_id: inviteData.to_user_id || undefined,
        bond_type: inviteData.bond_type,
      });

      setShowInviteForm(false);
      setInviteData({ to_email: "", to_user_id: "", bond_type: "ROMANTIC" });
      
      // Log analytics event
      try {
        logSoulmatesEvent({
          name: "bond_invite_sent",
          payload: { 
            bond_type: inviteData.bond_type,
            to_email: inviteData.to_email || undefined,
            to_user_id: inviteData.to_user_id || undefined,
          },
        });
      } catch (e) {
        console.error("Analytics error:", e);
      }
      
      alert("Invite sent successfully!");
      
      // Reload bonds list
      const data = await bondsApi.list();
      setBonds(data.bonds || []);
    } catch (err: any) {
      setError(err.message || "Failed to send invite");
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Couple Mode</h1>
            {bondsRemaining !== null && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {bondsRemaining} {bondsRemaining === 1 ? "bond" : "bonds"} remaining
              </p>
            )}
          </div>
          <button
            onClick={() => {
              if (!canCreateBond && upgradeRequired) {
                setError("Bonds require a paid plan. Please upgrade to create a bond.");
                return;
              }
              setShowInviteForm(!showInviteForm);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showInviteForm ? "Cancel" : "Invite Partner"}
          </button>
        </div>

        {/* Upgrade Prompt */}
        {!canCreateBond && upgradeRequired && (
          <UpgradePrompt
            feature="bonds"
            recommendedPlan={bonds.length === 0 ? "plus" : "couple-premium"}
          />
        )}

        {showInviteForm && (
          <form onSubmit={handleInvite} className="mb-8 p-6 border rounded space-y-4">
            <h2 className="text-xl font-semibold">Send Bond Invite</h2>
            
            <div>
              <label className="block mb-2">Invite by Email</label>
              <input
                type="email"
                value={inviteData.to_email}
                onChange={(e) => setInviteData({ ...inviteData, to_email: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="partner@example.com"
              />
            </div>

            <div className="text-center text-gray-500">OR</div>

            <div>
              <label className="block mb-2">Invite by User ID</label>
              <input
                type="text"
                value={inviteData.to_user_id}
                onChange={(e) => setInviteData({ ...inviteData, to_user_id: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="User ID"
              />
            </div>

            <div>
              <label className="block mb-2">Bond Type</label>
              <select
                value={inviteData.bond_type}
                onChange={(e) => setInviteData({ ...inviteData, bond_type: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="ROMANTIC">Romantic</option>
                <option value="FRIEND">Friend</option>
                <option value="SELF_EXPERIMENT">Self Experiment</option>
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send Invite
            </button>
          </form>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-800">
            <p className="font-semibold">Error loading bonds</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold mb-4">Active Bonds</h2>
          
          {loading ? (
            <div className="p-8 border rounded text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ) : bonds.length === 0 ? (
            <div className="p-8 border rounded text-center text-gray-500">
              <p className="mb-4">No active bonds yet.</p>
              <p>Invite a partner to start exploring couple mode!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bonds.map((bond) => (
                <Link
                  key={bond.id}
                  href={`/bond/${bond.id}`}
                  className="block p-6 border rounded hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {bond.current_label || `${bond.bond_type} Bond`}
                      </h3>
                      <p className="text-gray-600">
                        Started: {new Date(bond.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                      {bond.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

