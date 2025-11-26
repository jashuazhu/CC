import React from 'react';
import { AssetType } from '../types';
import { Calendar, Database, RefreshCw } from 'lucide-react';

interface ControlPanelProps {
  selectedAsset: AssetType;
  onAssetChange: (a: AssetType) => void;
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
  onManualFetch: () => void;
  isLoading: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedAsset,
  onAssetChange,
  startDate,
  endDate,
  onDateChange,
  onManualFetch,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
      {/* Asset Selector */}
      <div className="lg:col-span-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Selected Asset
        </label>
        <div className="relative">
          <select
            value={selectedAsset}
            onChange={(e) => onAssetChange(e.target.value as AssetType)}
            className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg py-2.5 px-3 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          >
            {Object.values(AssetType).map((asset) => (
              <option key={asset} value={asset}>
                {asset}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="lg:col-span-6 bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row gap-4">
         <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar size={14} /> Start Date
            </label>
            <input 
                type="date" 
                value={startDate}
                onChange={(e) => onDateChange(e.target.value, endDate)}
                className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
         </div>
         <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar size={14} /> End Date
            </label>
            <input 
                type="date" 
                value={endDate}
                onChange={(e) => onDateChange(startDate, e.target.value)}
                className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
         </div>
      </div>

      {/* Actions */}
      <div className="lg:col-span-3 bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-center">
         <button
            onClick={onManualFetch}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
         >
            {isLoading ? (
                <RefreshCw className="animate-spin" size={18} />
            ) : (
                <Database size={18} />
            )}
            {isLoading ? 'Fetching...' : 'Seed Data (30 Days)'}
         </button>
      </div>
    </div>
  );
};
