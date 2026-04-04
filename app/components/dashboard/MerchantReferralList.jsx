'use client';
import React, { useState, useEffect } from 'react';
import { Eye, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getReferralList, getReferralDetails } from '@/app/services/walletApi';

const MerchantReferralList = () => {
  const router = useRouter();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReferralList();
      setReferrals(data.referral_data || []);
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
      setError('Failed to load referral data. Please try again.');
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (merchant) => {
    try {
      const merchantId = merchant.user?.id || merchant.id;
      if (!merchantId) {
        toast.error('Invalid merchant ID');
        return;
      }
      
      setDetailsLoading(true);
      const details = await getReferralDetails(merchantId);
      setSelectedMerchant({
        ...merchant,
        details: details
      });
      toast.success(`Loaded details for ${merchant.user?.name || merchant.name}`);
    } catch (err) {
      console.error('Failed to fetch details:', err);
      toast.error('Failed to load merchant details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewRequests = (merchant) => {
    router.push('/dashboard/wallet-requests');
  };

  const closeDetails = () => {
    setSelectedMerchant(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchReferrals}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">SL</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Mobile</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Address</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Referral Count</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Order Count</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Commission</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {referrals.length > 0 ? (
              referrals.map((merchant, index) => {
                const user = merchant.user || {};
                return (
                  <tr key={user.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-800 text-sm">{index + 1}</td>
                    <td className="py-3 px-4 text-gray-800 text-sm font-medium">{user.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{user.email || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{user.mobile || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{user.address || 'N/A'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {merchant.referral_count || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {merchant.order_count || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-800 text-sm">
                      {(merchant.total_commission || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(merchant)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          onClick={() => handleViewRequests(merchant)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <List size={14} />
                          Requests
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="py-8 text-center text-gray-500">
                  No referral data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 p-4">
        {referrals.length > 0 ? (
          referrals.map((merchant, index) => {
            const user = merchant.user || {};
            return (
              <div key={user.id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{user.name || 'N/A'}</h3>
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Email:</span> {user.email || 'N/A'}</p>
                    <p><span className="font-medium">Mobile:</span> {user.mobile || 'N/A'}</p>
                    <p><span className="font-medium">Address:</span> {user.address || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-blue-600 font-medium">Referrals</p>
                    <p className="text-lg font-bold text-blue-800">{merchant.referral_count || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-green-600 font-medium">Orders</p>
                    <p className="text-lg font-bold text-green-800">{merchant.order_count || 0}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-purple-600 font-medium">Commission</p>
                    <p className="text-lg font-bold text-purple-800">{(merchant.total_commission || 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(merchant)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => handleViewRequests(merchant)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <List size={16} />
                    Requests
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            No referral data found
          </div>
        )}
      </div>

      {/* Details Section - Shows when View button is clicked */}
      {selectedMerchant && (
        <div className="mt-8 border-t-2 border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Referral Details - {selectedMerchant.user?.name || 'N/A'}
            </h3>
            <button
              onClick={closeDetails}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>

          {detailsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Details Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">SL</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Mobile</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Address</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Order Count</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMerchant.details?.referral_data?.[0]?.users?.map((user, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800 text-sm">{index + 1}</td>
                        <td className="py-3 px-4 text-gray-800 text-sm font-medium">{user.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">{user.email || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">{user.mobile || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">{user.address || 'N/A'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {user.order_count || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-800 text-sm">
                          {(selectedMerchant.details?.referral_data?.[0]?.total_commission || 0).toFixed(2)}
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-500">
                          No detailed data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Grand Total:</span>
                    <span className="text-lg font-bold text-gray-800">
                      {Number(selectedMerchant.details?.referral_data?.[0]?.total_commission || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Withdraw:</span>
                    <span className="text-lg font-bold text-blue-600">0.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Wallet Balance:</span>
                    <span className="text-lg font-bold text-green-600">
                      {Number(selectedMerchant.details?.withdraw_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MerchantReferralList;
