import { useEffect, useMemo, useState } from 'react';
import { User, Scissors, Plus, Trash2, Printer, Download, Mail, MessageSquare, Share2, CheckCircle2, DollarSign, Receipt, Sparkles, MoveRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { apiGet, apiPost } from '../../lib/api';
import { shareBillNative } from '../../lib/share';
import { toast } from 'react-toastify';
import upiQrCodeImage from '../../../assets/Qr code.jpeg';

const BILL_DRAFT_STORAGE_KEY = 'royalsalon:new-bill-draft';

function readDraftBillState() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawDraft = window.localStorage.getItem(BILL_DRAFT_STORAGE_KEY);
    if (!rawDraft) {
      return null;
    }

    const draft = JSON.parse(rawDraft);
    return {
      selectedCustomerId: typeof draft.selectedCustomerId === 'string' ? draft.selectedCustomerId : '',
      customerNameInput: typeof draft.customerNameInput === 'string' ? draft.customerNameInput : '',
      customerPhoneInput: typeof draft.customerPhoneInput === 'string' ? draft.customerPhoneInput : '',
      billItems: Array.isArray(draft.billItems)
        ? draft.billItems
          .filter((item) => item && item.serviceId != null)
          .map((item) => ({ serviceId: String(item.serviceId) }))
        : [],
      paymentMethod: typeof draft.paymentMethod === 'string' ? draft.paymentMethod : 'cash',
    };
  } catch (error) {
    console.error('Failed to restore draft bill state', error);
    return null;
  }
}

function shouldHideService(service) {
  const searchText = `${service?.name || ''} ${service?.category || ''}`.toLowerCase();
  return searchText.includes('beard') || searchText.includes('hair wash & care');
}

function hasMassageService(services) {
  return services.some((service) => {
    const searchText = `${service?.name || ''} ${service?.category || ''}`.toLowerCase();
    return searchText.includes('massage');
  });
}

const fallbackServices = [
  {
    _id: 'fallback-haircut',
    name: 'Royal Haircut',
    description: 'Precision haircut with consultation and styling finish',
    category: 'Hair Styling',
    duration: 45,
    price: 1200,
  },
  {
    _id: 'fallback-facial',
    name: 'Classic Facial',
    description: 'Deep cleansing facial with glow therapy',
    category: 'Skin Care',
    duration: 60,
    price: 1800,
  },
  {
    _id: 'fallback-shaving',
    name: 'Luxury Shaving',
    description: 'Hot towel shave with premium aftercare',
    category: 'Barbering',
    duration: 30,
    price: 750,
  },
  {
    _id: 'fallback-head-massage',
    name: 'Head Massage',
    description: 'Relaxing head massage with signature oil therapy',
    category: 'Hair Care',
    duration: 35,
    price: 900,
  },
  {
    _id: 'fallback-manicure-pedicure',
    name: 'Manicure & Pedicure',
    description: 'Nail care and spa polish service',
    category: 'Nail Care',
    duration: 75,
    price: 1400,
  },
  {
    _id: 'fallback-hair-coloring',
    name: 'Hair Coloring',
    description: 'Professional color application and tone matching',
    category: 'Hair Color',
    duration: 90,
    price: 3500,
  },
];

const getServiceImageUrl = (service) => {
  const apiBase = import.meta.env.VITE_API_URL || '';
  const name = String(service?.name || '').toLowerCase();
  let imgPath = '';
  
  if (name.includes('haircut')) imgPath = '/media/Haircut.jpeg';
  else if (name.includes('facial')) imgPath = '/media/Facial.jpeg';
  else if (name.includes('shaving') || name.includes('beard') || name.includes('grooming')) imgPath = '/media/Shaving.jpeg';
  else if (name.includes('massage')) imgPath = '/media/Hair massage.jpeg';
  else if (name.includes('wash') || name.includes('care')) imgPath = '/media/Hair wash.jpeg';
  else if (name.includes('manicure') || name.includes('pedicure') || name.includes('nail')) imgPath = '/media/manicure and pedicure.jpeg';
  else if (name.includes('color')) imgPath = '/media/Haircut.jpeg';
  else imgPath = service?.imageUrl || '';

  if (imgPath.startsWith('/media')) {
    return `${apiBase}${imgPath}`;
  }
  return imgPath || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80';
};

