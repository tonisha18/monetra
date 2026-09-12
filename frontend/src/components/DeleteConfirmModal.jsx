import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters.js';

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  transaction = null,
  isDeleting = false,
}) => {
  if (!isOpen || !transaction) return null;

  const recordedTime = transaction.transaction_time || transaction.created_at;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="delete-confirm-modal"
        className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Transaction</h3>
              <p className="text-xs text-slate-500">This action cannot be undone.</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-4">
            Are you sure you want to delete this transaction?
          </p>

          {/* Transaction Summary Box */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-6 text-xs text-slate-700 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Description:</span>
              <span className="font-semibold text-slate-900">{transaction.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount:</span>
              <span
                className={`font-semibold ${
                  transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span>{transaction.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span>{formatDate(transaction.transaction_date)}</span>
            </div>
            {recordedTime && (
              <div className="flex justify-between">
                <span className="text-slate-500">Recorded Time:</span>
                <span>{formatTime(recordedTime)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              id="cancel-delete-btn"
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-delete-btn"
              type="button"
              onClick={() => onConfirm(transaction.id)}
              disabled={isDeleting}
              className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
