import { ChainId } from '@uniswap/sdk-core';
import { WORLD_CHAIN_CONTRACTS } from '@/constants/tokens';

// World Chain configuration
export const WORLD_CHAIN_ID = 480 as ChainId;
export const WORLD_CHAIN_RPC = process.env.NEXT_PUBLIC_WORLD_CHAIN_RPC_URL || 'https://worldchain-mainnet.g.alchemy.com/v2/2CX9ldRg4gG7dvN8UGFskaJjdpqo39kN';

// Contract addresses for future real implementation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _contracts = WORLD_CHAIN_CONTRACTS;

// Pool data interface for World Chain liquidity pools
export interface PoolData {
  id: string;
  token0: {
    id: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  token1: {
    id: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  fee: number;
  liquidity: string;
  sqrtPrice: string;
  tick: number;
  feeGrowthGlobal0X128: string;
  feeGrowthGlobal1X128: string;
  protocolFee: number;
  tickSpacing: number;
  liquidityProviderCount: number;
  volumeUSD: string;
  volumeUSDChange: number;
  tvlUSD: string;
  tvlUSDChange: number;
  feesUSD: string;
  feesUSDChange: number;
  apr: number;
  aprChange: number;
  createdAtTimestamp: number;
  createdAtBlockNumber: number;
}

// Mock data for World Chain pools (based on the image data)
export const MOCK_WORLD_CHAIN_POOLS: PoolData[] = [
  {
    id: '0x1234567890abcdef1234567890abcdef12345678',
    token0: {
      id: '0x4200000000000000000000000000000000000006', // WETH
      symbol: 'ETH',
      name: 'World Chain ETH',
      decimals: 18,
    },
    token1: {
      id: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // WLD
      symbol: 'WLD',
      name: 'Worldcoin',
      decimals: 18,
    },
    fee: 3000, // 0.3%
    liquidity: '88400000000000000000',
    sqrtPrice: '1234567890123456789012345678901234567890',
    tick: 0,
    feeGrowthGlobal0X128: '0',
    feeGrowthGlobal1X128: '0',
    protocolFee: 0,
    tickSpacing: 60,
    liquidityProviderCount: 12,
    volumeUSD: '14900',
    volumeUSDChange: 15.2,
    tvlUSD: '88400',
    tvlUSDChange: 2.1,
    feesUSD: '44.7',
    feesUSDChange: 8.3,
    apr: 18.43,
    aprChange: 1.2,
    createdAtTimestamp: 1704067200,
    createdAtBlockNumber: 12345678,
  },
  {
    id: '0x2345678901bcdef1234567890abcdef1234567890',
    token0: {
      id: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // WLD
      symbol: 'WLD',
      name: 'Worldcoin',
      decimals: 18,
    },
    token1: {
      id: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    fee: 1400, // 0.14%
    liquidity: '10700000000000000000',
    sqrtPrice: '1234567890123456789012345678901234567890',
    tick: 0,
    feeGrowthGlobal0X128: '0',
    feeGrowthGlobal1X128: '0',
    protocolFee: 0,
    tickSpacing: 20,
    liquidityProviderCount: 8,
    volumeUSD: '17700',
    volumeUSDChange: 22.5,
    tvlUSD: '10700',
    tvlUSDChange: 5.8,
    feesUSD: '24.8',
    feesUSDChange: 12.1,
    apr: 84.92,
    aprChange: 3.4,
    createdAtTimestamp: 1704067200,
    createdAtBlockNumber: 12345679,
  },
  {
    id: '0x3456789012cdef1234567890abcdef1234567890',
    token0: {
      id: '0x4200000000000000000000000000000000000006', // WETH
      symbol: 'ETH',
      name: 'World Chain ETH',
      decimals: 18,
    },
    token1: {
      id: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDT
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
    fee: 500, // 0.05%
    liquidity: '3500000000000000000',
    sqrtPrice: '1234567890123456789012345678901234567890',
    tick: 0,
    feeGrowthGlobal0X128: '0',
    feeGrowthGlobal1X128: '0',
    protocolFee: 0,
    tickSpacing: 10,
    liquidityProviderCount: 5,
    volumeUSD: '362.82',
    volumeUSDChange: -8.2,
    tvlUSD: '3500',
    tvlUSDChange: 1.5,
    feesUSD: '0.18',
    feesUSDChange: -5.2,
    apr: 1.86,
    aprChange: 0.3,
    createdAtTimestamp: 1704067200,
    createdAtBlockNumber: 12345680,
  },
  {
    id: '0x4567890123def1234567890abcdef1234567890',
    token0: {
      id: '0x4200000000000000000000000000000000000006', // WETH
      symbol: 'ETH',
      name: 'World Chain ETH',
      decimals: 18,
    },
    token1: {
      id: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
      symbol: 'WBTC',
      name: 'Wrapped BTC',
      decimals: 8,
    },
    fee: 3000, // 0.3%
    liquidity: '395680000000000000',
    sqrtPrice: '1234567890123456789012345678901234567890',
    tick: 0,
    feeGrowthGlobal0X128: '0',
    feeGrowthGlobal1X128: '0',
    protocolFee: 0,
    tickSpacing: 60,
    liquidityProviderCount: 3,
    volumeUSD: '75.49',
    volumeUSDChange: 12.8,
    tvlUSD: '395.68',
    tvlUSDChange: 0.8,
    feesUSD: '0.23',
    feesUSDChange: 6.7,
    apr: 20.96,
    aprChange: 2.1,
    createdAtTimestamp: 1704067200,
    createdAtBlockNumber: 12345681,
  },
  {
    id: '0x5678901234ef1234567890abcdef1234567890',
    token0: {
      id: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // WLD
      symbol: 'WLD',
      name: 'Worldcoin',
      decimals: 18,
    },
    token1: {
      id: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // uSOL
      symbol: 'uSOL',
      name: 'Solana (Universal)',
      decimals: 9,
    },
    fee: 100, // 0.01%
    liquidity: '117040000000000000',
    sqrtPrice: '1234567890123456789012345678901234567890',
    tick: 0,
    feeGrowthGlobal0X128: '0',
    feeGrowthGlobal1X128: '0',
    protocolFee: 0,
    tickSpacing: 1,
    liquidityProviderCount: 2,
    volumeUSD: '219.25',
    volumeUSDChange: 18.5,
    tvlUSD: '117.04',
    tvlUSDChange: 3.2,
    feesUSD: '0.02',
    feesUSDChange: 9.1,
    apr: 6.84,
    aprChange: 1.8,
    createdAtTimestamp: 1704067200,
    createdAtBlockNumber: 12345682,
  },
];

// Service class for fetching pool data
export class PoolService {
  private static instance: PoolService;
  private cache: Map<string, PoolData[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): PoolService {
    if (!PoolService.instance) {
      PoolService.instance = new PoolService();
    }
    return PoolService.instance;
  }

  // Fetch pools for World Chain
  async fetchWorldChainPools(): Promise<PoolData[]> {
    const cacheKey = 'world-chain-v4-pools';
    const now = Date.now();

    // Check cache first
    if (this.cache.has(cacheKey) && this.cacheExpiry.get(cacheKey)! > now) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // For now, return mock data
      // In production, this would fetch from World Chain subgraph or direct contract calls
      const pools = MOCK_WORLD_CHAIN_POOLS;
      
      // Cache the results
      this.cache.set(cacheKey, pools);
      this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);
      
      return pools;
    } catch (error) {
      console.error('Error fetching World Chain pools:', error);
      // Return empty array on error
      return [];
    }
  }

  // Fetch pool by ID
  async fetchPoolById(poolId: string): Promise<PoolData | null> {
    const pools = await this.fetchWorldChainPools();
    return pools.find(pool => pool.id === poolId) || null;
  }

  // Get pools by token pair
  async fetchPoolsByTokenPair(token0Symbol: string, token1Symbol: string): Promise<PoolData[]> {
    const pools = await this.fetchWorldChainPools();
    return pools.filter(pool => 
      (pool.token0.symbol === token0Symbol && pool.token1.symbol === token1Symbol) ||
      (pool.token0.symbol === token1Symbol && pool.token1.symbol === token0Symbol)
    );
  }

  // Get top pools by TVL
  async fetchTopPoolsByTVL(limit: number = 10): Promise<PoolData[]> {
    const pools = await this.fetchWorldChainPools();
    return pools
      .sort((a, b) => parseFloat(b.tvlUSD) - parseFloat(a.tvlUSD))
      .slice(0, limit);
  }

  // Get pools by fee tier
  async fetchPoolsByFeeTier(fee: number): Promise<PoolData[]> {
    const pools = await this.fetchWorldChainPools();
    return pools.filter(pool => pool.fee === fee);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

// Export singleton instance
export const poolService = PoolService.getInstance();
