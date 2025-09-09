"use client";

import { ReactNode, useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { AuthProvider } from "@/contexts/AuthContext";

declare global {
  interface Window {
    MiniKit: typeof MiniKit;
  }
}

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeMiniKit = async () => {
      try {
        // Install MiniKit
        if (typeof MiniKit.install === "function") {
          MiniKit.install();
        }

        // Make MiniKit available globally
        window.MiniKit = MiniKit;

        // Wait for MiniKit to be ready
        if (MiniKit.isInstalled()) {
          // MiniKit is available, we can proceed
          console.log("MiniKit is installed and ready");
        } else {
          console.log("MiniKit not installed - running outside World App");
        }

        setIsInitialized(true);
        console.log("MiniKit provider initialized successfully");
      } catch (error) {
        console.error("MiniKit initialization error:", error);
        // Still initialize even if there's an error
        setIsInitialized(true);
      }
    };

    initializeMiniKit();
  }, []);

  if (!isInitialized) {
    return (
      <div className="loading-screen">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="loading-text">Initializing World App...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}