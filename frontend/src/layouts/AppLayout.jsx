import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar.jsx';
import { Navbar } from '../components/Navbar.jsx';
import { TransactionModal } from '../components/TransactionModal.jsx';
import api from '../services/api.js';

export const AppLayout = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/transactions')) return 'Transactions';
    if (path.includes('/ai-finsight')) return 'AI FinSight';
    if (path.includes('/profile')) return 'Manage Profile';
    return 'Dashboard';
  };

  const handleCreateTransaction = async (formData) => {
    setIsSubmittingTx(true);
    try {
      const res = await api.post('/transactions', formData);
      if (res.data?.success) {
        setIsAddModalOpen(false);
        // Dispatch an event so active views can reload data
        window.dispatchEvent(new CustomEvent('monetra-refresh'));
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to create transaction');
    } finally {
      setIsSubmittingTx(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Persistent / Responsive Sidebar */}
      <Sidebar
        isMobileOpen={isMobileNavOpen}
        closeMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Navbar
          toggleMobile={() => setIsMobileNavOpen(!isMobileNavOpen)}
          onOpenAddTx={() => setIsAddModalOpen(true)}
          title={getPageTitle()}
        />

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:p-8 max-w-7xl w-full mx-auto pb-8">
          <Outlet context={{ openAddModal: () => setIsAddModalOpen(true) }} />
        </main>
      </div>

      {/* Global Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTransaction}
        isSubmitting={isSubmittingTx}
      />
    </div>
  );
};
