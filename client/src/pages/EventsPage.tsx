import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  UserCheck,
  ExternalLink,
  Users,
} from 'lucide-react';
import { CampusEvent } from '../types';
import { collegeApi } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { NavTab } from '../components/layout/Sidebar';

interface EventsPageProps {
  setActiveTab: (tab: NavTab) => void;
  onAskAboutEvent?: (eventTitle: string) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ setActiveTab, onAskAboutEvent }) => {
  const { showToast } = useNotification();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', 'Hackathon', 'Workshop', 'Seminar', 'Cultural', 'Sports', 'Career'];

  useEffect(() => {
    loadEvents();
  }, [activeCategory]);

  const loadEvents = async () => {
    try {
      const list = await collegeApi.getEvents(activeCategory);
      setEvents(list);
    } catch (err) {
      console.warn('Failed to load events', err);
    }
  };

  const handleRsvp = async (id: string) => {
    try {
      const res = await collegeApi.rsvpEvent(id);
      setEvents((prev) =>
        prev.map((e) =>
          e._id === id || e.id === id ? { ...e, isRsvpd: res.isRsvpd, rsvpCount: res.rsvpCount } : e
        )
      );
      showToast(res.message, 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Login required to RSVP.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="pt-2">
        <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
          Campus Events & Hackathons
        </h2>
        <p className="text-xs text-[#8e918f] mt-1">
          Explore hackathons, workshops, and fests happening across Horizon University.
        </p>
      </div>

      {/* Categories Filter */}
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
            {cat === 'all' ? 'All Events' : cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((ev) => (
          <div
            key={ev._id || ev.id}
            className="rounded-3xl bg-[#1e1f20] hover:bg-[#282a2c] overflow-hidden border border-transparent hover:border-[#333538] flex flex-col justify-between transition-all"
          >
            {/* Banner Image */}
            <div className="relative h-40 w-full bg-[#131314] overflow-hidden">
              {ev.bannerUrl ? (
                <img
                  src={ev.bannerUrl}
                  alt={ev.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#131314]">
                  <Calendar className="w-10 h-10 text-[#444746]" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1f20] via-transparent to-transparent" />

              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-0.5 rounded-full bg-[#131314]/90 backdrop-blur-md text-[10px] font-semibold text-[#a8c7fa]">
                  {ev.category}
                </span>
              </div>
            </div>

            {/* Event Body */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#8e918f] mb-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(ev.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {ev.time}</span>
                </div>
                <h3 className="text-sm font-semibold text-white leading-snug">{ev.title}</h3>
                <p className="text-xs text-[#8e918f] line-clamp-2 mt-1 leading-relaxed">{ev.description}</p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-[#282a2c] text-xs text-[#8e918f]">
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#4285f4] shrink-0" />
                  <span className="truncate">{ev.venue}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Users className="w-3.5 h-3.5 text-[#9b72cb] shrink-0" />
                  <span className="truncate">{ev.organizer}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#282a2c] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleRsvp(ev._id || ev.id || '')}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-medium transition-all ${
                    ev.isRsvpd
                      ? 'bg-[#14321d] text-[#a8dab5] border border-[#235832]'
                      : 'bg-[#131314] hover:bg-[#333538] text-[#e3e3e3]'
                  }`}
                >
                  {ev.isRsvpd ? '✓ Registered' : 'RSVP'}
                </button>

                <button
                  onClick={() => {
                    if (onAskAboutEvent) {
                      onAskAboutEvent(`Tell me details about the event: "${ev.title}"`);
                    }
                    setActiveTab('chat');
                  }}
                  className="px-3 py-2 rounded-full bg-[#131314] hover:bg-[#333538] text-[#a8c7fa] text-xs font-medium"
                  title="Ask Crimson"
                >
                  ✦ Ask
                </button>

                {ev.registrationLink && (
                  <a
                    href={ev.registrationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full bg-[#131314] hover:bg-[#333538] text-[#c4c7c5] hover:text-white text-xs"
                    title="External Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
