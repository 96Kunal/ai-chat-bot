import React, { useState, useEffect } from 'react';
import {
  Plus,
  MessageSquare,
  Sparkles,
  GraduationCap,
  FileText,
  Bookmark,
  Settings,
  LogOut,
  Trash2,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { chatApi } from '../../services/api';
import { ChatSessionSummary } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { CrimsonLogo } from '../common/CrimsonLogo';

export type NavTab = 'chat' | 'documents' | 'study' | 'bookmarks' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onNewChat?: () => void;
  onSelectSession?: (sessionId: string) => void;
  currentSessionId?: string | null;
  onOpenAuth?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onNewChat,
  onSelectSession,
  currentSessionId,
  onOpenAuth,
}) => {
  const { user, logout } = useAuth();
  const { showToast } = useNotification();
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user, currentSessionId]);

  const loadSessions = async () => {
    try {
      const list = await chatApi.getSessions();
      setSessions(list);
    } catch (err) {
      console.warn('Failed to load chat history', err);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatApi.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      showToast('Chat deleted', 'info');
      if (currentSessionId === sessionId && onNewChat) {
        onNewChat();
      }
    } catch (err) {
      showToast('Failed to delete chat', 'error');
    }
  };

  const handleNewChat = () => {
    if (onNewChat) onNewChat();
    setActiveTab('chat');
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const handleSelectChat = (sessionId: string) => {
    if (onSelectSession) onSelectSession(sessionId);
    setActiveTab('chat');
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* ChatGPT Style Dark Minimal Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 transition-all duration-300 flex flex-col bg-[#171717] border-r border-[#262626] ${
          isCollapsed ? 'w-0 lg:w-[68px] overflow-hidden' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Controls: Brand & New Chat */}
        <div className="p-3 flex items-center justify-between gap-2 border-b border-[#262626]/60">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#212121] transition-colors"
            title={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
          >
            {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>

          {!isCollapsed && (
            <div
              onClick={() => handleSelectTab('chat')}
              className="cursor-pointer flex items-center gap-2"
            >
              <CrimsonLogo size="xs" />
              <span className="font-bold text-sm text-white tracking-tight">Crimson AI</span>
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={handleNewChat}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#212121] transition-colors"
              title="New chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* New Chat Pill Button */}
        {!isCollapsed && (
          <div className="px-3 pt-3">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-[#212121] hover:bg-[#2a2a2a] text-slate-200 hover:text-white text-xs font-semibold transition-all border border-[#2f2f2f] shadow-sm"
              title="Start a new conversation"
            >
              <Plus className="w-4 h-4 text-[#ea4335]" />
              <span>New chat</span>
            </button>
          </div>
        )}

        {/* Collapsed quick new chat icon button */}
        {isCollapsed && (
          <div className="p-2 flex flex-col items-center gap-2 border-b border-[#262626]">
            <button
              onClick={handleNewChat}
              className="p-2.5 rounded-xl bg-[#212121] hover:bg-[#2f2f2f] text-slate-200 hover:text-white transition-all shadow-sm"
              title="New chat"
            >
              <Plus className="w-5 h-5 text-[#ea4335]" />
            </button>
          </div>
        )}

        {/* Chat History List (ChatGPT Style) */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
              Recent Chats
            </div>

            {sessions.length === 0 ? (
              <div className="px-3 py-4 text-xs text-slate-500 italic">No chat history yet</div>
            ) : (
              sessions.map((sess) => {
                const isSelected = activeTab === 'chat' && currentSessionId === sess.id;
                return (
                  <div
                    key={sess.id}
                    onClick={() => handleSelectChat(sess.id)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#212121] text-white font-medium shadow-sm'
                        : 'text-slate-300 hover:bg-[#212121] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{sess.title}</span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSession(sess.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-[#ea4335] transition-opacity"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Assistant Tools Section */}
        <div className="p-2 border-t border-[#262626] space-y-1">
          {!isCollapsed && (
            <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
              Tools
            </div>
          )}

          {[
            { id: 'documents', label: 'Documents & Notes', icon: FileText },
            { id: 'study', label: 'Study & Code Studio', icon: GraduationCap },
            { id: 'bookmarks', label: 'Saved Vault', icon: Bookmark },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id as NavTab)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#212121] text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-[#212121]'
                } ${isCollapsed ? 'justify-center p-2.5' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Bottom User Account Pill */}
        <div className="p-3 border-t border-[#262626]">
          {user ? (
            <div
              className={`flex items-center gap-2.5 p-2 rounded-xl bg-[#212121] text-xs text-white ${
                isCollapsed ? 'justify-center p-1.5' : ''
              }`}
            >
              <img
                src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt={user.name}
                className="w-7 h-7 rounded-full bg-[#2f2f2f] shrink-0"
              />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                </div>
              )}
              {!isCollapsed && (
                <button
                  onClick={logout}
                  className="p-1 text-slate-400 hover:text-[#ea4335] transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                if (onOpenAuth) {
                  onOpenAuth();
                } else {
                  handleSelectTab('settings');
                }
              }}
              className={`w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                isCollapsed ? 'p-2' : ''
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ea4335]" />
              {!isCollapsed && <span>Sign In / Sign Up</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
