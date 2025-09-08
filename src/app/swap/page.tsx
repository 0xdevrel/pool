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
      <div className="page-header">
        <h1>Trade</h1>
        <p>Swap tokens and create limit orders on World Chain v4</p>
      </div>
      
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
