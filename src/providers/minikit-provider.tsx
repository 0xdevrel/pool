"use client";

import { ReactNode, useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

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

        // Make MiniKit available globally for debugging
        window.MiniKit = MiniKit;

        // Wait for initialization
       

        setIsInitialized(true);
        console.log("MiniKit initialized successfully");
        console.log("Running inside World App:", MiniKit.isInstalled());
      } catch (error) {
        console.error("MiniKit initialization error:", error);
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

  return <>{children}</>;
}