function mergeMissingCoreServices(loadedServices) {
  const byName = new Set(
    loadedServices.map((service) => String(service?.name || '').trim().toLowerCase()).filter(Boolean)
  );

  const missingFallbackServices = fallbackServices.filter((service) => !byName.has(String(service.name).trim().toLowerCase()));
  return [...loadedServices, ...missingFallbackServices];
}

export default function NewBill() {
  const draftState = useMemo(() => readDraftBillState(), []);

  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(draftState?.selectedCustomerId || '');
  const [customerNameInput, setCustomerNameInput] = useState(draftState?.customerNameInput || '');
  const [customerPhoneInput, setCustomerPhoneInput] = useState(draftState?.customerPhoneInput || '');
  const [billItems, setBillItems] = useState(draftState?.billItems || []);
  const [paymentMethod, setPaymentMethod] = useState(draftState?.paymentMethod || 'cash');
  const [addButtonState, setAddButtonState] = useState('Add service');
  const [lastBill, setLastBill] = useState(null);
  const [lastBillSignature, setLastBillSignature] = useState('');
  const [showGeneratePaymentOptions, setShowGeneratePaymentOptions] = useState(false);
  const [showUpiQrCode, setShowUpiQrCode] = useState(false);
  const [showCardMachinePrompt, setShowCardMachinePrompt] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const toPhoneDigits = (value) => String(value || '').replace(/\D/g, '').slice(0, 10);
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
  const formatPhoneInput = (value) => {
    const digits = toPhoneDigits(value);
    if (digits.length <= 5) {
      return digits;
    }
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [customersResponse, servicesResponse] = await Promise.all([
          apiGet('/api/customers'),
          apiGet('/api/services'),
        ]);

        if (!active) return;

        const loadedCustomers = customersResponse.items || [];
        const loadedServices = servicesResponse.items || [];
        const filteredLoadedServices = loadedServices.filter((service) => !shouldHideService(service));
        const servicesWithCoreOptions = mergeMissingCoreServices(filteredLoadedServices);
        const mergedServices = hasMassageService(servicesWithCoreOptions)
          ? servicesWithCoreOptions
          : [...servicesWithCoreOptions, fallbackServices.find((service) => service._id === 'fallback-head-massage')].filter(Boolean);

        setCustomers(loadedCustomers);
        setServices(mergedServices.length ? mergedServices : fallbackServices);

      } catch (error) {
        console.error(error);
        setServices(fallbackServices);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const selectedServices = useMemo(
    () => billItems.map((item) => services.find((service) => String(service._id) === String(item.serviceId))).filter(Boolean),
    [billItems, services]
  );
  const subtotal = useMemo(() => selectedServices.reduce((sum, service) => sum + Number(service.price || 0), 0), [selectedServices]);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;
  const selectedServiceIds = useMemo(() => new Set(billItems.map((item) => String(item.serviceId))), [billItems]);

  const categories = useMemo(() => {
    const list = new Set(services.map((s) => s.category).filter(Boolean));
    return ['All', ...Array.from(list)];
  }, [services]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'All') return services;
    return services.filter((s) => s.category === selectedCategory);
  }, [services, selectedCategory]);

  const customer = customers.find((item) => String(item._id) === String(selectedCustomerId));

  const finalCustomerName = customerNameInput.trim() || customer?.name || '';
  const finalCustomerPhoneDigits = toPhoneDigits(customerPhoneInput || customer?.phone || '');
  const canSaveBill = Boolean(finalCustomerName && finalCustomerPhoneDigits.length >= 10 && selectedServices.length);
  const currentBillSignature = useMemo(
    () => JSON.stringify({
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhoneDigits,
      services: selectedServices.map((service) => String(service.name || '')).sort(),
      paymentMethod,
      total: Number(total.toFixed(2)),
    }),
    [finalCustomerName, finalCustomerPhoneDigits, selectedServices, paymentMethod, total]
  );

  useEffect(() => {
    if (!customer) {
      return;
    }

    setCustomerNameInput(customer.name || '');
    setCustomerPhoneInput(formatPhoneInput(customer.phone || ''));
  }, [customer]);

  useEffect(() => {
    try {
      const draft = {
        selectedCustomerId,
        customerNameInput,
        customerPhoneInput,
        billItems,
        paymentMethod,
      };

      window.localStorage.setItem(BILL_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error('Failed to persist draft bill state', error);
    }
  }, [selectedCustomerId, customerNameInput, customerPhoneInput, billItems, paymentMethod]);

  const handleCustomerSelection = (event) => {
    const nextId = event.target.value;
    setSelectedCustomerId(nextId);

    if (!nextId) {
      setCustomerNameInput('');
      setCustomerPhoneInput('');
    }
  };

  const addService = () => {
    const firstServiceId = services[0]?._id ? String(services[0]._id) : '';

    if (!firstServiceId) {
      setAddButtonState('No services available');
      return;
    }

    setBillItems((prev) => {
      if (prev.some((item) => String(item.serviceId) === firstServiceId)) {
        setAddButtonState('Already added');
        return prev;
      }

      setAddButtonState('Added to bill');

      setTimeout(() => {
        const addedSection = document.getElementById('added-services-section');
        addedSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);

      return [...prev, { serviceId: firstServiceId }];
    });

    setTimeout(() => {
      setAddButtonState('Add service');
    }, 1200);
  };

  const removeService = (index) => {
    setBillItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const createBill = async (paymentMethodOverride) => {
    const selectedPaymentMethod = paymentMethodOverride || paymentMethod;

    if (!finalCustomerName) {
      alert('Please enter customer name.');
      return null;
    }

    if (finalCustomerPhoneDigits.length < 10) {
      alert('Please enter a valid 10-digit customer phone number.');
      return null;
    }

    if (!selectedServices.length) {
      alert('Please add at least one service to the bill.');
      return null;
    }

    try {
      const createdBill = await apiPost('/api/bills', {
        customerId: customer?._id || null,
        customerName: finalCustomerName,
        customerPhone: finalCustomerPhoneDigits,
        services: selectedServices.map((service) => service.name),
        totalAmount: Number(total.toFixed(2)),
        paymentMethod: selectedPaymentMethod,
        status: 'Paid',
      });

      setSelectedCustomerId('');
      setCustomerNameInput('');
      setCustomerPhoneInput('');
      setBillItems([]);
      setPaymentMethod('cash');
      window.localStorage.removeItem(BILL_DRAFT_STORAGE_KEY);

      setLastBill(createdBill);
      setLastBillSignature(currentBillSignature);
      return createdBill;
    } catch (error) {
      console.error(error);
      alert('Failed to create bill.');
      return null;
    }
  };

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

  const buildShareTextWithPdfLink = (bill) => {
    const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
    const pdfLink = `${apiBase}/api/bills/${bill._id}/pdf`;
    return `${buildBillMessage(bill)}\n\nDownload PDF\n${pdfLink}`;
  };

  const buildBillMessage = (bill) => {
    const billCustomerName = bill?.customerName || customer?.name || 'Customer';
    const billCustomerPhone = bill?.customerPhone || toPhoneDigits(customerPhoneInput || customer?.phone || '');
    const items = Array.isArray(bill?.services) ? bill.services : selectedServices.map((service) => service.name);
    const itemLines = items.map((item, index) => `${index + 1}. ${item}`).join('\n');
    const billTotal = formatCurrency(bill?.totalAmount || total);

    return [
      'RoyalSalon Luxury Concierge',
      `Customer: ${billCustomerName}`,
      `Phone: ${billCustomerPhone || '-'}`,
      `Payment Method: ${String(bill?.paymentMethod || paymentMethod).toUpperCase()}`,
      '',
      'Services:',
      itemLines || 'No services',
      '',
      `Total: ${billTotal}`,
      'Thank you for choosing RoyalSalon Luxury Concierge.',
    ].join('\n');
  };

  const ensureSavedBill = async () => {
    if (lastBill?._id && lastBillSignature === currentBillSignature) {
      return lastBill;
    }

    return createBill();
  };

  const downloadBillPdf = async (billId) => {
    const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
    const pdfUrl = `${apiBase}/api/bills/${billId}/pdf`;
    
    const isMobile = window.location.origin.startsWith('file:') || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.open(pdfUrl, '_system');
      toast.success('Opening PDF in system browser');
    } else {
      try {
        const response = await fetch(`/api/bills/${billId}/pdf`);
        if (!response.ok) {
          alert('Failed to generate the PDF.');
          return;
        }
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `royalsalon-bill-${billId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(downloadUrl);
        toast.success('PDF downloaded successfully');
      } catch (error) {
        console.error(error);
        alert('Failed to generate the PDF.');
      }
    }
  };

  const openBillPdf = async () => {
    const bill = await ensureSavedBill();

    if (!bill?._id) {
      return;
    }

    await downloadBillPdf(bill._id);
  };

  const generateBillWithPdf = async (paymentMethodOverride) => {
    const createdBill = await createBill(paymentMethodOverride);

    if (!createdBill?._id) {
      return;
    }

    await downloadBillPdf(createdBill._id);
    toast.success('Bill generated and PDF downloaded');
    setShowGeneratePaymentOptions(false);
  };

  const handleGenerateClick = () => {
    if (!finalCustomerName) {
      toast.error('Please enter customer name before generating bill.');
      return;
    }

    if (finalCustomerPhoneDigits.length < 10) {
      toast.error('Please enter a valid 10-digit customer phone number before generating bill.');
      return;
    }

    if (!selectedServices.length) {
      toast.error('Please add at least one service before generating bill.');
      return;
    }

    setShowGeneratePaymentOptions(true);
  };

  const handleGeneratePaymentSelection = async (method) => {
    setPaymentMethod(method);
    setShowUpiQrCode(method === 'upi');
    setShowCardMachinePrompt(method === 'card');

    if (method === 'cash') {
      toast.success('Cash was paid');
      await generateBillWithPdf('cash');
      return;
    }

    if (method === 'upi') {
      toast.info('Scan the QR code to collect UPI payment.');
      return;
    }

    toast.info('Use the salon card machine to collect card payment.');
  };

  const handleUpiPaymentConfirmed = async () => {
    toast.success('Payment received via UPI');
    await generateBillWithPdf('upi');
    setShowUpiQrCode(false);
    setShowCardMachinePrompt(false);
  };

  const handleCardPaymentConfirmed = async () => {
    toast.success('Payment received via Card');
    await generateBillWithPdf('card');
    setShowCardMachinePrompt(false);
    setShowUpiQrCode(false);
  };

  const openBillEmail = async () => {
    const bill = await ensureSavedBill();
    if (!bill?._id) return;

    const shareText = buildShareTextWithPdfLink(bill);
    const sharedNatively = await shareBillNative(bill._id, bill.customerName || 'Customer', shareText);
    if (sharedNatively) return;

    const recipientCustomer = customers.find((item) => String(item._id) === String(bill.customerId)) || customer;
    const subject = encodeURIComponent(`RoyalSalon Bill - ${bill.customerName || recipientCustomer?.name || 'Customer'}`);
    const body = encodeURIComponent(shareText);

    if (recipientCustomer?.email) {
      toast.success('Email draft prepared');
      setTimeout(() => {
        window.location.href = `mailto:${recipientCustomer.email}?subject=${subject}&body=${body}`;
      }, 180);
      return;
    }

    toast.success('Email draft prepared');
    setTimeout(() => {
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }, 180);
  };

  const openBillWhatsApp = async () => {
    try {
      const bill = await ensureSavedBill();
      if (!bill?._id) return;

      const shareText = buildShareTextWithPdfLink(bill);
      const sharedNatively = await shareBillNative(bill._id, bill.customerName || 'Customer', shareText);
      if (sharedNatively) return;

      const recipientCustomer = customers.find((item) => String(item._id) === String(bill.customerId)) || customer;
      const phoneNumber = toWhatsAppPhone(bill.customerPhone || customerPhoneInput || recipientCustomer?.phone || '');

      if (!phoneNumber) {
        alert('Please enter a valid customer mobile number to send on WhatsApp.');
        return;
      }

      if (navigator.share && navigator.canShare) {
        try {
          const response = await fetch(`/api/bills/${bill._id}/pdf`);
          if (response.ok) {
            const blob = await response.blob();
            const pdfFile = new File([blob], `royalsalon-bill-${bill._id}.pdf`, { type: 'application/pdf' });

            if (navigator.canShare({ files: [pdfFile] })) {
              await navigator.share({
                title: `RoyalSalon Bill - ${bill.customerName || 'Customer'}`,
                text: shareText,
                files: [pdfFile],
              });
              toast.success('Bill PDF shared successfully');
              return;
            }
          }
        } catch {
          // Fall back to direct WhatsApp.
        }
      }

      const text = encodeURIComponent(shareText);
      const appUrl = `whatsapp://send?phone=${phoneNumber}&text=${text}`;
      const webUrl = `https://wa.me/${phoneNumber}?text=${text}`;

      window.location.href = appUrl;
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          window.open(webUrl, '_blank', 'noopener,noreferrer');
        }
      }, 900);
    } catch (error) {
      console.error(error);
      toast.error('Unable to open WhatsApp');
    }
  };

  const openBillShare = async () => {
    const bill = await ensureSavedBill();
    if (!bill?._id) return;

    const shareText = buildShareTextWithPdfLink(bill);
    const sharedNatively = await shareBillNative(bill._id, bill.customerName || 'Customer', shareText);
    if (sharedNatively) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `RoyalSalon Bill - ${bill.customerName || 'Customer'}`,
          text: shareText,
          url: `${window.location.origin}/api/bills/${bill._id}/pdf`,
        });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') {
          return;
        }
      }
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText);
      alert('Bill details copied. You can paste them anywhere to share.');
      return;
    }

    alert('Sharing is not supported in this browser.');
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Premium POS Header */}
      <header className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-headline italic font-bold text-sm tracking-wide text-gold border-r border-stone-200 pr-2">RoyalSalon</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-stone-400">Checkout Terminal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-headline tracking-tight text-royal-purple">New Invoice</h2>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.95fr)_300px] gap-5">
        
        {/* Left Side: Client profile + POS Selection */}
        <div className="space-y-5">
          
          {/* Client Details Section */}
          <section className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-stone-850">
              <User size={15} className="text-royal-purple" />
              <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-stone-800">Client Details</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Client Name</label>
                <input
                  type="text"
                  value={customerNameInput}
                  onChange={(event) => setCustomerNameInput(event.target.value)}
                  placeholder="Walk-in Client"
                  className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-900 outline-none transition focus:bg-white focus:border-royal-purple"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Contact Number</label>
                <input
                  type="tel"
                  value={customerPhoneInput}
                  onChange={(event) => setCustomerPhoneInput(formatPhoneInput(event.target.value))}
                  placeholder="Mobile"
                  className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-xs text-stone-900 outline-none transition focus:bg-white focus:border-royal-purple"
                />
              </div>
            </div>
          </section>

          {/* POS Selection Grid */}
          <section className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-stone-800">
                <Scissors size={15} className="text-royal-purple" />
                <h3 className="font-headline font-bold text-xs uppercase tracking-wider">Salon Menu</h3>
              </div>
              <button 
                type="button" 
                onClick={addService}
                className="text-[10px] font-bold bg-royal-purple/10 text-royal-purple px-3 py-1.5 rounded-lg border border-royal-purple/20 hover:bg-royal-purple/15 transition-all"
              >
                {addButtonState}
              </button>
            </div>

            {/* Category tabs menu */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border uppercase tracking-wider',
                    selectedCategory === cat
                      ? 'bg-royal-purple text-white border-royal-purple shadow-sm'
                      : 'bg-stone-50 text-stone-550 border-stone-200 hover:bg-white hover:border-stone-300'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scrollable grid catalog (1 column on mobile for large images, 2 columns on tablet/desktop, 3 on large screens) */}
            <div className="max-h-[500px] overflow-y-auto pr-1.5 scrollbar-thin">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                {filteredServices.map((service) => {
                  const isSelected = selectedServiceIds.has(String(service._id));

                  return (
                    <button
                      key={service._id}
                      type="button"
                      onClick={() => (isSelected ? removeService(billItems.findIndex((item) => String(item.serviceId) === String(service._id))) : setBillItems((prev) => [...prev, { serviceId: String(service._id) }]))}
                      className={cn(
                        'rounded-2xl border text-left flex flex-col transition-all duration-300 relative group overflow-hidden bg-stone-50/10 hover:bg-white',
                        isSelected 
                          ? 'border-royal-purple bg-royal-purple/5 ring-1 ring-royal-purple shadow-md' 
                          : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
                      )}
                    >
                      {/* Top catalog image - large & clear */}
                      <div className="w-full h-36 sm:h-40 overflow-hidden relative shrink-0 bg-stone-100 border-b border-stone-150">
                        <img 
                          src={getServiceImageUrl(service)} 
                          alt={service.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=120&q=80';
                          }}
                        />
                        <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-[9px] font-bold text-white uppercase px-2 py-0.5 rounded">
                          {service.duration || '-'} min
                        </span>
                      </div>

                      {/* Bottom info details - highly readable and spacious */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between gap-2 min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-headline font-bold text-sm text-stone-900 group-hover:text-royal-purple transition-colors truncate">{service.name}</h4>
                            <span className="shrink-0 bg-royal-purple/10 px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider text-royal-purple">{service.category || 'Salon'}</span>
                          </div>
                          <p className="text-[11px] text-stone-400 font-medium leading-relaxed mt-1 line-clamp-2">{service.description || 'Premium treatment service.'}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4 mt-2 border-t border-stone-100 pt-2.5">
                          <span className="font-sans font-extrabold text-sm text-royal-purple">{formatCurrency(service.price)}</span>
                          <span className={cn(
                            'text-[9px] font-bold uppercase px-3 py-1 rounded-full shrink-0 shadow-sm transition-all',
                            isSelected ? 'bg-royal-purple text-white shadow-royal-purple/10' : 'bg-gold text-white hover:scale-[1.02] shadow-gold/10'
                          )}>
                            {isSelected ? 'Added' : 'Add to bill'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

        </div>

        {/* Right Side: Invoice Receipt and Actions */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          
          {/* Invoice Receipt Panel */}
          <div className="rounded-2xl border border-royal-purple/10 bg-gradient-to-br from-royal-purple to-royal-purple-container p-5 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-lg font-extrabold tracking-tight">Receipt Summary</h3>
              <CheckCircle2 size={18} className="text-gold" />
            </div>

            <div className="mt-4 space-y-2 rounded-xl bg-white/10 p-3.5 backdrop-blur-sm text-xs">
              <div className="flex justify-between text-white/80">
                <span>Items Selected</span>
                <span className="font-bold">{selectedServices.length}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Subtotal</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Tax (GST 18%)</span>
                <span className="font-bold">{formatCurrency(tax)}</span>
              </div>
              <div className="border-t border-white/15 pt-2 mt-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">Grand Total</span>
                <span className="block mt-0.5 font-sans text-2xl font-extrabold tracking-tight">{formatCurrency(total)}</span>
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleGenerateClick}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gold px-3 font-headline text-xs font-bold uppercase tracking-widest text-white shadow-md hover:bg-gold/90 transition-all active:scale-[0.98]"
            >
              <Printer size={14} />
              Generate Invoice
            </button>

            {showGeneratePaymentOptions && (
              <div className="mt-4 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/70">Payment Option</p>
                <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'cash', label: 'Cash', icon: DollarSign },
                    { id: 'upi', label: 'UPI', icon: Sparkles },
                    { id: 'card', label: 'Card', icon: Receipt },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => handleGeneratePaymentSelection(method.id)}
                      className={`inline-flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-[9px] font-bold uppercase tracking-wider transition ${paymentMethod === method.id ? 'bg-white text-royal-purple' : 'bg-white/15 text-white hover:bg-white/25'}`}
                    >
                      <method.icon size={12} />
                      {method.label}
                    </button>
                  ))}
                </div>

                {showUpiQrCode && (
                  <div className="mt-3 rounded-lg border border-white/20 bg-white/15 p-2.5">
                    <p className="text-[9px] font-bold uppercase text-white/75">UPI QR Code</p>
                    <img src={upiQrCodeImage} alt="UPI QR code" className="mt-2 w-full rounded-md border border-white/10 bg-white object-contain" />
                    <button
                      type="button"
                      onClick={handleUpiPaymentConfirmed}
                      className="mt-2.5 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-gold px-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm hover:bg-gold/90"
                    >
                      <CheckCircle2 size={12} />
                      Confirm UPI Paid
                    </button>
                  </div>
                )}

                {showCardMachinePrompt && (
                  <div className="mt-3 rounded-lg border border-white/20 bg-white/15 p-2.5">
                    <p className="text-[9px] font-bold uppercase text-white/75">Card Reader</p>
                    <p className="mt-1 text-[10px] text-white/90 leading-relaxed">Swipe or dip card on terminal reader to collect.</p>
                    <button
                      type="button"
                      onClick={handleCardPaymentConfirmed}
                      className="mt-2.5 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-gold px-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm hover:bg-gold/90"
                    >
                      <CheckCircle2 size={12} />
                      Confirm Card Paid
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-white/5 rounded-full blur-2xl"></div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <h4 className="font-headline font-bold text-xs text-stone-900 uppercase tracking-wider">Share / Export</h4>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { label: 'PDF', icon: Download },
                { label: 'Email', icon: Mail },
                { label: 'WhatsApp', icon: MessageSquare },
                { label: 'Share', icon: Share2 },
              ].map((action) => (
                <button 
                  key={action.label} 
                  className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-white hover:border-stone-300"
                  type="button" 
                  onClick={action.label === 'PDF' ? openBillPdf : action.label === 'Email' ? openBillEmail : action.label === 'WhatsApp' ? openBillWhatsApp : openBillShare}
                >
                  <action.icon size={13} className="text-royal-purple" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Added Services (POS Invoice Items Table) */}
      <section id="added-services-section" className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 bg-stone-50/50">
          <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-stone-900">Current Cart Items ({selectedServices.length})</h3>
        </div>

        {selectedServices.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-stone-400 font-medium">No treatments added to invoice. Click Add on any menu item above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/20 border-b border-stone-200 text-stone-400 text-[9px] font-bold uppercase tracking-wider">
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {selectedServices.map((service, index) => (
                  <tr key={`${service._id}-${index}`} className="hover:bg-stone-50/40 transition-colors">
                    <td className="px-5 py-3 font-semibold text-xs text-stone-900">{service.name}</td>
                    <td className="px-5 py-3 text-xs text-stone-500">{service.category || 'Salon'}</td>
                    <td className="px-5 py-3 text-xs text-stone-500">{service.duration || '-'} min</td>
                    <td className="px-5 py-3 text-xs font-bold text-stone-900">{formatCurrency(service.price)}</td>
                    <td className="px-5 py-3 text-right">
                      <button 
                        type="button" 
                        onClick={() => removeService(index)} 
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
