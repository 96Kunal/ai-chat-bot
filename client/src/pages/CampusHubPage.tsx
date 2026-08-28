import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Compass,
  MapPin,
  BookOpen,
  PhoneCall,
  Search,
  Sparkles,
  Mail,
  GraduationCap,
} from 'lucide-react';
import { CollegeKnowledgeItem } from '../types';
import { collegeApi } from '../services/api';
import { NavTab } from '../components/layout/Sidebar';

interface CampusHubPageProps {
  setActiveTab: (tab: NavTab) => void;
  onAskAboutKnowledge?: (title: string) => void;
}

export const CampusHubPage: React.FC<CampusHubPageProps> = ({ setActiveTab, onAskAboutKnowledge }) => {
  const [knowledgeList, setKnowledgeList] = useState<CollegeKnowledgeItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Knowledge', icon: Building2 },
    { id: 'department', label: 'Departments', icon: GraduationCap },
    { id: 'faculty', label: 'Faculty', icon: Users },
    { id: 'club', label: 'Clubs', icon: Compass },
    { id: 'facility', label: 'Facilities', icon: MapPin },
    { id: 'rule', label: 'Academic Rules', icon: BookOpen },
    { id: 'contact', label: 'Contacts', icon: PhoneCall },
  ];

  useEffect(() => {
    loadKnowledge();
  }, [activeCategory]);

  const loadKnowledge = async () => {
    try {
      const items = await collegeApi.getKnowledge(activeCategory, searchQuery);
      setKnowledgeList(items);
    } catch (err) {
      console.warn('Failed to load knowledge', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadKnowledge();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
            Campus Hub Directory
          </h2>
          <p className="text-xs text-[#8e918f] mt-1">
            Official verified campus guide to academic departments, professors, clubs, and facilities.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#8e918f] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campus..."
            className="w-full bg-[#1e1f20] border border-[#333538] focus:border-[#4285f4] rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-[#8e918f] focus:outline-none"
          />
        </form>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#004a77] text-[#c2e7ff] font-semibold'
                  : 'bg-[#1e1f20] text-[#c4c7c5] hover:bg-[#282a2c] hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {knowledgeList.map((item) => (
          <div
            key={item._id}
            className="p-5 rounded-3xl bg-[#1e1f20] hover:bg-[#282a2c] transition-all border border-transparent hover:border-[#333538] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#131314] text-[#a8c7fa] font-medium capitalize">
                  {item.category}
                </span>

                {item.metadata?.room && (
                  <span className="text-[11px] text-[#8e918f] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#4285f4]" />
                    <span>{item.metadata.room}</span>
                  </span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-white mb-1.5 leading-snug">{item.title}</h3>
              <p className="text-xs text-[#8e918f] leading-relaxed whitespace-pre-line line-clamp-4">
                {item.content}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#282a2c] flex items-center justify-between">
              {item.metadata?.email ? (
                <span className="text-[11px] text-[#8e918f] flex items-center gap-1 truncate max-w-[150px]">
                  <Mail className="w-3 h-3 text-[#4285f4] shrink-0" />
                  <span className="truncate">{item.metadata.email}</span>
                </span>
              ) : (
                <span className="text-[11px] text-[#8e918f]">Verified record</span>
              )}

              <button
                onClick={() => {
                  if (onAskAboutKnowledge) {
                    onAskAboutKnowledge(`Tell me more about ${item.title}`);
                  }
                  setActiveTab('chat');
                }}
                className="px-3 py-1 rounded-full bg-[#131314] hover:bg-[#333538] text-[#a8c7fa] text-xs font-medium flex items-center gap-1 transition-all"
              >
                <span>✦ Ask AI</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
