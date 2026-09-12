import { getSupabaseAdmin, getSupabaseClient, isSupabaseConfigured } from '../config/supabase.js';
import { checkSupabaseTableStatus } from '../services/transactionService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Controller to handle email confirmation, user auth, and status workflows
 */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Demo Mode fallback
    if (!isSupabaseConfigured() || normalizedEmail.startsWith('demo')) {
      const demoUser = {
        id: 'demo-user-123',
        email: normalizedEmail,
        user_metadata: { full_name: 'Demo User' },
        isDemo: true,
      };
      return successResponse(res, {
        user: demoUser,
        token: `demo-session-token-${demoUser.id}`,
        isDemo: true,
        message: 'Logged in as Demo User',
      });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return errorResponse(res, 'Supabase client is not available on backend', 503);
    }

    // Attempt sign in with password
    let { data, error } = await admin.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      // If unconfirmed, attempt immediate confirmation via admin API and retry
      if (
        error.message?.toLowerCase().includes('email not confirmed') ||
        error.code === 'email_not_confirmed'
      ) {
        try {
          const { data: usersData } = await admin.auth.admin.listUsers();
          const target = usersData?.users?.find(
            (u) => u.email?.toLowerCase() === normalizedEmail
          );
          if (target) {
            await admin.auth.admin.updateUserById(target.id, { email_confirm: true });
            const retry = await admin.auth.signInWithPassword({
              email: normalizedEmail,
              password,
            });
            if (retry.data?.session) {
              data = retry.data;
              error = null;
            }
          }
        } catch (autoErr) {
          console.warn('Auto confirm error on login:', autoErr.message);
        }
      }

      if (error) {
        return errorResponse(res, error.message || 'Invalid login credentials', 400);
      }
    }

    if (!data?.session) {
      return errorResponse(res, 'No session returned from authentication', 500);
    }

    return successResponse(res, {
      user: data.user,
      session: data.session,
      token: data.session.access_token,
      isDemo: false,
    });
  } catch (err) {
    console.error('Server login error:', err);
    return errorResponse(res, err.message || 'Login failed', 500);
  }
};

export const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured()) {
      const demoUser = {
        id: `demo-${Date.now()}`,
        email: normalizedEmail,
        user_metadata: { full_name: fullName || 'User' },
        isDemo: true,
      };
      return successResponse(res, {
        user: demoUser,
        token: `demo-session-token-${demoUser.id}`,
        isDemo: true,
        message: 'Registered in Demo Mode',
      });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return errorResponse(res, 'Supabase client is not available on backend', 503);
    }

    // Create user via Admin API with email_confirm: true to bypass email delays
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || normalizedEmail.split('@')[0],
      },
    });

    if (createError) {
      // Check if user already exists
      if (createError.message?.includes('already been registered') || createError.status === 422) {
        return errorResponse(res, 'A user with this email address already exists. Please log in.', 409);
      }
      return errorResponse(res, createError.message || 'Failed to create user', 400);
    }

    // Sign in the newly created user to generate session
    const { data: sessionData, error: sessionError } = await admin.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (sessionError || !sessionData?.session) {
      // Return the created user even if auto sign-in has a minor glitch
      return successResponse(res, {
        user: newUser.user,
        message: 'Account created successfully! Please sign in with your credentials.',
      });
    }

    // Try to create profile row if profiles table exists
    try {
      await admin.from('profiles').upsert({
        id: newUser.user.id,
        email: normalizedEmail,
        full_name: fullName || normalizedEmail.split('@')[0],
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Silently ignore if profiles table is not created yet
    }

    return successResponse(res, {
      user: sessionData.user,
      session: sessionData.session,
      token: sessionData.session.access_token,
      isDemo: false,
      message: 'Account created and signed in successfully!',
    });
  } catch (err) {
    console.error('Server register error:', err);
    return errorResponse(res, err.message || 'Registration failed', 500);
  }
};

