import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { CrimsonLogo } from '../common/CrimsonLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, demoLogin } = useAuth();
  const { showToast } = useNotification();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Software Engineer & Researcher');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
        showToast('Signed in successfully!', 'success');
      } else {
        await register({ name, email, password, major: role });
        showToast('Account created successfully!', 'success');
      }
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Authentication error.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async () => {
    setIsLoading(true);
    try {
      await demoLogin();
      showToast('Logged in with Demo Account (Alex Rivera)', 'success');
      onClose();
    } catch (err: any) {
      showToast('Demo login fallback activated.', 'info');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-[#212121] border border-[#383838] rounded-3xl p-7 shadow-2xl z-10 text-white space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-[#2f2f2f] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="flex justify-center">
            <CrimsonLogo size="lg" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isLogin ? 'Welcome back to Crimson AI' : 'Create your account'}
          </h2>
          <p className="text-xs text-slate-400">
            {isLogin
              ? 'Sign in to access your chat history and saved notes'
              : 'Sign up to get personalized AI reasoning and tools'}
          </p>
        </div>

        {/* 1-Click Demo Shortcut */}
        <div>
          <button
            type="button"
            onClick={handleDemo}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#2a2a2a] hover:bg-[#333333] text-slate-200 hover:text-white text-xs font-medium border border-[#383838] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#ea4335]" />
            <span>1-Click Demo Sign In (Alex Rivera)</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-[#333]" />
          <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">or</span>
          <div className="flex-1 h-[1px] bg-[#333]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-[#171717] border border-[#383838] focus:border-[#ea4335] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#171717] border border-[#383838] focus:border-[#ea4335] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#171717] border border-[#383838] focus:border-[#ea4335] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Role / Occupation</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Developer, Student, Designer"
                className="w-full bg-[#171717] border border-[#383838] focus:border-[#ea4335] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs transition-all flex items-center justify-center gap-1.5 mt-2"
          >
            <span>{isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle between Sign In & Sign Up */}
        <div className="text-center text-xs text-slate-400 pt-1">
          {isLogin ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-white hover:underline font-semibold ml-1"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-white hover:underline font-semibold ml-1"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
