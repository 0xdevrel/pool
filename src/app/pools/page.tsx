"use client";

import { PoolList } from "@/components/PoolList";
import { Navigation } from "@/components/Navigation";
import { PageHeader } from "@/components/PageHeader";
import { AuthGuard } from "@/components/AuthGuard";

export default function PoolsPage() {
  return (
    <AuthGuard>
      <div className="pools-page">
        <PageHeader title="World Chain Pools" />
        
        <div className="page-content">
          <PoolList />
        </div>
        
        <Navigation />
      </div>
    </AuthGuard>
  );
}
