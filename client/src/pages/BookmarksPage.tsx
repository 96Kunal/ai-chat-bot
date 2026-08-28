import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  Bookmark,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { BookmarkItem } from '../types';
import { bookmarkApi } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const BookmarksPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Saved' },
    { id: 'chat', label: 'Chat Answers' },
    { id: 'study_plan', label: 'Study Plans' },
    { id: 'quiz', label: 'Quizzes' },
    { id: 'concept', label: 'Concepts' },
    { id: 'note', label: 'Notes' },
  ];

  useEffect(() => {
    if (user) {
      loadBookmarks();
    }
  }, [user, activeCategory]);

  const loadBookmarks = async () => {
    try {
      const list = await bookmarkApi.getAll(activeCategory);
      setBookmarks(list);
    } catch (err) {
      console.warn('Failed to load bookmarks', err);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    try {
      await bookmarkApi.delete(id);
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
      showToast('Bookmark deleted', 'info');
    } catch (err) {
      showToast('Failed to delete bookmark', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="pt-2">
        <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
          Saved Vault
        </h2>
        <p className="text-xs text-[#8e918f] mt-1">
          Your bookmarked Crimson AI answers, study plans, and revision notes.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-[#004a77] text-[#c2e7ff] font-semibold'
                : 'bg-[#1e1f20] text-[#c4c7c5] hover:bg-[#282a2c] hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Bookmarks List */}
      {!user ? (
        <div className="p-12 rounded-3xl bg-[#1e1f20] border border-[#333538] text-center space-y-2">
          <Bookmark className="w-10 h-10 mx-auto text-[#444746] mb-2" />
          <h3 className="text-base font-semibold text-white">Sign In to Save Bookmarks</h3>
          <p className="text-xs text-[#8e918f]">
            Sign in to keep your bookmarked answers and study schedules synchronized.
          </p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#1e1f20] border border-[#333538] text-center space-y-2">
          <Bookmark className="w-10 h-10 mx-auto text-[#444746] mb-2" />
          <h3 className="text-base font-semibold text-white">No Bookmarks Saved Yet</h3>
          <p className="text-xs text-[#8e918f]">
            Click the bookmark icon under any Crimson response or study tool output to save it here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bm) => (
            <div
              key={bm._id}
              className="p-5 sm:p-6 rounded-3xl bg-[#1e1f20] border border-[#333538] space-y-4"
            >
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#282a2c]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#131314] text-[#a8c7fa] font-medium uppercase">
                      {bm.category}
                    </span>
                    <span className="text-[11px] text-[#8e918f]">
                      {new Date(bm.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{bm.title}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(bm.content, bm._id)}
                    className="p-1.5 rounded-full hover:bg-[#282a2c] text-[#8e918f] hover:text-white transition-colors"
                    title="Copy"
                  >
                    {copiedId === bm._id ? (
                      <Check className="w-4 h-4 text-[#34a853]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(bm._id)}
                    className="p-1.5 rounded-full hover:bg-[#282a2c] text-[#8e918f] hover:text-[#d96570] transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bookmark Body */}
              <div className="text-xs sm:text-sm text-[#e3e3e3] markdown-body leading-relaxed max-h-96 overflow-y-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {bm.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
