"use client";

import { PoolList } from "@/components/PoolList";
import { Navigation } from "@/components/Navigation";

export default function PoolsPage() {
  return (
    <div className="pools-page">
      {/* Mobile-First Header */}
      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Liquidity Pools</h1>
            <p className="page-subtitle">Explore and manage World Chain v4 pools</p>
          </div>
        </div>
      </header>
      
      <div className="page-content">
        <PoolList />
      </div>
      
      <Navigation />
    </div>
  );
}
