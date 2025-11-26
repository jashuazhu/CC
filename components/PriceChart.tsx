import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';
import { OHLCV } from '../types';

interface PriceChartProps {
  data: OHLCV[];
  showKalman: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-xl">
        <p className="text-slate-300 font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: ${Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const PriceChart: React.FC<PriceChartProps> = ({ data, showKalman }) => {
  if (data.length === 0) {
    return (
      <div className="h-96 w-full flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700 border-dashed">
        <p className="text-slate-500">No data available to plot</p>
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-200">Price Movement</h3>
        <div className="flex gap-2">
            <span className="flex items-center text-xs text-slate-400">
                <span className="w-3 h-3 bg-emerald-500 rounded-full mr-1"></span> Close Price
            </span>
            {showKalman && (
                 <span className="flex items-center text-xs text-slate-400">
                 <span className="w-3 h-3 bg-purple-500 rounded-full mr-1"></span> Kalman Estimate
             </span>
            )}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            tick={{ fontSize: 12 }} 
            tickMargin={10}
            minTickGap={30}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="close" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorClose)" 
            name="Close Price"
          />
          {showKalman && (
            <Line 
                type="monotone" 
                dataKey="estimatedValue" 
                stroke="#a855f7" 
                strokeWidth={2} 
                dot={false}
                name="Kalman Filter"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
