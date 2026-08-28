import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import {
  Copy,
  Check,
  Bookmark,
  Sparkles,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { bookmarkApi } from '../../services/api';
import { CrimsonLogo } from '../common/CrimsonLogo';

interface ChatMessageItemProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onRegenerate?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isStreaming = false,
  onRegenerate,
}) => {
  const { showToast } = useNotification();
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const isUser = message.sender === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = async () => {
    try {
      await bookmarkApi.create({
        title: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : ''),
        category: 'chat',
        content: message.content,
      });
      setIsBookmarked(true);
      showToast('Saved to vault', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Please log in to save bookmarks.', 'error');
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.content.replace(/[#*`_]/g, ''));
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
      showToast('Playing audio...', 'info');
    } else {
      showToast('Text-to-speech not supported on this browser.', 'error');
    }
  };

  return (
    <div className={`py-4 px-3 sm:px-6 max-w-3xl mx-auto w-full ${isUser ? 'flex justify-end' : ''}`}>
      {isUser ? (
        /* ChatGPT Style User Message Pill */
        <div className="max-w-[85%] sm:max-w-[75%]">
          <div className="py-2.5 px-4 rounded-3xl bg-[#2f2f2f] text-white text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
            {message.content}
          </div>
        </div>
      ) : (
        /* ChatGPT Style Assistant Message */
        <div className="flex items-start gap-3.5 w-full">
          {/* Crimson AI Logo Avatar */}
          <div className="shrink-0 mt-0.5">
            <CrimsonLogo size="sm" />
          </div>

          {/* Response Container */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Markdown Content */}
            <div className="markdown-body leading-relaxed text-[#ececec] text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');

                    return !inline ? (
                      <div className="relative group/code my-3 rounded-2xl overflow-hidden border border-[#383838] bg-[#1e1e1e]">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] text-xs text-slate-300 font-mono">
                          <span>{match ? match[1] : 'code'}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(codeString);
                              showToast('Code copied!', 'info');
                            }}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy code</span>
                          </button>
                        </div>
                        <pre className="!mt-0 !rounded-none !border-0 overflow-x-auto p-4 text-xs bg-[#1e1e1e] font-mono text-slate-100">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>

              {/* Streaming Pulsing Cursor */}
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-[#ea4335] animate-pulse align-middle rounded-sm" />
              )}
            </div>

            {/* Bottom Action Toolbar */}
            {!isStreaming && (
              <div className="flex items-center gap-1 pt-1.5 text-slate-400">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:bg-[#2f2f2f] hover:text-white transition-colors"
                  title="Copy response"
                >
                  {copied ? <Check className="w-4 h-4 text-[#34a853]" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleSpeak}
                  className="p-1.5 rounded-lg hover:bg-[#2f2f2f] hover:text-white transition-colors"
                  title="Read aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleBookmark}
                  className={`p-1.5 rounded-lg hover:bg-[#2f2f2f] transition-colors ${
                    isBookmarked ? 'text-[#ea4335]' : 'hover:text-white'
                  }`}
                  title="Save to vault"
                >
                  <Bookmark className="w-4 h-4" />
                </button>

                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="p-1.5 rounded-lg hover:bg-[#2f2f2f] hover:text-white transition-colors"
                    title="Regenerate"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
