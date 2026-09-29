import { useEffect, useState } from 'react';
import { Building2, Upload, Shield, Bell, RefreshCw, CheckCircle2, Star } from 'lucide-react';
import { apiGet, apiPut } from '../../lib/api';

export default function Settings() {
  const [form, setForm] = useState({
    salonName: '',
    phoneNumber: '',
    address: '',
    taxPercentage: 18,
    currency: 'INR (₹) - Indian Rupee',
  });

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await apiGet('/api/settings');
        if (!active || !response) return;
        setForm({
          salonName: response.salonName || '',
          phoneNumber: response.phoneNumber || '',
          address: response.address || '',
          taxPercentage: Number(response.taxPercentage || 18),
          currency: response.currency || 'INR (₹) - Indian Rupee',
        });
      } catch (error) {
        console.error(error);
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSave = async (event) => {
    event.preventDefault();
    try {
      await apiPut('/api/settings', form);
      alert('Settings saved successfully.');
    } catch (error) {
      console.error(error);
      alert('Failed to save settings.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-headline italic font-bold text-sm tracking-wide text-gold border-r border-stone-200 pr-2">RoyalSalon</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-stone-400">System Configuration</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-headline tracking-tight text-royal-purple">Salon Settings</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Avatar and Info Support */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col items-center text-center">
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-4 block">Official Logo</span>
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-stone-50 flex items-center justify-center border-2 border-dashed border-stone-200 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                  alt="Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-royal-purple/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload size={24} className="text-white" />
                </div>
              </div>
            </div>
            <h3 className="font-headline font-bold text-base text-royal-purple mt-4">RoyalSalon</h3>
            <p className="text-[10px] text-stone-400 mt-1">Recommended: PNG/SVG, min 512x512px</p>
            <button className="mt-4 text-xs font-semibold text-gold hover:underline" type="button">Update Identity</button>
          </div>

          <div className="bg-royal-purple p-6 rounded-2xl text-white overflow-hidden relative shadow-md">
            <div className="relative z-10">
              <Star size={20} className="text-gold fill-gold mb-3" />
              <h4 className="font-headline font-bold text-base mb-1">Concierge Support</h4>
              <p className="text-white/70 text-xs leading-relaxed mb-4">Need help configuring tax details or multisalon branches?</p>
              <button className="w-full py-2 bg-white/10 hover:bg-white/20 transition-all rounded-xl font-semibold text-xs" type="button">Contact Manager</button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Right Side: Form Configuration */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-150 pb-4 mb-6">
              <h2 className="font-headline font-bold text-base text-stone-900 flex items-center gap-2">
                <Building2 className="text-royal-purple" size={18} />
                Business Registry
              </h2>
              <span className="text-[9px] font-bold text-gold uppercase tracking-widest bg-gold/10 px-2 py-1 rounded-full">Primary Office</span>
            </div>

            <form className="space-y-4 text-xs" onSubmit={onSave}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-[0.1em] font-bold text-stone-400 px-1">Salon Name</label>
                  <input
                    name="salonName"
                    type="text"
                    value={form.salonName}
                    onChange={onInputChange}
                    className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-royal-purple focus:bg-white transition-all text-stone-900 font-semibold border-l-4 border-l-royal-purple outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-[0.1em] font-bold text-stone-400 px-1">Phone Number</label>
                  <input
                    name="phoneNumber"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={onInputChange}
                    className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-royal-purple focus:bg-white transition-all text-stone-900 font-medium outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-[0.1em] font-bold text-stone-400 px-1">Address</label>
                <textarea
                  name="address"
                  rows={2}
                  value={form.address}
                  onChange={onInputChange}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-royal-purple focus:bg-white transition-all text-stone-900 font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-[0.1em] font-bold text-stone-400 px-1">Tax Percentage (%)</label>
                  <div className="relative">
                    <input
                      name="taxPercentage"
                      type="number"
                      value={form.taxPercentage}
                      onChange={onInputChange}
                      className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-royal-purple focus:bg-white transition-all text-stone-900 font-medium outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-[0.1em] font-bold text-stone-400 px-1">Currency</label>
                  <select name="currency" value={form.currency} onChange={onInputChange} className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-royal-purple focus:bg-white transition-all text-stone-900 font-medium outline-none">
                    <option>INR (₹) - Indian Rupee</option>
                    <option>USD ($) - US Dollar</option>
                    <option>EUR (€) - Euro</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button type="button" className="px-4 py-2 rounded-xl text-stone-500 font-semibold hover:bg-stone-50 transition-all">Discard</button>
                <button type="submit" className="px-6 py-2.5 bg-gold text-white rounded-xl font-bold tracking-wide shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5">
                  <CheckCircle2 size={16} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Security Settings', desc: 'Manage access controls and keys.', icon: Shield },
          { title: 'Client Alerts', desc: 'Configure SMS and booking updates.', icon: Bell },
          { title: 'Integrations', desc: 'Sync card terminals and POS tools.', icon: RefreshCw },
        ].map((item, i) => (
          <div key={i} className="bg-stone-50 p-4 rounded-xl border border-transparent hover:border-gold/20 transition-all cursor-pointer flex gap-3 items-start">
            <item.icon size={18} className="text-royal-purple shrink-0 mt-0.5" />
            <div>
              <h5 className="font-headline font-bold text-stone-900 text-xs">{item.title}</h5>
              <p className="text-[10px] text-stone-500 mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
