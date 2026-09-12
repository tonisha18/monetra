import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  ArrowRight,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Sparkles,
  AlertCircle,
  User,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { SummaryCard } from '../components/SummaryCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { formatCurrency, formatDate, CATEGORY_COLORS, getCategoryBadgeStyle } from '../utils/formatters.js';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export const Dashboard = () => {
  const { openAddModal } = useOutletContext();
  const { user, profile, isDemoMode } = useAuth();

  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, chartsRes, txRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/charts'),
        api.get('/transactions?sortBy=transaction_date&sortOrder=desc'),
      ]);

      if (sumRes.data?.success) {
        setSummary(sumRes.data.data);
      }
      if (chartsRes.data?.success) {
        setCharts(chartsRes.data.data);
      }
      if (txRes.data?.success) {
        // Take 5 most recent
        setRecentTransactions((txRes.data.data || []).slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired or requires authentication. Please sign in or switch to Demo Mode.');
      } else {
        setError(err.userMessage || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen to refresh events from modal additions/deletions
    const handleRefresh = () => fetchDashboardData();
    window.addEventListener('monetra-refresh', handleRefresh);
    window.addEventListener('financial-tracker-refresh', handleRefresh);
    return () => {
      window.removeEventListener('monetra-refresh', handleRefresh);
      window.removeEventListener('financial-tracker-refresh', handleRefresh);
    };
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating your financial summary and charts..." />;
  }

  const hasTransactions = (summary?.transactionCount || 0) > 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {profile?.full_name || user?.user_metadata?.full_name || 'there'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here is your live financial snapshot and analytics overview.
          </p>
        </div>
        <button
          type="button"
          id="dashboard-add-tx-btn"
          onClick={openAddModal}
          className="mt-3.5 sm:mt-0 inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-95 shrink-0 min-h-[42px]"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Transaction
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setError('');
                fetchDashboardData();
              }}
              className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors"
            >
              Retry
            </button>
            <Link
              to="/login"
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* 4 Summary Cards (Responsive 2x2 grid on mobile, 4 columns on large screens) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <SummaryCard
          id="card-total-balance"
          title="Total Balance"
          amount={summary?.totalBalance || 0}
          icon={Wallet}
          colorScheme={summary?.totalBalance >= 0 ? 'emerald' : 'rose'}
          subtitle="Net Available Funds"
        />
        <SummaryCard
          id="card-total-income"
          title="Total Income"
          amount={summary?.totalIncome || 0}
          icon={TrendingUp}
          colorScheme="emerald"
          subtitle="All Time Earnings"
        />
        <SummaryCard
          id="card-total-expenses"
          title="Total Expenses"
          amount={summary?.totalExpenses || 0}
          icon={TrendingDown}
          colorScheme="rose"
          subtitle="All Time Outflow"
        />
        <SummaryCard
          id="card-savings"
          title="Savings"
          amount={summary?.savings || 0}
          icon={PiggyBank}
          colorScheme="indigo"
          subtitle="Income - Expenses"
        />
      </div>

      {/* Empty State when no transactions exist */}
      {!hasTransactions ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No transactions yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Add your first transaction to start tracking your finances and generate real-time visual charts.
          </p>
          <button
            type="button"
            id="empty-state-add-btn"
            onClick={openAddModal}
            className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Transaction
          </button>
        </div>
      ) : (
        <>
          {/* Charts Row 1: Chart 1 (Income vs Expenses) & Chart 2 (Expenses by Category) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Income vs Expenses */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2 text-emerald-600" />
                    Income vs Expenses
                  </h3>
                  <p className="text-xs text-slate-500">Chronological financial comparison</p>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full pt-2">
                {charts?.incomeVsExpense?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={charts.incomeVsExpense}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => (Math.abs(val) >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`)}
                      />
                      <Tooltip
                        formatter={(val) => [formatCurrency(val), '']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                      <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Not enough data for comparison chart
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Expenses by Category (Donut/Pie Chart) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center">
                    <PieChartIcon className="w-4 h-4 mr-2 text-purple-600" />
                    Expenses by Category
                  </h3>
                  <p className="text-xs text-slate-500">Distribution of spending across categories</p>
                </div>
              </div>

              <div className="min-h-[260px] sm:h-72 w-full flex flex-col sm:flex-row items-center justify-center gap-2">
                {charts?.expensesByCategory?.length > 0 ? (
                  <>
                    <div className="w-full sm:w-1/2 h-44 sm:h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={charts.expensesByCategory}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={68}
                            paddingAngle={3}
                          >
                            {charts.expensesByCategory.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CATEGORY_COLORS[entry.category] || '#64748b'}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(val) => [formatCurrency(val), 'Amount']}
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Category Legend list */}
                    <div className="w-full sm:w-1/2 max-h-40 sm:max-h-56 overflow-y-auto space-y-1.5 px-1 sm:pl-2 text-xs">
                      {charts.expensesByCategory.map((item) => (
                        <div key={item.category} className="flex items-center justify-between py-1 border-b border-slate-50">
                          <div className="flex items-center min-w-0 pr-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full mr-2 shrink-0"
                              style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#64748b' }}
                            />
                            <span className="font-medium text-slate-700 truncate">
                              {item.category}
                            </span>
                          </div>
                          <span className="font-semibold text-slate-900 shrink-0">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No expense records found yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chart 3: Monthly Financial Trend (Income, Expenses, Balance) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-indigo-600" />
                  Monthly Financial Trend
                </h3>
                <p className="text-xs text-slate-500">Income, expenses, and net balance trajectory over time</p>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              {charts?.monthlyTrend?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={charts.monthlyTrend}
                    margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => (Math.abs(val) >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`)}
                    />
                    <Tooltip
                      formatter={(val) => [formatCurrency(val), '']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="balance" name="Net Balance" stroke="#6366f1" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Not enough monthly points for trend line
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
