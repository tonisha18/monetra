import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Calendar,
  Check,
  AlertCircle,
  LogOut,
  ShieldCheck,
  Wallet,
  Receipt,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/formatters.js';
import api from '../services/api.js';

export const Profile = () => {
  const { user, profile, updateProfile, logout } = useAuth();

  const [fullName, setFullName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [transactionCount, setTransactionCount] = useState(0);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    } else if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }

    const fetchSummary = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        if (res.data?.success && res.data.data) {
          setTransactionCount(res.data.data.transactionCount || 0);
        }
      } catch {
        // Fallback silently if summary unavailable
      }
    };
    fetchSummary();
  }, [profile, user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Full name cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile(fullName.trim());
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const accountCreatedDate =
    profile?.created_at || user?.created_at || new Date().toISOString();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Title Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Manage Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal account settings, preferences, and security.
        </p>
      </div>

      {/* Account Highlights & Configuration Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Member Since
          </span>
          <span className="font-semibold text-slate-800 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
            <span className="truncate">{formatDate(accountCreatedDate)}</span>
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Default Currency
          </span>
          <span className="font-semibold text-slate-800 flex items-center">
            <Wallet className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
            INR (₹)
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Records
          </span>
          <span className="font-semibold text-slate-800 flex items-center">
            <Receipt className="w-3.5 h-3.5 mr-1.5 text-indigo-500 shrink-0" />
            {transactionCount} Records
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Account Status
          </span>
          <span className="font-semibold text-emerald-700 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 shrink-0" />
            Active &amp; Secure
          </span>
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center">
            <Check className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-2xl border border-emerald-200 shadow-xs">
            {(fullName || user?.email || 'U')[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {fullName || 'Personal Account'}
            </h2>
            <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="profile-fullname" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="profile-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100 transition-all"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="profile-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="profile-email"
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-500 text-sm cursor-not-allowed font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Your verified account login and primary contact email.
            </p>
          </div>

          {/* Account Creation Date */}
          <div>
            <label htmlFor="profile-joined" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Account Creation Date
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="profile-joined"
                type="text"
                disabled
                value={formatDate(accountCreatedDate)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-600 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-3">
            <button
              id="save-profile-btn"
              type="submit"
              disabled={isUpdating}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center disabled:opacity-60 cursor-pointer"
            >
              {isUpdating ? 'Saving Profile...' : 'Update Name'}
            </button>
          </div>
        </form>

        {/* Security & Sign Out Section */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
            <span>Your personal financial records and account data are encrypted and private.</span>
          </div>

          <button
            id="profile-logout-btn"
            type="button"
            onClick={logout}
            className="w-full sm:w-auto px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
