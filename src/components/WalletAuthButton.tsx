"use client";

import { useState } from "react";
import { MiniKit, MiniAppWalletAuthSuccessPayload } from "@worldcoin/minikit-js";
import { useAuth } from "@/contexts/AuthContext";

interface WalletAuthButtonProps {
  onAuthenticationSuccess?: (user: { walletAddress: string; username?: string }) => void;
}

export const WalletAuthButton = ({ onAuthenticationSuccess }: WalletAuthButtonProps) => {
  const { login } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWalletAuth = async () => {
    if (!MiniKit.isInstalled()) {
      setError("Please open this app in World App");
      return;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      // 1. Get nonce from backend
      const res = await fetch(`/api/nonce`);
      if (!res.ok) {
        throw new Error("Failed to get nonce");
      }
      const { nonce } = await res.json();

      // 2. Trigger wallet authentication
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: 'pool-auth', // Optional
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        statement: 'Sign in to Pool - Liquidity Pools of World chain',
      });

      if (finalPayload.status === 'error') {
        setError("Authentication failed. Please try again.");
        return;
      }

      // 3. Verify the signature on backend
      const response = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload as MiniAppWalletAuthSuccessPayload,
          nonce,
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.status === "success" && result.isValid) {
        // 4. Get user info from the payload
        const walletAddress = (finalPayload as MiniAppWalletAuthSuccessPayload).address;
        
        // Try to get username from MiniKit if available
        let username: string | undefined;
        try {
          if (MiniKit.isInstalled()) {
            const userInfo = await MiniKit.getUserByAddress(walletAddress);
            username = userInfo?.username;
          }
        } catch (error) {
          console.warn('Could not fetch username:', error);
        }
        
        const userData = {
          walletAddress: walletAddress,
          username: username,
        };
        
        // Update auth context
        login(userData);
        
        // Call optional callback
        if (onAuthenticationSuccess) {
          onAuthenticationSuccess(userData);
        }
      } else {
        setError(result.message || "Authentication verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Wallet auth error:", error);
      setError(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="verification-container">
      <button
        onClick={handleWalletAuth}
        disabled={isAuthenticating}
        className="verify-button"
      >
        {isAuthenticating ? (
          <div className="verify-loading">
            <div className="loading-spinner small"></div>
            <span>Authenticating...</span>
          </div>
        ) : (
          <div className="verify-content">
            <span>Sign in with Wallet</span>
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
