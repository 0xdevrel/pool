"use client";

import { useState, useEffect } from "react";
import { Token } from "@uniswap/sdk-core";
import { TokenSelector } from "./TokenSelector";
import { portfolioService } from "@/services/portfolioService";

interface SwapInputProps {
  label: string;
  token: Token | null;
  amount: string;
  onTokenChange: (token: Token) => void;
  onAmountChange: (amount: string) => void;
  disabled?: boolean;
  className?: string;
  userAddress?: string;
}

export const SwapInput = ({
  label,
  token,
  amount,
  onTokenChange,
  onAmountChange,
  disabled = false,
  className = "",
  userAddress
}: SwapInputProps) => {
  const [usdValue, setUsdValue] = useState<string>("$0");
  const [balance, setBalance] = useState<string>("0");

  useEffect(() => {
    const updateUsdValue = async () => {
      if (token && amount && parseFloat(amount) > 0) {
        try {
          const price = await portfolioService.getTokenPrice(token);
          const value = parseFloat(amount) * price;
          setUsdValue(`$${value.toFixed(2)}`);
        } catch (error) {
          console.error('Error fetching token price:', error);
          setUsdValue("$0");
        }
      } else {
        setUsdValue("$0");
      }
    };

    updateUsdValue();
  }, [token, amount]);

  useEffect(() => {
    const updateBalance = async () => {
      if (token && userAddress) {
        try {
          const tokenBalance = await portfolioService.getTokenBalance(token, userAddress);
          setBalance(tokenBalance);
        } catch (error) {
          console.error('Error fetching token balance:', error);
          setBalance("0");
        }
      } else {
        setBalance("0");
      }
    };

    updateBalance();
  }, [token, userAddress]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onAmountChange(value);
    }
  };

  const handleMaxClick = () => {
    if (token && parseFloat(balance) > 0) {
      onAmountChange(balance);
    }
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.000001) return '<0.000001';
    return num.toFixed(6).replace(/\.?0+$/, '');
  };

  return (
    <div className={`swap-input ${className}`}>
      <div className="input-label">
        <span>{label}</span>
        {token && parseFloat(balance) > 0 && (
          <button 
            className="max-button"
            onClick={handleMaxClick}
            disabled={disabled}
          >
            MAX
          </button>
        )}
      </div>
      
      <div className="input-container">
        <div className="amount-section">
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            className="amount-input"
            disabled={disabled}
          />
          <div className="usd-value">{usdValue}</div>
        </div>
        
        <div className="token-section">
          <TokenSelector
            selectedToken={token}
            onTokenSelect={onTokenChange}
            disabled={disabled}
            userAddress={userAddress}
          />
          {token && (
            <div className="token-balance">
              Balance: {formatBalance(balance)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
