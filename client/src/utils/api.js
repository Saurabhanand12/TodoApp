const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL;
  if (envURL) {
    // Ensure URL has a protocol if it's not relative
    if (envURL.includes('.') && !envURL.startsWith('http')) {
      return `https://${envURL}`;
    }
    return envURL;
  }
  
  // In production, use the current origin if no VITE_API_URL is provided
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  
  // Local development fallback
  return 'http://localhost:5000';
};

export const API = getBaseURL();

/**
 * Ensures error is a string to prevent React Error #31 (Object as child)
 * @param {Error|Object} err - The error object from axios or a generic error
 * @returns {string} - The formatted error message
 */
export const formatError = (err) => {
  if (!err) return 'An unknown error occurred';
  
  const msg = err.response?.data?.error || err.message || 'An unexpected error occurred';
  
  if (typeof msg === 'object') {
    return JSON.stringify(msg);
  }
  
  return String(msg);
};
