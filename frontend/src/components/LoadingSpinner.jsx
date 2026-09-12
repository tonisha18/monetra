import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading financial data...', fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        {content}
      </div>
    );
  }

  return content;
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="divide-y divide-slate-100 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-36"></div>
            <div className="h-3 bg-slate-100 rounded w-24"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
            <div className="h-5 bg-slate-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
