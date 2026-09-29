import { useEffect, useMemo, useState } from 'react';
import { UserPlus, TrendingUp, Award, DollarSign, Filter, Download, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { apiGet } from '../../lib/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCustomers() {
      try {
        const [customersResponse, billsResponse] = await Promise.all([
          apiGet('/api/customers'),
          apiGet('/api/bills'),
        ]);

        const existingCustomers = customersResponse.items || [];
        const bills = billsResponse.items || [];

        const normalizePhone = (value) => String(value || '').replace(/\D/g, '');
        const normalizeName = (value) => String(value || '').trim().toLowerCase();
        const buildKey = (name, phone) => {
          const digits = normalizePhone(phone);
          if (digits) return `p:${digits}`;
          const normalizedName = normalizeName(name);
          return normalizedName ? `n:${normalizedName}` : '';
        };

        const billStatsByKey = new Map();

        bills.forEach((bill) => {
          const name = bill.customerName || bill.name || '';
          const phone = bill.customerPhone || bill.phone || '';
          const key = buildKey(name, phone);

          if (!key) return;

          const current = billStatsByKey.get(key) || {
            name: name || 'Unknown',
            phone: phone || '-',
            visits: 0,
            totalSpent: 0,
            lastVisit: '-',
            lastPaymentMethod: '-',
            lastPaymentAmount: 0,
            lastBillId: '',
            lastServices: [],
          };

          current.visits += 1;
          current.totalSpent += Number(bill.totalAmount || bill.amount || 0);

          const billDate = bill.createdAt || bill.date;
          if (billDate) {
            if (current.lastVisit === '-' || new Date(billDate) > new Date(current.lastVisit)) {
              current.lastVisit = billDate;
              current.lastPaymentMethod = bill.paymentMethod || bill.method || current.lastPaymentMethod || '-';
              current.lastPaymentAmount = Number(bill.totalAmount || bill.amount || 0);
              current.lastBillId = String(bill._id || current.lastBillId || '');
              current.lastServices = Array.isArray(bill.services) ? bill.services : current.lastServices;
            }
          }

          billStatsByKey.set(key, current);
        });

        const mergedExistingCustomers = existingCustomers.map((customer) => {
          const key = buildKey(customer.name, customer.phone);
          const stats = key ? billStatsByKey.get(key) : null;

          if (!stats) return customer;

          billStatsByKey.delete(key);

          return {
            ...customer,
            visits: Number(stats.visits || customer.visits || 0),
            totalSpent: Number(stats.totalSpent || customer.totalSpent || customer.spent || 0),
            lastVisit: stats.lastVisit !== '-' ? stats.lastVisit : (customer.lastVisit || customer.last || '-'),
            lastPaymentMethod: stats.lastPaymentMethod || customer.lastPaymentMethod || '-',
            lastPaymentAmount: Number(stats.lastPaymentAmount || customer.lastPaymentAmount || 0),
            lastBillId: stats.lastBillId || customer.lastBillId || '',
            lastServices: Array.isArray(stats.lastServices) ? stats.lastServices : (customer.lastServices || []),
          };
        });

        const derivedCustomers = Array.from(billStatsByKey.entries()).map(([key, stats]) => ({
          _id: `derived-${key}`,
          name: stats.name,
          phone: stats.phone,
          visits: Number(stats.visits || 0),
          totalSpent: Number(stats.totalSpent || 0),
          tier: 'Standard Client',
          lastVisit: stats.lastVisit,
          lastPaymentMethod: stats.lastPaymentMethod || '-',
          lastPaymentAmount: Number(stats.lastPaymentAmount || 0),
          lastBillId: stats.lastBillId || '',
          lastServices: Array.isArray(stats.lastServices) ? stats.lastServices : [],
        }));

        const mergedCustomers = [...mergedExistingCustomers, ...derivedCustomers].filter((customer) => {
          const name = String(customer?.name || '').trim().toLowerCase();
          const email = String(customer?.email || '').trim().toLowerCase();
          return name !== 'guest customer' && email !== 'guest@example.com';
        });

        const sortedBills = [...bills].sort((left, right) => new Date(right.createdAt || right.date || 0) - new Date(left.createdAt || left.date || 0));

        if (active) {
          setCustomers(mergedCustomers);
          setRecentBills(sortedBills);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCustomers();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCustomerId && customers.length) {
      setSelectedCustomerId(String(customers[0]._id || ''));
    }
  }, [customers, selectedCustomerId]);

  const stats = useMemo(() => {
    const totalActive = customers.length;
    const totalVisits = customers.reduce((sum, customer) => sum + Number(customer.visits || 0), 0);
    const totalSpent = customers.reduce((sum, customer) => sum + Number(customer.totalSpent || customer.spent || 0), 0);
    const avgSpent = totalActive ? totalSpent / totalActive : 0;

    return {
      totalActive,
      totalVisits,
      avgSpent,
    };
  }, [customers]);

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

  const getInitial = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'NA';

  const selectedCustomer = useMemo(
    () => customers.find((customer) => String(customer._id) === String(selectedCustomerId)) || null,
    [customers, selectedCustomerId]
  );

  const latestPayment = useMemo(() => {
    if (!selectedCustomer) return null;

    const normalizedSelectedName = String(selectedCustomer.name || '').trim().toLowerCase();
    const matchedBills = recentBills.filter((bill) => {
      const billCustomerId = String(bill.customerId || '');
      const billCustomerName = String(bill.customerName || bill.name || '').trim().toLowerCase();
      return (
        (billCustomerId && String(selectedCustomer._id || '') === billCustomerId) ||
        (normalizedSelectedName && billCustomerName === normalizedSelectedName)
      );
    });

    return matchedBills[0] || null;
  }, [recentBills, selectedCustomer]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold">Membership Directory</span>
          <h2 className="text-xl sm:text-2xl font-extrabold font-headline tracking-tight text-royal-purple">Client Registry</h2>
        </div>
        <button className="flex items-center gap-2 bg-gold text-white px-5 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] shadow-md shadow-gold/15 shrink-0" type="button">
          <UserPlus size={16} />
          Add Client
        </button>
      </div>

      {/* Modern Compact Directory Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Registered Clients', value: String(stats.totalActive), detail: `${stats.totalVisits} Visits`, icon: TrendingUp },
          { label: 'Membership Status', value: stats.totalActive ? 'Active' : 'No Data', detail: 'Primary Ledger', icon: Award },
          { label: 'Average Client Value', value: formatCurrency(stats.avgSpent), detail: 'Per profile', icon: DollarSign },
        ].map((stat, i) => (
          <div key={i} className={cn('bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden', i === 2 ? 'col-span-2 sm:col-span-1' : '')}>
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-end justify-between mt-1">
              <span className="text-lg sm:text-xl font-headline font-extrabold text-stone-900">{stat.value}</span>
              <span className="text-gold text-[10px] font-bold flex items-center gap-0.5 shrink-0">
                <stat.icon className="w-3.5 h-3.5" />
                {stat.detail}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Details & Customer Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Selected Customer Premium VIP Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-stone-150 pb-3">
            <div>
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Account Overview</span>
              <h3 className="text-sm font-headline font-extrabold text-stone-900">{selectedCustomer?.name || 'Walk-in Profile'}</h3>
            </div>
            <span className="text-[8px] font-bold text-gold uppercase tracking-widest bg-gold/10 px-2 py-1 rounded-full">
              {selectedCustomer?.tier || 'VIP Guest'}
            </span>
          </div>

          {selectedCustomer ? (
            <div className="space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between pb-1.5 border-b border-stone-100"><span className="text-stone-400">Phone</span><span className="font-semibold text-stone-900">{selectedCustomer.phone || '-'}</span></div>
                <div className="flex justify-between pb-1.5 border-b border-stone-100"><span className="text-stone-400">Email</span><span className="font-semibold text-stone-900 truncate max-w-[150px]">{selectedCustomer.email || '-'}</span></div>
                <div className="flex justify-between pb-1.5 border-b border-stone-100"><span className="text-stone-400">Payment Option</span><span className="font-semibold text-stone-900 uppercase">{latestPayment?.paymentMethod || selectedCustomer.lastPaymentMethod || '-'}</span></div>
                <div className="flex justify-between pb-1.5 border-b border-stone-100"><span className="text-stone-400">Last Service Date</span><span className="font-semibold text-stone-900">{selectedCustomer.lastVisit || '-'}</span></div>
              </div>

              {/* VIP Concierge Metrics */}
              <div className="bg-royal-purple/5 p-3 rounded-xl border border-royal-purple/10 space-y-3">
                <p className="text-[9px] font-bold text-royal-purple uppercase tracking-wider">Customer Ledger</p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-stone-150">
                    <span className="block text-[8px] text-stone-400 uppercase">Visits</span>
                    <span className="font-headline font-extrabold text-sm text-stone-900">{Number(selectedCustomer.visits || 0)}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-stone-150">
                    <span className="block text-[8px] text-stone-400 uppercase">Total Spent</span>
                    <span className="font-headline font-extrabold text-xs text-stone-900 truncate block">{formatCurrency(selectedCustomer.totalSpent || 0)}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-stone-150">
                    <span className="block text-[8px] text-stone-400 uppercase">Last Invoice</span>
                    <span className="font-semibold text-[10px] text-stone-900 block truncate">{selectedCustomer.lastBillId ? `#${String(selectedCustomer.lastBillId).slice(-4)}` : '-'}</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-royal-purple/10">
                  <p className="text-[9px] text-stone-500 uppercase leading-relaxed">
                    Last Treatment: <span className="font-semibold text-royal-purple">{Array.isArray(selectedCustomer.lastServices) && selectedCustomer.lastServices.length ? selectedCustomer.lastServices.join(', ') : 'None recorded'}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-stone-400 font-medium">
              Select a client from the registry table to view account history.
            </div>
          )}
        </div>

        {/* Clientele Registry Table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-stone-50/50 border-b border-stone-200">
            <div className="flex gap-2 flex-wrap">
              <button className="px-3 py-1 bg-royal-purple text-white rounded-full text-[10px] font-bold font-headline uppercase tracking-wider" type="button">All Clients</button>
              <button className="px-3 py-1 text-stone-400 hover:bg-stone-100 rounded-full text-[10px] font-bold font-headline uppercase tracking-wider transition-colors" type="button">VIP</button>
            </div>
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <button className="p-1.5 text-stone-400 hover:text-royal-purple transition-colors" type="button">
                <Filter size={16} />
              </button>
              <button className="p-1.5 text-stone-400 hover:text-royal-purple transition-colors" type="button">
                <Download size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 max-h-[480px] overflow-y-auto p-4 scrollbar-thin">
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              {customers.map((customer, i) => (
                <button
                  key={customer._id || i}
                  type="button"
                  onClick={() => setSelectedCustomerId(String(customer._id || ''))}
                  className={cn(
                    'p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all duration-300 relative overflow-hidden bg-stone-50/10 hover:bg-white',
                    String(customer._id) === String(selectedCustomerId)
                      ? 'border-royal-purple bg-royal-purple/5 ring-1 ring-royal-purple shadow-md'
                      : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold font-headline bg-royal-purple/10 text-royal-purple text-xs shrink-0">
                      {getInitial(customer.name)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-headline font-bold text-sm text-stone-900 truncate">{customer.name}</h4>
                      <p className="text-[10px] text-stone-400 font-semibold mt-0.5 tracking-wider">{customer.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block text-[8px] font-bold text-gold uppercase tracking-widest bg-gold/10 px-2 py-0.5 rounded-full mb-1">
                      {customer.tier || 'VIP Client'}
                    </span>
                    <span className="text-[10px] text-stone-500 font-bold block">Spent: {formatCurrency(customer.totalSpent || customer.spent)}</span>
                  </div>
                </button>
              ))}
            </div>
            {!loading && customers.length === 0 && (
              <div className="py-8 text-xs text-stone-400 text-center">No customers found in database yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
