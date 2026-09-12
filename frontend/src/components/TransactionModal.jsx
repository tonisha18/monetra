import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Calendar, IndianRupee, Tag, FileText, Clock } from 'lucide-react';
import { CATEGORIES } from '../utils/formatters.js';

const getTodayDate = () => new Date().toISOString().split('T')[0];
const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) => {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: 'Food',
    description: '',
    transaction_date: getTodayDate(),
    transaction_time: getCurrentTime(),
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      let initialTime = initialData.transaction_time || '';
      if (!initialTime && initialData.created_at) {
        try {
          const d = new Date(initialData.created_at);
          if (!isNaN(d.getTime())) {
            initialTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          }
        } catch {
          // ignore
        }
      }
      if (!initialTime) {
        initialTime = getCurrentTime();
      }

      setFormData({
        type: initialData.type || 'expense',
        amount: initialData.amount !== undefined ? String(initialData.amount) : '',
        category: initialData.category || 'Food',
        description: initialData.description || '',
        transaction_date:
          initialData.transaction_date || getTodayDate(),
        transaction_time: initialTime,
      });
    } else {
      setFormData({
        type: 'expense',
        amount: '',
        category: 'Food',
        description: '',
        transaction_date: getTodayDate(),
        transaction_time: getCurrentTime(),
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    const amt = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amt) || amt <= 0) {
      errs.amount = 'Please enter a valid amount greater than 0';
    }
    if (!formData.category) {
      errs.category = 'Category is required';
    }
    if (!formData.description || !formData.description.trim()) {
      errs.description = 'Description is required';
    }
    if (!formData.transaction_date) {
      errs.transaction_date = 'Date is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      transaction_time: formData.transaction_time || getCurrentTime(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="transaction-modal-content"
        className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {isEditing ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <button
            id="close-transaction-modal-btn"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                id="type-expense-btn"
                onClick={() => setFormData({ ...formData, type: 'expense', category: formData.category === 'Salary' ? 'Food' : formData.category })}
                className={`flex items-center justify-center py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  formData.type === 'expense'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 mr-1.5 text-rose-500" />
                Expense
              </button>
              <button
                type="button"
                id="type-income-btn"
                onClick={() => setFormData({ ...formData, type: 'income', category: formData.category === 'Food' ? 'Salary' : formData.category })}
                className={`flex items-center justify-center py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  formData.type === 'income'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 mr-1.5 text-emerald-500" />
                Income
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="tx-amount-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Amount (₹ INR)
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-semibold">
                <IndianRupee className="w-4 h-4" />
              </div>
              <input
                id="tx-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-slate-900 text-base font-semibold focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                  errors.amount
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="tx-category-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Tag className="w-4 h-4" />
              </div>
              <select
                id="tx-category-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100 transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="tx-description-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <input
                id="tx-description-input"
                type="text"
                placeholder="e.g., Supermarket Groceries, Monthly Salary"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                  errors.description
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
                }`}
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Date & Exact Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label htmlFor="tx-date-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="tx-date-input"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                    errors.transaction_date
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
                  }`}
                />
              </div>
              {errors.transaction_date && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.transaction_date}</p>
              )}
            </div>

            {/* Exact Time */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="tx-time-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Exact Time
                </label>
                <button
                  type="button"
                  id="tx-set-current-time-btn"
                  onClick={() => setFormData({ ...formData, transaction_time: getCurrentTime() })}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium hover:underline cursor-pointer"
                >
                  Set to now
                </button>
              </div>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  id="tx-time-input"
                  type="time"
                  value={formData.transaction_time}
                  onChange={(e) => setFormData({ ...formData, transaction_time: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100 transition-all"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Exact time at which expense was recorded
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              id="cancel-tx-btn"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-tx-btn"
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-all flex items-center ${
                formData.type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : isEditing ? (
                <span>Update Transaction</span>
              ) : (
                <span>Add Transaction</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
