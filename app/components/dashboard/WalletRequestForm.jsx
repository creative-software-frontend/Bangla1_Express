'use client';
import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { createWalletRequest } from '@/app/services/walletApi';

const WalletRequestForm = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const availableBalance = 1.00; // TODO: Fetch from API when endpoint is fixed

  const handleIncrement = () => {
    setAmount(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (amount > 1) {
      setAmount(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      await createWalletRequest(amount);
      toast.success('Request submitted successfully');
      
      // Call success callback to refresh parent list
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to submit wallet request:', error);
      toast.error(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Wallet Request</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Available Balance */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Available Balance: <span className="font-semibold"> {availableBalance.toFixed(2)}</span> Available
            </p>
          </div>

          {/* Amount Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Withdrawal Amount
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={amount <= 1}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  amount <= 1
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                <Minus size={20} />
              </button>

              <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-lg border-2 border-gray-300 min-w-[150px] justify-center">
                <span className="text-2xl font-bold text-gray-800"></span>
                <span className="text-3xl font-bold text-gray-800">{amount}</span>
              </div>

              <button
                type="button"
                onClick={handleIncrement}
                className="p-3 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={amount <= 0 || loading}
              className={`flex-1 px-4 py-3 font-medium rounded-lg transition-colors ${
                amount <= 0 || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletRequestForm;
