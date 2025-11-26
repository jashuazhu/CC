import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  BrainCircuit, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { AssetType, OHLCV, SchedulerMetadata } from './types';
import { StorageService } from './services/storageService';
import { MarketDataService } from './services/marketDataService';
import { MathService } from './services/mathService';
import { getMarketAnalysis } from './services/geminiService';

// Components
import { StatsCard } from './components/StatsCard';
import { PriceChart } from './components/PriceChart';
import { ControlPanel } from './components/ControlPanel';
import { DataTable } from './components/DataTable';

const App: React.FC = () => {
  // State
  const [asset, setAsset] = useState<AssetType>(AssetType.BTC);
  const [data, setData] = useState<OHLCV[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerMetadata>(StorageService.getMetadata());
  const [showKalman, setShowKalman] = useState<boolean>(false);
  
  // Date Filters (Default to current month view, extended later)
  const today = new Date().toISOString().split('T')[0];
  const lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate() - 30);
  
  const [dateRange, setDateRange] = useState({
    start: lastMonth.toISOString().split('T')[0],
    end: today
  });

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // -- A. Daily Update Logic (useEffect hook) --
  useEffect(() => {
    const checkDailyUpdate = async () => {
      const metadata = StorageService.getMetadata();
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      // 1. Check Lock / Determine Need
      // If last run was before today
      if (metadata.lastRunDate < dateStr) {
        console.log("Starting Daily Update Task...");
        
        // 2. Execute Fetch (Locking)
        StorageService.updateMetadata({ status: 'running' });
        setSchedulerStatus(prev => ({ ...prev, status: 'running' }));

        try {
          // Fetch for all assets to keep DB sync
          const assets = Object.values(AssetType);
          for (const a of assets) {
            const candle = await MarketDataService.fetchDailyCandle(a, dateStr);
            // 3. Write to Firestore (Local Storage)
            StorageService.saveDailyData(a, candle);
          }

          // 4. Update Lock
          StorageService.updateMetadata({ 
            lastRunDate: dateStr, 
            status: 'completed',
            log: [...metadata.log, `Success: ${dateStr}`].slice(-10) // keep last 10 logs
          });
          
          // Refresh view if we are looking at updated data
          loadData();
          
        } catch (error) {
          console.error("Daily update failed", error);
          StorageService.updateMetadata({ status: 'error' });
        } finally {
            setSchedulerStatus(StorageService.getMetadata());
        }
      } else {
        console.log("Daily data already up to date.");
      }
    };

    checkDailyUpdate();
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset]); // Re-run loadData if asset changes, check daily update on mount

  // Helper to load data from storage
  const loadData = () => {
    const stored = StorageService.getDailyData(asset);
    
    // Apply Kalman Filter (Advanced Math Interface)
    const processed = MathService.applyKalmanFilter(stored);
    setData(processed);
  };

  // Filter Data for View
  const filteredData = useMemo(() => {
    return data.filter(d => d.date >= dateRange.start && d.date <= dateRange.end);
  }, [data, dateRange]);

  // Calculate Statistics
  const stats = useMemo(() => {
    return MathService.calculateStatistics(filteredData);
  }, [filteredData]);

  // -- B. Manual Data Entry Handler --
  const handleManualSeed = async () => {
    setLoading(true);
    try {
      const historicalData = await MarketDataService.fetchHistoricalBatch(asset, 30);
      StorageService.saveDailyData(asset, historicalData);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAI = async () => {
    setAnalyzing(true);
    const trend = filteredData.length > 5 
      ? `Price moved from ${filteredData[0].close} to ${filteredData[filteredData.length-1].close} over the period.` 
      : 'Insufficient data for trend.';
      
    const result = await getMarketAnalysis(asset, stats, trend);
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
            CryptoQuant Daily by Zhu`s Group @JHU & @Groton School
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${schedulerStatus.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            System Status: {schedulerStatus.status.toUpperCase()} (Last Run: {schedulerStatus.lastRunDate})
          </p>
        </div>
        
        <div className="flex gap-3">
             <button 
                onClick={() => setShowKalman(!showKalman)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${showKalman ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
             >
                {showKalman ? 'Disable Kalman Filter' : 'Enable Kalman Filter'}
             </button>
        </div>
      </div>

      {/* Control Panel */}
      <ControlPanel 
        selectedAsset={asset}
        onAssetChange={setAsset}
        startDate={dateRange.start}
        endDate={dateRange.end}
        onDateChange={(s, e) => setDateRange({ start: s, end: e })}
        onManualFetch={handleManualSeed}
        isLoading={loading}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Max Price" 
          value={`$${stats.max.toLocaleString()}`} 
          icon={TrendingUp} 
          colorClass="text-emerald-400 bg-emerald-400/10"
        />
        <StatsCard 
          title="Min Price" 
          value={`$${stats.min.toLocaleString()}`} 
          icon={TrendingDown} 
          colorClass="text-rose-400 bg-rose-400/10"
        />
        <StatsCard 
          title="Average" 
          value={`$${stats.mean.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} 
          icon={Activity} 
          colorClass="text-blue-400 bg-blue-400/10"
        />
        <StatsCard 
          title="Volatility (StdDev)" 
          value={`$${stats.stdDev.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} 
          icon={BarChart2} 
          colorClass="text-amber-400 bg-amber-400/10"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart Column */}
        <div className="lg:col-span-2 space-y-6">
            <PriceChart data={filteredData} showKalman={showKalman} />
        </div>

        {/* Sidebar: AI & Details */}
        <div className="space-y-6">
            {/* AI Analysis Card */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-slate-800 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500 rounded-lg">
                        <BrainCircuit className="text-white" size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-indigo-100">Gemini Market Analyst</h3>
                </div>
                
                <div className="min-h-[100px] text-indigo-200/80 text-sm leading-relaxed mb-4">
                    {aiAnalysis ? (
                        <p>{aiAnalysis}</p>
                    ) : (
                        <p className="italic opacity-60">Generate an AI analysis based on the current statistical dataset...</p>
                    )}
                </div>

                <button 
                    onClick={handleRunAI}
                    disabled={analyzing || filteredData.length === 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                    {analyzing ? 'Thinking...' : 'Generate Analysis'}
                </button>
            </div>
            
            {/* System Status Log (Small) */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">System Log</h4>
                <ul className="space-y-2">
                    {schedulerStatus.log.length === 0 && <li className="text-slate-600 text-xs italic">No logs yet.</li>}
                    {[...schedulerStatus.log].reverse().slice(0, 5).map((log, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle size={10} className="text-emerald-500" />
                            {log}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>

      {/* Raw Data Table */}
      <DataTable data={filteredData} />
    </div>
  );
};

export default App;
