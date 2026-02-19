'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/admin/StatCard';
import RecentPosts from '@/components/admin/RecentPosts';
import { DollarSign, TrendingUp, Calendar, FileText, FileEdit, FileCheck } from 'lucide-react';
import { graphqlRequest } from '@/lib/api';
import Link from 'next/link';

const GET_STATS_QUERY = `
  query {
    getCategories {
      posts {
        status
        galleries
      }
    }
  }
`;

export default function DashboardPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donationStats, setDonationStats] = useState({
    totalUSD: 0,
    totalLKR: 0,
    totalDonations: 0,
    recentCount: 0
  });
  const [userRole, setUserRole] = useState('staff');

  useEffect(() => {
    loadDashboardData();
    const role = localStorage.getItem('userRole') || 'staff';
    setUserRole(role);
    if (role === 'admin') {
      loadDonationStats();
    }
  }, []);

  const parseGalleryCount = (data) => {
    try {
      if (Array.isArray(data)) return data.length;
      if (typeof data === 'string' && data.trim() !== '') {
        let str = data.trim();
        if (!str.endsWith(']')) {
          const lastQuote = str.lastIndexOf('"');
          str = lastQuote !== -1 ? str.substring(0, lastQuote + 1) + ']' : str + '"]';
        }
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed.length : 0;
      }
    } catch (e) {
      const matches = data?.match(/\.(jpg|jpeg|png|webp)/gi);
      return matches ? matches.length : 0;
    }
    return 0;
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const result = await graphqlRequest(GET_STATS_QUERY);
      if (result?.getCategories) {
        const allPosts = result.getCategories.flatMap(cat => cat.posts || []);
        
        const totalPosts = allPosts.length;
        const totalPublished = allPosts.filter(p => p.status === 'published').length;
        const totalDrafts = allPosts.filter(p => p.status === 'draft').length;

        setStats([
          {
            title: "Total Posts",
            value: totalPosts.toString(),
            icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },
          {
            title: "Published",
            value: totalPublished.toString(),
            icon: FileCheck,
            color: "text-green-600",
            bg: "bg-green-100",
            trend: { value: "On Live", isUp: true }
          },
          {
            title: "Drafts",
            value: totalDrafts.toString(),
            icon: FileEdit,
            color: "text-orange-600",
            bg: "bg-orange-100",
            trend: { value: "Pending", isUp: false }
          },
        ]);
      }
    } catch (error) {
      console.error("Dashboard stats load failed", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDonationStats = () => {
    const dummyDonations = [
      { amount: 5000, currency: 'USD', date: '2025-02-08' },
      { amount: 250000, currency: 'LKR', date: '2025-02-07' },
      { amount: 3000, currency: 'USD', date: '2025-02-06' },
      { amount: 150000, currency: 'LKR', date: '2025-02-05' },
      { amount: 10000, currency: 'USD', date: '2025-02-04' },
      { amount: 500000, currency: 'LKR', date: '2025-02-03' },
      { amount: 7500, currency: 'USD', date: '2025-02-02' },
      { amount: 200000, currency: 'LKR', date: '2025-02-01' },
    ];

    const totalUSD = dummyDonations.filter(d => d.currency === 'USD').reduce((sum, d) => sum + d.amount, 0);
    const totalLKR = dummyDonations.filter(d => d.currency === 'LKR').reduce((sum, d) => sum + d.amount, 0);
    const totalDonations = dummyDonations.length;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = dummyDonations.filter(d => new Date(d.date) >= sevenDaysAgo).length;

    setDonationStats({ totalUSD, totalLKR, totalDonations, recentCount });
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">Welcome back!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded-2xl h-32 animate-pulse"></div>
          ))
        ) : (
          stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))
        )}
      </div>

      {userRole === 'admin' && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Donations Overview</h3>
            <Link href="/admin/donations" className="text-[#009cd6] hover:text-[#0088bd] font-semibold text-sm transition-colors">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <DonationCard label="Total (USD)" value={`$${donationStats.totalUSD.toLocaleString()}`} icon={DollarSign} iconBg="bg-green-100" iconColor="text-green-600" />
            <DonationCard label="Total (LKR)" value={`Rs. ${donationStats.totalLKR.toLocaleString()}`} icon={DollarSign} iconBg="bg-blue-100" iconColor="text-blue-600" />
            <DonationCard label="Total Count" value={donationStats.totalDonations} icon={TrendingUp} iconBg="bg-purple-100" iconColor="text-purple-600" />
            <DonationCard label="Recent (7d)" value={donationStats.recentCount} icon={Calendar} iconBg="bg-orange-100" iconColor="text-orange-600" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 mb-8">
        <RecentPosts />
      </div>
    </>
  );
}

function DonationCard({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-800 tracking-tight">{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}