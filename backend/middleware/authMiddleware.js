import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase.js';
import { errorResponse } from '../utils/response.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token required. Please login.', 401);
    }

    const token = authHeader.split(' ')[1]?.trim();

    if (!token || token === 'null' || token === 'undefined') {
      return errorResponse(res, 'Authentication token required. Please login.', 401);
    }

    // Check for demo token when Supabase is not yet configured in preview
    if (token.startsWith('demo-session-token-')) {
      const demoUserId = token.replace('demo-session-token-', '');
      req.user = {
        id: demoUserId || 'demo-user-123',
        email: 'demo@financialtracker.local',
        user_metadata: { full_name: 'Demo Financial User' },
        isDemo: true,
      };
      req.userId = req.user.id;
      return next();
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return errorResponse(
        res,
        'Supabase is not configured on the server. Please check SUPABASE_URL and SUPABASE_SECRET_KEY.',
        503
      );
    }

    // Verify token with Supabase Auth
    let authUser = null;
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        return errorResponse(res, 'Invalid or expired session. Please log in again.', 401, error?.message);
      }
      authUser = data.user;
    } catch (networkErr) {
      console.error('Supabase network error during auth verification:', networkErr.message);
      return errorResponse(
        res,
        'Unable to connect to Supabase authentication server. Please check your Supabase Project URL.',
        502,
        networkErr.message
      );
    }

    // Attach verified user to request
    req.user = authUser;
    req.userId = authUser.id;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return errorResponse(res, 'Authentication failed', 500, err.message);
  }
};
