/**
 * Configuration for the application.
 * Detects the build environment (Vite vs CRA) and sets the base API URL.
 */

// Check if we are in a Vite environment (uses import.meta.env)
// or Create React App environment (uses process.env)
const isVite = typeof import.meta !== 'undefined' && import.meta.env;

// Get the API URL from environment variables
const getApiUrl = () => {
    // FORCE LOCALHOST IN DEVELOPMENT
    // This ensures we don't accidentally hit production when running locally
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:5000';
    }

    if (isVite) {
        return import.meta.env.VITE_API_URL;
    }
    // Fallback for CRA or standard Node environment
    return process.env.REACT_APP_API_URL;
};

// Default fallback URL if no environment variable is set
const DEFAULT_API_URL = 'https://skillshare-0yvk.onrender.com';

// Export the configured API URL (no trailing slash)
export const API_URL = (getApiUrl() || DEFAULT_API_URL).replace(/\/$/, '');
