import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { fetchRepoInfo, fetchRepoLanguages, RepoInfo } from "../services/github";
import { analyzeRepo, RepoAnalysis } from "../services/gemini";
import { fetchReadme } from "../services/github";
import { cn } from "../lib/utils";

interface ComparisonRepo {
  info: RepoInfo;
  languages: Record<string, number>;
  analysis: RepoAnalysis;
}

interface RepositoryComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RepositoryComparison({ isOpen, onClose }: RepositoryComparisonProps) {
  const [repos, setRepos] = useState<ComparisonRepo[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addRepository = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || repos.length >= 3) return;

    setLoading(true);
    setError("");

    try {
      const cleanUrl = input.trim().replace(/\/$/, "");
      let owner = "";
      let repo = "";

      if (cleanUrl.includes("github.com/")) {
        const parts = cleanUrl.split("github.com/")[1].split("/");
        owner = parts[0];
        repo = parts[1];
      } else if (cleanUrl.includes("/")) {
        const parts = cleanUrl.split("/");
        owner = parts[0];
        repo = parts[1];
      } else {
        throw new Error("Invalid format. Use owner/repo or a GitHub URL.");
      }

      const info = await fetchRepoInfo(owner, repo);
      const languages = await fetchRepoLanguages(owner, repo);
      const readme = await fetchReadme(owner, repo);
      const analysis = await analyzeRepo(info.description, languages, readme);

      setRepos((prev) => [...prev, { info, languages, analysis }]);
      setInput("");
    } catch (err: any) {
      setError(err.message || "Failed to add repository");
    } finally {
      setLoading(false);
    }
  };

  const removeRepository = (index: number) => {
    setRepos((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl w-full max-w-5xl max-h-[90vh] overflow-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)] sticky top-0 bg-[var(--surface)]">
          <h2 className="text-xl font-semibold text-[var(--text-main)]">Compare Repositories</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Add Repository Form */}
          {repos.length < 3 && (
            <form onSubmit={addRepository} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g., facebook/react or https://github.com/facebook/react"
                  className="flex-1 px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={loading || repos.length >= 3}
                  className="px-4 py-2.5 bg-[var(--accent)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-500 mt-2">{error}</p>
              )}
            </form>
          )}

          {/* Comparison Table */}
          {repos.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-4 font-semibold text-[var(--text-muted)]">Metric</th>
                    {repos.map((r, i) => (
                      <th key={i} className="text-left py-3 px-4 font-semibold text-[var(--text-main)]">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold">{r.info.owner.login}/{r.info.name}</div>
                            <div className="text-xs text-[var(--text-muted)]">{r.info.language || "Mixed"}</div>
                          </div>
                          <button
                            onClick={() => removeRepository(i)}
                            className="p-1 rounded hover:bg-[var(--surface-hover)]"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 px-4 font-semibold text-[var(--text-muted)]">Stars</td>
                    {repos.map((r, i) => (
                      <td key={i} className="py-3 px-4 text-[var(--text-main)]">
                        {r.info.stargazers_count.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 px-4 font-semibold text-[var(--text-muted)]">Forks</td>
                    {repos.map((r, i) => (
                      <td key={i} className="py-3 px-4 text-[var(--text-main)]">
                        {r.info.forks_count.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 px-4 font-semibold text-[var(--text-muted)]">Watchers</td>
                    {repos.map((r, i) => (
                      <td key={i} className="py-3 px-4 text-[var(--text-main)]">
                        {r.info.watchers_count.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 px-4 font-semibold text-[var(--text-muted)]">Open Issues</td>
                    {repos.map((r, i) => (
                      <td key={i} className="py-3 px-4 text-[var(--text-main)]">
                        {r.info.open_issues_count}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 px-4 font-semibold text-[var(--text-muted)]">Readability</td>
                    {repos.map((r, i) => (
                      <td key={i} className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--accent)]"
                              style={{ width: `${(r.analysis.complexityScores.readability / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-[var(--text-main)]">{r.analysis.complexityScores.readability}/10</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 px-4 font-semibold text-[var(--text-muted)]">Modularity</td>
                    {repos.map((r, i) => (
                      <td key={i} className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--accent)]"
                              style={{ width: `${(r.analysis.complexityScores.modularity / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-[var(--text-main)]">{r.analysis.complexityScores.modularity}/10</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 px-4 font-semibold text-[var(--text-muted)]">Testability</td>
                    {repos.map((r, i) => (
                      <td key={i} className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--accent)]"
                              style={{ width: `${(r.analysis.complexityScores.testability / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-[var(--text-main)]">{r.analysis.complexityScores.testability}/10</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[var(--text-muted)]">Documentation</td>
                    {repos.map((r, i) => (
                      <td key={i} className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--accent)]"
                              style={{ width: `${(r.analysis.complexityScores.documentation / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-[var(--text-main)]">{r.analysis.complexityScores.documentation}/10</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {repos.length === 0 && (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <p className="text-sm">Add repositories to compare</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
