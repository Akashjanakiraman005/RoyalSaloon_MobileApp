import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  Package,
  Receipt,
  BarChart3,
  Search,
  Bell,
  User,
  Menu,
  X,
  Smartphone,
} from "lucide-react";

export default function Layout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/clients", icon: Users, label: "Clients" },
    { path: "/products", icon: Package, label: "Products" },
    { path: "/billing", icon: Receipt, label: "Billing" },
    { path: "/reports", icon: BarChart3, label: "Reports" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (onLinkClick?: () => void) => (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#f0ebe3]">
        <h1 className="text-xl font-semibold text-[#8b6f47]">
          Salon<span className="text-[#d4a574]">Elite</span>
        </h1>
        {onLinkClick && (
          <button
            onClick={onLinkClick}
            className="md:hidden p-1 hover:bg-[#faf8f5] rounded-lg text-[#9a9a9a]"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                active
                  ? "bg-gradient-to-r from-[#f5d5d8] to-[#f8e4d9] text-[#8b6f47]"
                  : "text-[#9a9a9a] hover:bg-[#faf8f5]"
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => {
            if (onLinkClick) onLinkClick();
            if (typeof window !== 'undefined' && window.setAppMode) {
              window.setAppMode('selection');
            }
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-rose-600 hover:bg-rose-50 w-full text-left cursor-pointer"
        >
          <Smartphone size={20} />
          <span className="text-sm font-medium">Switch Salon</span>
        </button>
      </nav>

      <div className="p-4 border-t border-[#f0ebe3]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#faf8f5] transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4a574] to-[#8b6f47] flex items-center justify-center shadow-md">
            <User size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#8b6f47]">Admin User</p>
            <p className="text-xs text-[#9a9a9a]">admin@salonelite.com</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#faf8f5]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#f0ebe3] flex-col">
        {sidebarContent()}
      </aside>

      {/* Sidebar - Mobile Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Drawer Panel */}
          <aside className="relative w-64 bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent(() => setIsSidebarOpen(false))}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[#f0ebe3] flex items-center justify-between px-4 md:px-8 gap-4">
          <div className="flex items-center flex-1 max-w-md gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-[#faf8f5] rounded-lg transition-colors text-[#8b6f47]"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a]"
                size={18}
              />
              <input
                type="text"
                placeholder="Search clients, products, invoices..."
                className="w-full pl-10 pr-4 py-2 bg-[#faf8f5] border border-[#f0ebe3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button 
              onClick={() => {
                if (typeof window !== 'undefined' && window.setAppMode) {
                  window.setAppMode('selection');
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#f8e4d9] hover:bg-[#f5d5d8] text-[#8b6f47] text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
              type="button"
            >
              <span>Switch Salon</span>
            </button>

            <button className="relative p-2 hover:bg-[#faf8f5] rounded-lg transition-colors">
              <Bell size={20} className="text-[#9a9a9a]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#f5a3a3] rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

