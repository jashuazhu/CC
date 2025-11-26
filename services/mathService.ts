import { OHLCV, Statistics } from '../types';

/**
 * Core Data Processing Module
 * Reserved interface for advanced mathematical study.
 */
export class MathService {
  /**
   * Calculates basic descriptive statistics for a given dataset.
   */
  static calculateStatistics(data: OHLCV[]): Statistics {
    if (data.length === 0) {
      return { max: 0, min: 0, mean: 0, stdDev: 0, count: 0 };
    }

    const prices = data.map(d => d.close);
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    const sum = prices.reduce((a, b) => a + b, 0);
    const mean = sum / prices.length;

    const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);

    return {
      max,
      min,
      mean,
      stdDev,
      count: data.length
    };
  }

  /**
   * Advanced Mathematical Interface: Kalman Filter
   * A 1D Kalman Filter implementation to estimate the "true" value of the asset
   * filtering out market noise.
   */
  static applyKalmanFilter(data: OHLCV[], processNoise = 1e-5, measurementNoise = 0.1): OHLCV[] {
    // Initial State
    let x = data[0]?.close || 0; // Estimated value
    let p = 1.0; // Estimation error covariance

    return data.map((point) => {
      const measurement = point.close;

      // 1. Prediction Update (Time Update)
      // Assuming a random walk model where next value = current value
      const x_pred = x; 
      const p_pred = p + processNoise;

      // 2. Measurement Update
      const k = p_pred / (p_pred + measurementNoise); // Kalman Gain
      x = x_pred + k * (measurement - x_pred); // Updated estimate
      p = (1 - k) * p_pred; // Updated error covariance

      return {
        ...point,
        estimatedValue: x
      };
    });
  }
}
