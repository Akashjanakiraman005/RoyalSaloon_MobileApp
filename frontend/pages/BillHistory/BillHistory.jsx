import { useEffect, useMemo, useState } from 'react';
import { Eye, Download, Mail, MessageSquare, ChevronLeft, ChevronRight, CreditCard, Wallet, Smartphone } from 'lucide-react';
import { cn } from '../../lib/utils';
import { apiGet } from '../../lib/api';
import { shareBillNative } from '../../lib/share';
import { toast } from 'react-toastify';

export default function BillHistory() {
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadBills() {
      try {
        const [billsResponse, customersResponse] = await Promise.all([
          apiGet('/api/bills'),
          apiGet('/api/customers'),
        ]);

        if (active) {
          setBills(billsResponse.items || []);
          setCustomers(customersResponse.items || []);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadBills();

    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => {
    const revenue = bills.reduce((sum, bill) => sum + Number(bill.totalAmount || bill.amount || 0), 0);
    const avg = bills.length ? revenue / bills.length : 0;
    return { revenue, avg };
  }, [bills]);

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getIconForMethod = (method = '') => {
    const key = method.toLowerCase();
    if (key.includes('cash')) return Wallet;
    if (key.includes('upi') || key.includes('apple') || key.includes('phone')) return Smartphone;
    return CreditCard;
  };

  const toWhatsAppPhone = (value) => {
    const digits = String(value || '').replace(/\D/g, '');

    if (digits.length === 10) {
      return `91${digits}`;
    }

    if (digits.length === 11 && digits.startsWith('0')) {
      return `91${digits.slice(1)}`;
    }

    if (digits.length >= 12) {
      return digits;
    }

    return '';
  };

  const resolveBillPhone = (bill) => {
    const directPhone = toWhatsAppPhone(bill?.customerPhone || bill?.phone || '');
    if (directPhone) return directPhone;

    const billCustomerId = String(bill?.customerId || '');
    const billCustomerName = String(bill?.customerName || bill?.name || '').trim().toLowerCase();

    const matchedCustomer = customers.find((customer) => {
      const customerId = String(customer?._id || '');
      const customerName = String(customer?.name || '').trim().toLowerCase();

      if (billCustomerId && customerId && billCustomerId === customerId) {
        return true;
      }

      return Boolean(billCustomerName && customerName && billCustomerName === customerName);
    });

    return toWhatsAppPhone(matchedCustomer?.phone || '');
  };

  const buildShareText = (bill) => {
    const items = Array.isArray(bill?.services) ? bill.services : [];
    const itemLines = items.length ? items.map((item, index) => `${index + 1}. ${item}`).join('\n') : 'No services';
    const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
    const pdfLink = `${apiBase}/api/bills/${bill._id}/pdf`;

    return [
      'RoyalSalon Luxury Concierge',
      `Customer: ${bill.customerName || 'Customer'}`,
      `Payment Method: ${String(bill.paymentMethod || bill.method || '-').toUpperCase()}`,
      '',
      'Services:',
      itemLines,
      '',
      `Total: ${formatCurrency(bill.totalAmount || bill.amount)}`,
      '',
      'Download PDF',
      pdfLink,
    ].join('\n');
  };

  const viewPdf = (bill) => {
    if (!bill?._id) {
      toast.error('Missing bill id');
      return;
    }
    const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
    const pdfUrl = `${apiBase}/api/bills/${bill._id}/pdf`;
    
    const isMobile = window.location.origin.startsWith('file:') || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.open(pdfUrl, '_system');
    } else {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const downloadPdf = async (bill) => {
    if (!bill?._id) {
      toast.error('Missing bill id');
      return;
    }

    const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
    const pdfUrl = `${apiBase}/api/bills/${bill._id}/pdf`;
    
    const isMobile = window.location.origin.startsWith('file:') || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      window.open(pdfUrl, '_system');
      toast.success('Opening PDF in system browser');
    } else {
      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error('Failed to generate PDF');

        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `royalsalon-bill-${bill._id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(downloadUrl);
        toast.success('PDF downloaded successfully');
      } catch (error) {
        console.error(error);
        toast.error('Unable to download PDF');
      }
    }
  };

  const emailBill = async (bill) => {
    const shareText = buildShareText(bill);
    const sharedNatively = await shareBillNative(bill._id, bill.customerName || 'Customer', shareText);
    if (sharedNatively) return;

    const subject = encodeURIComponent(`RoyalSalon Bill - ${bill.customerName || 'Customer'}`);
    const body = encodeURIComponent(shareText);
    const email = bill.customerEmail || '';
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const whatsappBill = async (bill) => {
    const shareText = buildShareText(bill);
    const sharedNatively = await shareBillNative(bill._id, bill.customerName || 'Customer', shareText);
    if (sharedNatively) return;

    const phoneNumber = resolveBillPhone(bill);
    if (!phoneNumber) {
      toast.error('Valid customer phone is required for WhatsApp');
      return;
    }

    const text = encodeURIComponent(shareText);
    const appUrl = `whatsapp://send?phone=${phoneNumber}&text=${text}`;
    const webUrl = `https://wa.me/${phoneNumber}?text=${text}`;
    const webFallbackUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${text}`;

    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent || '');

    if (isMobile) {
      window.location.assign(appUrl);
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          window.location.assign(webUrl);
        }
      }, 700);
      return;
    }

    const popup = window.open(webUrl, '_blank', 'noopener,noreferrer');
    if (!popup) {
      window.location.assign(webFallbackUrl);
    }
  };

  const exportCsv = () => {
    if (!bills.length) {
      toast.error('No bills available to export');
      return;
    }

    const headers = ['Bill No', 'Customer', 'Services', 'Date', 'Amount', 'Payment Method'];
    const rows = bills.map((bill, index) => [
      bill.billNo || `INV-${String(index + 1).padStart(4, '0')}`,
      bill.customerName || bill.name || '',
      Array.isArray(bill.services) ? bill.services.join('; ') : bill.services || '',
      formatDate(bill.createdAt || bill.date),
      Number(bill.totalAmount || bill.amount || 0).toFixed(2),
      bill.paymentMethod || bill.method || '',
    ]);

    const escapeCell = (cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'royalsalon-bill-history.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const getInitial = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'NA';

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Executive Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-headline italic font-bold text-sm tracking-wide text-gold border-r border-stone-200 pr-2">RoyalSalon</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-stone-400">Transaction Ledger</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-headline tracking-tight text-royal-purple">Bill History</h2>
        </div>
        <button className="flex items-center gap-2 bg-royal-purple text-white px-5 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] shadow-sm shrink-0" type="button" onClick={exportCsv}>
          <Download size={16} />
          Export CSV
        </button>
      </section>

      {/* Stats cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total Revenue', value: formatCurrency(totals.revenue), sub: 'Live from DB', color: 'text-emerald-600' },
          { label: 'Total Invoices', value: String(bills.length), sub: 'Current records', color: 'text-stone-500' },
          { label: 'Average Ticket', value: formatCurrency(totals.avg), sub: 'Per invoice', color: 'text-gold' },
          { label: 'New Customers', value: String(bills.filter((bill) => bill.customerType === 'new').length), sub: 'Derived metric', color: 'text-white/90', dark: true },
        ].map((stat, i) => (
          <div key={i} className={cn('p-4 sm:p-6 rounded-xl ambient-shadow relative overflow-hidden group', stat.dark ? 'bg-royal-purple text-white' : 'bg-white border border-stone-200 shadow-sm')}>
            <div className="relative z-10">
              <p className={cn('text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1', stat.dark ? 'text-white/70' : 'text-stone-400')}>{stat.label}</p>
              <h3 className={cn('text-lg sm:text-2xl font-sans font-extrabold truncate', stat.dark ? 'text-white' : 'text-royal-purple')}>{stat.value}</h3>
              <div className={cn('mt-2 sm:mt-4 flex items-center text-[10px] sm:text-xs font-semibold', stat.color)}>{stat.sub}</div>
            </div>
            {stat.dark && <div className="absolute inset-0 bg-gradient-to-br from-royal-purple to-royal-purple-container opacity-100 group-hover:scale-110 transition-transform duration-500"></div>}
          </div>
        ))}
      </div>

      {/* Spacious, Perfectly Aligned Table (Wraps in horizontal scroll container for mobile) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-200 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-5 py-4 w-28">Bill No.</th>
                <th className="px-5 py-4">Client</th>
                <th className="px-5 py-4">Treatments</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4 text-right">Amount</th>
                <th className="px-5 py-4 w-32">Method</th>
                <th className="px-5 py-4 text-right w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {bills.map((bill, i) => (
                <tr key={bill._id || i} className="hover:bg-royal-purple/5 transition-colors group cursor-pointer">
                  <td className="px-5 py-4">
                    <span className="font-sans font-bold text-royal-purple">{bill.billNo || `#INV-${String(i + 1).padStart(4, '0')}`}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold text-[9px] shrink-0">
                        {getInitial(bill.customerName || bill.name)}
                      </div>
                      <span className="font-semibold text-stone-900">{bill.customerName || bill.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 max-w-[150px] truncate">
                    <span className="text-[10px] text-stone-500 bg-stone-50 px-2.5 py-1 rounded border border-stone-150 block truncate">
                      {Array.isArray(bill.services) ? bill.services.join(', ') : bill.services || 'N/A'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-stone-600 font-medium">{formatDate(bill.createdAt || bill.date)}</td>
                  <td className="px-5 py-4 font-sans font-bold text-stone-900 text-right">
                    {formatCurrency(bill.totalAmount || bill.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-stone-500">
                      {(() => {
                        const Icon = getIconForMethod(bill.paymentMethod || bill.method || 'card');
                        return <Icon size={13} className="text-stone-400 shrink-0" />;
                      })()}
                      <span className="text-[10px] uppercase font-semibold">{bill.paymentMethod || bill.method || 'card'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {[
                        { Icon: Eye, action: () => viewPdf(bill) },
                        { Icon: Download, action: () => downloadPdf(bill) },
                        { Icon: Mail, action: () => emailBill(bill) },
                        { Icon: MessageSquare, action: () => whatsappBill(bill) },
                      ].map(({ Icon, action }, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); action(); }}
                          className="p-1.5 text-gold hover:bg-gold/10 rounded-lg transition-colors border border-stone-150 bg-white"
                        >
                          <Icon size={13} />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bills.length === 0 && (
            <div className="px-5 py-8 text-xs text-stone-400 text-center">No bills found in database yet.</div>
          )}
        </div>

        {/* Table Pagination */}
        <div className="px-5 py-3.5 bg-stone-50/50 border-t border-stone-200 flex justify-between items-center text-[10px] text-stone-400">
          <p className="font-medium font-sans">Showing {bills.length} transactions</p>
          <div className="flex gap-1">
            <button className="w-6 h-6 flex items-center justify-center rounded-lg border border-stone-150 text-stone-400 hover:bg-white transition-all" type="button"><ChevronLeft size={12} /></button>
            <button className="w-6 h-6 flex items-center justify-center rounded-lg bg-royal-purple text-white font-bold" type="button">1</button>
            <button className="w-6 h-6 flex items-center justify-center rounded-lg border border-stone-150 text-stone-400 hover:bg-white transition-all" type="button"><ChevronRight size={12} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
