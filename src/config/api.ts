/**
 * API Configuration for GamePilot Web
 * Provides centralized API URL configuration with environment-based switching
 */

// Get API URL from environment variables
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

// Helper function to construct full API endpoints
export const createApiUrl = (endpoint: string): string => {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Remove trailing slash from API_URL if present
  const cleanBaseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  
  return `${cleanBaseUrl}/api/${cleanEndpoint}`;
};

// Default API configuration for fetch calls
export const API_CONFIG = {
  baseURL: API_URL,
  credentials: 'include' as RequestCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Export the base API URL for direct usage
export { API_URL };

// Helper for making API calls with consistent configuration
export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const url = createApiUrl(endpoint);
  
  const config: RequestInit = {
    ...API_CONFIG,
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
  };

  return fetch(url, config);
};