export const confirmEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return errorResponse(res, 'Valid email address is required', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured()) {
      return successResponse(res, {
        confirmed: true,
        message: 'Demo mode active. Email confirmed automatically.',
      });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return errorResponse(
        res,
        'Supabase Secret Key is not configured on the backend server. Please confirm your email through the link sent to your inbox.',
        503
      );
    }

    // Look up the user in Supabase auth
    const { data: usersData, error: listError } = await admin.auth.admin.listUsers();
    if (listError) {
      console.error('Failed to list users from Supabase admin:', listError);
      return errorResponse(res, 'Failed to verify user account in Supabase', 500);
    }

    const matchedUser = usersData?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    if (!matchedUser) {
      return errorResponse(res, `No account found with email: ${normalizedEmail}`, 404);
    }

    if (matchedUser.email_confirmed_at) {
      return successResponse(res, {
        alreadyConfirmed: true,
        confirmed: true,
        userId: matchedUser.id,
        email: matchedUser.email,
        message: 'Your email is already confirmed. You can proceed to sign in.',
      });
    }

    // Confirm the email via Admin API
    const { error: updateError } = await admin.auth.admin.updateUserById(
      matchedUser.id,
      { email_confirm: true }
    );

    if (updateError) {
      console.error('Failed to confirm email via admin API:', updateError);
      return errorResponse(res, updateError.message || 'Failed to confirm email', 500);
    }

    // Optional: ensure profile row exists
    try {
      await admin.from('profiles').upsert({
        id: matchedUser.id,
        email: matchedUser.email,
        full_name:
          matchedUser.user_metadata?.full_name ||
          matchedUser.email.split('@')[0] ||
          'User',
        updated_at: new Date().toISOString(),
      });
    } catch (profileErr) {
      console.warn('Could not auto-upsert profile on email confirm:', profileErr.message);
    }

    return successResponse(res, {
      confirmed: true,
      userId: matchedUser.id,
      email: matchedUser.email,
      message: 'Email successfully confirmed! You can now log in immediately.',
    });
  } catch (err) {
    console.error('Error confirming email:', err);
    return errorResponse(res, err.message || 'Internal server error while confirming email', 500);
  }
};

export const resendConfirmation = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return errorResponse(res, 'Valid email address is required', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured()) {
      return successResponse(res, {
        message: 'Demo mode active. No confirmation email required.',
      });
    }

    const client = getSupabaseClient();
    if (!client) {
      return errorResponse(res, 'Supabase client is not available', 503);
    }

    const redirectUrl = req.headers.origin || 'http://localhost:3000';

    const { error } = await client.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${redirectUrl}/login`,
      },
    });

    if (error) {
      console.warn('Supabase resend confirmation error:', error);
      if (error.message?.includes('rate limit') || error.status === 429) {
        return errorResponse(
          res,
          'Supabase email rate limit reached (max 3-4 emails/hr on free tier). You can click "Instant Confirm" to verify your account immediately without waiting for an email.',
          429
        );
      }
      return errorResponse(res, error.message || 'Failed to resend confirmation email', 400);
    }

    return successResponse(res, {
      message: `A new confirmation link has been sent to ${normalizedEmail}. Please check your inbox and spam folder.`,
    });
  } catch (err) {
    console.error('Error in resendConfirmation:', err);
    return errorResponse(res, err.message || 'Internal server error while resending confirmation email', 500);
  }
};

export const checkEmailStatus = async (req, res) => {
  try {
    const email = (req.query.email || req.body?.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return errorResponse(res, 'Valid email address is required', 400);
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return successResponse(res, { configured: false, confirmed: true });
    }

    const { data: usersData, error } = await admin.auth.admin.listUsers();
    if (error) {
      return errorResponse(res, 'Failed to fetch user list', 500);
    }

    const matchedUser = usersData?.users?.find(
      (u) => u.email?.toLowerCase() === email
    );

    if (!matchedUser) {
      return successResponse(res, { exists: false, confirmed: false });
    }

    return successResponse(res, {
      exists: true,
      confirmed: Boolean(matchedUser.email_confirmed_at),
      emailConfirmedAt: matchedUser.email_confirmed_at,
    });
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to check email status', 500);
  }
};

export const getConfigStatus = async (req, res) => {
  try {
    const configured = isSupabaseConfigured();
    let tableReady = false;
    if (configured) {
      tableReady = await checkSupabaseTableStatus();
    }
    return successResponse(res, {
      supabaseConfigured: configured,
      supabaseUrl: process.env.SUPABASE_URL || '',
      tableReady,
      schemaPath: '/supabase-schema.sql',
    });
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to get config status', 500);
  }
};
