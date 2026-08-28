import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  UploadCloud,
  FileText,
  Trash2,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  FileCode,
  Plus,
} from 'lucide-react';
import { DocumentItem } from '../types';
import { documentApi } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { NavTab } from '../components/layout/Sidebar';

interface DocumentsPageProps {
  setActiveTab: (tab: NavTab) => void;
  onAttachDocToChat?: (docId: string) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ setActiveTab, onAttachDocToChat }) => {
  const { showToast } = useNotification();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [docQuestion, setDocQuestion] = useState('');
  const [docAnswer, setDocAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await documentApi.getDocuments();
      setDocuments(docs);
      if (docs.length > 0 && !selectedDoc) {
        handleSelectDoc(docs[0]._id || docs[0].id || '');
      }
    } catch (err) {
      console.warn('Could not load documents', err);
    }
  };

  const handleSelectDoc = async (id: string) => {
    try {
      const fullDoc = await documentApi.getDocumentById(id);
      setSelectedDoc(fullDoc);
      setDocAnswer('');
      setDocQuestion('');
    } catch (err) {
      showToast('Failed to load document content', 'error');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    showToast(`Analyzing "${file.name}" with Crimson AI...`, 'info');

    try {
      const newDoc = await documentApi.upload(file);
      showToast('Document analyzed successfully', 'success');
      setDocuments((prev) => [newDoc, ...prev]);
      setSelectedDoc(newDoc);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to process document.', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await documentApi.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => (d._id || d.id) !== id));
      if ((selectedDoc?._id || selectedDoc?.id) === id) {
        setSelectedDoc(null);
      }
      showToast('Document removed', 'info');
    } catch (err) {
      showToast('Failed to delete document', 'error');
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docQuestion.trim() || !selectedDoc) return;

    setIsAnswering(true);
    setDocAnswer('');

    try {
      const res = await documentApi.askDocument(selectedDoc._id || selectedDoc.id || '', docQuestion);
      setDocAnswer(res.answer);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error querying document.', 'error');
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
            Document Intelligence
          </h2>
          <p className="text-xs text-[#8e918f] mt-1">
            Upload course notes, syllabi, and PDFs to extract instant summaries and ask questions.
          </p>
        </div>

        {/* Upload Button */}
        <label className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#e3e3e3] hover:bg-white text-[#131314] font-medium text-xs cursor-pointer transition-all shrink-0">
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          <span>{isUploading ? 'Analyzing...' : 'Upload Document'}</span>
          <input
            type="file"
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Document List */}
        <div className="p-5 rounded-3xl bg-[#1e1f20] border border-[#333538] space-y-3">
          <div className="text-xs font-semibold text-[#c4c7c5] pb-2 border-b border-[#282a2c]">
            Uploaded Files ({documents.length})
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <FileCode className="w-10 h-10 mx-auto text-[#444746]" />
              <p className="text-xs font-medium text-[#8e918f]">No documents uploaded</p>
              <p className="text-[11px] text-[#8e918f]">Upload PDF, DOCX, or TXT notes above</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[550px] overflow-y-auto">
              {documents.map((doc) => {
                const docId = doc._id || doc.id || '';
                const isSelected = (selectedDoc?._id || selectedDoc?.id) === docId;

                return (
                  <div
                    key={docId}
                    onClick={() => handleSelectDoc(docId)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-start justify-between gap-3 border ${
                      isSelected
                        ? 'bg-[#004a77]/50 border-[#4285f4]/50 text-white'
                        : 'bg-[#131314] border-[#282a2c] text-[#c4c7c5] hover:bg-[#282a2c]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <FileText className="w-4 h-4 text-[#4285f4] shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-medium truncate">{doc.originalName}</h4>
                        <div className="text-[10px] text-[#8e918f] mt-0.5">
                          {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(docId, e)}
                      className="p-1 text-[#8e918f] hover:text-[#d96570] transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Document Details & Q&A */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDoc ? (
            <div className="p-6 rounded-3xl bg-[#1e1f20] border border-[#333538] space-y-6">
              {/* Document Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#282a2c]">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#4285f4]" />
                    <span>{selectedDoc.originalName}</span>
                  </h3>
                  <div className="text-xs text-[#8e918f] mt-0.5">
                    {(selectedDoc.size / 1024).toFixed(1)} KB • Extracted text ready
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onAttachDocToChat) {
                      onAttachDocToChat(selectedDoc._id || selectedDoc.id || '');
                    }
                    setActiveTab('chat');
                  }}
                  className="px-4 py-1.5 rounded-full bg-[#131314] hover:bg-[#282a2c] text-[#a8c7fa] text-xs font-medium border border-[#333538] transition-all"
                >
                  Open in Crimson Chat
                </button>
              </div>

              {/* AI Summary */}
              {selectedDoc.summary && (
                <div className="p-4 rounded-2xl bg-[#131314] border border-[#282a2c] space-y-2">
                  <span className="text-xs font-semibold text-[#a8c7fa] flex items-center gap-1.5">
                    <span>✦ Executive AI Summary</span>
                  </span>
                  <div className="text-xs text-[#e3e3e3] markdown-body leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {selectedDoc.summary}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Key Points */}
              {selectedDoc.keyPoints && selectedDoc.keyPoints.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[#c4c7c5]">Key Highlights:</span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#c4c7c5]">
                    {selectedDoc.keyPoints.map((kp, idx) => (
                      <li key={idx} className="p-3 rounded-2xl bg-[#131314] border border-[#282a2c] flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#34a853] shrink-0 mt-0.5" />
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Document-Specific Q&A */}
              <div className="space-y-3 pt-4 border-t border-[#282a2c]">
                <span className="text-xs font-semibold text-[#c4c7c5] block">Ask Document:</span>
                <form onSubmit={handleAskQuestion} className="relative">
                  <input
                    type="text"
                    value={docQuestion}
                    onChange={(e) => setDocQuestion(e.target.value)}
                    placeholder={`Ask questions about ${selectedDoc.originalName}...`}
                    className="w-full bg-[#131314] border border-[#333538] focus:border-[#4285f4] rounded-full pl-5 pr-20 py-2.5 text-xs text-white placeholder-[#8e918f] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!docQuestion.trim() || isAnswering}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1 bg-[#e3e3e3] hover:bg-white text-[#131314] font-medium text-xs rounded-full transition-all disabled:opacity-50"
                  >
                    {isAnswering ? '...' : 'Ask'}
                  </button>
                </form>

                {docAnswer && (
                  <div className="p-4 rounded-2xl bg-[#131314] border border-[#282a2c] text-xs text-[#e3e3e3] markdown-body leading-relaxed animate-in fade-in">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {docAnswer}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-[#1e1f20] border border-[#333538] text-center space-y-2">
              <FileText className="w-12 h-12 mx-auto text-[#444746]" />
              <h3 className="text-base font-semibold text-white">Select a Document</h3>
              <p className="text-xs text-[#8e918f]">
                Choose an uploaded file from the left panel or click Upload Document above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
