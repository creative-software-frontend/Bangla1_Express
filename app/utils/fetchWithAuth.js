/**
 * Reusable fetch utility with authentication, retry logic, and error handling
 * 
 * Features:
 * - Automatic JWT token injection from localStorage
 * - Retry logic (max 2 retries with exponential backoff)
 * - Request timeout (10 seconds default)
 * - Comprehensive error messages
 * - CORS-friendly configuration
 */

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second base delay

/**
 * Get auth token from localStorage
 * @returns {string|null} JWT token or null
 */
const getAuthToken = () => {
  try {
    const stored = localStorage.getItem('token');
    if (!stored) return null;
    
    // Handle both formats: plain string or JSON object
    const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
    return parsed.token || parsed || null;
  } catch (error) {
    console.warn('Failed to parse token from localStorage:', error);
    return null;
  }
};

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with timeout
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>}
 */
const fetchWithTimeout = async (url, options, timeout = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Main fetch function with auth, retry, and error handling
 * 
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @param {Object} config - Custom configuration
 * @param {number} config.timeout - Request timeout in ms (default: 10000)
 * @param {number} config.retries - Number of retries (default: 2)
 * @param {boolean} config.requireAuth - Whether to include auth token (default: true)
 * @param {boolean} config.parseJson - Whether to parse response as JSON (default: true)
 * 
 * @returns {Promise<any>} Parsed response data
 * 
 * @throws {Error} With detailed error message
 */
export const fetchWithAuth = async (url, options = {}, config = {}) => {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
    requireAuth = true,
    parseJson = true,
  } = config;

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Build headers
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      };

      // Add authorization header if required
      if (requireAuth) {
        const token = getAuthToken();
        if (!token) {
          throw new Error('AUTH_TOKEN_MISSING: No authentication token found. Please login again.');
        }
        headers.Authorization = `Bearer ${token}`;
      }

      // Make request with timeout
      const response = await fetchWithTimeout(url, {
        ...options,
        headers,
      }, timeout);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Specific error handling by status code
        switch (response.status) {
          case 401:
            throw new Error('HTTP_401: Authentication failed. Token may be expired or invalid. Please login again.');
          case 403:
            throw new Error('HTTP_403: Access forbidden. You do not have permission to access this resource.');
          case 404:
            throw new Error(`HTTP_404: Endpoint not found. URL: ${url}`);
          case 500:
            throw new Error('HTTP_500: Internal server error. Please try again later.');
          case 502:
            throw new Error('HTTP_502: Bad gateway. The server is temporarily unavailable.');
          case 503:
            throw new Error('HTTP_503: Service unavailable. The server is under maintenance.');
          default:
            throw new Error(`HTTP_${response.status}: ${errorData.message || response.statusText || 'Request failed'}`);
        }
      }

      // Parse and return response
      if (parseJson) {
        const data = await response.json();
        return data;
      }
      
      return response;

    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.message.includes('HTTP_401') || 
          error.message.includes('HTTP_403') ||
          error.message.includes('HTTP_404') ||
          error.message.includes('AUTH_TOKEN_MISSING')) {
        break; // Don't retry auth/permission errors
      }

      // Retry on network errors or server errors (5xx)
      if (attempt < retries) {
        const delay = RETRY_DELAY * Math.pow(2, attempt); // Exponential backoff
        console.warn(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`, error.message);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  const errorMessage = lastError?.message || 'Unknown error occurred';
  
  // Provide helpful debugging info
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
    throw new Error(
      `NETWORK_ERROR: Failed to connect to ${url}\n\n` +
      `Possible causes:\n` +
      `1. CORS policy blocking the request\n` +
      `2. API server is down or unreachable\n` +
      `3. Network connectivity issues\n` +
      `4. Mixed content (HTTP vs HTTPS)\n\n` +
      `Debugging steps:\n` +
      `- Check browser Network tab for CORS errors\n` +
      `- Verify API server is running: ${new URL(url).origin}\n` +
      `- Test endpoint with Postman/curl\n` +
      `- Check browser console for detailed error`
    );
  }

  throw lastError;
};

/**
 * Convenience method for GET requests
 */
export const get = (url, config = {}) => {
  return fetchWithAuth(url, { method: 'GET' }, config);
};

/**
 * Convenience method for POST requests
 */
export const post = (url, data, config = {}) => {
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data),
  }, config);
};

/**
 * Convenience method for PUT requests
 */
export const put = (url, data, config = {}) => {
  return fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, config);
};

/**
 * Convenience method for DELETE requests
 */
export const del = (url, config = {}) => {
  return fetchWithAuth(url, { method: 'DELETE' }, config);
};

export default fetchWithAuth;
