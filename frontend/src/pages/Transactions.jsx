import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Clock,
} from 'lucide-react';
import { LoadingSpinner, TableSkeleton } from '../components/LoadingSpinner.jsx';
import { TransactionModal } from '../components/TransactionModal.jsx';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.jsx';
import {
  formatCurrency,
  formatDate,
  formatTime,
  CATEGORIES,
  getCategoryBadgeStyle,
} from '../utils/formatters.js';
import api from '../services/api.js';

export const Transactions = () => {
  const { openAddModal } = useOutletContext();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('transaction_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modals state
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (search.trim()) params.append('search', search.trim());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await api.get(`/transactions?${params.toString()}`);
      if (res.data?.success) {
        setTransactions(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired or requires authentication. Please sign in or switch to Demo Mode.');
      } else {
        setError(err.userMessage || 'Failed to load transactions');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    const handleRefresh = () => fetchTransactions();
    window.addEventListener('monetra-refresh', handleRefresh);
    window.addEventListener('financial-tracker-refresh', handleRefresh);
    return () => {
      window.removeEventListener('monetra-refresh', handleRefresh);
      window.removeEventListener('financial-tracker-refresh', handleRefresh);
    };
  }, [typeFilter, categoryFilter, sortBy, sortOrder, startDate, endDate]);

  // Debounced or on-submit search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
    setSortBy('transaction_date');
    setSortOrder('desc');
  };

  // Edit handler
  const handleUpdateTransaction = async (formData) => {
    if (!editingTransaction) return;
    setIsSubmittingEdit(true);
    try {
      const res = await api.put(`/transactions/${editingTransaction.id}`, formData);
      if (res.data?.success) {
        // Update list locally
        setTransactions((prev) =>
          prev.map((item) => (item.id === editingTransaction.id ? res.data.data : item))
        );
        setEditingTransaction(null);
        window.dispatchEvent(new CustomEvent('monetra-refresh'));
        window.dispatchEvent(new CustomEvent('financial-tracker-refresh'));
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to update transaction');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Delete handler
  const handleDeleteTransaction = async (id) => {
    setIsDeleting(true);
    try {
      const res = await api.delete(`/transactions/${id}`);
      if (res.data?.success) {
        // Remove locally
        setTransactions((prev) => prev.filter((item) => item.id !== id));
        setDeletingTransaction(null);
        window.dispatchEvent(new CustomEvent('monetra-refresh'));
        window.dispatchEvent(new CustomEvent('financial-tracker-refresh'));
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters =
    search ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    startDate ||
    endDate;

  const secondaryFiltersCount = [
    categoryFilter !== 'all',
    Boolean(startDate),
    Boolean(endDate),
    sortBy !== 'transaction_date' || sortOrder !== 'desc',
  ].filter(Boolean).length;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            Transactions History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, edit, and categorize your income and expenditures.
          </p>
        </div>
        <button
          type="button"
          id="transactions-add-btn"
          onClick={openAddModal}
          className="mt-3.5 sm:mt-0 inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-95 shrink-0 min-h-[42px]"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Transaction
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
        {/* Row 1: Search and Type Pills */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="search-transactions-input"
              type="text"
              placeholder="Search by description or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-20 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Type Filter Buttons */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl w-full md:w-auto shrink-0">
            <button
              type="button"
              id="filter-type-all"
              onClick={() => setTypeFilter('all')}
              className={`flex-1 md:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              id="filter-type-income"
              onClick={() => setTypeFilter('income')}
              className={`flex-1 md:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                typeFilter === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              id="filter-type-expense"
              onClick={() => setTypeFilter('expense')}
              className={`flex-1 md:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                typeFilter === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Expense
            </button>
          </div>

          {/* Mobile Filter Expand Toggle */}
          <div className="w-full md:hidden flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-emerald-600 py-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              <span>More Filters & Sort</span>
              {secondaryFiltersCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-700 font-bold">
                  {secondaryFiltersCount}
                </span>
              )}
              {showMobileFilters ? (
                <ChevronUp className="w-3.5 h-3.5 ml-1" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              )}
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters and Sorting (Visible on desktop or when expanded on mobile) */}
        <div
          className={`${
            showMobileFilters ? 'grid' : 'hidden md:grid'
          } grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs`}
        >
          {/* Category Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              id="filter-category-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white"
            />
          </div>

          {/* Date Range End */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white"
            />
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <div className="flex space-x-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-2/3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white"
              >
                <option value="transaction_date">Date</option>
                <option value="amount">Amount</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-1/3 px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center justify-center transition-colors"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
                {sortOrder.toUpperCase()}
              </button>
            </div>
          </div>
        </div>

        {/* Clear Filters Active indicator (Desktop) */}
        {hasActiveFilters && (
          <div className="hidden md:flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">
              Showing filtered results ({transactions.length} found)
            </span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium inline-flex items-center"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Transactions Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} />
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600 font-medium">
            {error}
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-sm font-bold text-slate-800 mb-1">
              No transactions match your criteria
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              Try adjusting your search keywords, clear filters, or record a new transaction.
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Clear all filters
              </button>
            ) : (
              <button
                type="button"
                onClick={openAddModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Add Your First Transaction
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View (visible on medium screens and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Date & Time</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Date & Exact Time */}
                      <td className="py-3.5 px-6 text-slate-600 font-medium whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{formatDate(tx.transaction_date)}</div>
                        {(tx.transaction_time || tx.created_at) && (
                          <div className="flex items-center text-[11px] text-slate-400 font-normal mt-0.5">
                            <Clock className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                            <span>{formatTime(tx.transaction_time || tx.created_at)}</span>
                          </div>
                        )}
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                        {tx.description}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${getCategoryBadgeStyle(
                            tx.category
                          )}`}
                        >
                          {tx.category}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide ${
                            tx.type === 'income'
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <TrendingUp className="w-3 h-3 mr-1 text-emerald-600" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1 text-rose-600" />
                          )}
                          {tx.type}
                        </span>
                      </td>

                      {/* Amount */}
                      <td
                        className={`py-3.5 px-4 text-right font-bold whitespace-nowrap ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            id={`edit-tx-${tx.id}`}
                            onClick={() => setEditingTransaction(tx)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Transaction"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            id={`delete-tx-${tx.id}`}
                            onClick={() => setDeletingTransaction(tx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch Cards View (spacious, touch-friendly, eliminates packed tables on phones) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {transactions.map((tx) => (
                <div
                  key={`mobile-${tx.id}`}
                  className="p-4 space-y-2 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Top line: Date, Time and Type badge */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
                      <span>{formatDate(tx.transaction_date)}</span>
                      {(tx.transaction_time || tx.created_at) && (
                        <span className="flex items-center text-slate-400 text-[11px] border-l border-slate-200 pl-1.5">
                          <Clock className="w-3 h-3 mr-0.5 text-slate-400 shrink-0" />
                          <span>{formatTime(tx.transaction_time || tx.created_at)}</span>
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        tx.type === 'income'
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : 'text-rose-700 bg-rose-50 border border-rose-200'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <TrendingUp className="w-3 h-3 mr-1 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1 text-rose-600" />
                      )}
                      {tx.type}
                    </span>
                  </div>

                  {/* Middle line: Description & Amount */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {tx.description}
                      </h4>
                      <div className="mt-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getCategoryBadgeStyle(
                            tx.category
                          )}`}
                        >
                          {tx.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-base font-extrabold ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons with comfortable touch targets (min 44px height) */}
                  <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                    <button
                      type="button"
                      id={`edit-mobile-tx-${tx.id}`}
                      onClick={() => setEditingTransaction(tx)}
                      className="px-3.5 py-2 min-h-[40px] text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                      Edit
                    </button>
                    <button
                      type="button"
                      id={`delete-mobile-tx-${tx.id}`}
                      onClick={() => setDeletingTransaction(tx)}
                      className="px-3.5 py-2 min-h-[40px] text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      <TransactionModal
        isOpen={Boolean(editingTransaction)}
        onClose={() => setEditingTransaction(null)}
        onSubmit={handleUpdateTransaction}
        initialData={editingTransaction}
        isSubmitting={isSubmittingEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTransaction)}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDeleteTransaction}
        transaction={deletingTransaction}
        isDeleting={isDeleting}
      />
    </div>
  );
};
