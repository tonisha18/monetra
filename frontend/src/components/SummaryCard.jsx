import React from 'react';
import { formatCurrency } from '../utils/formatters.js';

export const SummaryCard = ({
  id,
  title,
  amount,
  icon: Icon,
  trend,
  colorScheme = 'slate',
  subtitle,
}) => {
  // Styles based on color scheme
  const schemes = {
    emerald: {
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-100',
      border: 'border-emerald-200/60',
    },
    rose: {
      bg: 'bg-rose-50/70',
      text: 'text-rose-700',
      iconBg: 'bg-rose-100',
      border: 'border-rose-200/60',
    },
    indigo: {
      bg: 'bg-indigo-50/70',
      text: 'text-indigo-700',
      iconBg: 'bg-indigo-100',
      border: 'border-indigo-200/60',
    },
    amber: {
      bg: 'bg-amber-50/70',
      text: 'text-amber-700',
      iconBg: 'bg-amber-100',
      border: 'border-amber-200/60',
    },
    slate: {
      bg: 'bg-slate-50',
      text: 'text-slate-800',
      iconBg: 'bg-slate-100',
      border: 'border-slate-200',
    },
  };

  const scheme = schemes[colorScheme] || schemes.slate;

  return (
    <div
      id={id}
      className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${scheme.iconBg}`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${scheme.text}`} />
        </div>
      </div>

      <div>
        <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 truncate">
          {formatCurrency(amount)}
        </div>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 font-medium truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
