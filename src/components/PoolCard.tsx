"use client";

import Image from "next/image";
import { PoolData } from "@/services/poolService";

interface PoolCardProps {
  pool: PoolData;
  onClick?: (pool: PoolData) => void;
}

export const PoolCard = ({ pool, onClick }: PoolCardProps) => {
  const formatNumber = (num: string | number, decimals: number = 2) => {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(decimals)}`;
  };

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const getTokenIcon = (symbol: string) => {
    const iconMap: { [key: string]: string } = {
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
    return iconMap[symbol] || '/eth.png'; // Default to ETH image
  };

  const handleClick = () => {
    if (onClick) {
      onClick(pool);
    }
  };

  return (
    <div className="pool-card" onClick={handleClick}>
      <div className="pool-header">
        <div className="token-pair">
          <div className="token-icons">
            <span className="token-icon">
              {getTokenIcon(pool.token0.symbol).startsWith('/') ? (
                <Image src={getTokenIcon(pool.token0.symbol)} alt={pool.token0.symbol} width={24} height={24} />
              ) : (
                getTokenIcon(pool.token0.symbol)
              )}
            </span>
            <span className="token-icon">
              {getTokenIcon(pool.token1.symbol).startsWith('/') ? (
                <Image src={getTokenIcon(pool.token1.symbol)} alt={pool.token1.symbol} width={24} height={24} />
              ) : (
                getTokenIcon(pool.token1.symbol)
              )}
            </span>
          </div>
          <div className="token-names">
            <span className="token-symbol">{pool.token0.symbol}</span>
            <span className="token-separator">/</span>
            <span className="token-symbol">{pool.token1.symbol}</span>
          </div>
        </div>
        <div className="pool-fee">
          <span className="fee-badge">{(pool.fee / 10000).toFixed(2)}%</span>
        </div>
      </div>

      <div className="pool-metrics">
        <div className="metric-row">
          <div className="metric">
            <span className="metric-label">TVL</span>
            <span className="metric-value">{formatNumber(pool.tvlUSD)}</span>
            <span className={`metric-change ${pool.tvlUSDChange >= 0 ? 'positive' : 'negative'}`}>
              {formatPercentage(pool.tvlUSDChange)}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">APR</span>
            <span className="metric-value">{pool.apr.toFixed(2)}%</span>
            <span className={`metric-change ${pool.aprChange >= 0 ? 'positive' : 'negative'}`}>
              {formatPercentage(pool.aprChange)}
            </span>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric">
            <span className="metric-label">24h Volume</span>
            <span className="metric-value">{formatNumber(pool.volumeUSD)}</span>
            <span className={`metric-change ${pool.volumeUSDChange >= 0 ? 'positive' : 'negative'}`}>
              {formatPercentage(pool.volumeUSDChange)}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Fees</span>
            <span className="metric-value">{formatNumber(pool.feesUSD)}</span>
            <span className={`metric-change ${pool.feesUSDChange >= 0 ? 'positive' : 'negative'}`}>
              {formatPercentage(pool.feesUSDChange)}
            </span>
          </div>
        </div>
      </div>

      <div className="pool-footer">
        <div className="liquidity-providers">
          <span className="provider-count">{pool.liquidityProviderCount} providers</span>
        </div>
        <div className="pool-actions">
          <button className="action-button secondary" onMouseDown={(e) => e.preventDefault()}>View</button>
          <button className="action-button primary" onMouseDown={(e) => e.preventDefault()}>Add Liquidity</button>
        </div>
      </div>
    </div>
  );
};
