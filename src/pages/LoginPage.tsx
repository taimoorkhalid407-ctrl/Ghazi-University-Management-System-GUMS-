import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Shield, User, GraduationCap, CheckCircle } from 'lucide-react';
import { UniversityLogo } from '../components/common/UniversityLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

export const LoginPage: React.FC = () => {
  const { login, demoLogin, isLoading } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Forgot password modal
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid academic email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await login(email.trim(), password);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setIsResetting(true);
    try {
      const res = await api.forgotPassword(resetEmail.trim());
      showToast(res.message, 'success');
      setResetSuccess(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to send reset link', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden">
      {/* Background graphic elements */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-8 sm:p-10">
          {/* Institution Header */}
          <div className="text-center mb-8 flex flex-col items-center">
            <UniversityLogo
              size="large"
              priority
              className="w-20 h-20 sm:w-24 sm:h-24 mb-3 drop-shadow-xs"
            />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Ghazi University
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Dera Ghazi Khan, Punjab
            </p>
            <p className="text-sm font-bold text-blue-700 mt-1">
              University Management System
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Academic Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="e.g. admin@gu.edu.pk"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-blue-600/20 focus:border-blue-600'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setResetSuccess(false);
                    setResetEmail(email);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-blue-600/20 focus:border-blue-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>
              <span className="text-slate-400">DG Khan Main Campus</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold text-sm transition-colors shadow-md shadow-blue-700/20 disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In to GUMS'}
            </button>
          </form>

          {/* Quick Demo Login Buttons for Evaluators / Test cases */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Role Demonstration
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => demoLogin('admin')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-center group"
              >
                <Shield className="w-4 h-4 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800">Admin</span>
                <span className="text-[10px] text-slate-400">Full Access</span>
              </button>

              <button
                type="button"
                onClick={() => demoLogin('teacher')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-center group"
              >
                <GraduationCap className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800">Teacher</span>
                <span className="text-[10px] text-slate-400">Classes/Marks</span>
              </button>

              <button
                type="button"
                onClick={() => demoLogin('student')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-center group"
              >
                <User className="w-4 h-4 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800">Student</span>
                <span className="text-[10px] text-slate-400">Portal View</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <UniversityLogo size="small" className="w-10 h-10" />
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">Ghazi University</h3>
                <p className="text-[11px] text-slate-500">Academic Password Recovery • GUMS</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter your registered university email to receive password recovery instructions.
            </p>

            {resetSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Instructions Sent
                </div>
                If an account exists for {resetEmail}, an email has been dispatched with reset instructions.
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="mt-4 w-full py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="e.g. admin@gu.edu.pk"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-4 py-2 text-xs font-semibold bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
                  >
                    {isResetting ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer Banner */}
      <footer className="relative z-10 py-4 px-4 text-center text-xs text-slate-400 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-center gap-2 mb-1">
          <UniversityLogo size="xs" className="w-5 h-5 opacity-80" />
          <span className="font-semibold text-slate-300">Ghazi University</span>
          <span>•</span>
          <span>Dera Ghazi Khan, Punjab, Pakistan</span>
        </div>
        <p className="text-[11px] text-slate-400">
          University Management System (GUMS) • Academic Management System Project
        </p>
      </footer>
    </div>
  );
};
