export interface WLDPriceData {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChange7d: number;
  marketCapRank: number;
  volumeRank: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  lastUpdated: Date;
}

export interface DashboardMetrics {
  wld: WLDPriceData;
  chartData: Array<{
    timestamp: number;
    price: number;
  }>;
}

export class DashboardService {
  private static instance: DashboardService;
  private cache: DashboardMetrics | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    // Check cache first
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache;
    }

    try {
      // Use the server-side API route instead of direct API calls
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        throw new Error(`Dashboard API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard metrics');
      }
      
      const metrics: DashboardMetrics = result.data;
      
      // Cache the results
      this.cache = metrics;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      
      return metrics;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      // Return cached data if available, otherwise return default values
      if (this.cache) {
        return this.cache;
      }
      return this.getDefaultMetrics();
    }
  }

  private getDefaultMetrics(): DashboardMetrics {
    return {
      wld: {
        price: 1.9,
        marketCap: 3800000000,
        volume24h: 50000000,
        priceChange24h: 2.5,
        priceChange7d: 15.2,
        marketCapRank: 34,
        volumeRank: 6,
        circulatingSupply: 2020000000,
        totalSupply: 10000000000,
        maxSupply: null,
        lastUpdated: new Date()
      },
      chartData: this.generateMockChartData()
    };
  }

  private generateMockChartData(): Array<{ timestamp: number; price: number }> {
    const data = [];
    const now = Date.now();
    const basePrice = 1.52;

    for (let i = 6; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000);
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = basePrice * (1 + variation);
      data.push({ timestamp, price });
    }

    return data;
  }
}

export const dashboardService = DashboardService.getInstance();