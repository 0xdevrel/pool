"use client";

import { useState } from "react";
import { Token } from "@uniswap/sdk-core";
import { SwapInput } from "./SwapInput";
import { swapService } from "@/services/swapService";
import { AVAILABLE_TOKENS } from "@/constants/tokens";
import { FaExchangeAlt, FaCalendarAlt } from "react-icons/fa";

interface LimitOrderInterfaceProps {
  className?: string;
  userAddress?: string;
}

export const LimitOrderInterface = ({ className = "", userAddress }: LimitOrderInterfaceProps) => {
  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState<string>("");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [expiry, setExpiry] = useState<number>(7); // days
  const [creating, setCreating] = useState(false);

  const expiryOptions = [
    { label: "1 day", value: 1 },
    { label: "1 week", value: 7 },
    { label: "1 month", value: 30 },
    { label: "1 year", value: 365 }
  ];

  const priceSuggestions = [
    { label: "Market", value: 0 },
    { label: "+1%", value: 1.01 },
    { label: "+5%", value: 1.05 },
    { label: "+10%", value: 1.10 }
  ];

  const popularPairs = [
    { tokenIn: AVAILABLE_TOKENS[0], tokenOut: AVAILABLE_TOKENS[1] }, // ETH/USDC
    { tokenIn: AVAILABLE_TOKENS[0], tokenOut: AVAILABLE_TOKENS[2] }, // ETH/WLD
    { tokenIn: AVAILABLE_TOKENS[1], tokenOut: AVAILABLE_TOKENS[2] }, // USDC/WLD
  ];

  const handlePairSelect = (pair: { tokenIn: Token; tokenOut: Token }) => {
    setTokenIn(pair.tokenIn);
    setTokenOut(pair.tokenOut);
  };

  const handleSwapTokens = () => {
    const tempToken = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(tempToken);
  };

  const handleCreateLimitOrder = async () => {
    if (!tokenIn || !tokenOut || !amountIn || !limitPrice) return;

    setCreating(true);
    try {
      const orderId = await swapService.createLimitOrder({
        tokenIn,
        tokenOut,
        amountIn,
        limitPrice,
        expiry: Math.floor(Date.now() / 1000) + (expiry * 24 * 60 * 60),
      });

      alert(`Limit order created successfully! Order ID: ${orderId}`);
      
      // Reset form
      setAmountIn("");
      setLimitPrice("");
    } catch (error) {
      console.error('Error creating limit order:', error);
      alert('Failed to create limit order. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const canCreateOrder = tokenIn && tokenOut && amountIn && parseFloat(amountIn) > 0 && limitPrice && parseFloat(limitPrice) > 0;

  return (
    <div className={`limit-order-interface ${className}`}>
      <div className="limit-order-header">
        <h2>Limit Order</h2>
        <p>Set a specific price for your trade</p>
      </div>

      {!tokenIn || !tokenOut ? (
        <div className="popular-pairs">
          <h3>Popular Pairs</h3>
          <div className="pair-buttons">
            {popularPairs.map((pair, index) => (
              <button
                key={index}
                className="pair-button"
                onClick={() => handlePairSelect(pair)}
              >
                <span className="pair-tokens">
                  {pair.tokenIn.symbol}/{pair.tokenOut.symbol}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="limit-order-inputs">
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

        <div className="limit-price-input">
          <div className="input-label">
            <span>Limit Price</span>
          </div>
          <div className="input-container">
            <div className="amount-section">
              <input
                type="text"
                value={limitPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setLimitPrice(value);
                  }
                }}
                placeholder="0"
                className="amount-input"
              />
              <div className="price-unit">
                {tokenOut?.symbol} per {tokenIn?.symbol}
              </div>
            </div>
          </div>
          {tokenIn && tokenOut && (
            <div className="price-suggestions">
              {priceSuggestions.map((suggestion) => (
                <button
                  key={suggestion.label}
                  className={`price-suggestion-button ${limitPrice === suggestion.value.toString() ? 'active' : ''}`}
                  onClick={() => {
                    if (suggestion.value === 0) {
                      // Market price - you could fetch current price here
                      setLimitPrice("0");
                    } else {
                      // Apply percentage to current market price
                      // For now, just set the multiplier
                      setLimitPrice(suggestion.value.toString());
                    }
                  }}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="limit-order-settings">
        <div className="expiry-section">
          <div className="expiry-label">
            <FaCalendarAlt className="setting-icon" />
            <span>Expiry</span>
          </div>
          <div className="expiry-buttons">
            {expiryOptions.map((option) => (
              <button
                key={option.value}
                className={`expiry-button ${expiry === option.value ? 'active' : ''}`}
                onClick={() => setExpiry(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tokenIn && tokenOut && amountIn && limitPrice && (
        <div className="limit-order-details">
          <div className="detail-row">
            <span>Order Type</span>
            <span>Sell {amountIn} {tokenIn.symbol} at {limitPrice} {tokenOut.symbol} per {tokenIn.symbol}</span>
          </div>
          <div className="detail-row">
            <span>Expected Output</span>
            <span>{(parseFloat(amountIn) * parseFloat(limitPrice)).toFixed(6)} {tokenOut.symbol}</span>
          </div>
          <div className="detail-row">
            <span>Expires</span>
            <span>{expiry} days from now</span>
          </div>
        </div>
      )}

      <div className="limit-order-actions">
        <button
          className={`limit-order-button ${canCreateOrder ? 'enabled' : 'disabled'}`}
          onClick={handleCreateLimitOrder}
          disabled={!canCreateOrder || creating}
        >
          {creating ? (
            <div className="loading-content">
              <div className="loading-spinner small"></div>
              <span>Creating order...</span>
            </div>
          ) : !tokenIn || !tokenOut ? (
            "Select tokens"
          ) : !amountIn || parseFloat(amountIn) <= 0 ? (
            "Enter amount"
          ) : !limitPrice || parseFloat(limitPrice) <= 0 ? (
            "Enter limit price"
          ) : (
            "Create Limit Order"
          )}
        </button>
      </div>
    </div>
  );
};
