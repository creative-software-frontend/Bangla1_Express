'use client';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getWalletRequests } from '@/app/services/walletApi';

const WalletRequestsList = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Map tab to status: pending=0, approved=1, cancelled=2
      const statusMap = {
        pending: '0',
        approved: '1',
        cancelled: '2'
      };
      
      const data = await getWalletRequests(statusMap[activeTab]);
      setRequests(data.request_list || []);
    } catch (err) {
      console.error('Failed to fetch wallet requests:', err);
      setError('Failed to load wallet requests. Please try again.');
      toast.error('Failed to load wallet requests');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case '0':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case '1':
        return 'bg-green-100 text-green-800 border border-green-300';
      case '2':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case '0': return 'Pending';
      case '1': return 'Approved';
      case '2': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  // Calculate summary counts
  const summary = {
    total: requests.length,
    pending: requests.filter(r => r.status === '0').length,
    approved: requests.filter(r => r.status === '1').length,
    cancelled: requests.filter(r => r.status === '2').length
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
          onClick={fetchRequests}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      {/* Header */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {summary.total} total requests · {summary.pending} pending
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending ({summary.pending})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'approved'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Approved ({summary.approved})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'cancelled'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Cancelled ({summary.cancelled})
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Merchant Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount (৳)</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{request.business_name || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatDate(request.created_at)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-800">
                    ৳{parseFloat(request.wallet_amount || 0).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-500">
                  No {activeTab} requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div key={request.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{request.business_name || 'N/A'}</h3>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Date:</span> {formatDate(request.created_at)}
                </p>
                <p className="text-gray-800 font-semibold text-lg">
                  Amount: ৳{parseFloat(request.wallet_amount || 0).toFixed(2)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No {activeTab} requests found
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletRequestsList;
