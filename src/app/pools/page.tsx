"use client";

import { PoolList } from "@/components/PoolList";
import { Navigation } from "@/components/Navigation";
import { PageHeader } from "@/components/PageHeader";

export default function PoolsPage() {
  return (
    <div className="pools-page">
      <PageHeader 
        title="Liquidity Pools" 
        subtitle="Explore and manage World Chain pools" 
      />
      
      <div className="page-content">
        <PoolList />
      </div>
      
      <Navigation />
    </div>
  );
}
