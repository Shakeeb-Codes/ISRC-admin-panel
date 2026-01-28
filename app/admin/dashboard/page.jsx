'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/admin/StatCard';
import QuickPost from '@/components/admin/QuickPost';
import RecentPosts from '@/components/admin/RecentPosts';
import MediaGrid from '@/components/admin/MediaGrid';
import { getStats } from '@/lib/dummyData';

export default function DashboardPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const statsData = await getStats();
    setStats(statsData);
    setLoading(false);
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">Welcome back! Here's what's happening with your NGO.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
            ))}
          </>
        ) : (
          stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <QuickPost />
        <RecentPosts />
      </div>

      {/* Media Library */}
      <MediaGrid limit={6} showHeader={true} />
    </>
  );
}