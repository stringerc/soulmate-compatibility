"use client";

import { useEffect } from "react";
import { initializeMobileOptimizations } from "@/lib/mobileOptimization";

/**
 * Client component to initialize mobile optimizations
 * Must be client-side because it uses window/document APIs
 */
export default function MobileOptimizer() {
  useEffect(() => {
    initializeMobileOptimizations();
  }, []);

  return null; // This component doesn't render anything
}

