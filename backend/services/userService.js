import { getSupabaseClient } from '../config/supabase.js';

// In-memory store for fallback demo mode if Supabase keys have not been configured yet
const demoProfiles = new Map();

export const getUserProfile = async (user) => {
  if (user.isDemo) {
    if (!demoProfiles.has(user.id)) {
      demoProfiles.set(user.id, {
        id: user.id,
        full_name: user.user_metadata?.full_name || 'Demo User',
        email: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    return demoProfiles.get(user.id);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at, updated_at')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is code for 0 rows returned
    // PGRST205 or schema cache error means table not created yet
    if (
      error.code === 'PGRST205' ||
      error.message?.includes('schema cache') ||
      error.message?.includes('does not exist')
    ) {
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    throw error;
  }

  if (!data) {
    // Upsert fallback if trigger did not fire
    const newProfile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || '',
      created_at: user.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .upsert(newProfile)
      .select()
      .single();

    if (insertError) {
      // Return memory fallback if table not yet migrated
      return newProfile;
    }
    return inserted;
  }

  return data;
};

export const updateUserProfile = async (user, { full_name }) => {
  if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
    throw new Error('Full name is required');
  }

  const cleanName = full_name.trim();

  if (user.isDemo) {
    const existing = demoProfiles.get(user.id) || {
      id: user.id,
      email: user.email,
      created_at: new Date().toISOString(),
    };
    const updated = {
      ...existing,
      full_name: cleanName,
      updated_at: new Date().toISOString(),
    };
    demoProfiles.set(user.id, updated);
    return updated;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: cleanName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
