'use client';
import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import WalletRequestForm from './WalletRequestForm';
import { getReferralDetails } from '@/app/services/walletApi';

const ReferralDetailsCard = ({ merchantId }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (merchantId) {
      fetchDetails();
    }
  }, [merchantId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getReferralDetails(merchantId);
      setDetails(data);
    } catch (err) {
      console.error('Failed to fetch details:', err);
      toast.error('Failed to load referral details');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletRequest = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Calculate totals from referral data
  const totalReferrals = details?.referral_data?.reduce((sum, item) => sum + (item.referral_count || 0), 0) || 0;
  const totalOrders = details?.referral_data?.reduce((sum, item) => sum + (item.order_count || 0), 0) || 0;
  const totalCommission = details?.referral_data?.reduce((sum, item) => sum + (item.total_commission || 0), 0) || 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Referrals Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Users className="text-white" size={24} />
            </div>
            <span className="text-3xl font-bold text-blue-800">{totalReferrals}</span>
          </div>
          <h3 className="text-sm font-medium text-blue-700 uppercase tracking-wide">Referrals</h3>
        </div>

        {/* Orders Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-600 rounded-lg">
              <ShoppingBag className="text-white" size={24} />
            </div>
            <span className="text-3xl font-bold text-green-800">{totalOrders}</span>
          </div>
          <h3 className="text-sm font-medium text-green-700 uppercase tracking-wide">Orders</h3>
        </div>

        {/* Commission Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-600 rounded-lg">
              <DollarSign className="text-white" size={24} />
            </div>
            <span className="text-3xl font-bold text-purple-800">{totalCommission.toFixed(2)}</span>
          </div>
          <h3 className="text-sm font-medium text-purple-700 uppercase tracking-wide">Commission</h3>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={handleWalletRequest}
          className="w-full md:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <DollarSign size={20} />
          Wallet Request
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && <WalletRequestForm onClose={closeModal} />}
    </div>
  );
};

export default ReferralDetailsCard;
