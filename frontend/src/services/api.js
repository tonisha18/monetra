import axios from 'axios';
import { getSupabaseClient } from './supabase.js';

// Resolve the API base URL.
// When VITE_API_URL is configured (e.g. on Vercel pointing to Render: https://xxx.onrender.com/api),
// it is prioritized. Defaults to '/api' for unified full-stack containers.
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.replace(/\/+$/, '');
  }
  return '/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Supabase access token or demo token to each outgoing request
api.interceptors.request.use(
  async (config) => {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
          return config;
        }
      }

      // Check stored token from backend auth
      const token = localStorage.getItem('ft_token');
      if (token && token !== 'null' && token !== 'undefined') {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      }

      // Check if demo session exists
      const demoToken = localStorage.getItem('ft_demo_token');
      if (demoToken && demoToken !== 'null' && demoToken !== 'undefined') {
        config.headers.Authorization = `Bearer ${demoToken}`;
      }
    } catch (err) {
      console.warn('Failed to attach auth token to request:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized response handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
      localStorage.removeItem('ft_token');
      localStorage.removeItem('ft_demo_token');
      localStorage.removeItem('ft_demo_user');

      if (typeof window !== 'undefined') {
        const isAuthPage =
          window.location.pathname.includes('/login') ||
          window.location.pathname.includes('/register');
        if (!isAuthPage) {
          window.dispatchEvent(
            new CustomEvent('auth:unauthorized', {
              detail: {
                message:
                  error.response?.data?.message ||
                  'Your session has expired or requires authentication.',
              },
            })
          );
        }
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';

    // Enhance error with clean message
    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default api;
