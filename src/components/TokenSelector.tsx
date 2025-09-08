"use client";

import { useState, useEffect } from "react";
import { Token } from "@uniswap/sdk-core";
import { AVAILABLE_TOKENS, TOKEN_ICONS } from "@/constants/tokens";
import { portfolioService } from "@/services/portfolioService";

interface TokenSelectorProps {
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  disabled?: boolean;
  className?: string;
  userAddress?: string;
}

export const TokenSelector = ({ 
  selectedToken, 
  onTokenSelect, 
  disabled = false,
  className = "",
  userAddress
}: TokenSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tokenBalances, setTokenBalances] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadBalances = async () => {
      if (!userAddress) {
        // If no user address, use zero balances
        const balances: { [key: string]: string } = {};
        for (const token of AVAILABLE_TOKENS) {
          balances[token.address] = "0";
        }
        setTokenBalances(balances);
        return;
      }

      const balances: { [key: string]: string } = {};
      for (const token of AVAILABLE_TOKENS) {
        try {
          const balance = await portfolioService.getTokenBalance(token, userAddress);
          balances[token.address] = balance;
        } catch (error) {
          console.error(`Error loading balance for ${token.symbol}:`, error);
          balances[token.address] = "0";
        }
      }
      setTokenBalances(balances);
    };
    loadBalances();
  }, [userAddress]);

  const filteredTokens = AVAILABLE_TOKENS.filter(token =>
    token.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    setIsOpen(false);
    setSearchTerm("");
  };

  const getTokenIcon = (symbol: string) => {
    return TOKEN_ICONS[symbol] || '🪙';
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.000001) return '<0.000001';
    
    // For very small amounts, show more precision
    if (num < 0.01) {
      return num.toFixed(8).replace(/\.?0+$/, '');
    }
    // For larger amounts, show up to 6 decimal places
    return num.toFixed(6).replace(/\.?0+$/, '');
  };

  return (
    <div className={`token-selector ${className}`}>
      <button
        className={`token-selector-button ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        {selectedToken ? (
          <div className="selected-token">
            <span className="token-icon">{getTokenIcon(selectedToken.symbol || '')}</span>
            <div className="token-info">
              <span className="token-symbol">{selectedToken.symbol}</span>
              <span className="token-name">{selectedToken.name}</span>
            </div>
            <span className="dropdown-arrow">▼</span>
          </div>
        ) : (
          <div className="no-token-selected">
            <span className="placeholder-text">Select token</span>
            <span className="dropdown-arrow">▼</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="token-selector-modal">
          <div className="modal-overlay" onClick={() => setIsOpen(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select Token</h3>
              <button 
                className="close-button"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                autoFocus
              />
            </div>

            <div className="token-list">
              {filteredTokens.map((token) => (
                <button
                  key={`${token.address}-${token.symbol}`}
                  className="token-option"
                  onClick={() => handleTokenSelect(token)}
                >
                  <div className="token-option-content">
                    <span className="token-icon">{getTokenIcon(token.symbol || '')}</span>
                    <div className="token-details">
                      <div className="token-symbol">{token.symbol}</div>
                      <div className="token-name">{token.name}</div>
                    </div>
                    <div className="token-balance">
                      {formatBalance(tokenBalances[token.address] || '0')}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredTokens.length === 0 && (
              <div className="no-tokens-found">
                <p>No tokens found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
