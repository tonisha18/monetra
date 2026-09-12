import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  User,
  LogOut,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Sidebar = ({ isMobileOpen, closeMobile }) => {
  const { user, profile, logout } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/transactions',
      label: 'Transactions',
      icon: Receipt,
    },
    {
      to: '/ai-finsight',
      label: 'AI FinSight',
      icon: Sparkles,
      badge: 'AI',
    },
    {
      to: '/profile',
      label: 'Manage Profile',
      icon: User,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-white text-base tracking-tight leading-none">
                  Monetra
                </h1>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  Personal Finance
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={closeMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 mr-3" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Account / Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2.5">
          <NavLink
            to="/profile"
            onClick={closeMobile}
            className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-800/80 transition-colors group cursor-pointer"
            title="Manage Profile"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 group-hover:border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0 transition-colors">
              {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                {profile?.full_name || user?.user_metadata?.full_name || 'Personal Account'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </NavLink>

          <button
            id="sidebar-logout-btn"
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900/50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
