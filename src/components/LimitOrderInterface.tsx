"use client";

import { useState } from "react";
import { Token } from "@uniswap/sdk-core";
import { SwapInput } from "./SwapInput";
import { swapService } from "@/services/swapService";
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
        </div>
      </div>

      <div className="limit-order-settings">
        <div className="setting-item">
          <label>
            <FaCalendarAlt className="setting-icon" />
            <span>Order Expiry</span>
          </label>
          <div className="expiry-controls">
            <input
              type="number"
              value={expiry}
              onChange={(e) => setExpiry(parseInt(e.target.value) || 7)}
              className="expiry-input"
              min="1"
              max="30"
            />
            <span className="expiry-unit">days</span>
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
