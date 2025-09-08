"use client";

import { useState } from "react";
import { MiniKit, VerificationLevel, VerifyCommandInput, ISuccessResult } from "@worldcoin/minikit-js";

interface VerifyButtonProps {
  onVerificationSuccess: () => void;
}

export const VerifyButton = ({ onVerificationSuccess }: VerifyButtonProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actionId = process.env.NEXT_PUBLIC_WLD_ACTION_ID || "sudoku-game";

  const handleVerification = async () => {
    if (!MiniKit.isInstalled()) {
      setError("Please open this app in World App");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const verifyPayload: VerifyCommandInput = {
        action: actionId,
        signal: "",
        verification_level: VerificationLevel.Device,
      };

      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

      const status = (finalPayload as { status?: unknown } | null | undefined)?.status;
      if (!finalPayload || (typeof status === "string" && status === "error")) {
        setError("Verification failed. Please try again.");
        return;
      }

      const verifyResponse = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult,
          action: actionId,
          signal: "",
        }),
      });

      const verifyResult: { status?: number; verifyRes?: { success?: boolean } ; error?: string } = await verifyResponse.json();
      if (verifyResponse.ok && (verifyResult.status === 200 || verifyResult.verifyRes?.success)) {
        onVerificationSuccess();
      } else {
        setError(verifyResult.error || "Verification failed on server. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="verification-container">
      <button
        onClick={handleVerification}
        disabled={isVerifying}
        className="verify-button"
      >
        {isVerifying ? (
          <div className="verify-loading">
            <div className="loading-spinner small"></div>
            <span>Verifying...</span>
          </div>
        ) : (
            <div className="verify-content">
            <span>Verify with World ID</span>
          </div>
        )}
      </button>
      
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
      

    </div>
  );
};
