import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { lessonService } from '../../services/lessonService';
import { ChatMessage } from '../../types';

interface AskAIViewProps {
  documentId: string;
  documentTitle: string;
  onJumpToPage?: (page: number) => void;
}

const SUGGESTIONS = [
  'What are the core definitions in this document?',
  'Can you summarize the main workflow step-by-step?',
  'Explain the key formulas and principles in simple terms.',
  'What are the potential pitfalls or common misconceptions mentioned?',
];

export const AskAIView: React.FC<AskAIViewProps> = ({
  documentId,
  documentTitle,
  onJumpToPage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lessonService.getChatHistory(documentId).then(setMessages).catch(console.error);
  }, [documentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    setInput('');
    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      document_id: documentId,
      role: 'user',
      content: q,
      citations_json: [],
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await lessonService.askAi(documentId, q, historyPayload);

      const assistantMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        document_id: documentId,
        role: 'assistant',
        content: res.answer,
        citations_json: res.citations || [],
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        document_id: documentId,
        role: 'assistant',
        content: 'Sorry, I encountered an error while analyzing the document. Please try again.',
        citations_json: [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              Grounded AI Study Tutor
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Answers are strictly grounded in <span className="font-semibold">{documentTitle}</span> with page citations.
            </p>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="py-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Ask anything about this document
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                The tutor searches the PDF text, extracts relevant passages, and provides answers with source citations.
              </p>
            </div>

            {/* Suggestions Chips */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto pt-2">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 text-left transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Citation Chips */}
                {!isUser && m.citations_json && m.citations_json.length > 0 && onJumpToPage && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Citations:
                    </span>
                    {m.citations_json.map((page) => (
                      <button
                        key={page}
                        onClick={() => onJumpToPage(page)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-medium hover:underline cursor-pointer"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        Page {page}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Searching PDF excerpts & synthesizing answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask a question about this document..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-hidden focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-2xl shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
