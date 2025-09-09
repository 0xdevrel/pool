import { Token } from '@uniswap/sdk-core';
import { quoterService } from './quoterService';
import { swapService } from './swapService';

export interface LimitOrder {
  id: string;
  user: string;
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  targetPrice: number;
  expiry: number;
  status: 'pending' | 'executed' | 'cancelled' | 'expired' | 'failed';
  createdAt: number;
  executedAt?: number;
  transactionId?: string;
  error?: string;
  pair: string;
}

export interface CreateLimitOrderParams {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  targetPrice: number;
  priceType: 'market' | '+1%' | '+5%' | '+10%' | 'custom';
  expiry: '1day' | '1week' | '1month' | '1year';
}

export class LimitOrderService {
  private static instance: LimitOrderService;
  private orders: LimitOrder[] = [];
  private monitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  static getInstance(): LimitOrderService {
    if (!LimitOrderService.instance) {
      LimitOrderService.instance = new LimitOrderService();
    }
    return LimitOrderService.instance;
  }

  constructor() {
    this.orders = this.loadOrders();
    this.startMonitoring();
  }

  async createLimitOrder(params: CreateLimitOrderParams): Promise<LimitOrder> {
    // Calculate actual target price
    const actualTargetPrice = await this.calculateTargetPrice(
      params.tokenIn,
      params.tokenOut,
      params.priceType,
      params.targetPrice
    );

    const order: LimitOrder = {
      id: `order_${Date.now()}_${Math.random().toString(16).substr(2, 8)}`,
      user: this.getUserAddress(),
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      targetPrice: actualTargetPrice,
      expiry: this.calculateExpiry(params.expiry),
      status: 'pending',
      createdAt: Date.now(),
      pair: `${params.tokenIn.symbol}/${params.tokenOut.symbol}`
    };

    // Store locally
    this.orders.push(order);
    this.saveOrders();

    // Send to backend for persistent storage
    await this.syncWithBackend(order);

    // Start monitoring if not already running
    if (!this.monitoring) {
      this.startMonitoring();
    }

    return order;
  }

  private async calculateTargetPrice(
    tokenIn: Token,
    tokenOut: Token,
    priceType: string,
    customPrice: number
  ): Promise<number> {
    if (priceType === 'custom') return customPrice;

    // Get current market price
    const currentPrice = await quoterService.getMarketPrice(tokenIn, tokenOut);
    
    if (currentPrice === 0) {
      throw new Error('Unable to fetch current market price');
    }

    const multipliers = {
      'market': 1,
      '+1%': 1.01,
      '+5%': 1.05,
      '+10%': 1.10
    };

    return currentPrice * (multipliers[priceType as keyof typeof multipliers] || 1);
  }

  private calculateExpiry(expiryType: string): number {
    const now = Date.now();
    const durations = {
      '1day': 24 * 60 * 60 * 1000,
      '1week': 7 * 24 * 60 * 60 * 1000,
      '1month': 30 * 24 * 60 * 60 * 1000,
      '1year': 365 * 24 * 60 * 60 * 1000
    };
    return now + (durations[expiryType as keyof typeof durations] || durations['1week']);
  }

  private startMonitoring(): void {
    if (this.monitoring) return;

    this.monitoring = true;
    
    const checkOrders = async () => {
      const pendingOrders = this.orders.filter(o => o.status === 'pending');
      
      if (pendingOrders.length === 0) {
        this.monitoring = false;
        if (this.monitoringInterval) {
          clearInterval(this.monitoringInterval);
          this.monitoringInterval = null;
        }
        return;
      }

      for (const order of pendingOrders) {
        try {
          // Check expiry
          if (Date.now() > order.expiry) {
            order.status = 'expired';
            continue;
          }

          // Check price condition
          const shouldExecute = await this.checkPriceCondition(order);
          if (shouldExecute) {
            await this.executeLimitOrder(order);
          }
        } catch (error) {
          console.error(`Error checking order ${order.id}:`, error);
        }
      }

      this.saveOrders();
    };

    // Check every 30 seconds
    this.monitoringInterval = setInterval(checkOrders, 30000);
    
    // Initial check
    checkOrders();
  }

