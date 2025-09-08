"use client";

import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { portfolioService, PortfolioSummary } from "@/services/portfolioService";
import { FaSync, FaWallet, FaChartLine } from "react-icons/fa";

interface User {
  walletAddress: string;
  username?: string;
  profilePictureUrl?: string;
}

export default function PortfolioPage() {
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolio = useCallback(async () => {
    if (!user?.walletAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const portfolioData = await portfolioService.getPortfolio(user.walletAddress);
      setPortfolio(portfolioData);
    } catch (err) {
      setError('Failed to load portfolio data');
      console.error('Error loading portfolio:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.walletAddress]);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('pool_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    if (user?.walletAddress) {
      loadPortfolio();
    }
  }, [user, loadPortfolio]);

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatTokenAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (num === 0) return '0';
    if (num < 0.000001) return '<0.000001';
    return num.toFixed(6).replace(/\.?0+$/, '');
  };

  const getTokenIcon = (symbol: string) => {
    const icons: { [key: string]: string } = {
      'WETH': '🔷',
      'WLD': '🌍',
      'USDC': '💵',
      'USDT': '💵',
      'WBTC': '₿',
      'uSOL': '☀️',
      'uXRP': '💎',
      'uDOGE': '🐕',
      'uSUI': '💧',
    };
    return icons[symbol] || '🪙';
  };

  if (!user) {
    return (
      <div className="portfolio-page">
        <div className="page-header">
          <h1>Portfolio</h1>
          <p>Please log in to view your portfolio</p>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="portfolio-page">
      <div className="page-header">
        <h1>Portfolio</h1>
        <p>Your token holdings on World Chain</p>
        <button 
          className="refresh-button"
          onClick={loadPortfolio}
          disabled={loading}
        >
          <FaSync className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>
      
      <div className="page-content">
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading portfolio...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadPortfolio}>Try Again</button>
          </div>
        )}

        {portfolio && !loading && (
          <>
            {/* Portfolio Summary */}
            <div className="portfolio-summary">
              <div className="summary-card">
                <div className="summary-icon">
                  <FaWallet />
                </div>
                <div className="summary-content">
                  <h3>Total Portfolio Value</h3>
                  <p className="total-value">{formatUSD(portfolio.totalValueUSD)}</p>
                  <span className="last-updated">
                    Last updated: {portfolio.lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Token Holdings */}
            <div className="token-holdings">
              <h2>Token Holdings</h2>
              <div className="holdings-list">
                {portfolio.tokenBalances
                  .filter(tokenBalance => parseFloat(tokenBalance.balance) > 0)
                  .sort((a, b) => b.usdValue - a.usdValue)
                  .map((tokenBalance) => (
                    <div key={`${tokenBalance.token.address}-${tokenBalance.token.symbol}`} className="holding-card">
                      <div className="token-info">
                        <span className="token-icon">
                          {getTokenIcon(tokenBalance.token.symbol || '')}
                        </span>
                        <div className="token-details">
                          <h4>{tokenBalance.token.symbol}</h4>
                          <p>{tokenBalance.token.name}</p>
                        </div>
                      </div>
                      <div className="token-balance">
                        <p className="balance-amount">
                          {formatTokenAmount(tokenBalance.balance)}
                        </p>
                        <p className="balance-usd">
                          {formatUSD(tokenBalance.usdValue)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              {portfolio.tokenBalances.filter(tb => parseFloat(tb.balance) > 0).length === 0 && (
                <div className="empty-state">
                  <FaChartLine className="empty-icon" />
                  <h3>No Holdings</h3>
                  <p>You don&apos;t have any token holdings yet.</p>
                  <p>Start by swapping tokens or adding liquidity to pools.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      <Navigation />
    </div>
  );
}