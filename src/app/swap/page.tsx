"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SwapInterface } from "@/components/SwapInterface";
import { LimitOrderInterface } from "@/components/LimitOrderInterface";
import { PageHeader } from "@/components/PageHeader";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";

export default function SwapPage() {
  const [activeTab, setActiveTab] = useState<'swap' | 'limit'>('swap');
  const { user } = useAuth();

  return (
    <AuthGuard>
      <div className="swap-page">
        <PageHeader title="Trade" />
        
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
    </AuthGuard>
  );
}
