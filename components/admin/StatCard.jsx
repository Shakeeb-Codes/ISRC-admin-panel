'use client';

import { FileText, Image as ImageIcon, FilePlus } from 'lucide-react';

export default function StatCard({ label, value, color, iconColor, iconType }) {
  // Map icon type to actual icon component
  const iconMap = {
    posts: FileText,
    images: ImageIcon,
    drafts: FilePlus
  };

  const Icon = iconMap[iconType] || FileText;

  return (
    <div className={`${color} rounded-lg p-6 shadow-sm hover:shadow-md transition-all cursor-pointer`}>
      <div className="flex items-center gap-4">
        <div className={`${iconColor} bg-white p-3 rounded-lg`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
}