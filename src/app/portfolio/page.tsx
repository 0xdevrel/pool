"use client";

import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { portfolioService, PortfolioSummary } from "@/services/portfolioService";
import { FaSync, FaWallet, FaChartLine } from "react-icons/fa";
import { PageHeader } from "@/components/PageHeader";

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
    
    // For very small amounts, show more precision
    if (num < 0.01) {
      return num.toFixed(8).replace(/\.?0+$/, '');
    }
    // For larger amounts, show up to 6 decimal places
    return num.toFixed(6).replace(/\.?0+$/, '');
  };

  const getTokenIcon = (symbol: string) => {
    const icons: { [key: string]: string } = {
      'WETH': '/eth.png',
      'ETH': '/eth.png',
      'WLD': '/wld.png',
      'USDC': '/usdc.png',
      'USDT': '/usdt.png',
      'USD₮0': '/usdt.png',
      'WBTC': '/wbtc.png',
      'uSOL': '/solana.png',
      'uXRP': '/xrp.png',
      'uDOGE': '/doge.png',
      'uSUI': '💧', // No image available
    };
    return icons[symbol] || '/eth.png'; // Default to ETH image
  };

  if (!user) {
    return (
      <div className="portfolio-page">
        <PageHeader title="Portfolio" showAvatar={false} />
        <Navigation />
      </div>
    );
  }

  return (
    <div className="portfolio-page">
      <PageHeader title="Portfolio" />
      
      <div className="page-content">
        <div className="portfolio-header-actions">
          <button 
            className="refresh-button"
            onClick={loadPortfolio}
            disabled={loading}
          >
            <FaSync className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
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
          <div className="portfolio-content">
            {/* Portfolio Summary */}
            <section className="portfolio-summary">
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
            </section>

            {/* Token Holdings */}
            <section className="token-holdings">
              <div className="section-header">
                <h2 className="section-title">Token Holdings</h2>
                <span className="holdings-count">
                  {portfolio.tokenBalances.filter(tb => parseFloat(tb.balance) > 0).length} tokens
                </span>
              </div>
              
              <div className="holdings-grid">
                {portfolio.tokenBalances
                  .filter(tokenBalance => parseFloat(tokenBalance.balance) > 0)
                  .sort((a, b) => b.usdValue - a.usdValue)
                  .map((tokenBalance) => (
                    <div key={`${tokenBalance.token.address}-${tokenBalance.token.symbol}`} className="holding-card">
                      <div className="token-info">
                        <span className="token-icon">
                          {getTokenIcon(tokenBalance.token.symbol || '').startsWith('/') ? (
                            <img src={getTokenIcon(tokenBalance.token.symbol || '')} alt={tokenBalance.token.symbol || 'Token'} />
                          ) : (
                            getTokenIcon(tokenBalance.token.symbol || '')
                          )}
                        </span>
                        <div className="token-details">
                          <h4 className="token-symbol">{tokenBalance.token.symbol}</h4>
                          <p className="token-name">{tokenBalance.token.name}</p>
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
            </section>
          </div>
        )}
      </div>
      
      <Navigation />
    </div>
  );
}