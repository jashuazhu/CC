import { AssetType, OHLCV } from '../types';

/**
 * Simulates fetching data from an external Crypto API.
 * In a production environment, this would call CoinGecko or Binance API.
 * For this demo, we generate realistic random walk data to ensure reliability without API keys.
 */
export class MarketDataService {
  
  static async fetchDailyCandle(asset: AssetType, dateStr: string): Promise<OHLCV> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate realistic looking price based on asset type
    const basePrice = asset === AssetType.BTC ? 95000 : asset === AssetType.ETH ? 3400 : 150;
    const volatility = 0.05; // 5% daily swing
    
    const randomChange = 1 + (Math.random() * volatility * 2 - volatility);
    const close = basePrice * randomChange;
    const open = basePrice;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);

    return {
      date: dateStr,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 10000)
    };
  }

  static async fetchHistoricalBatch(asset: AssetType, days: number): Promise<OHLCV[]> {
     // Simulate API latency
     await new Promise(resolve => setTimeout(resolve, 1000));

     const data: OHLCV[] = [];
     const today = new Date();
     
     let currentPrice = asset === AssetType.BTC ? 60000 : asset === AssetType.ETH ? 2500 : 80;
     
     // Generate backwards then reverse
     for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const volatility = 0.03;
        const change = 1 + (Math.random() * volatility * 2 - volatility);
        
        const open = currentPrice;
        const close = currentPrice * change;
        const high = Math.max(open, close) * 1.02;
        const low = Math.min(open, close) * 0.98;

        data.push({
            date: dateStr,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: Math.floor(Math.random() * 1000000)
        });

        currentPrice = close;
     }

     return data;
  }
}
