import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Send,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Register = () => {
  const navigate = useNavigate();
  const { register, confirmUserEmail, resendConfirmationEmail, login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email confirmation state
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setNeedsConfirmation(false);

    // Validation
    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await register(formData.fullName.trim(), formData.email.trim(), formData.password);
      
      // If email confirmation is required by Supabase project settings
      if (data?.user && !data?.session) {
        setNeedsConfirmation(true);
        setRegisteredEmail(formData.email.trim());
        setSuccessMsg(
          'Account created! Email verification is required. Verify via your email or click "Instant Confirm & Continue" below.'
        );
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantConfirm = async () => {
    const targetEmail = registeredEmail || formData.email.trim();
    if (!targetEmail) return;

    setIsConfirming(true);
    setError('');
    try {
      await confirmUserEmail(targetEmail);
      // Attempt login with the password provided
      if (formData.password) {
        await login(targetEmail, formData.password);
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.message || 'Could not auto-confirm email. Please check your inbox.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleResend = async () => {
    const targetEmail = registeredEmail || formData.email.trim();
    if (!targetEmail) return;

    setIsResending(true);
    setError('');
    try {
      const res = await resendConfirmationEmail(targetEmail);
      setSuccessMsg(res.message || `Confirmation link resent to ${targetEmail}`);
    } catch (err) {
      setError(err.message || 'Failed to resend confirmation email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-md mb-4">
          <Wallet className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create Your Account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Monetra
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200/80 rounded-2xl">
          {/* Email confirmation required action box */}
          {needsConfirmation && (
            <div className="mb-6 p-4 bg-amber-50/90 border border-amber-200 text-amber-900 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Email Verification Required
                  </h3>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    An account was created for <span className="font-semibold">{registeredEmail}</span>. You can confirm it instantly below to jump straight to your dashboard.
                  </p>
                </div>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleInstantConfirm}
                  disabled={isConfirming}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isConfirming ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Confirming &amp; Signing in...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Instant Confirm &amp; Continue</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="py-2 px-3 bg-white border border-amber-300 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isResending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Resend Link</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && !needsConfirmation && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-fullname" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="reg-fullname"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-password"
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-confirm-password"
                  type="password"
                  required
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center text-sm disabled:opacity-60"
            >
              {isSubmitting ? (
                'Creating Account...'
              ) : (
                <>
                  <span>Register Account</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
