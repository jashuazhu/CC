import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  colorClass?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, colorClass = "text-blue-400" }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-lg bg-slate-700/50 ${colorClass}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-baseline">
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
    </div>
  );
};
