import React from 'react';
import { OHLCV } from '../types';

interface DataTableProps {
  data: OHLCV[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  // Show most recent first
  const sortedData = [...data].reverse();

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200">Raw Data Points</h3>
      </div>
      <div className="overflow-x-auto max-h-[400px]">
        <table className="w-full text-sm text-left text-slate-400">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Open</th>
              <th scope="col" className="px-6 py-3">High</th>
              <th scope="col" className="px-6 py-3">Low</th>
              <th scope="col" className="px-6 py-3">Close</th>
              <th scope="col" className="px-6 py-3">Kalman Est.</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length > 0 ? (
                sortedData.map((row) => (
                <tr key={row.date} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{row.date}</td>
                    <td className="px-6 py-4">${row.open.toLocaleString()}</td>
                    <td className="px-6 py-4 text-emerald-400">${row.high.toLocaleString()}</td>
                    <td className="px-6 py-4 text-rose-400">${row.low.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-white">${row.close.toLocaleString()}</td>
                    <td className="px-6 py-4 text-purple-400">
                        {row.estimatedValue ? `$${row.estimatedValue.toFixed(2)}` : '-'}
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No data found. Click "Seed Data" to initialize.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
