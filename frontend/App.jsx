import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastContainer } from 'react-toastify';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import TopBar from './components/TopBar/TopBar.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Services from './pages/Services/Services.jsx';
import NewBill from './pages/NewBill/NewBill.jsx';
import BillHistory from './pages/BillHistory/BillHistory.jsx';
import Reports from './pages/Reports/Reports.jsx';
import Settings from './pages/Settings/Settings.jsx';

import { Scissors, Sparkles, Crown } from 'lucide-react';

// Import Girls Salon entrypoint
import GirlsApp from './girls-salon/app/App.tsx';

// Import Custom Logo
import logoImg from '../assets/logo.png';

const pages = {
  dashboard: Dashboard,
  services: Services,
  'new-bill': NewBill,
  'bill-history': BillHistory,
  reports: Reports,
  settings: Settings,
};

export default function App() {
  const [appMode, setAppMode] = useState('splash');
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Expose setAppMode globally for the navigation buttons to return to selection screen
  useEffect(() => {
    window.setAppMode = (mode) => {
      setAppMode(mode);
      if (mode === 'selection') {
        setCurrentView('dashboard');
      }
    };
    return () => {
      delete window.setAppMode;
    };
  }, []);

  // Splash Screen timer (5 seconds)
  useEffect(() => {
    if (appMode === 'splash') {
      const timer = setTimeout(() => {
        setAppMode('selection');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [appMode]);

  const CurrentPage = pages[currentView] || Dashboard;

  return (
    <AnimatePresence mode="wait">
      {/* 1. Splash Screen */}
      {appMode === 'splash' && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-stone-900 overflow-hidden"
          style={{ 
            backgroundImage: 'linear-gradient(rgba(115,91,36,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(115,91,36,0.015) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Luxury double border frame: Royal Purple outer, Gold inner */}
          <div className="absolute inset-4 border border-[#34146c]/40 rounded-2xl pointer-events-none"></div>
          <div className="absolute inset-[20px] border border-[#735b24]/20 rounded-[14px] pointer-events-none"></div>
          
          {/* Decorative Corner Accents: Outer Gold, Inner Purple */}
          {/* Top Left */}
          <div className="absolute top-[26px] left-[26px] w-6 h-6 border-t-2 border-l-2 border-[#735b24]/50 rounded-tl-sm pointer-events-none"></div>
          <div className="absolute top-[34px] left-[34px] w-4 h-4 border-t border-l border-[#34146c]/40 rounded-tl-sm pointer-events-none"></div>
          
          {/* Top Right */}
          <div className="absolute top-[26px] right-[26px] w-6 h-6 border-t-2 border-r-2 border-[#735b24]/50 rounded-tr-sm pointer-events-none"></div>
          <div className="absolute top-[34px] right-[34px] w-4 h-4 border-t border-r border-[#34146c]/40 rounded-tr-sm pointer-events-none"></div>
          
          {/* Bottom Left */}
          <div className="absolute bottom-[26px] left-[26px] w-6 h-6 border-b-2 border-l-2 border-[#735b24]/50 rounded-bl-sm pointer-events-none"></div>
          <div className="absolute bottom-[34px] left-[34px] w-4 h-4 border-b border-l border-[#34146c]/40 rounded-bl-sm pointer-events-none"></div>
          
          {/* Bottom Right */}
          <div className="absolute bottom-[26px] right-[26px] w-6 h-6 border-b-2 border-r-2 border-[#735b24]/50 rounded-br-sm pointer-events-none"></div>
          <div className="absolute bottom-[34px] right-[34px] w-4 h-4 border-b border-r border-[#34146c]/40 rounded-br-sm pointer-events-none"></div>
          
          {/* Floating Luxury Salon Designs (Outlines in Gold and Purple) */}
          {/* 1. Golden Spray Bottle (Top-Left) */}
          <motion.div 
            className="absolute top-1/4 left-[12%] text-[#735b24]/12 rotate-[25deg] pointer-events-none"
            animate={{ y: [0, -6, 0], rotate: [25, 23, 25] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          >
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M10 6h4M12 6v4M14 6h2M12 4h2M10 8h4" />
              <path d="M9 10h6l1 10H8L9 10z" />
            </svg>
          </motion.div>

          {/* 2. Royal Purple Comb (Bottom-Left) */}
          <motion.div 
            className="absolute bottom-1/4 left-[12%] text-[#34146c]/12 -rotate-[35deg] pointer-events-none"
            animate={{ y: [0, 6, 0], rotate: [-35, -37, -35] }}
            transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 1 }}
          >
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="6" width="18" height="3" rx="0.5" />
              <line x1="4" y1="9" x2="4" y2="17" />
              <line x1="6" y1="9" x2="6" y2="17" />
              <line x1="8" y1="9" x2="8" y2="17" />
              <line x1="10" y1="9" x2="10" y2="17" />
              <line x1="12" y1="9" x2="12" y2="17" />
              <line x1="14" y1="9" x2="14" y2="17" />
              <line x1="16" y1="9" x2="16" y2="17" />
              <line x1="18" y1="9" x2="18" y2="17" />
              <line x1="20" y1="9" x2="20" y2="17" />
            </svg>
          </motion.div>

          {/* 3. Royal Purple Crown (Top-Right) */}
          <motion.div 
            className="absolute top-[28%] right-[12%] text-[#34146c]/12 rotate-[15deg] pointer-events-none"
            animate={{ y: [0, -6, 0], rotate: [15, 17, 15] }}
            transition={{ repeat: Infinity, duration: 6.5, ease: 'easeInOut', delay: 0.5 }}
          >
            <Crown className="w-12 h-12" strokeWidth={1.2} />
          </motion.div>

          {/* 4. Golden Scissors (Bottom-Right) */}
          <motion.div 
            className="absolute bottom-[28%] right-[12%] text-[#735b24]/12 -rotate-[15deg] pointer-events-none"
            animate={{ y: [0, 6, 0], rotate: [-15, -13, -15] }}
            transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut', delay: 1.5 }}
          >
            <Scissors className="w-12 h-12" strokeWidth={1.2} />
          </motion.div>

          {/* 5. Golden Hair Dryer (Middle-Right) */}
          <motion.div 
            className="absolute top-1/2 right-[18%] text-[#735b24]/12 rotate-[15deg] pointer-events-none"
            animate={{ y: [0, -5, 0], rotate: [15, 13, 15] }}
            transition={{ repeat: Infinity, duration: 6.2, ease: 'easeInOut', delay: 0.8 }}
          >
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M12 6h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-8M12 6a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4" />
              <path d="M10 12v6a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-6" />
              <path d="M12 20c0 1-1 2-2 2" />
            </svg>
          </motion.div>

          {/* 6. Royal Purple Hand Mirror (Middle-Left) */}
          <motion.div 
            className="absolute top-1/2 left-[18%] text-[#34146c]/12 -rotate-[15deg] pointer-events-none"
            animate={{ y: [0, 5, 0], rotate: [-15, -13, -15] }}
            transition={{ repeat: Infinity, duration: 6.8, ease: 'easeInOut', delay: 1.2 }}
          >
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="12" cy="9" r="5" />
              <path d="M12 14v6M9 20h6" />
            </svg>
          </motion.div>

          {/* 7. Golden Pump Bottle (Top-Center/Right) */}
          <motion.div 
            className="absolute top-[14%] right-[25%] text-[#735b24]/10 rotate-[10deg] pointer-events-none"
            animate={{ y: [0, -4, 0], rotate: [10, 8, 10] }}
            transition={{ repeat: Infinity, duration: 5.8, ease: 'easeInOut', delay: 0.4 }}
          >
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="7" y="9" width="10" height="11" rx="1.5" />
              <path d="M12 9V6M12 6H9M12 6h3" />
            </svg>
          </motion.div>

          {/* 8. Royal Purple Perfume Bottle (Bottom-Center/Left) */}
          <motion.div 
            className="absolute bottom-[14%] left-[25%] text-[#34146c]/10 -rotate-[10deg] pointer-events-none"
            animate={{ y: [0, 4, 0], rotate: [-10, -8, -10] }}
            transition={{ repeat: Infinity, duration: 6.4, ease: 'easeInOut', delay: 1.4 }}
          >
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="8" y="10" width="8" height="9" rx="2" />
              <path d="M11 7h2v3h-2z" />
              <circle cx="6" cy="7" r="2" />
              <path d="M8 7H6" />
            </svg>
          </motion.div>

          {/* 9. Royal Purple Hair Brush (Top-Center/Left) */}
          <motion.div 
            className="absolute top-[14%] left-[25%] text-[#34146c]/10 -rotate-[10deg] pointer-events-none"
            animate={{ y: [0, -4, 0], rotate: [-10, -8, -10] }}
            transition={{ repeat: Infinity, duration: 6.0, ease: 'easeInOut', delay: 0.6 }}
          >
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="9" y="4" width="6" height="11" rx="2" />
              <path d="M12 15v5M10 20h4" />
              <path d="M12 7h0M12 10h0M12 13h0M10 8h0M14 8h0M10 11h0M14 11h0" strokeLinecap="round" strokeWidth="1.5" />
            </svg>
          </motion.div>

          {/* Slow rotating ambient color glow backlights - with higher purple intensity */}
          <motion.div 
            className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-[#34146c]/10 to-[#735b24]/5 rounded-full blur-3xl pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          />
          
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6 text-center px-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
          >
            {/* Circular Logo Emblem Frame to blend the white background image */}
            <motion.div 
              className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-[#735b24]/30 bg-white p-5 flex items-center justify-center shadow-[0_8px_25px_rgba(115,91,36,0.08)] overflow-hidden"
              animate={{ 
                scale: [1, 1.02, 1],
                y: [0, -4, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4, 
                ease: "easeInOut" 
              }}
            >
              <img 
                src={logoImg} 
                alt="RoyalSalon Logo" 
                className="w-full h-full object-contain"
              />
            </motion.div>
            <div className="space-y-1 mt-1 flex flex-col items-center">
              <h1 className="font-headline italic font-bold text-3xl md:text-4xl text-[#34146c] tracking-wide">RoyalSalon</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#735b24]">Hair For All</p>
              
              {/* Elegant SVG flourish graphic */}
              <svg className="w-36 h-6 text-[#735b24]/60 my-2" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 10 C 30 2, 40 18, 50 10 C 60 2, 70 18, 90 10" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
                <circle cx="50" cy="10" r="2.5" fill="#34146c" />
                <path d="M40 10 C 43 7, 47 7, 50 10 C 53 7, 57 7, 60 10" stroke="currentColor" strokeWidth="0.5" />
              </svg>
            </div>
            
            {/* Elegant golden loader bar */}
            <div className="w-32 h-[1px] bg-stone-100 relative overflow-hidden mt-2 rounded">
              <motion.div 
                className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-transparent via-[#735b24] to-transparent"
                animate={{ left: ['-50%', '150%'] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 2. Gender Selection Screen */}
      {appMode === 'selection' && (
        <motion.div
          key="selection"
          className="fixed inset-0 z-40 flex flex-col items-center bg-white text-stone-900 p-6 overflow-y-auto"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Luxury double border frame: Royal Purple outer, Gold inner */}
          <div className="absolute inset-4 border border-[#34146c]/40 rounded-2xl pointer-events-none"></div>
          <div className="absolute inset-[20px] border border-[#735b24]/20 rounded-[14px] pointer-events-none"></div>

          {/* Decorative Corner Accents: Outer Gold, Inner Purple */}
          {/* Top Left */}
          <div className="absolute top-[26px] left-[26px] w-6 h-6 border-t-2 border-l-2 border-[#735b24]/50 rounded-tl-sm pointer-events-none"></div>
          <div className="absolute top-[34px] left-[34px] w-4 h-4 border-t border-l border-[#34146c]/40 rounded-tl-sm pointer-events-none"></div>
          
          {/* Top Right */}
          <div className="absolute top-[26px] right-[26px] w-6 h-6 border-t-2 border-r-2 border-[#735b24]/50 rounded-tr-sm pointer-events-none"></div>
          <div className="absolute top-[34px] right-[34px] w-4 h-4 border-t border-r border-[#34146c]/40 rounded-tr-sm pointer-events-none"></div>
          
          {/* Bottom Left */}
          <div className="absolute bottom-[26px] left-[26px] w-6 h-6 border-b-2 border-l-2 border-[#735b24]/50 rounded-bl-sm pointer-events-none"></div>
          <div className="absolute bottom-[34px] left-[34px] w-4 h-4 border-b border-l border-[#34146c]/40 rounded-bl-sm pointer-events-none"></div>
          
          {/* Bottom Right */}
          <div className="absolute bottom-[26px] right-[26px] w-6 h-6 border-b-2 border-r-2 border-[#735b24]/50 rounded-br-sm pointer-events-none"></div>
          <div className="absolute bottom-[34px] right-[34px] w-4 h-4 border-b border-r border-[#34146c]/40 rounded-br-sm pointer-events-none"></div>

          {/* Floating Luxury Salon Designs (Outlines in Gold and Purple) */}
          {/* 1. Golden Spray Bottle (Top-Left) */}
          <motion.div 
            className="absolute top-1/4 left-[12%] text-[#735b24]/12 rotate-[25deg] pointer-events-none"
            animate={{ y: [0, -6, 0], rotate: [25, 23, 25] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          >
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M10 6h4M12 6v4M14 6h2M12 4h2M10 8h4" />
              <path d="M9 10h6l1 10H8L9 10z" />
            </svg>
          </motion.div>

          {/* 2. Royal Purple Comb (Bottom-Left) */}
          <motion.div 
            className="absolute bottom-1/4 left-[12%] text-[#34146c]/12 -rotate-[35deg] pointer-events-none"
            animate={{ y: [0, 6, 0], rotate: [-35, -37, -35] }}
            transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 1 }}
          >
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="6" width="18" height="3" rx="0.5" />
              <line x1="4" y1="9" x2="4" y2="17" />
              <line x1="6" y1="9" x2="6" y2="17" />
              <line x1="8" y1="9" x2="8" y2="17" />
              <line x1="10" y1="9" x2="10" y2="17" />
              <line x1="12" y1="9" x2="12" y2="17" />
              <line x1="14" y1="9" x2="14" y2="17" />
              <line x1="16" y1="9" x2="16" y2="17" />
              <line x1="18" y1="9" x2="18" y2="17" />
              <line x1="20" y1="9" x2="20" y2="17" />
            </svg>
          </motion.div>

          {/* 3. Royal Purple Crown (Top-Right) */}
          <motion.div 
            className="absolute top-[28%] right-[12%] text-[#34146c]/12 rotate-[15deg] pointer-events-none"
            animate={{ y: [0, -6, 0], rotate: [15, 17, 15] }}
            transition={{ repeat: Infinity, duration: 6.5, ease: 'easeInOut', delay: 0.5 }}
          >
            <Crown className="w-12 h-12" strokeWidth={1.2} />
          </motion.div>

          {/* 4. Golden Scissors (Bottom-Right) */}
          <motion.div 
            className="absolute bottom-[28%] right-[12%] text-[#735b24]/12 -rotate-[15deg] pointer-events-none"
            animate={{ y: [0, 6, 0], rotate: [-15, -13, -15] }}
            transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut', delay: 1.5 }}
          >
            <Scissors className="w-12 h-12" strokeWidth={1.2} />
          </motion.div>

          {/* 5. Golden Hair Dryer (Middle-Right) */}
          <motion.div 
            className="absolute top-1/2 right-[18%] text-[#735b24]/12 rotate-[15deg] pointer-events-none"
            animate={{ y: [0, -5, 0], rotate: [15, 13, 15] }}
            transition={{ repeat: Infinity, duration: 6.2, ease: 'easeInOut', delay: 0.8 }}
          >
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M12 6h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-8M12 6a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4" />
              <path d="M10 12v6a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-6" />
              <path d="M12 20c0 1-1 2-2 2" />
            </svg>
          </motion.div>

          {/* 6. Royal Purple Hand Mirror (Middle-Left) */}
          <motion.div 
            className="absolute top-1/2 left-[18%] text-[#34146c]/12 -rotate-[15deg] pointer-events-none"
            animate={{ y: [0, 5, 0], rotate: [-15, -13, -15] }}
            transition={{ repeat: Infinity, duration: 6.8, ease: 'easeInOut', delay: 1.2 }}
          >
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="12" cy="9" r="5" />
              <path d="M12 14v6M9 20h6" />
            </svg>
          </motion.div>

          {/* 7. Golden Pump Bottle (Top-Center/Right) */}
          <motion.div 
            className="absolute top-[14%] right-[25%] text-[#735b24]/10 rotate-[10deg] pointer-events-none"
            animate={{ y: [0, -4, 0], rotate: [10, 8, 10] }}
            transition={{ repeat: Infinity, duration: 5.8, ease: 'easeInOut', delay: 0.4 }}
          >
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="7" y="9" width="10" height="11" rx="1.5" />
              <path d="M12 9V6M12 6H9M12 6h3" />
            </svg>
          </motion.div>

          {/* 8. Royal Purple Perfume Bottle (Bottom-Center/Left) */}
          <motion.div 
            className="absolute bottom-[14%] left-[25%] text-[#34146c]/10 -rotate-[10deg] pointer-events-none"
            animate={{ y: [0, 4, 0], rotate: [-10, -8, -10] }}
            transition={{ repeat: Infinity, duration: 6.4, ease: 'easeInOut', delay: 1.4 }}
          >
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="8" y="10" width="8" height="9" rx="2" />
              <path d="M11 7h2v3h-2z" />
              <circle cx="6" cy="7" r="2" />
              <path d="M8 7H6" />
            </svg>
          </motion.div>

          {/* 9. Royal Purple Hair Brush (Top-Center/Left) */}
          <motion.div 
            className="absolute top-[14%] left-[25%] text-[#34146c]/10 -rotate-[10deg] pointer-events-none"
            animate={{ y: [0, -4, 0], rotate: [-10, -8, -10] }}
            transition={{ repeat: Infinity, duration: 6.0, ease: 'easeInOut', delay: 0.6 }}
          >
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="9" y="4" width="6" height="11" rx="2" />
              <path d="M12 15v5M10 20h4" />
              <path d="M12 7h0M12 10h0M12 13h0M10 8h0M14 8h0M10 11h0M14 11h0" strokeLinecap="round" strokeWidth="1.5" />
            </svg>
          </motion.div>

          {/* Subtle decoration gradients */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#735b24]/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#34146c]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-full max-w-4xl flex flex-col items-center z-10 my-auto py-8">
            {/* Title header */}
            <motion.div 
              className="flex flex-col items-center text-center gap-2 mb-6 sm:mb-12 mt-4"
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <div>
                <h2 className="font-headline font-bold text-3xl md:text-4xl text-[#34146c] tracking-wide">Choose Your Salon</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#735b24] mt-1">Welcome to RoyalSalon Experience</p>
              </div>
            </motion.div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 w-full max-w-2xl px-2 justify-items-center">
              {/* Gentlemen Card */}
              <motion.button
                onClick={() => setAppMode('men')}
                className="group relative flex flex-col items-center justify-center p-6 sm:p-10 w-full max-w-[280px] sm:max-w-none rounded-2xl sm:rounded-3xl border border-stone-200 bg-white/50 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.01)] text-center overflow-hidden transition-all duration-500 hover:border-[#34146c]/50 hover:bg-white hover:shadow-[0_20px_50px_rgba(52,20,108,0.12)] cursor-pointer"
                whileHover={{ y: -6 }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="absolute -inset-px bg-gradient-to-br from-[#34146c]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#34146c]/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#34146c]/15 transition-colors duration-300">
                  <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-[#34146c] group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-headline font-bold text-lg sm:text-xl text-stone-900 group-hover:text-[#34146c] transition-colors duration-350">GENTLEMEN</h3>
                <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-[#735b24] mt-1.5">Barbering & Grooming</p>
                <p className="text-xs text-stone-500 mt-3 sm:mt-4 max-w-[220px] leading-relaxed">Premium haircuts, shavings, massages, and executive treatment logs.</p>
                
                <span className="mt-5 sm:mt-6 text-[10px] font-extrabold uppercase text-[#34146c] tracking-wider border-b border-[#34146c]/30 pb-0.5 group-hover:border-[#34146c] transition-all duration-300">Enter Salon →</span>
              </motion.button>

              {/* Ladies Card */}
              <motion.button
                onClick={() => setAppMode('women')}
                className="group relative flex flex-col items-center justify-center p-6 sm:p-10 w-full max-w-[280px] sm:max-w-none rounded-2xl sm:rounded-3xl border border-stone-200 bg-white/50 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.01)] text-center overflow-hidden transition-all duration-500 hover:border-[#735b24]/50 hover:bg-white hover:shadow-[0_20px_50px_rgba(115,91,36,0.12)] cursor-pointer"
                whileHover={{ y: -6 }}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="absolute -inset-px bg-gradient-to-br from-[#735b24]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#735b24]/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#735b24]/15 transition-colors duration-300">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#735b24] group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-headline font-bold text-lg sm:text-xl text-stone-900 group-hover:text-[#735b24] transition-colors duration-350">LADIES</h3>
                <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-[#735b24] mt-1.5">Royal Spa & Styling</p>
                <p className="text-xs text-stone-500 mt-3 sm:mt-4 max-w-[220px] leading-relaxed">Luxury spa treatments, color, manicure, and product catalogs.</p>
                
                <span className="mt-5 sm:mt-6 text-[10px] font-extrabold uppercase text-[#735b24] tracking-wider border-b border-[#735b24]/30 pb-0.5 group-hover:border-[#735b24] transition-all duration-300">Enter Salon →</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Gentlemen's (Boys) Salon App */}
      {appMode === 'men' && (
        <motion.div
          key="men"
          className="min-h-screen bg-surface"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Sidebar 
            currentView={currentView} 
            onViewChange={(view) => {
              setCurrentView(view);
              setSidebarOpen(false);
            }} 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <div className="ml-0 md:ml-64 min-h-screen flex flex-col transition-all duration-300">
            <TopBar onToggleSidebar={() => setSidebarOpen(true)} />
            <ToastContainer
              position="top-right"
              autoClose={4000}
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
              draggable={false}
              closeButton={false}
              toastClassName="!rounded-xl !border !border-white/10 !bg-royal-purple !text-white !shadow-[0_10px_30px_rgba(88,58,196,0.25)] !text-xs !py-1.5 !px-3 !min-h-0 !w-auto !max-w-[280px] !mx-auto md:!mr-4"
              bodyClassName="!font-semibold !text-white !p-1"
              progressClassName="!bg-white"
            />
            <main className="mt-16 p-10 flex-1 overflow-x-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <CurrentPage />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </motion.div>
      )}

      {/* 4. Ladies' (Girls) Salon App */}
      {appMode === 'women' && (
        <motion.div
          key="women"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <GirlsApp />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
