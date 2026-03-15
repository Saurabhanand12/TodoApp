const getBaseURL = () => {
  let envURL = import.meta.env.VITE_API_URL;
  
  if (envURL && typeof envURL === 'string' && envURL.trim() !== '') {
    envURL = envURL.trim();
    
    // Remove leading slash if it's followed by a domain-looking string
    if (envURL.startsWith('/') && envURL.slice(1).includes('.')) {
      envURL = envURL.slice(1);
    }

    // If it looks like a domain but lacks protocol
    if (envURL.includes('.') && !envURL.startsWith('http') && !envURL.startsWith('/')) {
      return `https://${envURL}`;
    }
    return envURL;
  }
  
  // In production, use current origin if no valid VITE_API_URL
  if (import.meta.env.PROD) {
    return typeof window !== 'undefined' ? window.location.origin : '';
  }
  
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
  
  // Axios error structure
  let msg = err.response?.data?.error || err.response?.data?.message || err.message || 'An unexpected error occurred';
  
  // If we still didn't find a string, check common Vercel/Cloudflare error shapes
  if (typeof msg === 'object') {
    msg = msg.message || msg.error || JSON.stringify(msg);
  }
  
  return typeof msg === 'string' ? msg : String(msg);
};
