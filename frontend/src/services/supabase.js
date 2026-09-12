import { createClient } from '@supabase/supabase-js';

// Retrieve public variables
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check localStorage for user-provided runtime config or defaults
export const getStoredSupabaseConfig = () => {
  const localUrl = localStorage.getItem('ft_supabase_url');
  const localKey = localStorage.getItem('ft_supabase_anon_key');
  return {
    url: localUrl || envUrl || '',
    anonKey: localKey || envAnonKey || '',
  };
};

export const setStoredSupabaseConfig = (url, anonKey) => {
  if (url) localStorage.setItem('ft_supabase_url', url.trim());
  if (anonKey) localStorage.setItem('ft_supabase_anon_key', anonKey.trim());
};

export const clearStoredSupabaseConfig = () => {
  localStorage.removeItem('ft_supabase_url');
  localStorage.removeItem('ft_supabase_anon_key');
};

let client = null;

export const isSupabaseConfigured = () => {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) return false;
  if (config.url.includes('your-project.supabase.co') || config.url.includes('placeholder')) return false;
  if (config.anonKey.includes('your_supabase_anon_key') || config.anonKey.includes('your-anon-key')) return false;
  return true;
};

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, anonKey } = getStoredSupabaseConfig();

  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
};

export const supabase = getSupabaseClient();
