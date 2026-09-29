import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Users, Receipt, BarChart3, Star, Calendar, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { apiGet } from '../../lib/api';

export default function Dashboard() {
  const [overview, setOverview] = useState({
    customersCount: 0,
    servicesCount: 0,
    billsCount: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    monthlySeries: [],
  });
  const [recentBills, setRecentBills] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [dashboardResponse, billsResponse] = await Promise.all([
          apiGet('/api/dashboard'),
          apiGet('/api/bills'),
        ]);

        if (!active) return;

        setOverview(dashboardResponse || {});
        setRecentBills((billsResponse.items || []).slice(0, 5));
      } catch (error) {
        console.error(error);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const chartData = useMemo(
    () => (Array.isArray(overview.monthlySeries) ? overview.monthlySeries.map((item) => ({ name: item.label, value: Number(item.totalRevenue || 0) })) : []),
    [overview.monthlySeries]
  );

  const monthlyGrowth = useMemo(() => {
    const series = Array.isArray(overview.monthlySeries) ? overview.monthlySeries : [];
    if (series.length < 2) {
      return 0;
    }

    const current = Number(series[series.length - 1]?.totalRevenue || 0);
    const previous = Number(series[series.length - 2]?.totalRevenue || 0);

    if (previous <= 0) {
      return current > 0 ? 100 : 0;
    }

    return ((current - previous) / previous) * 100;
  }, [overview.monthlySeries]);

  const todaySales = useMemo(() => {
    const todayKey = new Date().toDateString();
    return recentBills.reduce((sum, bill) => {
      const date = new Date(bill.createdAt || Date.now());
      if (date.toDateString() !== todayKey) {
        return sum;
      }

      return sum + Number(bill.totalAmount || bill.amount || 0);
    }, 0);
  }, [recentBills]);

  const salonCapacity = useMemo(() => {
    const maxQueueSize = 6;
    const count = Number(overview.customersCount || 0);
    return Math.min(100, Math.round((count / maxQueueSize) * 100));
  }, [overview.customersCount]);

  const stats = [
    { label: 'Today Sales', value: `₹${Number(todaySales || 0).toLocaleString('en-IN')}`, icon: TrendingUp, live: true, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Bills', value: String(overview.billsCount || 0), icon: Receipt, color: 'text-royal-purple', bg: 'bg-royal-purple/10' },
    { label: 'Total Customers', value: String(overview.customersCount || 0), icon: Users, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Monthly Revenue', value: `₹${Number(overview.monthlyRevenue || 0).toLocaleString('en-IN')}`, icon: BarChart3, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  ];

  const currentDateText = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Executive Welcome Banner */}
      <header className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-royal-purple to-royal-purple-container p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">Executive Console</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight">RoyalSalon Suite</h2>
            <p className="text-xs text-white/70">Welcome back. Here is your salon\'s operational blueprint.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs backdrop-blur-md border border-white/10 shrink-0">
            <Calendar size={14} className="text-gold" />
            <span className="font-semibold">{currentDateText}</span>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
      </header>

      {/* Modern Compact Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between h-32 hover:border-gold/30 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start">
              <div className={cn('p-2.5 rounded-xl', stat.bg, stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.live && (
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                  Live
                </span>
              )}
            </div>
            <div>
              <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg sm:text-xl font-bold text-stone-900 mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics & Queue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col h-[350px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-headline font-bold text-base text-stone-950">Revenue Analytics</h3>
              <p className="text-[10px] text-stone-400 font-medium">Monthly collection trends</p>
            </div>
            <div className="flex bg-stone-100 p-0.5 rounded-full border border-stone-200">
              <button className="px-3 py-1 text-[10px] font-bold rounded-full bg-white shadow-sm text-royal-purple" type="button">Monthly</button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.length ? chartData : [{ name: 'N/A', value: 0 }]}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4b2e83" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#735b24" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#a8a29e' }}
                  dy={5}
                />
                <Tooltip
                  cursor={{ fill: '#fafafa', radius: 4 }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: 11, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="value" fill="url(#chartGradient)" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden h-[180px] lg:h-auto">
          <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mb-3">
            <Star size={24} className="text-gold fill-gold" />
          </div>
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest mb-1">Salon Capacity</h4>
          <p className="text-3xl font-extrabold text-royal-purple">{salonCapacity}%</p>
          <p className="text-[10px] text-stone-400 mt-1 max-w-[160px]">Active customers vs queue capacity (6max)</p>
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-royal-purple/5 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Transactions Section */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 flex justify-between items-center border-b border-stone-200">
          <div>
            <h3 className="font-headline font-bold text-base text-stone-950">Recent Transactions</h3>
            <p className="text-[10px] text-stone-400 font-medium font-sans">Latest invoice submissions</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-200 text-stone-400 text-[9px] font-bold uppercase tracking-wider">
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentBills.map((row, i) => (
                <tr key={i} className="hover:bg-stone-50/40 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-royal-purple/10 text-royal-purple flex items-center justify-center text-[10px] font-bold font-headline">{(row.customerName || 'NA').slice(0, 2).toUpperCase()}</div>
                      <span className="text-xs font-semibold text-stone-900">{row.customerName || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-stone-500 max-w-[180px] truncate">{Array.isArray(row.services) ? row.services.join(', ') : row.services || '-'}</td>
                  <td className="px-5 py-3 text-xs text-stone-500">{new Date(row.createdAt || Date.now()).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3 text-xs font-bold text-stone-900">₹{Number(row.totalAmount || row.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider',
                        (row.status || 'Paid') === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      )}
                    >
                      {row.status || 'Paid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentBills.length === 0 && <div className="px-5 py-6 text-xs text-stone-400 text-center">No recent transactions available yet.</div>}
        </div>
      </section>
    </div>
  );
}
