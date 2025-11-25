"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { signOut as nextAuthSignOut } from "next-auth/react";
import { signOut as jwtSignOut, getUserEmail } from "@/lib/auth";
import { LogOut, User, Sparkles } from "lucide-react";

export default function NavBar() {
  const { isAuthenticated, isLoading, userEmail } = useAuth();

  const handleLogout = async () => {
    // Try NextAuth sign out first
    try {
      await nextAuthSignOut({ callbackUrl: "/" });
    } catch (error) {
      // Fallback to JWT sign out
      jwtSignOut();
    }
  };

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Soulmates
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition font-medium">
              Pricing
            </Link>
            <Link href="/explore" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition">
              Explore
            </Link>
            <Link href="/bonds" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition">
              Bonds
            </Link>
            
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <>
                    <Link href="/me" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{userEmail || "Dashboard"}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition"
                      title="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition">
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition shadow-lg hover:shadow-xl"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

