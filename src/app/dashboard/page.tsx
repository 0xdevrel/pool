"use client";

import { useState, useEffect } from "react";
import { WalletAuthButton } from "@/components/WalletAuthButton";
import { Navigation } from "@/components/Navigation";
import { PoolList } from "@/components/PoolList";
import { PageHeader } from "@/components/PageHeader";
import { useRouter } from "next/navigation";
import { FaPlus, FaExchangeAlt } from "react-icons/fa";

interface User {
  walletAddress: string;
  username?: string;
  profilePictureUrl?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const storedUser = localStorage.getItem('pool_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
    setIsLoading(false);
  }, []);

  const handleAuthenticationSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('pool_user', JSON.stringify(userData));
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-required-screen">
        <div className="auth-content">
          <div className="auth-card">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
            <WalletAuthButton onAuthenticationSuccess={handleAuthenticationSuccess} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <PageHeader 
        title="Pool" 
        subtitle="Liquidity Pools" 
      />

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Welcome Section */}
          <section className="welcome-section">
            <h2 className="welcome-title">
              Welcome back, {user.username || "User"}!
            </h2>
            <p className="welcome-subtitle">
              Manage your liquidity pools and maximize your yields
            </p>
          </section>

          {/* Stats Cards */}
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3 className="stat-value">$0.00</h3>
                  <p className="stat-label">Total Value</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <h3 className="stat-value">0.00%</h3>
                  <p className="stat-label">APY</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔄</div>
                <div className="stat-content">
                  <h3 className="stat-value">0</h3>
                  <p className="stat-label">Active Pools</p>
                </div>
              </div>
            </div>
          </section>

          {/* Coming Soon Section */}
          <section className="coming-soon-section">
            <div className="coming-soon-card">
              <h3 className="coming-soon-title">🚀 Coming Soon</h3>
              <p className="coming-soon-description">
                Advanced liquidity pool features are in development. Get ready for enhanced trading capabilities!
              </p>
              <div className="feature-list">
                <div className="feature-item">
                  <span className="feature-dot"></span>
                  <span>Advanced pool management</span>
                </div>
                <div className="feature-item">
                  <span className="feature-dot"></span>
                  <span>Liquidity provision</span>
                </div>
                <div className="feature-item">
                  <span className="feature-dot"></span>
                  <span>Token swapping</span>
                </div>
                <div className="feature-item">
                  <span className="feature-dot"></span>
                  <span>Yield optimization</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="actions-section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-button primary" onClick={() => router.push('/pools')}>
                <FaPlus className="action-icon" />
                <span>Add Liquidity</span>
              </button>
              <button className="action-button secondary" onClick={() => router.push('/swap')}>
                <FaExchangeAlt className="action-icon" />
                <span>Swap Tokens</span>
              </button>
              <button className="action-button secondary" onClick={() => router.push('/pools')}>
                <span className="action-icon">📊</span>
                <span>View Pools</span>
              </button>
            </div>
          </section>

          {/* Top Pools Preview */}
          <section className="pools-preview-section">
            <div className="section-header">
              <h3 className="section-title">Top Pools</h3>
              <button 
                className="view-all-button"
                onClick={() => router.push('/pools')}
              >
                View All
              </button>
            </div>
            <div className="pools-preview">
              <PoolList className="preview-mode" />
            </div>
          </section>
        </div>
      </main>

      <Navigation />
    </div>
  );
}
