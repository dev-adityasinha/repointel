import React, { useState } from "react";
import { Zap, Copy, CheckCircle, Lightbulb } from "lucide-react";
import { SmartSuggestion } from "../services/gemini";

export default function SmartSuggestionsPanel({ suggestions }: { suggestions: SmartSuggestion[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(suggestions[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getEffortIcon = (effort: string) => {
    switch (effort) {
      case "quick":
        return "⚡";
      case "moderate":
        return "⏱️";
      case "complex":
        return "🏗️";
      default:
        return "❓";
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center">
        <Lightbulb className="w-12 h-12 text-[var(--accent)] mx-auto mb-3 opacity-50" />
        <p className="text-[var(--text-muted)]">No suggestions available at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden transition-all"
        >
          {/* Header */}
          <button
            onClick={() => setExpandedId(expandedId === suggestion.id ? null : suggestion.id)}
            className="w-full p-5 text-left hover:bg-[var(--bg)] transition-colors flex items-start justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <h3 className="text-sm font-bold text-[var(--text-main)]">{suggestion.title}</h3>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{suggestion.description}</p>
            </div>
            <div className="flex flex-col gap-2 items-end flex-shrink-0">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(suggestion.priority)}`}>
                {suggestion.priority.toUpperCase()}
              </span>
              <span className="text-xs text-[var(--text-muted)]">{getEffortIcon(suggestion.effort)} {suggestion.effort}</span>
            </div>
          </button>

          {/* Expanded Content */}
          {expandedId === suggestion.id && (
            <div className="bg-[var(--bg)] border-t border-[var(--border)] p-5 space-y-4 animate-in fade-in duration-200">
              {/* Impact */}
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2">
                  💪 Expected Impact
                </div>
                <div className="text-sm text-[var(--text-main)] font-semibold text-green-600">
                  {suggestion.impact}
                </div>
              </div>

              {/* Code Example */}
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-3">
                  👀 Code Example ({suggestion.codeExample.language})
                </div>

                {/* Problem */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-red-600 mb-2">❌ Current (Problem):</div>
                  <div className="bg-[var(--surface)] border border-red-500/30 rounded-lg p-3 overflow-x-auto">
                    <pre className="text-xs text-[var(--text-main)] font-mono whitespace-pre-wrap break-words">
                      <code>{suggestion.codeExample.problem}</code>
                    </pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(suggestion.codeExample.problem, `${suggestion.id}-problem`)}
                    className="mt-2 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1"
                  >
                    {copiedId === `${suggestion.id}-problem` ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>

                {/* Solution */}
                <div>
                  <div className="text-xs font-semibold text-green-600 mb-2">✅ Improved (Solution):</div>
                  <div className="bg-[var(--surface)] border border-green-500/30 rounded-lg p-3 overflow-x-auto">
                    <pre className="text-xs text-[var(--text-main)] font-mono whitespace-pre-wrap break-words">
                      <code>{suggestion.codeExample.solution}</code>
                    </pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(suggestion.codeExample.solution, `${suggestion.id}-solution`)}
                    className="mt-2 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1"
                  >
                    {copiedId === `${suggestion.id}-solution` ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
                <a
                  href="https://github.com/new"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 px-3 py-2 bg-[var(--accent)] text-white rounded-lg text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors text-center"
                >
                  Create Issue →
                </a>
                <button
                  onClick={() => setExpandedId(null)}
                  className="flex-1 px-3 py-2 bg-[var(--border)] text-[var(--text-muted)] rounded-lg text-xs font-semibold hover:bg-[var(--border-hover)] transition-colors"
                >
                  Collapse
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-[var(--text-main)] mb-1">Smart Suggestion Tips</div>
            <ul className="text-xs text-[var(--text-muted)] space-y-1">
              <li>• Click on any suggestion to see code examples</li>
              <li>• Copy code snippets with one click</li>
              <li>• Create GitHub issues to track improvements</li>
              <li>• Implement high-priority items first for maximum impact</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
