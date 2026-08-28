import React from 'react';
import {
  Menu,
  Key,
  ChevronDown,
  Plus,
  Settings,
  PanelLeft,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavTab } from './Sidebar';
import { CrimsonLogo } from '../common/CrimsonLogo';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  setIsMobileOpen: (open: boolean) => void;
  onNewChat?: () => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  setIsMobileOpen,
  onNewChat,
  onOpenAuth,
}) => {
  const { user, customApiKey } = useAuth();

  return (
    <header
      className={`sticky top-0 z-30 h-14 bg-[#212121]/90 backdrop-blur-md border-b border-[#2f2f2f]/60 transition-all duration-300 ${
        isCollapsed ? 'lg:pl-[68px]' : 'lg:pl-64'
      }`}
    >
      <div className="h-full px-4 flex items-center justify-between gap-4 max-w-5xl mx-auto w-full">
        {/* Left Side: Toggle button & Model Picker */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileOpen(true);
              } else {
                setIsCollapsed(!isCollapsed);
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#2f2f2f] transition-colors"
            title="Toggle sidebar"
          >
            {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <Menu className="w-5 h-5 lg:hidden" />}
          </button>

          {/* Model Selector Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#2f2f2f] text-slate-200 hover:text-white text-sm font-semibold transition-colors cursor-pointer">
            <CrimsonLogo size="xs" />
            <span>Crimson AI</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Right Side: Key status, Auth / User badge, Settings */}
        <div className="flex items-center gap-2">
          {/* Sign In button if guest */}
          {!user && (
            <button
              onClick={() => {
                if (onOpenAuth) onOpenAuth();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ea4335]" />
              <span>Sign In</span>
            </button>
          )}

          {/* New Chat Button */}
          {onNewChat && (
            <button
              onClick={() => {
                onNewChat();
                setActiveTab('chat');
              }}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#2f2f2f] transition-colors"
              title="New chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {/* Settings Shortcut */}
          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#2f2f2f] transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
