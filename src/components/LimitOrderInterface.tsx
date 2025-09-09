"use client";

import { useState, useEffect, useCallback } from "react";
import { Token } from "@uniswap/sdk-core";
import { SwapInput } from "./SwapInput";
import { limitOrderService, LimitOrder } from "@/services/limitOrderService";
import { quoterService } from "@/services/quoterService";
import { AVAILABLE_TOKENS } from "@/constants/tokens";
import { FaExchangeAlt, FaCalendarAlt, FaTimes } from "react-icons/fa";

interface LimitOrderInterfaceProps {
  className?: string;
  userAddress?: string;
}

export const LimitOrderInterface = ({ className = "", userAddress }: LimitOrderInterfaceProps) => {
  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState<string>("");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [expiry, setExpiry] = useState<string>('1week'); // days
  const [creating, setCreating] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [orders, setOrders] = useState<LimitOrder[]>([]);
  const [priceType, setPriceType] = useState<'market' | '+1%' | '+5%' | '+10%' | 'custom'>('+10%');

  const expiryOptions = [
    { label: "1 day", value: "1day" },
    { label: "1 week", value: "1week" },
    { label: "1 month", value: "1month" },
    { label: "1 year", value: "1year" }
  ];

  const priceSuggestions = [
    { label: "Market", value: "market" },
    { label: "+1%", value: "+1%" },
    { label: "+5%", value: "+5%" },
    { label: "+10%", value: "+10%" }
  ];

  const fetchCurrentPrice = useCallback(async () => {
    if (!tokenIn || !tokenOut) return;
    
    try {
      const price = await quoterService.getMarketPrice(tokenIn, tokenOut);
      setCurrentPrice(price);
      
      // Auto-calculate limit price based on selection
      if (priceType !== 'custom' && price > 0) {
        const multipliers = {
          'market': 1,
          '+1%': 1.01,
          '+5%': 1.05,
          '+10%': 1.10
        };
        setLimitPrice((price * multipliers[priceType]).toFixed(6));
      }
    } catch (error) {
      console.error('Failed to fetch price:', error);
      setCurrentPrice(null);
      alert(`Failed to fetch current price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [tokenIn, tokenOut, priceType]);

  // Load existing orders and fetch current price
  useEffect(() => {
    setOrders(limitOrderService.getOrders());
    fetchCurrentPrice();
  }, [tokenIn, tokenOut, fetchCurrentPrice]);

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
      const order = await limitOrderService.createLimitOrder({
        tokenIn,
        tokenOut,
        amountIn,
        targetPrice: parseFloat(limitPrice),
        priceType,
        expiry: (expiry as '1day' | '1week' | '1month' | '1year') || '1week'
      });

      alert(`Limit order created successfully! Order ID: ${order.id}`);
      
      // Update orders list
      setOrders(limitOrderService.getOrders());
      
      // Reset form
      setAmountIn("");
      setLimitPrice("");
    } catch (error) {
      console.error('Error creating limit order:', error);
      alert(`Failed to create limit order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (limitOrderService.cancelOrder(orderId)) {
      setOrders(limitOrderService.getOrders());
      alert('Order cancelled');
    }
  };

  const canCreateOrder = tokenIn && tokenOut && amountIn && parseFloat(amountIn) > 0 && limitPrice && parseFloat(limitPrice) > 0;

  return (
    <div className={`limit-order-interface ${className}`}>
      <div className="limit-order-header">
        <h2>Limit Order</h2>
        <p>Set a specific price for your trade</p>
      </div>

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
                  className={`price-suggestion-button ${priceType === suggestion.value ? 'active' : ''}`}
                  onClick={() => {
                    setPriceType(suggestion.value as 'market' | '+1%' | '+5%' | '+10%' | 'custom');
                    if (suggestion.value === 'market') {
                      setLimitPrice(currentPrice?.toString() || "0");
                    } else if (currentPrice && suggestion.value !== 'custom') {
                      const multipliers = {
                        'market': 1,
                        '+1%': 1.01,
                        '+5%': 1.05,
                        '+10%': 1.10
                      };
                      setLimitPrice((currentPrice * multipliers[suggestion.value as keyof typeof multipliers]).toFixed(6));
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
                onClick={() => setExpiry(option.value as '1day' | '1week' | '1month' | '1year')}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {currentPrice && tokenIn && tokenOut && (
        <div className="current-price-display">
          <span>Current Price: {currentPrice.toFixed(6)} {tokenOut.symbol} per {tokenIn.symbol}</span>
        </div>
      )}

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
            <span>{expiryOptions.find(opt => opt.value === expiry)?.label || '1 week'} from now</span>
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

      {/* Active Orders */}
      {orders.filter(o => o.status === 'pending').length > 0 && (
        <div className="active-orders">
          <h3>Active Orders</h3>
          <div className="orders-list">
            {orders.filter(o => o.status === 'pending').map(order => (
              <div key={order.id} className="order-card">
                <div className="order-info">
                  <div className="order-pair">{order.pair}</div>
                  <div className="order-details">
                    <span>Sell {parseFloat(order.amountIn).toFixed(4)} {order.tokenIn.symbol}</span>
                    <span>at {order.targetPrice.toFixed(6)} {order.tokenOut.symbol}</span>
                  </div>
                  <div className="order-expiry">
                    Expires: {new Date(order.expiry).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  className="cancel-order-button"
                  onClick={() => handleCancelOrder(order.id)}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
