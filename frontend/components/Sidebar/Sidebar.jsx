import {
  LayoutDashboard,
  PlusCircle,
  Users,
  Scissors,
  Receipt,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  X,
  Smartphone,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Sidebar({ currentView, onViewChange, isOpen, onClose }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-bill', label: 'New Bill', icon: PlusCircle },
    { id: 'services', label: 'Services', icon: Scissors },
    { id: 'bill-history', label: 'Bill History', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-45 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        'bg-sidebar h-screen w-64 fixed left-0 top-0 flex flex-col py-8 px-4 shadow-2xl z-50 transition-transform duration-300 md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="mb-12 px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter text-white font-headline">RoyalSalon</h1>
            <p className="text-stone-500 text-[10px] uppercase tracking-[0.2em] font-medium mt-1">Luxury Concierge</p>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-900 transition-colors"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

      <nav className="flex-1 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 font-headline text-sm tracking-wide font-medium uppercase text-left',
              isActive
                ? 'bg-royal-purple-container/30 text-violet-400 border-r-4 border-gold translate-x-1'
                : 'text-stone-400 hover:text-white hover:bg-stone-900 hover:translate-x-1'
            )}
            type="button"
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
      </nav>

      <div className="mt-auto space-y-2 pt-8 border-t border-stone-800">
        <button
          onClick={() => onViewChange('settings')}
          className={cn(
            'w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 font-headline text-sm tracking-wide font-medium uppercase text-left',
            currentView === 'settings'
              ? 'bg-royal-purple-container/30 text-violet-400 border-r-4 border-gold translate-x-1'
              : 'text-stone-400 hover:text-white hover:bg-stone-900'
          )}
          type="button"
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button
          onClick={() => {
            if (onClose) onClose();
            if (typeof window !== 'undefined' && window.setAppMode) {
              window.setAppMode('selection');
            }
          }}
          className="w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 font-headline text-sm tracking-wide font-medium uppercase text-rose-400 hover:text-white hover:bg-stone-900 text-left cursor-pointer"
          type="button"
        >
          <Smartphone size={20} />
          <span>Switch Salon</span>
        </button>
      </div>
    </aside>
  </>
);
}
