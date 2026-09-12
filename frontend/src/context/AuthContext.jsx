import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase.js';
import api, { getApiBaseUrl } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Sync profile from backend
  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      if (res.data?.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch profile:', err.userMessage || err.message);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Listen for 401 unauthorized events from API interceptor
    const handleUnauthorized = () => {
      if (!isMounted) return;
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsDemoMode(false);
      localStorage.removeItem('ft_demo_token');
      localStorage.removeItem('ft_demo_user');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const initAuth = async () => {
      try {
        let sessionRestored = false;

        // 1. Check for stored token and user from backend authentication
        const storedToken = localStorage.getItem('ft_token');
        const storedUser = localStorage.getItem('ft_user');
        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setSession({ access_token: storedToken, user: parsedUser });
            setIsDemoMode(Boolean(parsedUser.isDemo));
            sessionRestored = true;
            await fetchProfile();
          } catch (e) {
            console.warn('Failed to restore backend auth session:', e);
          }
        }

        const supabase = getSupabaseClient();

        // 2. Check if active Supabase session exists
        if (supabase && !sessionRestored) {
          try {
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            if (existingSession?.access_token && isMounted) {
              setSession(existingSession);
              setUser(existingSession.user);
              setIsDemoMode(false);
              sessionRestored = true;
              await fetchProfile();
            }

            // Listen for Supabase auth state changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange(
              async (_event, newSession) => {
                if (!isMounted) return;
                setSession(newSession);
                setUser(newSession?.user || null);
                if (newSession?.access_token && newSession?.user) {
                  setIsDemoMode(false);
                  await fetchProfile();
                } else if (!newSession) {
                  setProfile(null);
                }
              }
            );

            // Clean up subscription on unmount
            if (!sessionRestored) {
              // Check demo fallback if no active Supabase session
              const demoToken = localStorage.getItem('ft_demo_token');
              const demoUserData = localStorage.getItem('ft_demo_user');
              if (demoToken && demoUserData) {
                const parsedUser = JSON.parse(demoUserData);
                setUser(parsedUser);
                setIsDemoMode(true);
                setProfile({
                  id: parsedUser.id,
                  full_name: parsedUser.user_metadata?.full_name || 'Demo User',
                  email: parsedUser.email,
                  created_at: new Date().toISOString(),
                });
              }
            }

            return () => {
              subscription?.unsubscribe();
            };
          } catch (sbErr) {
            console.warn('Supabase getSession failed:', sbErr);
          }
        }

        // 2. Check for demo session if Supabase not configured or no Supabase session restored
        if (!sessionRestored) {
          const demoToken = localStorage.getItem('ft_demo_token');
          const demoUserData = localStorage.getItem('ft_demo_user');
          if (demoToken && demoUserData) {
            const parsedUser = JSON.parse(demoUserData);
            setUser(parsedUser);
            setIsDemoMode(true);
            setProfile({
              id: parsedUser.id,
              full_name: parsedUser.user_metadata?.full_name || 'Demo User',
              email: parsedUser.email,
              created_at: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.error('Initialization error in AuthProvider:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  // Dedicated demo login function
  const loginDemo = (userChoice) => {
    const demoUser = userChoice || {
      id: 'demo-user-123',
      email: 'demo@financialtracker.local',
      user_metadata: { full_name: 'Demo Financial User' },
    };
    const token = `demo-session-token-${demoUser.id}`;
    localStorage.setItem('ft_demo_token', token);
    localStorage.setItem('ft_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setSession(null);
    setIsDemoMode(true);
    setProfile({
      id: demoUser.id,
      full_name: demoUser.user_metadata?.full_name || 'Demo User',
      email: demoUser.email,
      created_at: new Date().toISOString(),
    });
    return demoUser;
  };

  // Resend confirmation email
  const resendConfirmationEmail = async (userEmail) => {
    try {
      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/auth/resend-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to resend confirmation email');
      }
      return data;
    } catch (err) {
      // Fallback directly to client Supabase SDK
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: userEmail,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });
        if (error) throw new Error(error.message || 'Failed to resend confirmation email');
        return { success: true, message: `Verification email sent to ${userEmail}` };
      }
      throw err;
    }
  };

  // Instant confirm email via backend admin API
  const confirmUserEmail = async (userEmail) => {
    const apiBase = getApiBaseUrl();
    const response = await fetch(`${apiBase}/auth/confirm-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to confirm email address');
    }
    return data;
  };

  // Login handler
  const login = async (email, password) => {
    // If demo credentials or requested demo
    if (email === 'demo@financialtracker.local' || email?.startsWith('demo')) {
      const demo = loginDemo();
      await fetchProfile();
      return { user: demo };
    }

    // Try backend authentication first (using server-side Supabase credentials)
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success && res.data?.data) {
        const { user: authedUser, token, session: authSession } = res.data.data;
        localStorage.setItem('ft_token', token);
        localStorage.setItem('ft_user', JSON.stringify(authedUser));
        localStorage.removeItem('ft_demo_token');
        localStorage.removeItem('ft_demo_user');
        setUser(authedUser);
        setSession(authSession || { access_token: token, user: authedUser });
        setIsDemoMode(false);
        await fetchProfile();
        return res.data.data;
      }
    } catch (apiErr) {
      // If error is explicit bad credentials, throw that directly
      if (apiErr.response?.status === 400 || apiErr.response?.data?.message?.includes('Invalid')) {
        throw new Error(apiErr.response?.data?.message || 'Invalid email or password');
      }
      console.warn('Backend login endpoint failed or bypassed, checking client Supabase:', apiErr.message);
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      // Supabase not configured: use demo
      const demo = loginDemo();
      await fetchProfile();
      return { user: demo };
    }

    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle "Email not confirmed" gracefully
    if (error) {
      const isUnconfirmed =
        error.message?.toLowerCase().includes('email not confirmed') ||
        error.code === 'email_not_confirmed';

      if (isUnconfirmed) {
        // Attempt immediate auto-confirmation via backend admin API
        try {
          const autoConfirm = await confirmUserEmail(email);
          if (autoConfirm?.success) {
            // Re-attempt sign in now that the email is confirmed
            const retry = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (retry.data?.session?.access_token) {
              data = retry.data;
              error = null;
            }
          }
        } catch (autoErr) {
          console.warn('Auto-confirmation attempt on login failed:', autoErr);
        }
      }

      if (error) {
        const customErr = new Error(
          isUnconfirmed
            ? 'Your email address has not been confirmed yet. You can click "Confirm & Sign In" or "Resend Email" below.'
            : error.message || 'Login failed. Please check your credentials.'
        );
        customErr.isEmailNotConfirmed = isUnconfirmed;
        customErr.email = email;
        customErr.code = error.code;
        throw customErr;
      }
    }

    if (!data?.session?.access_token) {
      const customErr = new Error(
        'No active session received. Please confirm your email before signing in.'
      );
      customErr.isEmailNotConfirmed = true;
      customErr.email = email;
      throw customErr;
    }

    localStorage.setItem('ft_token', data.session.access_token);
    localStorage.setItem('ft_user', JSON.stringify(data.user));
    localStorage.removeItem('ft_demo_token');
    localStorage.removeItem('ft_demo_user');
    setUser(data.user);
    setSession(data.session);
    setIsDemoMode(false);
    await fetchProfile();
    return data;
  };

  // Register handler
  const register = async (fullName, email, password) => {
    // Try backend registration first (creates user in Supabase with email_confirm: true)
    try {
      const res = await api.post('/auth/register', { email, password, fullName });
      if (res.data?.success && res.data?.data) {
        const { user: regUser, token, session: regSession } = res.data.data;
        if (token) {
          localStorage.setItem('ft_token', token);
          localStorage.setItem('ft_user', JSON.stringify(regUser));
          localStorage.removeItem('ft_demo_token');
          localStorage.removeItem('ft_demo_user');
          setUser(regUser);
          setSession(regSession || { access_token: token, user: regUser });
          setIsDemoMode(false);
          await fetchProfile();
        }
        return res.data.data;
      }
    } catch (apiErr) {
      if (apiErr.response?.data?.message?.includes('already exists') || apiErr.response?.status === 409) {
        throw new Error(apiErr.response?.data?.message || 'A user with this email already exists');
      }
      console.warn('Backend register skipped or failed, trying client:', apiErr.message);
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      // Demo register
      const demoUser = {
        id: `demo-${Date.now()}`,
        email,
        user_metadata: { full_name: fullName },
      };
      const token = `demo-session-token-${demoUser.id}`;
      localStorage.setItem('ft_demo_token', token);
      localStorage.setItem('ft_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      setSession(null);
      setIsDemoMode(true);
      await fetchProfile();
      return { user: demoUser };
    }

    // 1. Create account with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw new Error(error.message || 'Registration failed');
    }

    // If Supabase created user but email confirmation is required (data.session is null)
    if (data.user && !data.session) {
      try {
        // Attempt instant auto-confirm so user can immediately use the app
        const autoConfirm = await confirmUserEmail(email);
        if (autoConfirm?.success) {
          const autoSignIn = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (autoSignIn.data?.session && autoSignIn.data?.user) {
            localStorage.setItem('ft_token', autoSignIn.data.session.access_token);
            localStorage.setItem('ft_user', JSON.stringify(autoSignIn.data.user));
            localStorage.removeItem('ft_demo_token');
            localStorage.removeItem('ft_demo_user');
            setUser(autoSignIn.data.user);
            setSession(autoSignIn.data.session);
            setIsDemoMode(false);

            try {
              await supabase.from('profiles').upsert({
                id: autoSignIn.data.user.id,
                full_name: fullName,
                email: email,
                updated_at: new Date().toISOString(),
              });
            } catch (profileErr) {
              console.warn('Could not auto-insert profile into profiles table:', profileErr);
            }

            await fetchProfile();
            return autoSignIn.data;
          }
        }
      } catch (autoErr) {
        console.warn('Registration auto-confirm attempt was skipped:', autoErr);
      }

      // If auto-confirm wasn't possible, ensure session is clean
      setUser(null);
      setSession(null);
    } else if (data.session && data.user) {
      localStorage.setItem('ft_token', data.session.access_token);
      localStorage.setItem('ft_user', JSON.stringify(data.user));
      localStorage.removeItem('ft_demo_token');
      localStorage.removeItem('ft_demo_user');
      setUser(data.user);
      setSession(data.session);
      setIsDemoMode(false);

      // Upsert profile in database
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          updated_at: new Date().toISOString(),
        });
      } catch (profileErr) {
        console.warn('Could not auto-insert profile into profiles table:', profileErr);
      }

      await fetchProfile();
    }

    return data;
  };

  // Logout handler
  const logout = async () => {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    } finally {
      localStorage.removeItem('ft_token');
      localStorage.removeItem('ft_user');
      localStorage.removeItem('ft_demo_token');
      localStorage.removeItem('ft_demo_user');
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsDemoMode(false);
    }
  };

  // Profile update handler
  const updateProfile = async (fullName) => {
    const res = await api.put('/users/profile', { full_name: fullName });
    if (res.data?.success) {
      setProfile(res.data.data);
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Failed to update profile');
  };

  // Demo user switcher (for testing User A vs User B isolation easily)
  const switchDemoUser = (userNum = 1) => {
    const id = `demo-user-${userNum}`;
    const name = userNum === 1 ? 'Alex Morgan (User 1)' : 'Jordan Lee (User 2)';
    const demoUser = {
      id,
      email: `user${userNum}@financialtracker.local`,
      user_metadata: { full_name: name },
    };
    const token = `demo-session-token-${id}`;
    localStorage.setItem('ft_demo_token', token);
    localStorage.setItem('ft_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setIsDemoMode(true);
    fetchProfile();
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isDemoMode,
    isConfigured: isSupabaseConfigured(),
    login,
    loginDemo,
    confirmUserEmail,
    resendConfirmationEmail,
    register,
    logout,
    updateProfile,
    refreshProfile: fetchProfile,
    switchDemoUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
