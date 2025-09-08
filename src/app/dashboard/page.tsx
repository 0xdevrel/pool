"use client";

import { useState, useEffect } from "react";
import { WalletAuthButton } from "@/components/WalletAuthButton";
import { Navigation } from "@/components/Navigation";
import { PoolList } from "@/components/PoolList";
import { useRouter } from "next/navigation";
import { FaUser, FaSignOutAlt, FaPlus, FaExchangeAlt } from "react-icons/fa";
import { MiniKit } from "@worldcoin/minikit-js";
import Image from "next/image";

interface User {
  walletAddress: string;
  username?: string;
  profilePictureUrl?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and fetch username
    const storedUser = localStorage.getItem('pool_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Fetch username from MiniKit if not already available
      if (!userData.username && userData.walletAddress) {
        fetchUserInfo(userData.walletAddress);
      }
    }
    setIsLoading(false);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  const fetchUserInfo = async (walletAddress: string) => {
    try {
      if (MiniKit.isInstalled()) {
        const userInfo = await MiniKit.getUserByAddress(walletAddress);
        if (userInfo) {
          const updatedUser = {
            walletAddress,
            username: userInfo.username,
            profilePictureUrl: userInfo.profilePictureUrl,
          };
          setUser(updatedUser);
          localStorage.setItem('pool_user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const handleAuthenticationSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('pool_user', JSON.stringify(userData));
    
    // Fetch additional user info after authentication
    if (userData.walletAddress) {
      fetchUserInfo(userData.walletAddress);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('pool_user');
    setShowUserMenu(false);
    router.push('/');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
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
      {/* Mobile-First Header with Avatar */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">Pool</h1>
            <span className="app-subtitle">Liquidity Pools</span>
          </div>
          <div className="header-right">
            <div className="user-menu-container">
              <div className="user-avatar-small" onClick={toggleUserMenu}>
                {user.profilePictureUrl ? (
                  <Image 
                    src={user.profilePictureUrl} 
                    alt="Profile" 
                    width={40}
                    height={40}
                    className="avatar-image"
                  />
                ) : (
                  <FaUser className="avatar-icon" />
                )}
              </div>
              {showUserMenu && (
                <div className="user-menu">
                  <div className="user-menu-header">
                    <div className="user-info">
                      <div className="user-name">
                        {user.username || "Anonymous User"}
                      </div>
                      <div className="user-address">
                        {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                      </div>
                    </div>
                  </div>
                  <div className="user-menu-actions">
                    <button className="menu-action" onClick={handleSignOut}>
                      <FaSignOutAlt className="action-icon" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

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
                Uniswap V4 integration is in development. Get ready for advanced liquidity pool features!
              </p>
              <div className="feature-list">
                <div className="feature-item">
                  <span className="feature-dot"></span>
                  <span>Uniswap V4 integration</span>
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
