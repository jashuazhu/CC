export enum AssetType {
  BTC = 'BTC',
  ETH = 'ETH',
  SOL = 'SOL'
}

export interface OHLCV {
  date: string; // ISO 8601 YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Reserved for advanced processing
  estimatedValue?: number; // From Kalman Filter
}

export interface Statistics {
  max: number;
  min: number;
  mean: number;
  stdDev: number;
  count: number;
}

export interface SchedulerMetadata {
  lastRunDate: string; // YYYY-MM-DD
  status: 'idle' | 'running' | 'completed' | 'error';
  log: string[];
}

export interface DateRange {
  start: string;
  end: string;
}
