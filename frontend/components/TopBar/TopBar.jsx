import { Bell, Menu } from 'lucide-react';

export default function TopBar({ onToggleSidebar }) {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-stone-100 flex items-center justify-between md:justify-end px-4 sm:px-8 z-40 border-b border-stone-200">
      <button 
        onClick={onToggleSidebar}
        className="p-2 text-stone-500 hover:bg-stone-200 rounded-full transition-all md:hidden"
        type="button"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-4 ml-auto">
        <button 
          onClick={() => {
            if (typeof window !== 'undefined' && window.setAppMode) {
              window.setAppMode('selection');
            }
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gold/10 hover:bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
          type="button"
        >
          <span>Switch Salon</span>
        </button>

        <button className="relative p-2 text-stone-500 hover:bg-stone-200 rounded-full transition-all" type="button">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-gold rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
          <div className="text-right">
            <p className="text-sm font-semibold font-headline leading-tight">Akash</p>
            <p className="text-[10px] text-stone-500 uppercase tracking-wider">Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}
