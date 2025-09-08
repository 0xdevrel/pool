"use client";

import { useState, useEffect } from "react";
import { Token } from "@uniswap/sdk-core";
import { SwapInput } from "./SwapInput";
import { swapService, SwapQuote } from "@/services/swapService";
import { FaExchangeAlt, FaCog, FaInfoCircle } from "react-icons/fa";

interface SwapInterfaceProps {
  className?: string;
  userAddress?: string;
}

export const SwapInterface = ({ className = "", userAddress }: SwapInterfaceProps) => {
  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState<string>("");
  const [amountOut, setAmountOut] = useState<string>("");
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);
  const [deadline, setDeadline] = useState(30);

  // Auto-fetch quote when inputs change
  useEffect(() => {
    const fetchQuote = async () => {
      if (tokenIn && tokenOut && amountIn && parseFloat(amountIn) > 0) {
        setLoading(true);
        try {
          const newQuote = await swapService.getQuote({
            tokenIn,
            tokenOut,
            amountIn,
            slippageTolerance,
            deadline: Math.floor(Date.now() / 1000) + (deadline * 60),
          });
          setQuote(newQuote);
          setAmountOut(newQuote.amountOut);
        } catch (error) {
          console.error('Error fetching quote:', error);
          setQuote(null);
          setAmountOut("");
        } finally {
          setLoading(false);
        }
      } else {
        setQuote(null);
        setAmountOut("");
      }
    };

    const debounceTimer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounceTimer);
  }, [tokenIn, tokenOut, amountIn, slippageTolerance, deadline]);

  const handleSwapTokens = () => {
    const tempToken = tokenIn;
    const tempAmount = amountIn;
    
    setTokenIn(tokenOut);
    setTokenOut(tempToken);
    setAmountIn(amountOut);
    setAmountOut(tempAmount);
  };

  const handleSwap = async () => {
    if (!tokenIn || !tokenOut || !amountIn || !quote) return;

    setSwapping(true);
    try {
      const txHash = await swapService.executeSwap({
        tokenIn,
        tokenOut,
        amountIn,
        slippageTolerance,
        deadline: Math.floor(Date.now() / 1000) + (deadline * 60),
      }, quote);

      // Show success message
      alert(`Swap successful! Transaction hash: ${txHash}`);
      
      // Reset form
      setAmountIn("");
      setAmountOut("");
      setQuote(null);
    } catch (error) {
      console.error('Error executing swap:', error);
      alert('Swap failed. Please try again.');
    } finally {
      setSwapping(false);
    }
  };

  const canSwap = tokenIn && tokenOut && amountIn && parseFloat(amountIn) > 0 && quote && !loading;

  return (
    <div className={`swap-interface ${className}`}>
      <div className="swap-header">
        <h2>Swap</h2>
        <button 
          className="settings-button"
          onClick={() => setShowSettings(!showSettings)}
        >
          <FaCog />
        </button>
      </div>

      {showSettings && (
        <div className="swap-settings">
          <div className="setting-item">
            <label>
              <span>Max slippage</span>
              <FaInfoCircle className="info-icon" />
            </label>
            <div className="slippage-controls">
              <button 
                className={`slippage-button ${slippageTolerance === 0.1 ? 'active' : ''}`}
                onClick={() => setSlippageTolerance(0.1)}
              >
                Auto
              </button>
              <input
                type="number"
                value={slippageTolerance}
                onChange={(e) => setSlippageTolerance(parseFloat(e.target.value) || 0)}
                className="slippage-input"
                step="0.1"
                min="0"
                max="50"
              />
              <span className="slippage-unit">%</span>
            </div>
          </div>

          <div className="setting-item">
            <label>
              <span>Swap deadline</span>
              <FaInfoCircle className="info-icon" />
            </label>
            <div className="deadline-controls">
              <input
                type="number"
                value={deadline}
                onChange={(e) => setDeadline(parseInt(e.target.value) || 30)}
                className="deadline-input"
                min="1"
                max="4320"
              />
              <span className="deadline-unit">minutes</span>
            </div>
          </div>
        </div>
      )}

      <div className="swap-inputs">
        <SwapInput
          label="Sell"
          token={tokenIn}
          amount={amountIn}
          onTokenChange={setTokenIn}
          onAmountChange={setAmountIn}
          userAddress={userAddress}
        />

        <div className="swap-arrow-container">
          <button 
            className="swap-arrow-button"
            onClick={handleSwapTokens}
            disabled={!tokenIn || !tokenOut}
          >
            <FaExchangeAlt />
          </button>
        </div>

        <SwapInput
          label="Buy"
          token={tokenOut}
          amount={amountOut}
          onTokenChange={setTokenOut}
          onAmountChange={() => {}} // Read-only for output
          disabled={true}
          userAddress={userAddress}
        />
      </div>

      {quote && (
        <div className="swap-details">
          <div className="detail-row">
            <span>Rate</span>
            <span>1 {tokenIn?.symbol} = {(parseFloat(quote.amountOut) / (parseFloat(amountIn) || 1)).toFixed(6)} {tokenOut?.symbol}</span>
          </div>
          <div className="detail-row">
            <span>Price Impact</span>
            <span className={quote.priceImpact > 1 ? 'warning' : ''}>{quote.priceImpact.toFixed(2)}%</span>
          </div>
          <div className="detail-row">
            <span>Minimum Received</span>
            <span>{swapService.formatTokenAmount(quote.minimumReceived, tokenOut?.decimals || 18)} {tokenOut?.symbol}</span>
          </div>
          <div className="detail-row">
            <span>Fee</span>
            <span>{swapService.formatTokenAmount(quote.fee, tokenIn?.decimals || 18)} {tokenIn?.symbol}</span>
          </div>
        </div>
      )}

      <div className="swap-actions">
        <button
          className={`swap-button ${canSwap ? 'enabled' : 'disabled'}`}
          onClick={handleSwap}
          disabled={!canSwap || swapping}
        >
          {swapping ? (
            <div className="loading-content">
              <div className="loading-spinner small"></div>
              <span>Swapping...</span>
            </div>
          ) : loading ? (
            <div className="loading-content">
              <div className="loading-spinner small"></div>
              <span>Getting quote...</span>
            </div>
          ) : !tokenIn || !tokenOut ? (
            "Select tokens"
          ) : !amountIn || parseFloat(amountIn) <= 0 ? (
            "Enter an amount"
          ) : (
            "Swap"
          )}
        </button>
      </div>
    </div>
  );
};
