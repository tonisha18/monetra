import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

let client = null;

export const isSupabaseConfigured = () => {
  if (!supabaseUrl || !supabaseKey) return false;
  if (supabaseUrl.includes('your-project.supabase.co') || supabaseUrl.includes('placeholder')) return false;
  if (supabaseKey.includes('your-supabase') || supabaseKey.includes('placeholder')) return false;
  return true;
};

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!client) {
    client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return client;
};

let adminClient = null;

export const getSupabaseAdmin = () => {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    return null;
  }
  if (secretKey.includes('your-supabase') || secretKey.includes('placeholder')) {
    return null;
  }
  if (!adminClient) {
    adminClient = createClient(supabaseUrl, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
};

export const supabase = getSupabaseClient();
export const supabaseAdmin = getSupabaseAdmin();
