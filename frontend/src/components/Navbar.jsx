import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const Navbar = ({ toggleMobile, onOpenAddTx, title = 'Dashboard' }) => {
  const { user, profile } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left side: Hamburger + Page Title */}
      <div className="flex items-center space-x-3">
        <button
          id="mobile-menu-toggle"
          type="button"
          onClick={toggleMobile}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-2.5 sm:space-x-3.5">
        {/* Add Transaction Button */}
        {onOpenAddTx && (
          <button
            id="navbar-add-tx-btn"
            type="button"
            onClick={onOpenAddTx}
            className="hidden sm:inline-flex items-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Transaction</span>
          </button>
        )}

        {/* Profile Link */}
        <Link
          to="/profile"
          className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors flex items-center"
          title="My Profile"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
            {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
        </Link>
      </div>
    </header>
  );
};
