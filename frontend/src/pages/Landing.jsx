import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  PieChart,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Lock,
  Smartphone,
  Layers,
  ChevronRight,
  Play,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Landing = () => {
  const { loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleTryDemo = () => {
    loginDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight block leading-tight">
                Monetra
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 tracking-wide uppercase block">
                Personal Finance
              </span>
            </div>
          </div>

          {/* Desktop & Mobile Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              type="button"
              onClick={handleTryDemo}
              className="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Play className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
              Live Demo
            </button>

            <Link
              to="/login"
              id="landing-login-btn"
              className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-colors min-h-[40px] flex items-center"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              id="landing-signup-btn"
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-sm transition-all transform active:scale-95 flex items-center min-h-[40px]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-8 sm:pt-16 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          {/* Subtle Pill Tag */}
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-800 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Clean, Real-Time Personal Financial Management</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Master your money with <span className="text-emerald-600">clarity</span> and confidence.
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Record transactions in seconds, monitor live net balance and savings rates, and explore rich visual analytics designed seamlessly for both mobile and desktop.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link
              to="/register"
              id="hero-get-started-cta"
              className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-bold rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center min-h-[48px]"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>

            <Link
              to="/login"
              id="hero-sign-in-cta"
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-sm sm:text-base font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center min-h-[48px]"
            >
              Sign In
            </Link>

            <button
              type="button"
              onClick={handleTryDemo}
              id="hero-demo-cta"
              className="w-full sm:w-auto px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 underline decoration-emerald-400 hover:decoration-emerald-600 underline-offset-4 flex items-center justify-center"
            >
              <Play className="w-3 h-3 mr-1.5 fill-emerald-600" />
              Try Instant Demo (No signup)
            </button>
          </div>

          {/* Quick Security Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-500 font-medium">
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
              <span>Isolated User Records</span>
            </div>
            <div className="flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
              <span>Encrypted Session Tokens</span>
            </div>
            <div className="flex items-center">
              <Smartphone className="w-4 h-4 mr-1.5 text-emerald-600" />
              <span>Mobile-First Fluid Interface</span>
            </div>
          </div>
        </section>

        {/* Live Interactive App Interface Mockup */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-16 sm:pb-24">
          <div className="bg-slate-900 rounded-3xl p-3 sm:p-5 shadow-2xl border border-slate-800">
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Monetra • Live Overview
              </span>
              <div className="text-[11px] text-emerald-400 font-mono font-semibold flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                Active
              </div>
            </div>

            {/* Inner Dashboard Canvas */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 text-left">
              {/* Mock App Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200/80 gap-3">
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-slate-900">
                    Welcome to your financial overview
                  </h3>
                  <p className="text-xs text-slate-500">Live balance and category distribution</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors"
                  >
                    + Add Transaction
                  </Link>
                </div>
              </div>

              {/* 4 Financial Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-5">
                {/* Balance */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Balance</span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-slate-900">$12,850.00</div>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Net Available Funds</p>
                </div>

                {/* Income */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Income</span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-emerald-600">$18,400.00</div>
                  <p className="text-[10px] text-slate-500 mt-0.5">All-time earnings</p>
                </div>

                {/* Expenses */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Expenses</span>
                    <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-rose-600">$5,550.00</div>
                  <p className="text-[10px] text-slate-500 mt-0.5">All-time outflow</p>
                </div>

                {/* Savings Rate */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Savings Rate</span>
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-indigo-600">69.8%</div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Healthy cash buffer</p>
                </div>
              </div>

              {/* Sample Analytics & Recent Transactions Snippet */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Visual Category Breakdown Progress */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center">
                      <PieChart className="w-4 h-4 mr-1.5 text-purple-600" />
                      Spending Categories
                    </span>
                    <span className="text-[11px] text-slate-500">Monthly Share</span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-700">Housing & Rent</span>
                        <span className="text-slate-900 font-semibold">$2,200 (39.6%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full w-[40%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-700">Food & Groceries</span>
                        <span className="text-slate-900 font-semibold">$1,250 (22.5%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full w-[23%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-700">Utilities & Internet</span>
                        <span className="text-slate-900 font-semibold">$600 (10.8%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full w-[11%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sample Activity List */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-1.5 text-emerald-600" />
                      Recent Activity
                    </span>
                    <Link to="/register" className="text-[11px] text-emerald-600 font-semibold hover:underline">
                      View all
                    </Link>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-semibold text-slate-900">Monthly Client Retainer</p>
                        <p className="text-[10px] text-slate-400">Salary • Today</p>
                      </div>
                      <span className="font-bold text-emerald-600">+$4,200.00</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-semibold text-slate-900">Whole Foods Market</p>
                        <p className="text-[10px] text-slate-400">Food • Yesterday</p>
                      </div>
                      <span className="font-bold text-rose-600">-$142.50</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-semibold text-slate-900">Electric & Water Utility</p>
                        <p className="text-[10px] text-slate-400">Utilities • Sep 9</p>
                      </div>
                      <span className="font-bold text-rose-600">-$98.20</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section className="py-12 sm:py-16 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Engineered for speed, security, and clarity.
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Everything you need to keep your personal accounts organized and up to date.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Instant Balance Computations
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Every transaction immediately recalculates your total balance, income, expenses, and savings rate across your entire history.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Tailored Mobile Experience
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Generous padding, intuitive responsive navigation, and touch-optimized card items ensure your finances look comfortable on any phone.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Private Account Isolation
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Secure authenticated sessions isolate data per user ID. Your transaction data stays completely separated from other accounts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Ready to take control of your finances?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Join now to track your daily income, monitor spending categories, and hit your financial goals.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm sm:text-base rounded-xl transition-all shadow-md active:scale-95"
                >
                  Create Your Account
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm sm:text-base rounded-xl transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Monetra. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="hover:text-slate-800 transition-colors">
              Sign In
            </Link>
            <span>•</span>
            <Link to="/register" className="hover:text-slate-800 transition-colors">
              Register
            </Link>
            <span>•</span>
            <button
              type="button"
              onClick={handleTryDemo}
              className="text-emerald-600 hover:underline font-semibold"
            >
              Demo Preview
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
