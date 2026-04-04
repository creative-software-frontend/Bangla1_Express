'use client';
import React, { useState, useCallback } from 'react';
import WalletRequestsList from '@/app/components/dashboard/WalletRequestsList';
import WalletRequestForm from '@/app/components/dashboard/WalletRequestForm';

export default function WalletRequestsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Callback to refresh the list after successful submission
  const handleSuccess = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Wallet Requests</h1>
          <button
            onClick={openModal}
            className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
          >
            New Request
          </button>
        </div>

        {/* Wallet Requests List */}
        <WalletRequestsList key={refreshKey} />

        {/* Modal */}
        {isModalOpen && <WalletRequestForm onClose={closeModal} onSuccess={handleSuccess} />}
      </div>
    </div>
  );
}
