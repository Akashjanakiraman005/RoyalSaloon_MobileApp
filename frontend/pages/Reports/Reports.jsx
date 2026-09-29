import { useEffect, useMemo, useState } from 'react';
import { Calendar, Download, TrendingUp, TrendingDown, Users, DollarSign, Star, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';
import { apiGet } from '../../lib/api';

export default function Reports() {
  const [overview, setOverview] = useState({
    customersCount: 0,
    servicesCount: 0,
    billsCount: 0,
    totalRevenue: 0,
  });
  const [bills, setBills] = useState([]);
  const [servicesCatalog, setServicesCatalog] = useState([]);

  const isRetailService = (service = {}) => {
    const categoryText = String(service.category || '').toLowerCase();
    const nameText = String(service.name || '').toLowerCase();
    const combined = `${categoryText} ${nameText}`;

    return (
      combined.includes('retail')
      || combined.includes('product')
      || combined.includes('shampoo')
      || combined.includes('conditioner')
      || combined.includes('serum')
      || combined.includes('oil')
      || combined.includes('cream')
      || combined.includes('wax')
      || combined.includes('gel')
    );
  };

  useEffect(() => {
    let active = true;

    async function loadReportData() {
      try {
        const [dashboardResponse, billsResponse, servicesResponse] = await Promise.all([
          apiGet('/api/dashboard'),
          apiGet('/api/bills'),
          apiGet('/api/services'),
        ]);

        if (!active) return;
        setOverview(dashboardResponse || {});
        setBills(billsResponse.items || []);
        setServicesCatalog(servicesResponse.items || []);
      } catch (error) {
        console.error(error);
      }
    }

    loadReportData();

    return () => {
      active = false;
    };
  }, []);

  const forecastData = useMemo(() => {
    const monthMap = new Map();
    const serviceLookup = new Map(servicesCatalog.map((service) => [service.name, service]));

    bills.forEach((bill) => {
      const date = new Date(bill.createdAt || Date.now());
      const key = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

      if (!monthMap.has(key)) {
        monthMap.set(key, { services: 0, retail: 0 });
      }

      const bucket = monthMap.get(key);
      const billServices = Array.isArray(bill.services) ? bill.services : [];
      const billTotal = Number(bill.totalAmount || bill.amount || 0);

      if (!billServices.length) {
        bucket.services += billTotal;
        return;
      }

      const equalShare = billServices.length ? billTotal / billServices.length : 0;

      billServices.forEach((serviceName) => {
        const service = serviceLookup.get(serviceName);
        const lineAmount = Number(service?.price || 0) || equalShare;

        if (isRetailService(service || { name: serviceName })) {
          bucket.retail += lineAmount;
        } else {
          bucket.services += lineAmount;
        }
      });
    });

    return Array.from(monthMap.entries()).map(([name, values]) => ({
      name,
      services: Math.round(values.services),
      retail: Math.round(values.retail),
    }));
  }, [bills, servicesCatalog]);

  const avgTicket = overview.billsCount ? overview.totalRevenue / overview.billsCount : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-headline italic font-bold text-sm tracking-wide text-gold border-r border-stone-200 pr-2">RoyalSalon</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-stone-400">Performance Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-headline tracking-tight text-royal-purple">Reports</h2>
        </div>
        <div className="flex gap-2 shrink-0 print:hidden">
          <button className="bg-stone-50 border border-stone-200 text-stone-700 font-headline font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-white text-xs" type="button">
            <Calendar size={14} />
            Last 30 Days
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-royal-purple text-white font-headline font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 hover:scale-[1.02] transition-transform duration-300 shadow-sm text-xs" 
            type="button"
          >
            <Download size={14} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total Revenue', value: `₹${Number(overview.totalRevenue || 0).toLocaleString('en-IN')}`, trend: 'Live', up: true, icon: DollarSign },
          { label: 'Appointments', value: String(overview.billsCount || 0), trend: 'Invoices', up: true, icon: Calendar },
          { label: 'New Clients', value: String(overview.customersCount || 0), trend: 'Customers', up: true, icon: Users },
          { label: 'Avg. Ticket Value', value: `₹${Number(avgTicket).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, trend: 'Calculated', up: null, icon: Star },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5">
              <stat.icon className="w-12 h-12 text-royal-purple" />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">{stat.label}</p>
            <h3 className="text-lg sm:text-2xl font-extrabold text-royal-purple mb-1.5 truncate">{stat.value}</h3>
            <div className={cn('flex items-center gap-1 text-[10px] font-semibold', stat.up === true ? 'text-emerald-600' : stat.up === false ? 'text-red-600' : 'text-gold')}>
              {stat.up === true && <TrendingUp className="w-3 h-3" />}
              {stat.up === false && <TrendingDown className="w-3 h-3" />}
              {stat.trend} vs last month
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Popularity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col h-[320px]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-headline font-bold text-base text-stone-950">Revenue Forecast</h3>
              <p className="text-[10px] text-stone-400 font-medium font-sans">Monthly breakdown of income streams</p>
            </div>
            <div className="flex gap-3 text-[9px] font-bold uppercase shrink-0">
              <span className="flex items-center gap-1 text-royal-purple-container">
                <span className="w-2 h-2 rounded-full bg-royal-purple-container"></span> Services
              </span>
              <span className="flex items-center gap-1 text-gold">
                <span className="w-2 h-2 rounded-full bg-gold"></span> Retail
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData.length ? forecastData : [{ name: 'N/A', services: 0, retail: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#a8a29e' }} dy={5} />
                <Tooltip cursor={{ fill: '#fafafa', radius: 4 }} contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: 11, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                <Bar dataKey="services" stackId="a" fill="#4b2e83" barSize={24} />
                <Bar dataKey="retail" stackId="a" fill="#735b24" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-royal-purple text-white p-6 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between h-[250px] lg:h-auto">
          <div className="relative z-10 space-y-4">
            <h3 className="font-headline font-bold text-base text-white">Service Popularity</h3>
            <div className="space-y-4 text-xs">
              {[
                { rank: '01', name: 'Top Service', count: `${overview.servicesCount || 0} Active Services` },
                { rank: '02', name: 'Total Customers', count: `${overview.customersCount || 0} Clients` },
                { rank: '03', name: 'Invoices Processed', count: `${overview.billsCount || 0} Bills` },
              ].map((service, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-headline font-bold text-gold text-xs">{service.rank}</span>
                    <div>
                      <p className="font-bold">{service.name}</p>
                      <p className="text-[9px] text-white/50 uppercase tracking-widest">{service.count}</p>
                    </div>
                  </div>
                  <TrendingUp className="w-4 h-4 text-gold shrink-0" />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-gold/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Events log Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 flex justify-between items-center border-b border-stone-200 bg-stone-50/50">
          <div>
            <h3 className="font-headline font-bold text-base text-stone-950">Performance Events</h3>
            <p className="text-[10px] text-stone-400 font-medium">Derived billing transactions</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/20 border-b border-stone-200 text-stone-400 text-[9px] font-bold uppercase tracking-wider">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Service Professional</th>
                <th className="px-5 py-3">Client Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {bills.slice(0, 5).map((event, i) => (
                <tr key={i} className="hover:bg-stone-50/40 transition-colors">
                  <td className="px-5 py-4 font-medium text-stone-600">{new Date(event.createdAt || Date.now()).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-royal-purple text-white flex items-center justify-center text-[9px] font-bold font-headline">{(event.customerName || 'NA').slice(0, 2).toUpperCase()}</div>
                      <span className="font-semibold text-stone-900">{event.customerName || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider', (event.customerType || 'Returning') === 'VIP' ? 'bg-violet-50 text-violet-600 border border-violet-100' : 'bg-stone-100 text-stone-600')}>
                      {event.customerType || 'Returning'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('w-1.5 h-1.5 rounded-full', (event.status || 'Completed') === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500')}></span>
                      <span className="font-medium text-stone-600">{event.status || 'Completed'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-stone-950">₹{Number(event.totalAmount || event.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {bills.length === 0 && (
            <div className="px-5 py-8 text-xs text-stone-400 text-center">No performance events found yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
