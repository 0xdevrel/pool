"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Navigation } from "@/components/Navigation";
import { PageHeader } from "@/components/PageHeader";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { FaSync } from "react-icons/fa";
import { dashboardService, DashboardMetrics } from "@/services/dashboardService";

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadMetrics();
    }
  }, [user]);

  const loadMetrics = async () => {
    setMetricsLoading(true);
    try {
      const metricsData = await dashboardService.getDashboardMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
    } finally {
      setMetricsLoading(false);
    }
  };


  const formatUSD = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // const formatSupply = (value: number) => {
  //   if (value >= 1000000000) {
  //     return `${(value / 1000000000).toFixed(2)}B`;
  //   } else if (value >= 1000000) {
  //     return `${(value / 1000000).toFixed(2)}M`;
  //   } else if (value >= 1000) {
  //     return `${(value / 1000).toFixed(2)}K`;
  //   } else {
  //     return value.toFixed(0);
  //   }
  // };

  const renderInteractiveChart = (chartData: Array<{ timestamp: number; price: number }>) => {
    if (!chartData || chartData.length === 0) return null;

    const width = 400;
    const height = 200;
    const padding = 20;
    
    const minPrice = Math.min(...chartData.map(d => d.price));
    const maxPrice = Math.max(...chartData.map(d => d.price));
    const priceRange = maxPrice - minPrice;
    
    const xScale = (index: number) => padding + (index / (chartData.length - 1)) * (width - 2 * padding);
    const yScale = (price: number) => height - padding - ((price - minPrice) / priceRange) * (height - 2 * padding);
    
    const pathData = chartData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.price)}`)
      .join(' ');
    
    const areaData = `${pathData} L ${xScale(chartData.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`;
    
    return (
      <>
        <defs>
          <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Grid lines */}
        <g className="grid-lines">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + ratio * (height - 2 * padding)}
              x2={width - padding}
              y2={padding + ratio * (height - 2 * padding)}
              stroke="var(--border)"
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}
        </g>
        
        {/* Area under curve */}
        <path
          d={areaData}
          fill="url(#priceGradient)"
        />
        
        {/* Main price line */}
        <path
          d={pathData}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          filter="url(#glow)"
        />
        
        {/* Interactive data points */}
        {chartData.map((d, i) => (
          <g key={i}>
            <circle
              cx={xScale(i)}
              cy={yScale(d.price)}
              r="4"
              fill="var(--accent)"
              className="data-point"
              style={{ cursor: 'pointer' }}
            />
            <circle
              cx={xScale(i)}
              cy={yScale(d.price)}
              r="8"
              fill="transparent"
              className="data-point-hover"
              style={{ cursor: 'pointer' }}
            />
          </g>
        ))}
      </>
    );
  };

  return (
    <AuthGuard>
      <div className="dashboard-container">
      <PageHeader title="Pool" />

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Welcome Section */}
          <section className="welcome-section">
            <h2 className="welcome-title">
              Welcome back, {user?.username || "User"}!
            </h2>
            <p className="welcome-subtitle">
              Track World Chain liquidity and trading activity
            </p>
          </section>

          {/* WLD Hero Section */}
          <section className="wld-hero">
            <div className="hero-header">
              <div className="hero-title">
                <div className="wld-logo">
                  <div className="wld-icon">
                    <Image src="/wld.png" alt="Worldcoin" width={28} height={28} />
                  </div>
                  <div className="wld-info">
                    <h2>Worldcoin</h2>
                    <span className="wld-symbol">WLD</span>
                  </div>
                </div>
                <button 
                  className={`refresh-button-small ${metricsLoading ? 'loading' : ''}`}
                  onClick={loadMetrics}
                  disabled={metricsLoading}
                  title={metricsLoading ? 'Refreshing...' : 'Refresh data'}
                >
                  <FaSync className={metricsLoading ? 'spinning' : ''} style={{ 
                    animation: metricsLoading ? 'spin 1s linear infinite' : 'none',
                    transformOrigin: 'center'
                  }} />
                </button>
              </div>
              
              {metrics && (
                <div className="hero-price">
                  <div className="current-price">
                    <span className="price-value">${metrics.wld.price.toFixed(4)}</span>
                    <div className={`price-change-large ${metrics.wld.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                      {formatPercentage(metrics.wld.priceChange24h)}
                    </div>
                  </div>
                  <div className="price-subtitle">
                    <span>7d: {formatPercentage(metrics.wld.priceChange7d)}</span>
                    <span>•</span>
                    <span>Updated {metrics.wld.lastUpdated.toLocaleTimeString()}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Market Stats Grid */}
          {metrics && (
            <section className="market-stats">
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-header">
                    <span className="stat-icon">📊</span>
                    <span className="stat-label">Market Cap</span>
                  </div>
                  <div className="stat-value">{formatUSD(metrics.wld.marketCap)}</div>
                  <div className="stat-rank">#{metrics.wld.marketCapRank} ranking</div>
                </div>

                <div className="stat-card secondary">
                  <div className="stat-header">
                    <span className="stat-icon">📈</span>
                    <span className="stat-label">24h Volume</span>
                  </div>
                  <div className="stat-value">{formatUSD(metrics.wld.volume24h)}</div>
                  <div className="stat-rank">#{metrics.wld.volumeRank} ranking</div>
                </div>

              </div>
            </section>
          )}

          {/* Interactive Chart Section */}
          {metrics && (
            <section className="chart-section">
              <div className="chart-header">
                <h3>Price Performance</h3>
                <div className="chart-controls">
                  <button className="timeframe-btn active">7D</button>
                </div>
              </div>
              
              <div className="interactive-chart">
                <div className="chart-container">
                  <svg className="price-chart" viewBox="0 0 400 200">
                    {renderInteractiveChart(metrics.chartData)}
                  </svg>
                  <div className="chart-overlay">
                    <div className="chart-tooltip" id="chart-tooltip">
                      <div className="tooltip-price">$0.00</div>
                      <div className="tooltip-date">Date</div>
                    </div>
                  </div>
                </div>
                
                <div className="chart-stats">
                  <div className="chart-stat">
                    <span className="stat-label">7d High</span>
                    <span className="stat-value">${Math.max(...metrics.chartData.map(d => d.price)).toFixed(4)}</span>
                  </div>
                  <div className="chart-stat">
                    <span className="stat-label">7d Low</span>
                    <span className="stat-value">${Math.min(...metrics.chartData.map(d => d.price)).toFixed(4)}</span>
                  </div>
                  <div className="chart-stat">
                    <span className="stat-label">7d Change</span>
                    <span className={`stat-value ${metrics.wld.priceChange7d >= 0 ? 'positive' : 'negative'}`}>
                      {formatPercentage(metrics.wld.priceChange7d)}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Loading and Error States */}
          {metricsLoading && (
            <div className="metrics-loading">
              <div className="loading-spinner"></div>
              <p>Loading WLD data...</p>
            </div>
          )}

          {!metrics && !metricsLoading && (
            <div className="metrics-error">
              <p>Failed to load WLD data</p>
              <button onClick={loadMetrics}>Try Again</button>
            </div>
          )}
        </div>
      </main>

      <Navigation />
      </div>
    </AuthGuard>
  );
}
