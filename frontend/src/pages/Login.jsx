import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Play,
  CheckCircle2,
  Send,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const navigate = useNavigate();
  const { login, loginDemo, confirmUserEmail, resendConfirmationEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email confirmation state helpers
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setConfirmSuccess('');
    setResendSuccess('');
    setEmailNotConfirmed(false);

    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      const isUnconfirmed =
        err.isEmailNotConfirmed ||
        err.message?.toLowerCase().includes('email not confirmed') ||
        err.code === 'email_not_confirmed';

      if (isUnconfirmed) {
        setEmailNotConfirmed(true);
        setUnconfirmedEmail(email.trim());
        setError(
          'Email not confirmed. Please verify your email before signing in or click Instant Confirm below.'
        );
      } else {
        setError(err.message || 'Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantConfirmAndSignIn = async () => {
    const targetEmail = unconfirmedEmail || email.trim();
    if (!targetEmail) {
      setError('Please enter your email address first.');
      return;
    }

    setIsConfirming(true);
    setError('');
    setConfirmSuccess('');
    try {
      const res = await confirmUserEmail(targetEmail);
      setConfirmSuccess(
        res.message || 'Email successfully verified! Signing you in...'
      );

      // If user has entered password, sign in automatically
      if (password) {
        await login(targetEmail, password);
        navigate('/dashboard');
      } else {
        setEmailNotConfirmed(false);
        setConfirmSuccess('Email confirmed! Please enter your password and click Sign In.');
      }
    } catch (err) {
      setError(
        err.message ||
          'Could not auto-confirm email. Please check your inbox or use the demo login.'
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const handleResendConfirmation = async () => {
    const targetEmail = unconfirmedEmail || email.trim();
    if (!targetEmail) {
      setError('Please enter your email address to resend confirmation.');
      return;
    }

    setIsResending(true);
    setError('');
    setResendSuccess('');
    try {
      const res = await resendConfirmationEmail(targetEmail);
      setResendSuccess(
        res.message || `Confirmation email sent to ${targetEmail}. Please check your inbox and spam folder.`
      );
    } catch (err) {
      setError(err.message || 'Failed to resend confirmation email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleDemoSignIn = () => {
    setIsSubmitting(true);
    try {
      loginDemo();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-md mb-4">
          <Wallet className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Your Account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Monetra
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200/80 rounded-2xl">
          {/* Email confirmation alert & action block */}
          {emailNotConfirmed && (
            <div className="mb-6 p-4 bg-amber-50/90 border border-amber-200 text-amber-900 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Email Confirmation Required
                  </h3>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Email verification is required for <span className="font-semibold">{unconfirmedEmail || email}</span> before signing in.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleInstantConfirmAndSignIn}
                  disabled={isConfirming || isSubmitting}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isConfirming ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Instant Confirm &amp; Sign In</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={isResending}
                  className="py-2 px-3 bg-white border border-amber-300 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isResending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Resend Email</span>
                </button>
              </div>
            </div>
          )}

          {/* Standard error notification */}
          {error && !emailNotConfirmed && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success messages */}
          {confirmSuccess && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-emerald-600" />
              <span>{confirmSuccess}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start">
              <Send className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-emerald-600" />
              <span>{resendSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailNotConfirmed) setEmailNotConfirmed(false);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting || isConfirming}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center text-sm disabled:opacity-60"
            >
              {isSubmitting ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              id="demo-login-btn"
              onClick={handleDemoSignIn}
              disabled={isSubmitting}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center"
            >
              <Play className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Explore Demo Account
            </button>
          </div>

          <div className="mt-5 text-center text-xs text-slate-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
