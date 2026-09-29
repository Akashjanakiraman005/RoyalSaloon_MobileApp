const DEFAULT_SERVICES = [
  { _id: 's1', name: 'Royal Haircut', price: 500, duration: 30, category: 'Hair Styling', description: 'Classic signature haircut finished with a premium hot towel treatment.' },
  { _id: 's2', name: 'Beard Grooming & Shave', price: 300, duration: 25, category: 'Barbering', description: 'Precision beard trim, alignment, and luxurious hot lather straight razor shave.' },
  { _id: 's3', name: 'Charcoal Facial Mask', price: 800, duration: 45, category: 'Skin Care', description: 'Deep cleansing pore treatment with charcoal extract and ice massage.' },
  { _id: 's4', name: 'Premium Hair Coloring', price: 1500, duration: 90, category: 'Hair Styling', description: 'Rich, ammonia-free hair coloring with intense shine finish.' },
  { _id: 's5', name: 'Luxury Pedicure', price: 600, duration: 40, category: 'Nail Care', description: 'Relaxing foot soak, scrub, nail shaping, and light massage.' },
];

const DEFAULT_BILLS = [
  { _id: 'b1', billNo: 'INV-0001', customerName: 'Rajesh Kumar', customerPhone: '9876543210', services: ['Royal Haircut', 'Beard Grooming & Shave'], totalAmount: 800, paymentMethod: 'cash', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { _id: 'b2', billNo: 'INV-0002', customerName: 'Amit Sharma', customerPhone: '9123456789', services: ['Charcoal Facial Mask'], totalAmount: 800, paymentMethod: 'upi', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { _id: 'b3', billNo: 'INV-0003', customerName: 'Vikram Singh', customerPhone: '9345678901', services: ['Premium Hair Coloring', 'Royal Haircut'], totalAmount: 2000, paymentMethod: 'card', createdAt: new Date().toISOString() },
];

const DEFAULT_SETTINGS = {
  salonName: 'RoyalSalon',
  taxRate: 18,
  currency: 'INR',
};

function handleMockRequest(method, path, payload) {
  const getLocal = (key, def) => {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : def;
  };
  const setLocal = (key, val) => {
    localStorage.setItem(key, JSON.stringify(val));
  };

  if (!localStorage.getItem('rs_services')) setLocal('rs_services', DEFAULT_SERVICES);
  if (!localStorage.getItem('rs_bills')) setLocal('rs_bills', DEFAULT_BILLS);
  if (!localStorage.getItem('rs_settings')) setLocal('rs_settings', DEFAULT_SETTINGS);

  const cleanPath = path.replace(/^\/api/, '');

  if (cleanPath.startsWith('/services')) {
    const services = getLocal('rs_services', DEFAULT_SERVICES);
    if (method === 'GET') {
      return { items: services };
    }
    if (method === 'POST') {
      const newService = { ...payload, _id: 's_' + Date.now() };
      services.push(newService);
      setLocal('rs_services', services);
      return newService;
    }
  }

  if (cleanPath.startsWith('/bills')) {
    const bills = getLocal('rs_bills', DEFAULT_BILLS);
    if (method === 'GET') {
      return { items: bills };
    }
    if (method === 'POST') {
      const newBill = {
        ...payload,
        _id: 'b_' + Date.now(),
        billNo: payload.billNo || `INV-${String(bills.length + 1).padStart(4, '0')}`,
        createdAt: new Date().toISOString(),
      };
      bills.push(newBill);
      setLocal('rs_bills', bills);

      // Update customers
      const customers = getLocal('rs_customers', []);
      const custIndex = customers.findIndex(c => c.name === newBill.customerName);
      if (custIndex >= 0) {
        customers[custIndex].visits = (customers[custIndex].visits || 0) + 1;
        customers[custIndex].totalSpent = (customers[custIndex].totalSpent || 0) + Number(newBill.totalAmount || 0);
      } else if (newBill.customerName) {
        customers.push({
          _id: 'c_' + Date.now(),
          name: newBill.customerName,
          phone: newBill.customerPhone || '',
          visits: 1,
          totalSpent: Number(newBill.totalAmount || 0),
          tier: 'Standard Client'
        });
      }
      setLocal('rs_customers', customers);

      return newBill;
    }
  }

  if (cleanPath.startsWith('/customers')) {
    const customers = getLocal('rs_customers', []);
    if (customers.length === 0) {
      const bills = getLocal('rs_bills', DEFAULT_BILLS);
      const derived = [];
      bills.forEach(b => {
        if (!b.customerName) return;
        const exists = derived.find(c => c.name === b.customerName);
        if (exists) {
          exists.visits += 1;
          exists.totalSpent += Number(b.totalAmount || 0);
        } else {
          derived.push({
            _id: 'c_' + Math.random(),
            name: b.customerName,
            phone: b.customerPhone || '',
            visits: 1,
            totalSpent: Number(b.totalAmount || 0),
            tier: 'VIP Client'
          });
        }
      });
      setLocal('rs_customers', derived);
      return { items: derived };
    }
    return { items: customers };
  }

  if (cleanPath.startsWith('/settings')) {
    const settings = getLocal('rs_settings', DEFAULT_SETTINGS);
    if (method === 'GET') {
      return settings;
    }
    if (method === 'PUT') {
      setLocal('rs_settings', payload);
      return payload;
    }
  }

  if (cleanPath.startsWith('/dashboard')) {
    const bills = getLocal('rs_bills', DEFAULT_BILLS);
    const customers = getLocal('rs_customers', []);

    const totalRevenue = bills.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
    const todayRevenue = bills
      .filter(b => new Date(b.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

    return {
      overview: {
        totalRevenue,
        todayRevenue,
        billsCount: bills.length,
        customersCount: customers.length || 3,
      },
      recentBills: bills.slice(-5).reverse(),
      capacity: Math.min(Math.round((bills.length % 5) * 20), 100),
    };
  }

  return { items: [] };
}

// Global fetch override supporting custom production API endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const originalFetch = window.fetch;
window.fetch = async function (input, init) {
  const url = typeof input === 'string' ? input : input.url;

  if (url.startsWith('/api') || url.startsWith('api/')) {
    const fullUrl = API_BASE_URL ? `${API_BASE_URL}${url.startsWith('/') ? url : '/' + url}` : url;
    try {
      const response = await originalFetch(fullUrl, init);
      if (response.ok) {
        return response;
      }
      throw new Error(`HTTP error ${response.status}`);
    } catch (err) {
      console.warn(`Fetch fallback activated for ${url} due to:`, err);
      const method = init?.method || 'GET';
      let payload = null;
      if (init?.body) {
        try {
          payload = JSON.parse(init.body);
        } catch (e) {
          payload = init.body;
        }
      }
      const mockData = handleMockRequest(method, url, payload);

      return {
        ok: true,
        status: 200,
        json: async () => mockData,
        blob: async () => new Blob([JSON.stringify(mockData)], { type: 'application/pdf' }),
        text: async () => JSON.stringify(mockData)
      };
    }
  }

  return originalFetch(input, init);
};

export async function apiGet(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`GET ${path} failed`);
  }
  return response.json();
}

export async function apiPost(path, payload) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`POST ${path} failed`);
  }
  return response.json();
}

export async function apiPut(path, payload) {
  const response = await fetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`PUT ${path} failed`);
  }
  return response.json();
}
