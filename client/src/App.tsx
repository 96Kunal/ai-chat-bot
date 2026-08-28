import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ChatPage } from './pages/ChatPage';
import { StudyToolsPage } from './pages/StudyToolsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthModal } from './components/auth/AuthModal';
import { ParticleSwarmBackground } from './components/animations/ParticleSwarmBackground';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('chat');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setActiveTab('chat');
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setActiveTab('chat');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#ea4335] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-300">Initializing Crimson AI...</span>
        </div>
      </div>
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <ChatPage
            currentSessionId={currentSessionId}
            setCurrentSessionId={setCurrentSessionId}
          />
        );
      case 'documents':
        return (
          <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full">
            <DocumentsPage
              setActiveTab={setActiveTab}
              onAttachDocToChat={() => {
                setActiveTab('chat');
              }}
            />
          </div>
        );
      case 'study':
        return (
          <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full">
            <StudyToolsPage />
          </div>
        );
      case 'bookmarks':
        return (
          <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full">
            <BookmarksPage />
          </div>
        );
      case 'settings':
        return (
          <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full">
            <SettingsPage />
          </div>
        );
      default:
        return (
          <ChatPage
            currentSessionId={currentSessionId}
            setCurrentSessionId={setCurrentSessionId}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#212121] text-white flex flex-col font-sans relative overflow-x-hidden">
      {/* 3D Particle Swarm Background Simulation */}
      <ParticleSwarmBackground />

      {/* ChatGPT Style Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        currentSessionId={currentSessionId}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        setIsMobileOpen={setIsMobileOpen}
        onNewChat={handleNewChat}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 flex flex-col transition-all duration-300 relative z-10 ${
          isCollapsed ? 'lg:pl-[68px]' : 'lg:pl-64'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col"
          >
            {renderActivePage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Sign In / Sign Up Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
