'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Clock, CheckCircle2 } from 'lucide-react';

const COLORS = {
  Akademik: '#3b82f6',
  Organisasi: '#8b5cf6',
  Fasilitas: '#10b981',
  Kebijakan: '#f59e0b',
  Lainnya: '#6b7280'
};

const STATUS_COLORS = {
  received: '#94a3b8',
  verified: '#3b82f6',
  process: '#f59e0b',
  followed_up: '#8b5cf6',
  finished: '#10b981',
  rejected: '#ef4444'
};

export default function AnalyticsDashboard({ aspirations }) {
  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!aspirations || aspirations.length === 0) {
      return {
        totalAspirations: 0,
        categoryData: [],
        statusData: [],
        monthlyTrend: [],
        avgResponseTime: 0,
        completionRate: 0
      };
    }

    // Category distribution
    const categoryCounts = {};
    aspirations.forEach(asp => {
      const category = asp.category || 'Lainnya';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / aspirations.length) * 100).toFixed(1)
    }));

    // Status distribution
    const statusCounts = {};
    const statusLabels = {
      received: 'Diterima',
      verified: 'Diverifikasi',
      process: 'Dalam Proses',
      followed_up: 'Ditindaklanjuti',
      finished: 'Selesai',
      rejected: 'Ditolak'
    };

    aspirations.forEach(asp => {
      const status = asp.status || 'received';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
      status: status
    }));

    // Monthly trend (last 6 months)
    const monthlyData = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      monthlyData[monthKey] = 0;
    }

    aspirations.forEach(asp => {
      if (asp.created_at) {
        const date = asp.created_at.toDate ? asp.created_at.toDate() : new Date(asp.created_at);
        const monthKey = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey]++;
        }
      }
    });

    const monthlyTrend = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count
    }));

    // Calculate average response time (in days)
    let totalResponseTime = 0;
    let respondedCount = 0;

    aspirations.forEach(asp => {
      if (asp.created_at && asp.updated_at && asp.status !== 'received') {
        const created = asp.created_at.toDate ? asp.created_at.toDate() : new Date(asp.created_at);
        const updated = asp.updated_at.toDate ? asp.updated_at.toDate() : new Date(asp.updated_at);
        const diffDays = Math.floor((updated - created) / (1000 * 60 * 60 * 24));
        totalResponseTime += diffDays;
        respondedCount++;
      }
    });

    const avgResponseTime = respondedCount > 0 ? (totalResponseTime / respondedCount).toFixed(1) : 0;

    // Completion rate
    const finishedCount = statusCounts.finished || 0;
    const completionRate = ((finishedCount / aspirations.length) * 100).toFixed(1);

    return {
      totalAspirations: aspirations.length,
      categoryData,
      statusData,
      monthlyTrend,
      avgResponseTime,
      completionRate,
      pending: (statusCounts.received || 0) + (statusCounts.verified || 0),
      inProgress: (statusCounts.process || 0) + (statusCounts.followed_up || 0),
      finished: statusCounts.finished || 0
    };
  }, [aspirations]);

  const kpiCards = [
    {
      label: 'Total Aspirasi',
      value: analytics.totalAspirations,
      icon: <PieChartIcon className="w-6 h-6" />,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Pending',
      value: analytics.pending,
      icon: <Clock className="w-6 h-6" />,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      label: 'Dalam Proses',
      value: analytics.inProgress,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      label: 'Selesai',
      value: analytics.finished,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Analytics Dashboard</h2>
        <p className="text-slate-500 font-medium">Insight dan statistik aspirasi mahasiswa</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <div
            key={index}
            className="glass-card p-6 rounded-2xl border-white/60 hover:border-blue-200 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${kpi.bgColor} rounded-xl flex items-center justify-center ${kpi.iconColor}`}>
                {kpi.icon}
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {kpi.label}
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
            Rata-rata Waktu Respon
          </div>
          <div className="text-4xl font-black text-blue-600">
            {analytics.avgResponseTime} <span className="text-xl text-slate-400">hari</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
            Completion Rate
          </div>
          <div className="text-4xl font-black text-green-600">
            {analytics.completionRate}%
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution - Pie Chart */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Distribusi Kategori
          </h3>
          {analytics.categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Lainnya} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              Belum ada data
            </div>
          )}
        </div>

        {/* Status Distribution - Bar Chart */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Status Aspirasi
          </h3>
          {analytics.statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {analytics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              Belum ada data
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend - Line Chart */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Tren Bulanan (6 Bulan Terakhir)
        </h3>
        {analytics.monthlyTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                name="Jumlah Aspirasi"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-400">
            Belum ada data
          </div>
        )}
      </div>

      {/* Top Categories Table */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-black text-slate-900 mb-4">Top Kategori</h3>
        <div className="space-y-3">
          {analytics.categoryData
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
            .map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black"
                    style={{ backgroundColor: COLORS[category.name] || COLORS.Lainnya }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-black text-slate-900">{category.name}</div>
                    <div className="text-sm text-slate-500">{category.percentage}% dari total</div>
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{category.value}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
