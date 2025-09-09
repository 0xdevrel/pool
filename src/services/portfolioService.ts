"use client";

import { ethers } from 'ethers';
import { Token } from '@uniswap/sdk-core';
import { AVAILABLE_TOKENS } from '@/constants/tokens';

interface PriceData {
  usd: number;
  last_updated: string;
}

// ERC20 ABI for balance checking
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

export interface TokenBalance {
  token: Token;
  balance: string;
  balanceFormatted: string;
  usdValue: number;
}

export interface PortfolioSummary {
  totalValueUSD: number;
  tokenBalances: TokenBalance[];
  lastUpdated: Date;
}

class PortfolioService {
  private provider: ethers.JsonRpcProvider | null = null;
  private cache: Map<string, { data: PortfolioSummary; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes to match price API cache
  private loadingPromises: Map<string, Promise<PortfolioSummary>> = new Map(); // Prevent multiple simultaneous calls

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    try {
      // Use environment variable for RPC URL
      const rpcUrl = process.env.NEXT_PUBLIC_WORLD_CHAIN_RPC_URL;
      
      if (!rpcUrl) {
        console.warn('NEXT_PUBLIC_WORLD_CHAIN_RPC_URL not found in environment variables');
        return;
      }
      
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      console.log('Portfolio service initialized with RPC:', rpcUrl);
    } catch (error) {
      console.error('Failed to initialize provider:', error);
    }
  }

  // Get token balance for a specific address
  async getTokenBalance(token: Token, userAddress: string): Promise<string> {
    if (!this.provider) {
      console.warn('Provider not initialized, returning zero balance');
      return '0';
    }

    try {
      const contract = new ethers.Contract(token.address, ERC20_ABI, this.provider);
      const balance = await contract.balanceOf(userAddress);
      
      // Convert from wei/smallest unit to human readable format using token decimals
      const formattedBalance = ethers.formatUnits(balance, token.decimals);
      return formattedBalance;
    } catch (error) {
      console.error(`Error fetching balance for ${token.symbol}:`, error);
      return '0';
    }
  }

  // Get all token balances for a user
  async getPortfolio(userAddress: string): Promise<PortfolioSummary> {
    const cacheKey = `portfolio_${userAddress}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    // Check if there's already a loading promise for this user
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    if (!this.provider) {
      console.warn('Provider not initialized, returning empty portfolio');
      return {
        totalValueUSD: 0,
        tokenBalances: [],
        lastUpdated: new Date(),
      };
    }

    // Create a loading promise to prevent multiple simultaneous calls
    const loadingPromise = this.fetchPortfolioData(userAddress, cacheKey);
    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;
      return result;
    } finally {
      // Clean up the loading promise
      this.loadingPromises.delete(cacheKey);
    }
  }

  private async fetchPortfolioData(userAddress: string, cacheKey: string): Promise<PortfolioSummary> {
    try {
      const tokenBalances: TokenBalance[] = [];
      let totalValueUSD = 0;

      // Fetch all prices at once for better performance
      const prices = await this.getTokenPrices(AVAILABLE_TOKENS);

      // Fetch balances for all available tokens in parallel
      const balancePromises = AVAILABLE_TOKENS.map(async (token) => {
        try {
          const balance = await this.getTokenBalance(token, userAddress);
          const balanceFormatted = this.formatTokenAmount(balance);
          
          // Use pre-fetched price data
          const price = prices[token.symbol || ''] || 0;
          const balanceNum = parseFloat(balance);
          const usdValue = balanceNum * price;
          
          return {
            token,
            balance: balanceFormatted, // Store the formatted balance
            balanceFormatted,
            usdValue,
          };
        } catch (error) {
          console.error(`Error processing token ${token.symbol}:`, error);
          return null;
        }
      });

      const results = await Promise.all(balancePromises);
      
      // Filter out null results and calculate total value
      results.forEach((result) => {
        if (result) {
          tokenBalances.push(result);
          totalValueUSD += result.usdValue;
        }
      });

      const portfolio: PortfolioSummary = {
        totalValueUSD,
        tokenBalances,
        lastUpdated: new Date(),
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: portfolio,
        timestamp: Date.now(),
      });

      return portfolio;
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      return {
        totalValueUSD: 0,
        tokenBalances: [],
        lastUpdated: new Date(),
      };
    }
  }

  // Get USD value of a token amount
  private async getTokenUSDValue(token: Token, balance: string): Promise<number> {
    try {
      const price = await this.getTokenPrice(token);
      const balanceNum = parseFloat(balance); // balance is already formatted
      return balanceNum * price;
    } catch (error) {
      console.error('Error calculating USD value:', error);
      return 0;
    }
  }

  // Format token amount for display (balance is already converted from wei)
  private formatTokenAmount(amount: string): string {
    const num = parseFloat(amount);
    if (num === 0) return '0';
    if (num < 0.000001) return '<0.000001';
    
    // For very small amounts, show more precision
    if (num < 0.01) {
      return num.toFixed(8).replace(/\.?0+$/, '');
    }
    // For larger amounts, show up to 6 decimal places
    return num.toFixed(6).replace(/\.?0+$/, '');
  }


  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get specific token balance with formatting
  async getFormattedTokenBalance(token: Token, userAddress: string): Promise<string> {
    const balance = await this.getTokenBalance(token, userAddress);
    return this.formatTokenAmount(balance);
  }

  // Get token price in USD from our price API
  async getTokenPrice(token: Token): Promise<number> {
    try {
      const response = await fetch(`/api/prices?tokens=${token.symbol}`);
      if (!response.ok) {
        console.warn(`Failed to fetch price for ${token.symbol}`);
        return 0;
      }
      
      const data = await response.json();
      if (data.success && data.prices && token.symbol && data.prices[token.symbol]) {
        return (data.prices[token.symbol] as PriceData).usd;
      }
      
      console.warn(`No price data found for ${token.symbol}`);
      return 0;
    } catch (error) {
      console.error('Error getting token price:', error);
      return 0;
    }
  }

  // Get multiple token prices at once for better performance
  async getTokenPrices(tokens: Token[]): Promise<{ [symbol: string]: number }> {
    try {
      const symbols = tokens.map(t => t.symbol).filter(Boolean);
      const response = await fetch(`/api/prices?tokens=${symbols.join(',')}`);
      if (!response.ok) {
        console.warn('Failed to fetch prices for multiple tokens');
        return {};
      }
      
      const data = await response.json();
      if (data.success && data.prices) {
        // Extract USD values from the API response
        const priceMap: { [symbol: string]: number } = {};
        for (const [symbol, priceData] of Object.entries(data.prices)) {
          if (typeof priceData === 'object' && priceData !== null && 'usd' in priceData) {
            priceMap[symbol] = (priceData as PriceData).usd;
          }
        }
        return priceMap;
      }
      
      return {};
    } catch (error) {
      console.error('Error getting token prices:', error);
      return {};
    }
  }
}

export const portfolioService = new PortfolioService();
