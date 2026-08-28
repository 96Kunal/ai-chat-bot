import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Calendar,
  User,
  Search,
} from 'lucide-react';
import { AnnouncementItem } from '../types';
import { collegeApi } from '../services/api';
import { NavTab } from '../components/layout/Sidebar';

interface AnnouncementsPageProps {
  setActiveTab: (tab: NavTab) => void;
  onAskAboutNotice?: (title: string) => void;
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({
  setActiveTab,
  onAskAboutNotice,
}) => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['all', 'Urgent', 'Academic', 'Exam', 'Campus', 'Placement'];

  useEffect(() => {
    loadAnnouncements();
  }, [activeCategory]);

  const loadAnnouncements = async () => {
    try {
      const list = await collegeApi.getAnnouncements(activeCategory);
      setAnnouncements(list);
    } catch (err) {
      console.warn('Failed to load notices', err);
    }
  };

  const filtered = announcements.filter((a) =>
    searchQuery ? a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.content.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
            Official Campus Notices
          </h2>
          <p className="text-xs text-[#8e918f] mt-1">
            Exam schedules, placement circulars, and departmental circulars.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#8e918f] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars..."
            className="w-full bg-[#1e1f20] border border-[#333538] focus:border-[#4285f4] rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-[#8e918f] focus:outline-none"
          />
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-all ${
              activeCategory === cat
                ? 'bg-[#004a77] text-[#c2e7ff] font-semibold'
                : 'bg-[#1e1f20] text-[#c4c7c5] hover:bg-[#282a2c] hover:text-white'
            }`}
          >
            {cat === 'all' ? 'All Notices' : cat}
          </button>
        ))}
      </div>

      {/* Announcements Stream */}
      <div className="space-y-3.5">
        {filtered.map((ann) => (
          <div
            key={ann._id}
            className="p-5 sm:p-6 rounded-3xl bg-[#1e1f20] hover:bg-[#282a2c] border border-transparent hover:border-[#333538] transition-all space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] px-3 py-0.5 rounded-full font-semibold ${
                    ann.priority === 'high'
                      ? 'bg-[#ea4335]/20 text-[#ea4335]'
                      : 'bg-[#4285f4]/20 text-[#4285f4]'
                  }`}
                >
                  {ann.category} • {ann.priority} priority
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#8e918f]">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{ann.author}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(ann.publishedAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>

            <h3 className="text-base font-semibold text-white leading-snug">{ann.title}</h3>
            <p className="text-xs sm:text-sm text-[#c4c7c5] leading-relaxed whitespace-pre-line">
              {ann.content}
            </p>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => {
                  if (onAskAboutNotice) {
                    onAskAboutNotice(`Can you explain the implications of notice: "${ann.title}"?`);
                  }
                  setActiveTab('chat');
                }}
                className="px-4 py-1.5 rounded-full bg-[#131314] hover:bg-[#333538] text-[#a8c7fa] text-xs font-medium transition-all flex items-center gap-1.5"
              >
                <span>✦ Ask Crimson AI about this</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
