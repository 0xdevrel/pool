"use client";

import { useState, useEffect } from "react";
import { PoolCard } from "./PoolCard";
import { PoolData, poolService } from "@/services/poolService";

interface PoolListProps {
  className?: string;
}

export const PoolList = ({ className = "" }: PoolListProps) => {
  const [pools, setPools] = useState<PoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'tvl' | 'volume' | 'apr'>('tvl');
  const [filterBy, setFilterBy] = useState<'all' | 'eth' | 'wld' | 'usdc'>('all');

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    try {
      setLoading(true);
      setError(null);
      const poolData = await poolService.fetchWorldChainPools();
      setPools(poolData);
    } catch (err) {
      setError('Failed to fetch pools');
      console.error('Error fetching pools:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePoolClick = (pool: PoolData) => {
    // Navigate to pool details page
    console.log('Pool clicked:', pool);
  };

  const filteredAndSortedPools = pools
    .filter(pool => {
      if (filterBy === 'all') return true;
      return pool.token0.symbol.toLowerCase().includes(filterBy) || 
             pool.token1.symbol.toLowerCase().includes(filterBy);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'tvl':
          return parseFloat(b.tvlUSD) - parseFloat(a.tvlUSD);
        case 'volume':
          return parseFloat(b.volumeUSD) - parseFloat(a.volumeUSD);
        case 'apr':
          return b.apr - a.apr;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className={`pool-list ${className}`}>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading pools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`pool-list ${className}`}>
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={fetchPools} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`pool-list ${className}`}>
      {/* Header with filters */}
      <div className="pool-list-header">
        <div className="list-title">
          <h2>World Chain Pools</h2>
          <span className="pool-count">{filteredAndSortedPools.length} pools</span>
        </div>
        
        <div className="list-controls">
          <div className="filter-group">
            <label>Filter:</label>
            <select 
              value={filterBy} 
              onChange={(e) => setFilterBy(e.target.value as 'all' | 'eth' | 'wld' | 'usdc')}
              className="filter-select"
            >
              <option value="all">All Tokens</option>
              <option value="eth">ETH</option>
              <option value="wld">WLD</option>
              <option value="usdc">USDC</option>
            </select>
          </div>
          
          <div className="sort-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'tvl' | 'volume' | 'apr')}
              className="sort-select"
            >
              <option value="tvl">TVL</option>
              <option value="volume">Volume</option>
              <option value="apr">APR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pool cards */}
      <div className="pool-grid">
        {filteredAndSortedPools.map((pool) => (
          <PoolCard
            key={pool.id}
            pool={pool}
            onClick={handlePoolClick}
          />
        ))}
      </div>

      {filteredAndSortedPools.length === 0 && (
        <div className="empty-state">
          <p>No pools found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
