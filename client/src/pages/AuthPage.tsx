import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Lock,
  Mail,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface AuthPageProps {
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, register, demoLogin } = useAuth();
  const { showToast } = useNotification();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [major, setMajor] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('2nd Year');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
        showToast('Welcome back!', 'success');
      } else {
        await register({ name, email, password, major, year });
        showToast('Student account created!', 'success');
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Authentication failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestDemo = async () => {
    setIsLoading(true);
    try {
      await demoLogin();
      showToast('Signed in with Student Demo Account', 'success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast('Demo login fallback enabled.', 'info');
      if (onSuccess) onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md p-8 rounded-4xl bg-[#1e1f20] border border-[#333538] shadow-2xl space-y-6">
        {/* Gemini Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4285f4] via-[#9b72cb] to-[#d96570] flex items-center justify-center text-white mx-auto shadow-md">
            <span className="text-2xl">✦</span>
          </div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            {isLogin ? 'Sign in to Crimson AI' : 'Create Student Account'}
          </h2>
          <p className="text-xs text-[#8e918f]">
            Access personalized course roadmaps and campus intelligence
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-[#c4c7c5] mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8e918f] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-[#131314] border border-[#333538] focus:border-[#4285f4] rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8e918f] focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#c4c7c5] mb-1">Campus Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8e918f] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@horizon.edu"
                className="w-full bg-[#131314] border border-[#333538] focus:border-[#4285f4] rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8e918f] focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c4c7c5] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8e918f] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#131314] border border-[#333538] focus:border-[#4285f4] rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8e918f] focus:outline-none"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-[#c4c7c5] mb-1">Department</label>
                <select
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full bg-[#131314] border border-[#333538] focus:border-[#4285f4] rounded-full px-3 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Computer Science & Engineering">CSE</option>
                  <option value="AI & Data Science">AI & DS</option>
                  <option value="Electronics & Comm.">ECE</option>
                  <option value="Mechanical Eng.">Mech</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c4c7c5] mb-1">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-[#131314] border border-[#333538] focus:border-[#4285f4] rounded-full px-3 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-[#e3e3e3] hover:bg-white text-[#131314] font-medium text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            <span>{isLoading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Login Shortcut */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGuestDemo}
            className="w-full py-2.5 rounded-full bg-[#131314] hover:bg-[#282a2c] text-[#a8c7fa] text-xs font-medium border border-[#333538] transition-all"
          >
            Quick 1-Click Demo Login (Alex Rivera)
          </button>
        </div>

        {/* Toggle between Login & Signup */}
        <div className="text-center text-xs text-[#8e918f]">
          {isLogin ? (
            <span>
              New student?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-[#a8c7fa] hover:underline font-medium ml-1"
              >
                Create an account
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-[#a8c7fa] hover:underline font-medium ml-1"
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
