'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, DollarSign, TrendingUp, Calendar, Loader2 } from 'lucide-react';

export default function DonationsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCurrency, setSelectedCurrency] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUSD: 0,
    totalLKR: 0,
    totalDonations: 0,
    recentCount: 0
  });

  const categories = [
    'Economic Development',
    'Education',
    'Emergency Response',
    'Environmental Development',
    'Food Security',
    'Health',
    'Mother & Child Care',
    'Peacebuilding',
    'Shelter',
    'WASH'
  ];

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    
    if (role !== 'admin') {
      router.push('/admin/dashboard');
    } else {
      setAuthorized(true);
      loadDonations();
    }
  }, [router]);

  useEffect(() => {
    if (authorized) {
      filterDonations();
      calculateStats();
    }
  }, [selectedCategory, selectedCurrency, donations, authorized]);

  const loadDonations = () => {
    setLoading(true);

    // Dummy data
    const dummyDonations = [
      { id: 1, donorName: 'Ahmed Hassan', amount: 5000, currency: 'USD', category: 'Education', date: '2025-02-08', status: 'Completed' },
      { id: 2, donorName: 'Sarah Johnson', amount: 250000, currency: 'LKR', category: 'Health', date: '2025-02-07', status: 'Completed' },
      { id: 3, donorName: 'Mohamed Ali', amount: 3000, currency: 'USD', category: 'WASH', date: '2025-02-06', status: 'Completed' },
      { id: 4, donorName: 'Fatima Ibrahim', amount: 150000, currency: 'LKR', category: 'Food Security', date: '2025-02-05', status: 'Completed' },
      { id: 5, donorName: 'John Smith', amount: 10000, currency: 'USD', category: 'Emergency Response', date: '2025-02-04', status: 'Completed' },
      { id: 6, donorName: 'Aisha Mohammed', amount: 500000, currency: 'LKR', category: 'Shelter', date: '2025-02-03', status: 'Completed' },
      { id: 7, donorName: 'David Brown', amount: 7500, currency: 'USD', category: 'Mother & Child Care', date: '2025-02-02', status: 'Completed' },
      { id: 8, donorName: 'Zainab Ahmed', amount: 200000, currency: 'LKR', category: 'Economic Development', date: '2025-02-01', status: 'Completed' }
    ];

    setDonations(dummyDonations);
    setFilteredDonations(dummyDonations);
    setLoading(false);
  };

  const filterDonations = () => {
    let filtered = donations;
    if (selectedCategory !== 'all') filtered = filtered.filter(d => d.category === selectedCategory);
    if (selectedCurrency !== 'all') filtered = filtered.filter(d => d.currency === selectedCurrency);
    setFilteredDonations(filtered);
  };

  const calculateStats = () => {
    const totalUSD = donations.filter(d => d.currency === 'USD').reduce((sum, d) => sum + d.amount, 0);
    const totalLKR = donations.filter(d => d.currency === 'LKR').reduce((sum, d) => sum + d.amount, 0);
    const totalDonations = donations.length;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = donations.filter(d => new Date(d.date) >= sevenDaysAgo).length;
    setStats({ totalUSD, totalLKR, totalDonations, recentCount });
  };

  const formatCurrency = (amount, currency) => {
    if (currency === 'USD') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `Rs. ${amount.toLocaleString('en-US')}`;
    }
  };

  const exportToPDF = () => {
    alert('PDF export will be available when API is connected.');
  };

  if (!authorized) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#009cd6]" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Donations</h2>
            <p className="text-gray-600">Track and manage donations received</p>
          </div>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-[#009cd6] text-white px-6 py-3 rounded-lg hover:bg-[#0088bd] transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            <Download size={20} />
            Export to PDF
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total (USD)</p>
                <p className="text-2xl font-bold text-gray-800">${stats.totalUSD.toLocaleString('en-US')}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total (LKR)</p>
                <p className="text-2xl font-bold text-gray-800">Rs. {stats.totalLKR.toLocaleString('en-US')}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Donations</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalDonations}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recent (7 days)</p>
                <p className="text-2xl font-bold text-gray-800">{stats.recentCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar size={24} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009cd6] bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Currency</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009cd6] bg-white"
            >
              <option value="all">All Currencies</option>
              <option value="USD">USD ($)</option>
              <option value="LKR">LKR (Rs.)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin h-12 w-12 text-[#009cd6] mx-auto" />
            <p className="text-gray-500 mt-4">Loading donations...</p>
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No donations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Donor Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4"><span className="font-semibold text-gray-800">{donation.donorName}</span></td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">{formatCurrency(donation.amount, donation.currency)}</span>
                      <span className="text-xs text-gray-500 ml-2">{donation.currency}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{donation.category}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{new Date(donation.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">{donation.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}