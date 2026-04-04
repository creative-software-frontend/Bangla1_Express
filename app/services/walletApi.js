import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'https://system.shiponconsumer.com/api';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  try {
    const stored = localStorage.getItem('token');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed.token || null;
  } catch (error) {
    console.error('Failed to parse token:', error);
    return null;
  }
};

/**
 * Create axios instance with default config
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Add request interceptor to inject token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Add response interceptor to handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/landing/login';
      }
    } else if (error.response?.status === 403) {
      toast.error('Access forbidden. You do not have permission.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ERR_NETWORK') {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Get merchant referral list
 * @returns {Promise<Object>} Referral data with withdraw_amount and referral_data array
 */
export const getReferralList = async () => {
  try {
    const response = await apiClient.get('/merchant-refer-list');
    
    if (response.data?.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch referral list');
    }
  } catch (error) {
    console.error('Error fetching referral list:', error);
    throw error;
  }
};

/**
 * Get referral details for a specific merchant
 * @param {number|string} merchantId - Merchant ID
 * @returns {Promise<Object>} Merchant details
 */
export const getReferralDetails = async (merchantId) => {
  try {
    const response = await apiClient.get('/view-details', {
      params: { id: merchantId }
    });
    
    if (response.data?.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch merchant details');
    }
  } catch (error) {
    console.error('Error fetching referral details:', error);
    throw error;
  }
};

/**
 * Get wallet request list
 * @param {string|null} status - Filter by status: "0"=Pending, "1"=Approved, "2"=Cancelled, null=all
 * @returns {Promise<Object>} Wallet requests data
 */
export const getWalletRequests = async (status = null) => {
  try {
    const params = {};
    if (status !== null && status !== undefined) {
      params.status = status;
    }
    
    const response = await apiClient.get('/wallet-request-list', { params });
    
    if (response.data?.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch wallet requests');
    }
  } catch (error) {
    console.error('Error fetching wallet requests:', error);
    throw error;
  }
};

/**
 * Create a new wallet withdrawal request
 * @param {number} amount - Withdrawal amount
 * @returns {Promise<Object>} Success message
 */
export const createWalletRequest = async (amount) => {
  try {
    const response = await apiClient.post('/wallet-request', {
      amount: amount,
    });
    
    if (response.data?.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to create wallet request');
    }
  } catch (error) {
    console.error('Error creating wallet request:', error);
    throw error;
  }
};

/**
 * Get merchant balance (placeholder - API needs fixing)
 * TODO: Backend team needs to fix this endpoint
 * @returns {Promise<Object>} Balance information
 */
export const getMerchantBalance = async () => {
  try {
    const response = await apiClient.get('/mechantblance');
    
    if (response.data?.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch balance');
    }
  } catch (error) {
    console.error('Error fetching merchant balance:', error);
    throw error;
  }
};

export default apiClient;
