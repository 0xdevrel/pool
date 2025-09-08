"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SwapInterface } from "@/components/SwapInterface";
import { LimitOrderInterface } from "@/components/LimitOrderInterface";

interface User {
  walletAddress: string;
  username?: string;
  profilePictureUrl?: string;
}

export default function SwapPage() {
  const [activeTab, setActiveTab] = useState<'swap' | 'limit'>('swap');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('pool_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, []);

  return (
    <div className="swap-page">
      {/* Mobile-First Header */}
      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Trade</h1>
            <p className="page-subtitle">Swap tokens and create limit orders on World Chain v4</p>
          </div>
        </div>
      </header>
      
      <div className="swap-tabs">
        <button 
          className={`tab-button ${activeTab === 'swap' ? 'active' : ''}`}
          onClick={() => setActiveTab('swap')}
        >
          Swap
        </button>
        <button 
          className={`tab-button ${activeTab === 'limit' ? 'active' : ''}`}
          onClick={() => setActiveTab('limit')}
        >
          Limit
        </button>
      </div>
      
      <div className="page-content">
        {activeTab === 'swap' ? (
          <SwapInterface userAddress={user?.walletAddress} />
        ) : (
          <LimitOrderInterface userAddress={user?.walletAddress} />
        )}
      </div>
      
      <Navigation />
    </div>
  );
}
