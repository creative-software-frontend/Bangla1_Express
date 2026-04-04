'use client';
import React from 'react';
import MerchantReferralList from '@/app/components/dashboard/MerchantReferralList';
import ReferralDetailsCard from '@/app/components/dashboard/ReferralDetailsCard';

export default function MerchantReferralsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Merchant Referrals</h1>
        </div>

        {/* Referral List */}
        <MerchantReferralList />

        {/* Referral Statistics Section */}
        <div className="mt-8">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Referral Statistics</h2>
          <ReferralDetailsCard 
            referrals={1} 
            orders={1} 
            commission={5} 
          />
        </div>
      </div>
    </div>
  );
}