  private async checkPriceCondition(order: LimitOrder): Promise<boolean> {
    try {
      const currentPrice = await quoterService.getMarketPrice(order.tokenIn, order.tokenOut);
      return currentPrice >= order.targetPrice;
    } catch (error) {
      console.error('Error checking price condition:', error);
      return false;
    }
  }

  private async executeLimitOrder(order: LimitOrder): Promise<void> {
    try {
      const result = await swapService.executeSwap({
        tokenIn: order.tokenIn,
        tokenOut: order.tokenOut,
        amountIn: order.amountIn,
        slippageTolerance: 0.5,
        deadline: Math.floor(Date.now() / 1000) + 1800 // 30 minutes
      }, {
        amountOut: (parseFloat(order.amountIn) * order.targetPrice).toString(),
        priceImpact: 0,
        minimumReceived: (parseFloat(order.amountIn) * order.targetPrice * 0.995).toString(),
        fee: (parseFloat(order.amountIn) * 0.003).toString(),
        route: [order.tokenIn.symbol || '', order.tokenOut.symbol || '']
      });

      order.status = 'executed';
      order.executedAt = Date.now();
      order.transactionId = result;

      // Notify user
      this.notifyUser(order, 'executed');
    } catch (error) {
      order.status = 'failed';
      order.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to execute limit order:', error);
    }
  }

  // Local storage management
  private loadOrders(): LimitOrder[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('limit_orders');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading orders from localStorage:', error);
      return [];
    }
  }

  private saveOrders(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('limit_orders', JSON.stringify(this.orders));
    } catch (error) {
      console.error('Error saving orders to localStorage:', error);
    }
  }

  private getUserAddress(): string {
    if (typeof window === 'undefined') return '';
    
    try {
      const storedUser = localStorage.getItem('pool_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        return userData.walletAddress || '';
      }
    } catch (error) {
      console.error('Error getting user address:', error);
    }
    
    return '';
  }

  private async syncWithBackend(order: LimitOrder): Promise<void> {
    try {
      // Send to your backend for persistent storage
      await fetch('/api/limit-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
    } catch (error) {
      console.error('Failed to sync with backend:', error);
      // Don't throw - local storage is sufficient for demo
    }
  }

  private notifyUser(order: LimitOrder, status: string): void {
    // Show in-app notification
    if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
      new Notification('Limit Order Update', {
        body: `Your ${order.pair} limit order has been ${status}`,
        icon: '/icon.png'
      });
    }

    // Also show browser alert for demo purposes
    if (typeof window !== 'undefined') {
      alert(`Limit order ${status}: ${order.pair} at ${order.targetPrice}`);
    }
  }

  // Public methods
  getOrders(): LimitOrder[] {
    return [...this.orders];
  }

  getPendingOrders(): LimitOrder[] {
    return this.orders.filter(o => o.status === 'pending');
  }

  getOrderById(id: string): LimitOrder | undefined {
    return this.orders.find(o => o.id === id);
  }

  cancelOrder(orderId: string): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (order && order.status === 'pending') {
      order.status = 'cancelled';
      this.saveOrders();
      return true;
    }
    return false;
  }

  // Clean up expired orders (older than 30 days)
  cleanupExpiredOrders(): void {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.orders = this.orders.filter(order => 
      order.createdAt > thirtyDaysAgo || order.status === 'pending'
    );
    this.saveOrders();
  }

  // Get order statistics
  getOrderStats(): {
    total: number;
    pending: number;
    executed: number;
    cancelled: number;
    expired: number;
    failed: number;
  } {
    return {
      total: this.orders.length,
      pending: this.orders.filter(o => o.status === 'pending').length,
      executed: this.orders.filter(o => o.status === 'executed').length,
      cancelled: this.orders.filter(o => o.status === 'cancelled').length,
      expired: this.orders.filter(o => o.status === 'expired').length,
      failed: this.orders.filter(o => o.status === 'failed').length
    };
  }
}

// Export singleton instance
export const limitOrderService = LimitOrderService.getInstance();
