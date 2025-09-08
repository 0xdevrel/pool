"use client";

import { PoolList } from "@/components/PoolList";
import { Navigation } from "@/components/Navigation";

export default function PoolsPage() {
  return (
    <div className="pools-page">
      <div className="page-header">
        <h1>Liquidity Pools</h1>
        <p>Explore and manage World Chain v4 pools</p>
      </div>
      
      <div className="page-content">
        <PoolList />
      </div>
      
      <Navigation />
    </div>
  );
}
