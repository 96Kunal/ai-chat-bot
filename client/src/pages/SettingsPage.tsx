import React, { useState } from 'react';
import {
  User,
  Cpu,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { CrimsonLogo } from '../components/common/CrimsonLogo';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotification();

  // Profile Form state
  const [name, setName] = useState(user?.name || 'Alex Rivera');
  const [major, setMajor] = useState(user?.major || 'Software Developer & Researcher');
  const [avatarSeed, setAvatarSeed] = useState(user?.name || 'user');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to update your profile.', 'info');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name,
        major,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(avatarSeed)}`,
      });
      showToast('Profile updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="pt-2">
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          Settings & Preferences
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal profile and Crimson AI preferences.
        </p>
      </div>

      {/* 1. User Profile Card */}
      <div className="p-6 rounded-3xl bg-[#282828] border border-[#383838] space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#383838]">
          <div className="w-10 h-10 rounded-2xl bg-[#1f1f1f] flex items-center justify-center text-[#ea4335]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Personal Profile</h3>
            <p className="text-xs text-slate-400">
              Personalizes explanations, suggestions, and conversation style.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setAvatarSeed(e.target.value);
                }}
                className="w-full bg-[#1e1e1e] border border-[#383838] focus:border-[#ea4335] rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Role / Focus Area</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g. Software Engineer, Student, Data Scientist"
                className="w-full bg-[#1e1e1e] border border-[#383838] focus:border-[#ea4335] rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-full bg-white hover:bg-slate-200 text-black font-semibold text-xs transition-all shadow-sm"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. System Status */}
      <div className="p-6 rounded-3xl bg-[#282828] border border-[#383838] space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#ea4335]" />
          <span>System Status & Engine</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-[#333]">
            <span className="text-slate-500 block text-[10px] uppercase">AI Engine</span>
            <span className="font-semibold text-white">Crimson 4.0 (3.6 Flash)</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-[#333]">
            <span className="text-slate-500 block text-[10px] uppercase">Connection</span>
            <span className="font-semibold text-[#a8dab5] flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>Fully Connected</span>
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#1e1e1e] border border-[#333]">
            <span className="text-slate-500 block text-[10px] uppercase">Streaming Engine</span>
            <span className="font-semibold text-slate-300">SSE Real-time Pipeline</span>
          </div>
        </div>
      </div>
    </div>
  );
};
