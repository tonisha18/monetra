import React, { useState } from 'react';
import { X, Database, Copy, Check, ExternalLink, ShieldCheck, Key } from 'lucide-react';
import {
  getStoredSupabaseConfig,
  setStoredSupabaseConfig,
  clearStoredSupabaseConfig,
} from '../services/supabase.js';

export const SupabaseSetupModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- 1. Create PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create TRANSACTIONS table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);

-- 4. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 5. Security policies for profiles
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 6. Security policies for transactions
CREATE POLICY "Users can select own transactions" 
  ON public.transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
  ON public.transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" 
  ON public.transactions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" 
  ON public.transactions FOR DELETE 
  USING (auth.uid() = user_id);
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setStoredSupabaseConfig(url, anonKey);
    setSavedSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleResetConfig = () => {
    clearStoredSupabaseConfig();
    setUrl('');
    setAnonKey('');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="supabase-setup-modal"
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Database Setup & SQL Schema</h3>
              <p className="text-xs text-slate-500">PostgreSQL Schema & Security Policies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick instructions */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 text-xs text-emerald-900 space-y-2">
            <div className="flex items-center font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              How to setup your Cloud Database:
            </div>
            <ol className="list-decimal list-inside space-y-1 text-emerald-800/90 pl-1">
              <li>Log in to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-semibold inline-flex items-center">Supabase.com <ExternalLink className="w-3 h-3 ml-0.5 inline" /></a> and create a new project.</li>
              <li>Go to the <strong>SQL Editor</strong> tab in your dashboard.</li>
              <li>Copy and paste the SQL script below, then click <strong>Run</strong>.</li>
              <li>Copy your Project URL and Anon/Public Key from Project Settings &gt; API.</li>
              <li><strong>Instant Sign-in Tip:</strong> Under <em>Authentication &gt; Providers &gt; Email</em>, toggle <strong>Confirm email</strong> to <strong>OFF</strong> to allow users to sign in without email confirmation delays.</li>
            </ol>
          </div>

          {/* Copyable SQL Schema */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                SQL Schema & Security Policies
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Copy SQL
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
              <pre>{sqlCode}</pre>
            </div>
          </div>

          {/* Live credentials tester / setup */}
          <div className="border-t border-slate-100 pt-5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center mb-3">
              <Key className="w-4 h-4 mr-1.5 text-slate-600" />
              Configure Live Supabase Credentials
            </h4>
            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzproject.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Supabase Anon / Public Key
                </label>
                <input
                  type="password"
                  placeholder="eyJh..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-100 font-mono"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetConfig}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Use Default / Demo Mode
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  {savedSuccess ? 'Connected & Reloading...' : 'Save & Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
