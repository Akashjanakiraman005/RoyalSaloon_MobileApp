import { useEffect, useMemo, useState } from 'react';
import { Scissors, Diamond, TrendingUp, Plus, Edit2, Trash2, Filter, MoreVertical, Clock3 } from 'lucide-react';
import { apiGet } from '../../lib/api';

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

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadServices() {
      try {
        const response = await apiGet('/api/services');
        if (active) {
          setServices(response.items || []);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  const avgPrice = useMemo(() => {
    if (!services.length) return 0;
    const total = services.reduce((sum, service) => sum + Number(service.price || 0), 0);
    return total / services.length;
  }, [services]);

  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-headline italic font-bold text-sm tracking-wide text-gold border-r border-stone-200 pr-2">RoyalSalon</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-stone-400">Operational Catalog</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-headline tracking-tight text-royal-purple">Service Catalog</h2>
        </div>
        <button className="flex items-center gap-2 bg-gold text-white px-5 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] shadow-md shadow-gold/15 shrink-0" type="button">
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {/* Modern Catalog Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="z-10">
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Total Services</p>
            <p className="text-xl sm:text-3xl font-sans font-extrabold text-royal-purple mt-1">{services.length}</p>
          </div>
          <div className="z-10 flex items-center gap-1.5 text-gold font-bold text-[10px]">
            <TrendingUp size={12} />
            <span>Active database list</span>
          </div>
          <Scissors size={72} className="absolute -right-2 -bottom-2 text-stone-100/60 transition-transform duration-75 group-hover:scale-105" />
        </div>

        <div className="bg-royal-purple p-4 rounded-2xl shadow-md flex flex-col justify-between h-28 relative overflow-hidden group text-white">
          <div className="z-10">
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Average Menu Price</p>
            <p className="text-xl sm:text-3xl font-sans font-extrabold text-gold mt-1">{formatCurrency(avgPrice)}</p>
          </div>
          <div className="z-10 flex items-center gap-1.5 text-violet-300 font-bold text-[10px]">
            <span>Premium Tier Pricing</span>
          </div>
          <Diamond size={72} className="absolute -right-2 -bottom-2 text-white/5 transition-transform duration-75 group-hover:rotate-6" />
        </div>
      </div>

      {/* Service Listing Table/Cards */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 flex justify-between items-center border-b border-stone-200 bg-stone-50/50">
          <div>
            <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-stone-900">Treatment Registry</h3>
            <p className="text-[10px] text-stone-400 font-medium">Synced menu options</p>
          </div>
          <div className="flex gap-1">
            <button className="p-1.5 text-stone-400 hover:text-royal-purple transition-colors" type="button">
              <Filter size={16} />
            </button>
            <button className="p-1.5 text-stone-400 hover:text-royal-purple transition-colors" type="button">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable grid catalog (1 column on mobile for large images, 2 columns on tablet/desktop, 3 on large screens) */}
        <div className="max-h-[500px] overflow-y-auto p-4 scrollbar-thin">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
            {services.map((service, index) => {
              const price = Number(service.price || 0);

              return (
                <div
                  key={service._id || index}
                  className="rounded-2xl border border-stone-200 text-left flex flex-col transition-all duration-300 relative group overflow-hidden bg-white shadow-sm hover:border-stone-300 hover:shadow-md"
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
                      <span className="font-sans font-extrabold text-sm text-royal-purple">{formatCurrency(price)}</span>
                      <div className="flex gap-1.5 shrink-0">
                        <button className="px-3 py-1 rounded-lg border border-stone-200 bg-stone-50 text-[10px] font-bold text-stone-600 hover:bg-white hover:border-stone-300" type="button">Edit</button>
                        <button className="px-3 py-1 rounded-lg border border-red-200 bg-red-50 text-[10px] font-bold text-red-600 hover:bg-red-100" type="button">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {services.length === 0 && (
            <div className="py-8 text-xs text-stone-400 text-center">No services found in database yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
