import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  X,
  ArrowUp,
  Paperclip,
} from 'lucide-react';
import { ChatMessage, ChatSessionSummary, DocumentItem } from '../types';
import { chatApi, documentApi } from '../services/api';
import { ChatMessageItem } from '../components/chat/ChatMessageItem';
import { SuggestedPrompts } from '../components/chat/SuggestedPrompts';
import { VoiceInputButton } from '../components/chat/VoiceInputButton';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { CrimsonLogo } from '../components/common/CrimsonLogo';

interface ChatPageProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  currentSessionId?: string | null;
  setCurrentSessionId?: (id: string | null) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  initialPrompt,
  onClearInitialPrompt,
  currentSessionId,
  setCurrentSessionId,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  useEffect(() => {
    const loadDocs = async () => {
      if (user) {
        try {
          const docList = await documentApi.getDocuments();
          setDocuments(docList);
        } catch (err) {
          console.warn('Failed to load documents', err);
        }
      }
    };
    loadDocs();
  }, [user]);

  // Load session if currentSessionId changes from sidebar
  useEffect(() => {
    if (currentSessionId) {
      chatApi.getSessionById(currentSessionId).then((sess) => {
        if (sess) {
          setMessages(sess.messages || []);
        }
      }).catch(() => {});
    } else if (currentSessionId === null) {
      setMessages([]);
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isStreaming) return;

    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamingText('');

    let accumulatedResponse = '';

    await chatApi.sendMessageStream({
      message: text,
      sessionId: currentSessionId || undefined,
      documentId: selectedDocId || undefined,
      onMeta: (meta) => {
        if (meta.sessionId && !currentSessionId && setCurrentSessionId) {
          setCurrentSessionId(meta.sessionId);
        }
      },
      onChunk: (chunk) => {
        accumulatedResponse += chunk;
        setStreamingText(accumulatedResponse);
      },
      onDone: (data) => {
        const assistantMsg: ChatMessage = {
          id: data.message?.id || Math.random().toString(36).substring(2, 9),
          sender: 'assistant',
          content: accumulatedResponse,
          documentContextId: selectedDocId || undefined,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setStreamingText('');
        setIsStreaming(false);
      },
      onError: (err) => {
        setIsStreaming(false);
        showToast(err || 'Failed to generate response.', 'error');
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRegenerate = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find((m) => m.sender === 'user');
      if (lastUserMessage) {
        handleSendMessage(lastUserMessage.content);
      }
    }
  };

  const selectedDocumentName = documents.find((d) => (d._id || d.id) === selectedDocId)?.originalName;

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] relative overflow-hidden bg-[#212121]">
      {/* Messages Canvas / Welcoming Empty State */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isStreaming ? (
          <div className="h-full flex flex-col justify-center items-center py-10">
            {/* ChatGPT Style Central Hero with Crimson Logo */}
            <div className="text-center mb-6 space-y-3 flex flex-col items-center">
              <CrimsonLogo size="lg" />
              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                What can I help with today?
              </h1>
            </div>

            {/* 4 Minimalist Suggestion Capsules */}
            <SuggestedPrompts onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full space-y-4">
            {messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                onRegenerate={msg.sender === 'assistant' ? handleRegenerate : undefined}
              />
            ))}

            {isStreaming && (
              <ChatMessageItem
                message={{
                  id: 'streaming-chunk',
                  sender: 'assistant',
                  content: streamingText || 'Thinking...',
                  timestamp: new Date(),
                }}
                isStreaming={true}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ChatGPT Style Bottom Input Capsule */}
      <div className="p-4 max-w-3xl mx-auto w-full">
        {/* Attached Document Pill if selected */}
        {selectedDocumentName && (
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2f2f2f] text-slate-200 border border-[#3f3f3f] text-xs font-medium">
              <FileText className="w-3.5 h-3.5 text-[#ea4335]" />
              <span className="truncate max-w-[200px]">{selectedDocumentName}</span>
              <button onClick={() => setSelectedDocId(null)} className="ml-1 text-slate-400 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-[#2f2f2f] hover:bg-[#333333] focus-within:!bg-[#333333] rounded-3xl p-2 px-3.5 border border-[#3f3f3f] shadow-lg transition-all">
          {/* Document Attachment Button */}
          {documents.length > 0 && (
            <div className="relative mb-0.5">
              <select
                value={selectedDocId || ''}
                onChange={(e) => setSelectedDocId(e.target.value || null)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Attach document context"
              >
                <option value="">Attach Document...</option>
                {documents.map((doc) => (
                  <option key={doc._id || doc.id} value={doc._id || doc.id}>
                    {doc.originalName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-[#3f3f3f] transition-colors"
                title="Attach document"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Multiline Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Message Crimson AI..."
            disabled={isStreaming}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 resize-none max-h-40 py-2.5 px-2 focus:outline-none leading-relaxed"
          />

          {/* Voice Input */}
          <div className="mb-0.5">
            <VoiceInputButton
              onTranscript={(transcript) => {
                setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
              }}
              disabled={isStreaming}
            />
          </div>

          {/* Circular Send Arrow Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isStreaming}
            className={`p-2 rounded-full mb-0.5 transition-all flex items-center justify-center ${
              inputMessage.trim() && !isStreaming
                ? 'bg-white text-black hover:bg-slate-200 shadow-md'
                : 'bg-[#3f3f3f] text-slate-500 cursor-not-allowed opacity-50'
            }`}
            title="Send message"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal ChatGPT Disclaimer */}
        <p className="text-center text-[11px] text-slate-400 mt-2">
          Crimson AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};
