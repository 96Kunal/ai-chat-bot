import React, { useState } from 'react';
import {
  Sparkles,
  GraduationCap,
  FileText,
  Bookmark,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NavTab } from '../components/layout/Sidebar';

interface DashboardProps {
  setActiveTab: (tab: NavTab) => void;
  onStartChatWithPrompt?: (prompt: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onStartChatWithPrompt }) => {
  const { user } = useAuth();
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      if (onStartChatWithPrompt) {
        onStartChatWithPrompt(quickInput.trim());
      }
      setActiveTab('chat');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="pt-2">
        <h1 className="text-3xl font-semibold text-white tracking-tight">
          Welcome back, {user ? user.name.split(' ')[0] : 'there'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Crimson AI Personal Assistant — What would you like to explore today?
        </p>

        <form onSubmit={handleQuickSubmit} className="mt-4 relative max-w-2xl">
          <div className="relative flex items-center bg-[#2f2f2f] hover:bg-[#383838] focus-within:!bg-[#383838] rounded-2xl p-1.5 pl-4 pr-2 transition-all border border-[#3f3f3f]">
            <span className="text-[#ea4335] text-xs mr-2">✦</span>
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Ask anything: 'Explain pointers', 'Plan a project', 'Draft notes'..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none py-1.5"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-white text-black font-medium text-xs rounded-xl hover:bg-slate-200 transition-all shrink-0"
            >
              Ask
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={() => setActiveTab('chat')}
          className="p-4 rounded-2xl bg-[#282828] hover:bg-[#303030] cursor-pointer transition-all border border-[#383838] flex flex-col justify-between h-36"
        >
          <div className="w-8 h-8 rounded-xl bg-[#1f1f1f] flex items-center justify-center text-[#ea4335]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">AI Chat</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Real-time reasoning and conversation</p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('study')}
          className="p-4 rounded-2xl bg-[#282828] hover:bg-[#303030] cursor-pointer transition-all border border-[#383838] flex flex-col justify-between h-36"
        >
          <div className="w-8 h-8 rounded-xl bg-[#1f1f1f] flex items-center justify-center text-[#9b72cb]">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Study & Code Studio</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Roadmaps, code explainers, quizzes</p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('documents')}
          className="p-4 rounded-2xl bg-[#282828] hover:bg-[#303030] cursor-pointer transition-all border border-[#383838] flex flex-col justify-between h-36"
        >
          <div className="w-8 h-8 rounded-xl bg-[#1f1f1f] flex items-center justify-center text-[#4285f4]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Documents</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Instant PDF summaries and Q&A</p>
          </div>
        </div>
      </div>
    </div>
  );
};
