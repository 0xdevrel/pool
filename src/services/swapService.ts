import { Token } from '@uniswap/sdk-core';
import { POOL_CONFIGS, WORLD_CHAIN_CONTRACTS } from '@/constants/tokens';
import { portfolioService } from './portfolioService';
import { quoterService } from './quoterService';
import { encodeAbiParameters, parseUnits } from 'viem';

// V4 Universal Router Commands
const Commands = {
  V4_SWAP: 0x10
} as const;

// V4 Actions
const Actions = {
  SWAP_EXACT_IN_SINGLE: 0x00,
  SWAP_EXACT_IN: 0x01,
  SWAP_EXACT_OUT_SINGLE: 0x02,
  SWAP_EXACT_OUT: 0x03,
  SETTLE: 0x10,
  SETTLE_ALL: 0x11,
  SETTLE_PAIR: 0x12,
  TAKE: 0x13,
  TAKE_ALL: 0x14,
  TAKE_PAIR: 0x15
} as const;

// Universal Router ABI
const UNIVERSAL_ROUTER_ABI = [
  {
    name: 'execute',
    type: 'function',
    inputs: [
      { name: 'commands', type: 'bytes' },
      { name: 'inputs', type: 'bytes[]' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: [{ name: 'outputs', type: 'bytes[]' }],
    stateMutability: 'payable'
  }
] as const;

export interface SwapQuote {
  amountOut: string;
  priceImpact: number;
  minimumReceived: string;
  fee: string;
  route: string[];
}

export interface SwapParams {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  slippageTolerance: number;
  deadline: number;
}

export interface LimitOrderParams {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  limitPrice: string;
  expiry: number;
}

export class SwapService {
  private static instance: SwapService;
  private cache: Map<string, SwapQuote> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds

  static getInstance(): SwapService {
    if (!SwapService.instance) {
      SwapService.instance = new SwapService();
    }
    return SwapService.instance;
  }

  // Get quote for a swap
  async getQuote(params: SwapParams): Promise<SwapQuote> {
    const cacheKey = `${params.tokenIn.address}-${params.tokenOut.address}-${params.amountIn}`;
    const now = Date.now();

    // Check cache first
    if (this.cache.has(cacheKey) && this.cacheExpiry.get(cacheKey)! > now) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Use the new quoter service
      const quoteResult = await quoterService.getQuote({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn
      });

      if (!quoteResult || !quoteResult.amountOut) {
        throw new Error('No quote available for this token pair');
      }

      // Convert to SwapQuote format
      const quote: SwapQuote = {
        amountOut: quoteResult.amountOut,
        priceImpact: quoteResult.priceImpact || 0,
        minimumReceived: this.calculateMinimumReceived(quoteResult.amountOut, params.slippageTolerance),
        fee: this.calculateFee(params.amountIn),
        route: quoteResult.route || [params.tokenIn.symbol || '', params.tokenOut.symbol || '']
      };
      
      // Cache the result
      this.cache.set(cacheKey, quote);
      this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);
      
      return quote;
    } catch (error) {
      console.error('Error getting quote:', error);
      throw error;
    }
  }

  // Calculate minimum received amount with slippage
  private calculateMinimumReceived(amountOut: string, slippageTolerance: number): string {
    const amountOutNum = parseFloat(amountOut);
    const slippageMultiplier = 1 - (slippageTolerance / 100);
    return (amountOutNum * slippageMultiplier).toString();
  }

  // Calculate fee for the swap
  private calculateFee(amountIn: string): string {
    const amountInNum = parseFloat(amountIn);
    // Standard Uniswap V4 fee is 0.3% (3000 basis points)
    const feeRate = 0.003;
    return (amountInNum * feeRate).toString();
  }


  // Find pool configuration for token pair
  private findPoolConfig(tokenIn: Token, tokenOut: Token): typeof POOL_CONFIGS[0] | null {
    return POOL_CONFIGS.find(config => 
      (config.currency0 === tokenIn.address && config.currency1 === tokenOut.address) ||
      (config.currency0 === tokenOut.address && config.currency1 === tokenIn.address)
    ) || null;
  }

  // V4-specific methods
  private createPoolKey(tokenIn: Token, tokenOut: Token): {
    currency0: `0x${string}`;
    currency1: `0x${string}`;
    fee: number;
    tickSpacing: number;
    hooks: `0x${string}`;
  } {
    const [currency0, currency1] = this.sortTokens(tokenIn.address, tokenOut.address);
    const poolConfig = this.findPoolConfig(tokenIn, tokenOut);
    const fee = poolConfig?.fee || 3000;
    
    return {
      currency0: currency0 as `0x${string}`,
      currency1: currency1 as `0x${string}`,
      fee,
      tickSpacing: this.getTickSpacing(fee),
      hooks: '0x0000000000000000000000000000000000000000' as `0x${string}`
    };
  }

  private sortTokens(tokenA: string, tokenB: string): [string, string] {
    return tokenA.toLowerCase() < tokenB.toLowerCase() 
      ? [tokenA, tokenB] 
      : [tokenB, tokenA];
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

  private encodeSwapExactInSingle(params: {
    poolKey: {
      currency0: `0x${string}`;
      currency1: `0x${string}`;
      fee: number;
      tickSpacing: number;
      hooks: `0x${string}`;
    };
    zeroForOne: boolean;
    amountIn: bigint;
    amountOutMinimum: bigint;
    sqrtPriceLimitX96: bigint;
    hookData: `0x${string}`;
  }): `0x${string}` {
    return encodeAbiParameters(
      [{
        components: [
          {
            components: [
              { name: 'currency0', type: 'address' },
              { name: 'currency1', type: 'address' },
              { name: 'fee', type: 'uint24' },
              { name: 'tickSpacing', type: 'int24' },
              { name: 'hooks', type: 'address' }
            ],
            name: 'poolKey',
            type: 'tuple'
          },
          { name: 'zeroForOne', type: 'bool' },
          { name: 'amountIn', type: 'uint128' },
          { name: 'amountOutMinimum', type: 'uint128' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
          { name: 'hookData', type: 'bytes' }
        ],
        type: 'tuple'
      }],
      [params]
    );
  }


  // Execute swap using V4 Universal Router via MiniKit
  async executeSwap(params: SwapParams, quote: SwapQuote, userAddress?: string): Promise<string> {
    try {
      // Check if MiniKit is available
      if (typeof window === 'undefined' || !window.MiniKit) {
        throw new Error('MiniKit not available');
      }

      const { MiniKit } = window as { MiniKit: { user?: { walletAddress?: string }; commandsAsync?: { sendTransaction: (params: unknown) => Promise<unknown> } } };

      // Check if user is connected - use provided userAddress or check MiniKit
      const walletAddress = userAddress || MiniKit.user?.walletAddress;
      if (!walletAddress) {
        throw new Error('User not connected. Please sign in to perform swaps.');
      }

      // Create V4 pool key
      const poolKey = this.createPoolKey(params.tokenIn, params.tokenOut);
      
      // Encode V4 swap command
      const commands = `0x${Commands.V4_SWAP.toString(16).padStart(2, '0')}` as `0x${string}`;
      
      // Encode actions for V4 swap
      const actions = `0x${Actions.SWAP_EXACT_IN_SINGLE.toString(16).padStart(2, '0')}${Actions.SETTLE_ALL.toString(16).padStart(2, '0')}${Actions.TAKE_ALL.toString(16).padStart(2, '0')}` as `0x${string}`;
      
      // Parse amountIn safely - handle both decimal strings and raw integer strings
      let amountInBigInt: bigint;
      try {
        amountInBigInt = parseUnits(params.amountIn, params.tokenIn.decimals);
      } catch (e) {
        console.warn('Failed to parse amountIn as decimal string in swap execution, attempting raw BigInt conversion:', params.amountIn, e);
        try {
          amountInBigInt = BigInt(params.amountIn);
        } catch (e2) {
          console.error('Failed to parse amountIn in swap execution, defaulting to 0n:', params.amountIn, e2);
          amountInBigInt = BigInt(0);
        }
      }

      // Parse minimum received amount safely
      let minAmountOutBigInt: bigint;
      try {
        minAmountOutBigInt = parseUnits(quote.minimumReceived, params.tokenOut.decimals);
      } catch (e) {
        console.warn('Failed to parse minimumReceived as decimal string in swap execution, attempting raw BigInt conversion:', quote.minimumReceived, e);
        try {
          minAmountOutBigInt = BigInt(quote.minimumReceived);
        } catch (e2) {
          console.error('Failed to parse minimumReceived in swap execution, defaulting to 0n:', quote.minimumReceived, e2);
          minAmountOutBigInt = BigInt(0);
        }
      }

      // Encode parameters for each action
      const swapParams = this.encodeSwapExactInSingle({
        poolKey,
        zeroForOne: params.tokenIn.address.toLowerCase() === poolKey.currency0.toLowerCase(),
        amountIn: amountInBigInt,
        amountOutMinimum: minAmountOutBigInt,
        sqrtPriceLimitX96: BigInt(0),
        hookData: '0x' as `0x${string}`
      });
      
      const settleParams = encodeAbiParameters(
        [{ type: 'address' }, { type: 'uint256' }],
        [poolKey.currency0, amountInBigInt]
      );
      
      const takeParams = encodeAbiParameters(
        [{ type: 'address' }, { type: 'uint256' }],
        [poolKey.currency1, minAmountOutBigInt]
      );
      
      // Combine into inputs array
      const inputs = [
        encodeAbiParameters(
          [{ type: 'bytes' }, { type: 'bytes[]' }],
          [actions, [swapParams, settleParams, takeParams]]
        )
      ];
      
      // Execute via MiniKit
      const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 minutes
      
      console.log('Executing V4 swap with params:', {
        poolKey,
        amountIn: params.amountIn,
        amountOutMin: quote.minimumReceived,
        commands,
        inputs: inputs.length
      });

      const { finalPayload } = await (MiniKit as { commandsAsync: { sendTransaction: (params: unknown) => Promise<{ finalPayload: { status: string; error?: string; transaction_id: string } }> } }).commandsAsync.sendTransaction({
        transaction: [{
          address: WORLD_CHAIN_CONTRACTS.UNIVERSAL_ROUTER as `0x${string}`,
          abi: UNIVERSAL_ROUTER_ABI,
          functionName: 'execute',
          args: [commands, inputs, deadline],
          value: params.tokenIn.address === '0x0000000000000000000000000000000000000000' 
            ? params.amountIn 
            : '0'
        }]
      });
      
      if (finalPayload.status === 'error') {
        throw new Error(finalPayload.error);
      }
      
      // Clear cache after successful swap
      this.clearCache();
      
      return finalPayload.transaction_id;
    } catch (error) {
      console.error('Error executing V4 swap:', error);
      throw error;
    }
  }

  // Create limit order (mock implementation)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createLimitOrder(params: LimitOrderParams): Promise<string> {
    try {
      // In production, this would:
      // 1. Validate limit order parameters
      // 2. Create limit order contract interaction
      // 3. Return order ID

      // Simulate order creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock order ID
      const orderId = 'order_' + Math.random().toString(16).substr(2, 16);
      
      return orderId;
    } catch (error) {
      console.error('Error creating limit order:', error);
      throw error;
    }
  }

  // Get user's token balances (real implementation)
  async getTokenBalance(token: Token, userAddress: string): Promise<string> {
    try {
      // Use the portfolio service to get real balances
      return await portfolioService.getTokenBalance(token, userAddress);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }

  // Get USD price for token (mock implementation)
  async getTokenPrice(token: Token): Promise<number> {
    const mockPrices: { [key: string]: number } = {
      'WETH': 3668.69,
      'WLD': 0.986,
      'USDC': 1.00,
      'USDT': 1.00,
      'WBTC': 114906.53,
      'uSOL': 165.43,
      'uXRP': 3.04,
      'uDOGE': 0.206,
      'uSUI': 3.51,
    };

    return mockPrices[token.symbol || ''] || 0;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // Format token amount for display
  formatTokenAmount(amount: string, decimals: number, maxDecimals: number = 6): string {
    const num = parseFloat(amount);
    if (num === 0) return '0';
    if (num < 0.000001) return '<0.000001';
    return num.toFixed(maxDecimals).replace(/\.?0+$/, '');
  }

  // Format USD amount
  formatUSD(amount: number): string {
    if (amount === 0) return '$0';
    if (amount < 0.01) return '<$0.01';
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toFixed(2)}`;
  }
}

// Export singleton instance
export const swapService = SwapService.getInstance();
