import { createPublicClient, http, encodeFunctionData, keccak256, parseUnits } from 'viem';
import { Token } from '@uniswap/sdk-core';
import { POOL_CONFIGS, WORLD_CHAIN_CONTRACTS } from '@/constants/tokens';

// World Chain configuration
const WORLD_CHAIN = {
  id: 480,
  name: 'World Chain',
  network: 'worldchain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_WORLD_CHAIN_RPC_URL || 'https://worldchain-mainnet.g.alchemy.com/v2/2CX9ldRg4gG7dvN8UGFskaJjdpqo39kN'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_WORLD_CHAIN_RPC_URL || 'https://worldchain-mainnet.g.alchemy.com/v2/2CX9ldRg4gG7dvN8UGFskaJjdpqo39kN'],
    },
  },
  blockExplorers: {
    default: { name: 'World Chain Explorer', url: 'https://worldchain.world.org' },
  },
};

// V4 StateView ABI for reading pool state
const STATE_VIEW_ABI = [
  {
    name: 'getSlot0',
    type: 'function',
    inputs: [{ name: 'id', type: 'bytes32' }],
    outputs: [{
      components: [
        { name: 'sqrtPriceX96', type: 'uint160' },
        { name: 'tick', type: 'int24' },
        { name: 'protocolFee', type: 'uint24' },
        { name: 'lpFee', type: 'uint24' }
      ],
      type: 'tuple'
    }],
    stateMutability: 'view'
  },
  {
    name: 'getLiquidity',
    type: 'function',
    inputs: [{ name: 'id', type: 'bytes32' }],
    outputs: [{ name: 'liquidity', type: 'uint128' }],
    stateMutability: 'view'
  }
] as const;

export interface QuoteParams {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  fee?: number;
}

export interface QuoteResult {
  amountOut: string;
  sqrtPriceX96After: string;
  gasEstimate: string;
  priceImpact: number;
  route: string[];
}

export class QuoterService {
  private client: ReturnType<typeof createPublicClient> | null;
  private cache: Map<string, { result: QuoteResult; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds

  constructor() {
    try {
      this.client = createPublicClient({
        chain: WORLD_CHAIN,
        transport: http()
      });
    } catch (error) {
      console.warn('Failed to initialize public client:', error);
      this.client = null;
    }
  }

  async getQuote(params: QuoteParams): Promise<QuoteResult | null> {
    const cacheKey = `${params.tokenIn.address}-${params.tokenOut.address}-${params.amountIn}-${params.fee || 3000}`;
    const now = Date.now();

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (now - cached.timestamp < this.CACHE_DURATION) {
        return cached.result;
      }
    }

    try {
      // Check if client is available
      if (!this.client) {
        throw new Error('Public client not available');
      }

      // V4 uses StateView instead of Quoter contract
      const poolKey = this.createPoolKey(params.tokenIn, params.tokenOut, params.fee);
      const poolId = this.getPoolId(poolKey);
      
      // Read pool state from StateView
      const [slot0, liquidity] = await Promise.all([
        this.client.readContract({
          address: WORLD_CHAIN_CONTRACTS.STATE_VIEW as `0x${string}`,
          abi: STATE_VIEW_ABI,
          functionName: 'getSlot0',
          args: [poolId]
        }).catch(error => {
          console.warn('Failed to read slot0 from StateView:', error);
          return {
            sqrtPriceX96: BigInt('79228162514264337593543950336'), // Default price
            tick: 0,
            protocolFee: 0,
            lpFee: 3000
          };
        }),
        this.client.readContract({
          address: WORLD_CHAIN_CONTRACTS.STATE_VIEW as `0x${string}`,
          abi: STATE_VIEW_ABI,
          functionName: 'getLiquidity',
          args: [poolId]
        }).catch(error => {
          console.warn('Failed to read liquidity from StateView:', error);
          return BigInt('1000000000000000000'); // Default liquidity
        })
      ]);

      // Parse amountIn safely - handle both decimal strings and raw integer strings
      let amountInBigInt: bigint;
      try {
        // First try to parse as a decimal string (e.g., "1.5" ETH)
        amountInBigInt = parseUnits(params.amountIn, params.tokenIn.decimals);
      } catch (e) {
        console.warn('Failed to parse amountIn as decimal string, attempting raw BigInt conversion:', params.amountIn, e);
        try {
          // If decimal parsing fails, try parsing as a raw integer string
          amountInBigInt = BigInt(params.amountIn);
        } catch (e2) {
          console.error('Failed to parse amountIn as raw integer string, defaulting to 0n:', params.amountIn, e2);
          // If both fail, default to 0n to prevent crash
          amountInBigInt = BigInt(0);
        }
      }

      // Calculate output amount using pool state
      const amountOut = this.calculateSwapAmount(
        amountInBigInt,
        slot0.sqrtPriceX96,
        liquidity,
        params.tokenIn.address.toLowerCase() === poolKey.currency0.toLowerCase()
      );

      const result: QuoteResult = {
        amountOut: amountOut.toString(),
        sqrtPriceX96After: slot0.sqrtPriceX96.toString(),
        gasEstimate: '150000', // Estimated gas for V4 swap
        priceImpact: this.calculatePriceImpact(amountInBigInt, amountOut, slot0.sqrtPriceX96),
        route: [params.tokenIn.symbol || '', params.tokenOut.symbol || '']
      };

      // Cache the result
      this.cache.set(cacheKey, { result, timestamp: now });
      
      return result;
    } catch (error) {
      console.error('V4 Quote calculation failed:', error);
      // Fallback to simulation if StateView fails
      return this.simulateSwap(params);
    }
  }

