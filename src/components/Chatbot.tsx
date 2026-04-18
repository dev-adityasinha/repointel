import React, { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, AlertCircle } from "lucide-react";
import { askRepositoryQuestion } from "../services/gemini";
import { cn } from "../lib/utils";

interface AppData {
  info: any;
  languages: Record<string, number>;
  contents: string[];
  issues: any[];
  analysis: any;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chatbot({ data }: { data: AppData | null }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm here to answer questions about this repository. Ask me anything about its structure, purpose, code quality, or any other aspect of the project.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !data || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await askRepositoryQuestion(
        input,
        data.info,
        data.languages,
        data.contents,
        data.issues,
        data.analysis
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || "Failed to get a response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
        <MessageCircle className="w-12 h-12 text-[var(--text-muted)] mb-4 opacity-50" />
        <p className="text-[var(--text-muted)] text-sm">
          Analyze a repository first to start chatting about it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Messages */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-xs lg:max-w-md px-4 py-3 rounded-lg",
                message.role === "user"
                  ? "bg-[var(--accent)] text-white rounded-br-none"
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-main)] rounded-bl-none"
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <span
                className={cn(
                  "text-xs mt-1 block",
                  message.role === "user"
                    ? "text-white/70"
                    : "text-[var(--text-muted)]"
                )}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start animate-in fade-in">
            <div className="bg-[var(--surface)] border border-[var(--border)] px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-3 py-2 rounded-lg flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this repository..."
          disabled={loading}
          className="flex-1 px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all outline-none text-sm text-[var(--text-main)] disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-3 py-2.5 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
