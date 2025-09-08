"use client";

import { useState, useEffect } from "react";
import { WalletAuthButton } from "@/components/WalletAuthButton";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  walletAddress: string;
  username?: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const storedUser = localStorage.getItem('pool_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      // Redirect to dashboard if already authenticated
      router.push('/dashboard');
    }
    setIsLoading(false);
  }, [router]);

  const handleAuthenticationSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('pool_user', JSON.stringify(userData));
    // Redirect to dashboard after successful authentication
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-card">
          <div className="app-icon">
            <Image
              src="/globe.svg"
              alt="Pool Logo"
              width={96}
              height={96}
              style={{ filter: "none" }}
            />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{color:"var(--foreground)"}}>Pool</h1>
          <p className="text-sm mb-3" style={{color:"var(--secondary)"}}>Liquidity Pools of World chain</p>
         
          <div className="features-card">
            <h2 className="text-lg font-semibold mb-4" style={{color:"var(--foreground)"}}>Features</h2>
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span style={{color:"var(--secondary)"}}>Decentralized liquidity pools</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span style={{color:"var(--secondary)"}}>World chain integration</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span style={{color:"var(--secondary)"}}>Yield farming opportunities</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span style={{color:"var(--secondary)"}}>Privacy-preserving authentication</span>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-sm">
          <WalletAuthButton onAuthenticationSuccess={handleAuthenticationSuccess} />
        </div>
      </div>
      <div className="footer">
        <div className="footer-content">
          <p className="footer-text" style={{ marginTop: 4 }}>
            Made with <span aria-hidden>❤️</span> by {" "}
            <a
              href="https://x.com/0xminiapps"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link bold link-accent"
            >
              IBRL Labs
            </a>
          </p>
          <div className="footer-links">
            <Link href="/privacy" className="footer-link link-success">
              Privacy Policy
            </Link>
            <span className="footer-separator">•</span>
            <Link href="/terms" className="footer-link link-purple">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}