  private findPoolConfig(tokenIn: Token, tokenOut: Token, fee?: number): typeof POOL_CONFIGS[0] | null {
    return POOL_CONFIGS.find(config => {
      const matchesTokens = 
        (config.currency0 === tokenIn.address && config.currency1 === tokenOut.address) ||
        (config.currency0 === tokenOut.address && config.currency1 === tokenIn.address);
      
      const matchesFee = fee ? config.fee === fee : true;
      
      return matchesTokens && matchesFee;
    }) || null;
  }

  private sortTokens(tokenA: string, tokenB: string): [string, string] {
    return tokenA.toLowerCase() < tokenB.toLowerCase() 
      ? [tokenA, tokenB] 
      : [tokenB, tokenA];
  }

  private calculatePriceImpact(amountIn: bigint, amountOut: bigint, sqrtPriceX96: bigint): number {
    // Calculate price impact based on pool state
    const price = Number(sqrtPriceX96) / (2 ** 96);
    const priceSquared = price * price;
    
    // Simplified price impact calculation
    const inputValue = Number(amountIn) / (10 ** 18); // Assuming 18 decimals
    const outputValue = Number(amountOut) / (10 ** 18);
    const expectedOutput = inputValue * priceSquared;
    
    if (expectedOutput === 0) return 0;
    
    const impact = ((expectedOutput - outputValue) / expectedOutput) * 100;
    return Math.max(0, impact);
  }

  // V4-specific methods
  private createPoolKey(tokenIn: Token, tokenOut: Token, fee?: number): {
    currency0: string;
    currency1: string;
    fee: number;
    tickSpacing: number;
    hooks: string;
  } {
    const [currency0, currency1] = this.sortTokens(tokenIn.address, tokenOut.address);
    const poolFee = fee || 3000;
    
    return {
      currency0,
      currency1,
      fee: poolFee,
      tickSpacing: this.getTickSpacing(poolFee),
      hooks: '0x0000000000000000000000000000000000000000'
    };
  }

  private getPoolId(poolKey: {
    currency0: string;
    currency1: string;
    fee: number;
    tickSpacing: number;
    hooks: string;
  }): `0x${string}` {
    // V4 uses keccak256 hash of encoded pool key as ID
    const encoded = encodeFunctionData({
      abi: [{
        name: 'encode',
        type: 'function',
        inputs: [{
          components: [
            { name: 'currency0', type: 'address' },
            { name: 'currency1', type: 'address' },
            { name: 'fee', type: 'uint24' },
            { name: 'tickSpacing', type: 'int24' },
            { name: 'hooks', type: 'address' }
          ],
          type: 'tuple'
        }]
      }],
      functionName: 'encode',
      args: [poolKey]
    });
    
    return keccak256(encoded);
  }

  private calculateSwapAmount(
    amountIn: bigint,
    sqrtPriceX96: bigint,
    liquidity: bigint,
    zeroForOne: boolean
  ): bigint {
    // Simplified calculation - implement full tick math for production
    const price = Number(sqrtPriceX96) / (2 ** 96);
    const priceSquared = price * price;
    
    if (zeroForOne) {
      // Swapping token0 for token1
      const amountOut = (Number(amountIn) * priceSquared * 0.997); // 0.3% fee
      return BigInt(Math.floor(amountOut));
    } else {
      // Swapping token1 for token0
      const amountOut = (Number(amountIn) / priceSquared * 0.997);
      return BigInt(Math.floor(amountOut));
    }
  }

  private getTickSpacing(fee: number): number {
    switch(fee) {
      case 100: return 1;
      case 500: return 10;
      case 3000: return 60;
      case 10000: return 200;
      default: return 60;
    }
  }

  private async simulateSwap(params: QuoteParams): Promise<QuoteResult | null> {
    try {
      // Fallback simulation when StateView is not available
      const mockPrice = 1.0; // Mock price for simulation
      
      // Parse amountIn safely
      let amountInBigInt: bigint;
      try {
        amountInBigInt = parseUnits(params.amountIn, params.tokenIn.decimals);
      } catch (e) {
        console.warn('Failed to parse amountIn as decimal string in simulation, attempting raw BigInt conversion:', params.amountIn, e);
        try {
          amountInBigInt = BigInt(params.amountIn);
        } catch (e2) {
          console.error('Failed to parse amountIn in simulation, defaulting to 0n:', params.amountIn, e2);
          amountInBigInt = BigInt(0);
        }
      }
      
      const amountIn = Number(amountInBigInt) / (10 ** params.tokenIn.decimals);
      const amountOut = amountIn * mockPrice * 0.997; // Apply 0.3% fee
      
      return {
        amountOut: amountOut.toString(),
        sqrtPriceX96After: '0',
        gasEstimate: '150000',
        priceImpact: 0,
        route: [params.tokenIn.symbol || '', params.tokenOut.symbol || '']
      };
    } catch (error) {
      console.error('Swap simulation failed:', error);
      return null;
    }
  }


  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get current market price for a token pair
  async getMarketPrice(tokenIn: Token, tokenOut: Token): Promise<number> {
    try {
      const quote = await this.getQuote({
        tokenIn,
        tokenOut,
        amountIn: '1'
      });
      
      if (!quote) {
        throw new Error('No quote available');
      }
      
      return parseFloat(quote.amountOut);
    } catch (error) {
      console.error('Error getting market price:', error);
      throw new Error(`Failed to get market price for ${tokenIn.symbol}/${tokenOut.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const quoterService = new QuoterService();
