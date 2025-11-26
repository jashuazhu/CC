import { OHLCV, SchedulerMetadata, AssetType } from '../types';

const STORAGE_KEYS = {
  DATA_PREFIX: 'daily_prices_',
  METADATA: 'scheduler_metadata'
};

/**
 * Mock Firestore Service
 * Implements the logic defined in the "Daily Update Logic" section.
 * Uses localStorage to persist data across reloads.
 */
export class StorageService {
  
  // -- Metadata / Locking Operations --

  static getMetadata(): SchedulerMetadata {
    const raw = localStorage.getItem(STORAGE_KEYS.METADATA);
    if (!raw) {
      return {
        lastRunDate: '1970-01-01',
        status: 'idle',
        log: []
      };
    }
    return JSON.parse(raw);
  }

  static updateMetadata(updates: Partial<SchedulerMetadata>) {
    const current = this.getMetadata();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(updated));
  }

  // -- Data Operations --

  static getDailyData(asset: AssetType): OHLCV[] {
    const key = `${STORAGE_KEYS.DATA_PREFIX}${asset}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }

  static saveDailyData(asset: AssetType, newData: OHLCV | OHLCV[]) {
    const currentData = this.getDailyData(asset);
    const key = `${STORAGE_KEYS.DATA_PREFIX}${asset}`;
    
    // Merge logic: avoid duplicates based on date
    const itemsToAdd = Array.isArray(newData) ? newData : [newData];
    
    // Create a map for existing data
    const dataMap = new Map(currentData.map(d => [d.date, d]));
    
    itemsToAdd.forEach(item => {
      dataMap.set(item.date, item);
    });

    // Convert back to array and sort by date
    const merged = Array.from(dataMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    localStorage.setItem(key, JSON.stringify(merged));
  }

  static clearData(asset: AssetType) {
    const key = `${STORAGE_KEYS.DATA_PREFIX}${asset}`;
    localStorage.removeItem(key);
  }
}
