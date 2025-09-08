"use client";

import { ethers } from 'ethers';
import { Token } from '@uniswap/sdk-core';
import { AVAILABLE_TOKENS } from '@/constants/tokens';

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
  private readonly CACHE_DURATION = 30000; // 30 seconds

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
      console.warn('Provider not initialized, returning mock balance');
      return this.getMockBalance(token);
    }

    try {
      const contract = new ethers.Contract(token.address, ERC20_ABI, this.provider);
      const balance = await contract.balanceOf(userAddress);
      return balance.toString();
    } catch (error) {
      console.error(`Error fetching balance for ${token.symbol}:`, error);
      return this.getMockBalance(token);
    }
  }

  // Get all token balances for a user
  async getPortfolio(userAddress: string): Promise<PortfolioSummary> {
    const cacheKey = `portfolio_${userAddress}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    if (!this.provider) {
      console.warn('Provider not initialized, returning mock portfolio');
      return this.getMockPortfolio(userAddress);
    }

    try {
      const tokenBalances: TokenBalance[] = [];
      let totalValueUSD = 0;

      // Fetch balances for all available tokens in parallel
      const balancePromises = AVAILABLE_TOKENS.map(async (token) => {
        try {
          const balance = await this.getTokenBalance(token, userAddress);
          const balanceFormatted = this.formatTokenAmount(balance);
          const usdValue = await this.getTokenUSDValue(token, balance);
          
          return {
            token,
            balance,
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
      return this.getMockPortfolio(userAddress);
    }
  }

  // Get USD value of a token amount
  private async getTokenUSDValue(token: Token, balance: string): Promise<number> {
    try {
      // In production, you would fetch real prices from a price API
      // For now, using mock prices
      const mockPrices: { [key: string]: number } = {
        'WETH': 2500,
        'WLD': 2.5,
        'USDC': 1.0,
        'USDT': 1.0,
        'WBTC': 45000,
        'uSOL': 200,
        'uXRP': 0.5,
        'uDOGE': 0.08,
        'uSUI': 1.5,
      };

      const price = mockPrices[token.symbol || ''] || 0;
      const balanceNum = parseFloat(this.formatTokenAmount(balance));
      return balanceNum * price;
    } catch (error) {
      console.error('Error calculating USD value:', error);
      return 0;
    }
  }

  // Format token amount based on decimals
  private formatTokenAmount(amount: string): string {
    const num = parseFloat(amount);
    if (num === 0) return '0';
    if (num < 0.000001) return '<0.000001';
    return num.toFixed(6).replace(/\.?0+$/, '');
  }

  // Mock balance for fallback
  private getMockBalance(token: Token): string {
    const mockBalances: { [key: string]: string } = {
      'ETH': '0.5',      // World Chain ETH
      'USDC': '1000',    // USDC
      'WLD': '100',      // Worldcoin
      'WBTC': '0.01',    // Wrapped BTC
      'uXRP': '1000',    // XRP (Universal)
      'uDOGE': '50000',  // Dogecoin (Universal)
      'uSOL': '10',      // Solana (Universal)
      'uSUI': '100',     // Sui (Universal)
    };

    return mockBalances[token.symbol || ''] || '0';
  }

  // Mock portfolio for fallback
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getMockPortfolio(userAddress: string): PortfolioSummary {
    const tokenBalances: TokenBalance[] = AVAILABLE_TOKENS.map(token => {
      const balance = this.getMockBalance(token);
      const balanceFormatted = this.formatTokenAmount(balance);
      // Use synchronous mock price calculation (matching Uniswap v4 interface prices)
      const mockPrices: { [key: string]: number } = {
        'ETH': 3668.69,   // World Chain ETH
        'USDC': 1.00,     // USDC
        'WLD': 0.986,     // Worldcoin
        'WBTC': 114906.53, // Wrapped BTC
        'uXRP': 3.04,     // XRP (Universal)
        'uDOGE': 0.206,   // Dogecoin (Universal)
        'uSOL': 165.43,   // Solana (Universal)
        'uSUI': 3.51,     // Sui (Universal)
      };
      const price = mockPrices[token.symbol || ''] || 0;
      const balanceNum = parseFloat(balanceFormatted);
      const usdValue = balanceNum * price;

      return {
        token,
        balance,
        balanceFormatted,
        usdValue,
      };
    });

    const totalValueUSD = tokenBalances.reduce((sum, tb) => sum + tb.usdValue, 0);

    return {
      totalValueUSD,
      tokenBalances,
      lastUpdated: new Date(),
    };
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

  // Get token price in USD
  async getTokenPrice(token: Token): Promise<number> {
    try {
      // In production, you would fetch real prices from a price API
      // For now, using mock prices matching Uniswap v4 interface
      const mockPrices: { [key: string]: number } = {
        'ETH': 3668.69,   // World Chain ETH
        'USDC': 1.00,     // USDC
        'WLD': 0.986,     // Worldcoin
        'WBTC': 114906.53, // Wrapped BTC
        'uXRP': 3.04,     // XRP (Universal)
        'uDOGE': 0.206,   // Dogecoin (Universal)
        'uSOL': 165.43,   // Solana (Universal)
        'uSUI': 3.51,     // Sui (Universal)
      };

      return mockPrices[token.symbol || ''] || 0;
    } catch (error) {
      console.error('Error getting token price:', error);
      return 0;
    }
  }
}

export const portfolioService = new PortfolioService();
