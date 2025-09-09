"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { WalletAuthButton } from "./WalletAuthButton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export const AuthGuard = ({ 
  children, 
  redirectTo = "/", 
  requireAuth = true 
}: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, requireAuth, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="auth-required-screen">
        <div className="auth-content">
          <div className="auth-card">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">Please sign in to access this page.</p>
            <WalletAuthButton 
              onAuthenticationSuccess={() => {
                // The AuthContext will handle the login
                window.location.reload();
              }} 
            />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
