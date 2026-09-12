/**
 * Formatting helpers for currency, dates, and category styling
 */

export const formatCurrency = (amount, currency = 'INR') => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }); // e.g. "12 Sep 2026"
    }
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatTime = (timeOrTimestamp) => {
  if (!timeOrTimestamp) return '';
  // If it's a HH:mm or HH:mm:ss string
  if (typeof timeOrTimestamp === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(timeOrTimestamp)) {
    const [hours, minutes] = timeOrTimestamp.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;
  }
  try {
    const d = new Date(timeOrTimestamp);
    if (isNaN(d.getTime())) return timeOrTimestamp;
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return timeOrTimestamp;
  }
};

export const formatDateTime = (dateString, timeString) => {
  const datePart = formatDate(dateString);
  const timePart = formatTime(timeString);
  if (datePart && timePart) {
    return `${datePart} at ${timePart}`;
  }
  return datePart || timePart || '';
};

export const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Education',
  'Entertainment',
  'Healthcare',
  'Rent',
  'Salary',
  'Freelance',
  'Investment',
  'Other',
];

export const CATEGORY_COLORS = {
  Food: '#f59e0b', // amber-500
  Transport: '#3b82f6', // blue-500
  Shopping: '#8b5cf6', // purple-500
  Bills: '#ef4444', // red-500
  Education: '#06b6d4', // cyan-500
  Entertainment: '#ec4899', // pink-500
  Healthcare: '#10b981', // emerald-500
  Rent: '#6366f1', // indigo-500
  Salary: '#22c55e', // green-500
  Freelance: '#14b8a6', // teal-500
  Investment: '#a855f7', // purple-500
  Other: '#64748b', // slate-500
};

export const getCategoryBadgeStyle = (category) => {
  const styles = {
    Food: 'bg-amber-50 text-amber-700 border-amber-200',
    Transport: 'bg-blue-50 text-blue-700 border-blue-200',
    Shopping: 'bg-purple-50 text-purple-700 border-purple-200',
    Bills: 'bg-rose-50 text-rose-700 border-rose-200',
    Education: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    Entertainment: 'bg-pink-50 text-pink-700 border-pink-200',
    Healthcare: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Rent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Salary: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Freelance: 'bg-teal-50 text-teal-700 border-teal-200',
    Investment: 'bg-violet-50 text-violet-700 border-violet-200',
    Other: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  return styles[category] || 'bg-slate-50 text-slate-700 border-slate-200';
};
