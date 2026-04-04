'use client';

import { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { get } from '@/app/utils/fetchWithAuth';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user data
  const fetchUser = async () => {
    try {
      const tokenString = localStorage.getItem('token');
      if (!tokenString) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Use the new fetch utility which handles token parsing automatically
      const data = await get('/api/user-info', {
        timeout: 10000,
        retries: 2,
      });

      // Validate response structure
      if (!data.user) {
        console.error('User data not found in API response:', data);
        setUser(null);
        
        // Show appropriate error based on response
        if (data.message) {
          toast.error(data.message);
        }
        return;
      }

      setUser(data.user);
      console.log('User loaded successfully:', data.user.name || data.user.email);
    } catch (error) {
      console.error('Error fetching user info:', error.message);
      
      // Handle specific error types
      if (error.message.includes('AUTH_TOKEN_MISSING') || error.message.includes('HTTP_401')) {
        console.warn('Authentication failed - clearing user data');
        setUser(null);
        // Don't show toast here to avoid spam on every page load
      } else if (error.message.includes('HTTP_404')) {
        console.error('User info endpoint not found. Check API configuration.');
        setUser(null);
        toast.error('Configuration error: User endpoint not found');
      } else if (error.message.includes('NETWORK_ERROR')) {
        console.error('Network error fetching user info');
        setUser(null);
        toast.error('Network error. Please check your connection.');
      } else {
        setUser(null);
        toast.error('Failed to load user information');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchUser();
  }, []);

  // Listen for localStorage changes (for login/logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        console.log('Token changed, refreshing user data');
        setLoading(true);
        fetchUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for token changes in same tab
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      const previousToken = localStorage.getItem('previousToken') || '';
      
      if (currentToken !== previousToken) {
        console.log('Token changed in same tab, refreshing user data');
        localStorage.setItem('previousToken', currentToken || '');
        setLoading(true);
        fetchUser();
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};
