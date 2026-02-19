'use client';

import { FileText } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, color, bg, trend }) {
  const DisplayIcon = Icon || FileText;

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`${bg} ${color} p-3 rounded-xl transition-colors group-hover:scale-110 duration-300`}>
          <DisplayIcon size={24} />
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trend.isUp ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
            {trend.value}
          </span>
        )}
      </div>
      
      <div>
        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <h3 className="text-3xl font-bold text-gray-800 tracking-tight">{value}</h3>
        </div>
      </div>
    </div>
  );
}