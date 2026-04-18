import React, { useState } from "react";
import { X, Plus, AlertCircle, Check } from "lucide-react";
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
  const [repo1Input, setRepo1Input] = useState("");
  const [repo2Input, setRepo2Input] = useState("");
  const [repo1, setRepo1] = useState<ComparisonRepo | null>(null);
  const [repo2, setRepo2] = useState<ComparisonRepo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parseRepository = async (input: string): Promise<ComparisonRepo | null> => {
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

    return { info, languages, analysis };
  };

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repo1Input.trim() || !repo2Input.trim()) return;

    setLoading(true);
    setError("");
    setRepo1(null);
    setRepo2(null);

    try {
      const [repoA, repoB] = await Promise.all([
        parseRepository(repo1Input),
        parseRepository(repo2Input),
      ]);

      setRepo1(repoA);
      setRepo2(repoB);
    } catch (err: any) {
      setError(err.message || "Failed to compare repositories");
    } finally {
      setLoading(false);
    }
  };

  const resetComparison = () => {
    setRepo1(null);
    setRepo2(null);
    setRepo1Input("");
    setRepo2Input("");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl w-full max-w-6xl max-h-[90vh] overflow-auto flex flex-col">
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
          {/* Input Form */}
          <form onSubmit={handleCompare} className="mb-8">
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-main)] mb-2">
                Compare Two Repositories
              </label>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Enter repository names or GitHub URLs to compare code quality. Great for comparing assignments!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2 block">
                  Repository 1
                </label>
                <input
                  type="text"
                  value={repo1Input}
                  onChange={(e) => setRepo1Input(e.target.value)}
                  placeholder="e.g., friend1/assignment"
                  className="w-full px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none text-sm"
                />
                {repo1 && (
                  <div className="mt-2 text-xs text-[var(--success)] flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Loaded: {repo1.info.full_name}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2 block">
                  Repository 2
                </label>
                <input
                  type="text"
                  value={repo2Input}
                  onChange={(e) => setRepo2Input(e.target.value)}
                  placeholder="e.g., friend2/assignment"
                  className="w-full px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none text-sm"
                />
                {repo2 && (
                  <div className="mt-2 text-xs text-[var(--success)] flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Loaded: {repo2.info.full_name}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[var(--accent)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Comparing...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Compare
                  </>
                )}
              </button>
              {(repo1 || repo2) && (
                <button
                  type="button"
                  onClick={resetComparison}
                  className="px-6 py-2.5 bg-[var(--border)] text-[var(--text-main)] text-sm font-semibold rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </form>

          {/* Comparison Results */}
          {repo1 && repo2 && (
            <div className="space-y-6">
              {/* Winner Badge */}
              <div className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent border border-[var(--accent)]/30 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-[var(--text-main)] mb-4">🏆 Comparison Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-[var(--surface)] rounded-lg">
                    <div className="text-[var(--text-muted)] text-xs mb-1">Most Popular</div>
                    <div className="font-bold text-[var(--accent)]">
                      {repo1.info.stargazers_count > repo2.info.stargazers_count
                        ? repo1.info.owner.login
                        : repo2.info.owner.login}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      ⭐ {Math.max(repo1.info.stargazers_count, repo2.info.stargazers_count).toLocaleString()} stars
                    </div>
                  </div>
                  <div className="p-3 bg-[var(--surface)] rounded-lg">
                    <div className="text-[var(--text-muted)] text-xs mb-1">Better Code Quality</div>
                    <div className="font-bold text-[var(--accent)]">
                      {repo1.analysis.complexityScores.readability > repo2.analysis.complexityScores.readability
                        ? repo1.info.owner.login
                        : repo2.info.owner.login}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      🎯 {Math.max(repo1.analysis.complexityScores.readability, repo2.analysis.complexityScores.readability)}/10
                    </div>
                  </div>
                  <div className="p-3 bg-[var(--surface)] rounded-lg">
                    <div className="text-[var(--text-muted)] text-xs mb-1">Better Modularity</div>
                    <div className="font-bold text-[var(--accent)]">
                      {repo1.analysis.complexityScores.modularity > repo2.analysis.complexityScores.modularity
                        ? repo1.info.owner.login
                        : repo2.info.owner.login}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      🏗️ {Math.max(repo1.analysis.complexityScores.modularity, repo2.analysis.complexityScores.modularity)}/10
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-3 px-4 font-semibold text-[var(--text-muted)]">Metric</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--text-main)]">
                        <div className="flex items-center gap-2">
                          <img
                            src={repo1.info.owner.avatar_url}
                            alt={repo1.info.owner.login}
                            className="w-6 h-6 rounded-full"
                          />
                          <div>
                            <div className="font-semibold">{repo1.info.owner.login}/{repo1.info.name}</div>
                            <div className="text-xs text-[var(--text-muted)]">{Object.keys(repo1.languages)[0] || "Mixed"}</div>
                          </div>
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--text-main)]">
                        <div className="flex items-center gap-2">
                          <img
                            src={repo2.info.owner.avatar_url}
                            alt={repo2.info.owner.login}
                            className="w-6 h-6 rounded-full"
                          />
                          <div>
                            <div className="font-semibold">{repo2.info.owner.login}/{repo2.info.name}</div>
                            <div className="text-xs text-[var(--text-muted)]">{Object.keys(repo2.languages)[0] || "Mixed"}</div>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Basic Stats */}
                    <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                      <td colSpan={3} className="py-2 px-4 font-semibold text-[var(--text-muted)] text-xs uppercase">
                        Popularity Metrics
                      </td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-3 px-4 font-semibold text-[var(--text-muted)]">⭐ Stars</td>
                      <td className={cn("py-3 px-4", repo1.info.stargazers_count >= repo2.info.stargazers_count ? "bg-[var(--accent)]/10" : "")}>
                        <div className="font-bold text-[var(--text-main)]">{repo1.info.stargazers_count.toLocaleString()}</div>
                      </td>
                      <td className={cn("py-3 px-4", repo2.info.stargazers_count >= repo1.info.stargazers_count ? "bg-[var(--accent)]/10" : "")}>
                        <div className="font-bold text-[var(--text-main)]">{repo2.info.stargazers_count.toLocaleString()}</div>
                      </td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-3 px-4 font-semibold text-[var(--text-muted)]">🔀 Forks</td>
                      <td className={cn("py-3 px-4", repo1.info.forks_count >= repo2.info.forks_count ? "bg-[var(--accent)]/10" : "")}>
                        <div className="font-bold text-[var(--text-main)]">{repo1.info.forks_count.toLocaleString()}</div>
                      </td>
                      <td className={cn("py-3 px-4", repo2.info.forks_count >= repo1.info.forks_count ? "bg-[var(--accent)]/10" : "")}>
                        <div className="font-bold text-[var(--text-main)]">{repo2.info.forks_count.toLocaleString()}</div>
                      </td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-3 px-4 font-semibold text-[var(--text-muted)]">👁️ Watchers</td>
                      <td className={cn("py-3 px-4", repo1.info.watchers_count >= repo2.info.watchers_count ? "bg-[var(--accent)]/10" : "")}>
                        <div className="font-bold text-[var(--text-main)]">{repo1.info.watchers_count.toLocaleString()}</div>
                      </td>
                      <td className={cn("py-3 px-4", repo2.info.watchers_count >= repo1.info.watchers_count ? "bg-[var(--accent)]/10" : "")}>
                        <div className="font-bold text-[var(--text-main)]">{repo2.info.watchers_count.toLocaleString()}</div>
                      </td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-3 px-4 font-semibold text-[var(--text-muted)]">📋 Open Issues</td>
                      <td className={cn("py-3 px-4", repo1.info.open_issues_count <= repo2.info.open_issues_count ? "bg-[var(--success)]/10" : "")}>
                        <div className="font-bold text-[var(--text-main)]">{repo1.info.open_issues_count}</div>
                      </td>
                      <td className={cn("py-3 px-4", repo2.info.open_issues_count <= repo1.info.open_issues_count ? "bg-[var(--success)]/10" : "")}>
                        <div className="font-bold text-[var(--text-main)]">{repo2.info.open_issues_count}</div>
                      </td>
                    </tr>

                    {/* Code Quality */}
                    <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                      <td colSpan={3} className="py-2 px-4 font-semibold text-[var(--text-muted)] text-xs uppercase">
                        Code Quality Metrics
                      </td>
                    </tr>
                    {renderScoreRow("🎯 Readability", repo1.analysis.complexityScores.readability, repo2.analysis.complexityScores.readability)}
                    {renderScoreRow("🏗️ Modularity", repo1.analysis.complexityScores.modularity, repo2.analysis.complexityScores.modularity)}
                    {renderScoreRow("🧪 Testability", repo1.analysis.complexityScores.testability, repo2.analysis.complexityScores.testability)}
                    {renderScoreRow("📚 Documentation", repo1.analysis.complexityScores.documentation, repo2.analysis.complexityScores.documentation)}
                    {renderScoreRow("🏛️ Architecture", repo1.analysis.complexityScores.architecture, repo2.analysis.complexityScores.architecture)}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!repo1 && !repo2 && !loading && (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <p className="text-sm">Enter two repository names or URLs above and click "Compare" to get started</p>
              <p className="text-xs mt-2 opacity-60">Perfect for comparing assignments between friends!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderScoreRow(label: string, score1: number, score2: number) {
  return (
    <tr key={label} className="border-b border-[var(--border)]">
      <td className="py-3 px-4 font-semibold text-[var(--text-muted)]">{label}</td>
      <td className={cn("py-3 px-4", score1 >= score2 ? "bg-[var(--accent)]/10" : "")}>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)]"
              style={{ width: `${(score1 / 10) * 100}%` }}
            />
          </div>
          <span className="font-bold text-[var(--text-main)] w-12">{score1}/10</span>
        </div>
      </td>
      <td className={cn("py-3 px-4", score2 >= score1 ? "bg-[var(--accent)]/10" : "")}>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)]"
              style={{ width: `${(score2 / 10) * 100}%` }}
            />
          </div>
          <span className="font-bold text-[var(--text-main)] w-12">{score2}/10</span>
        </div>
      </td>
    </tr>
  );
}
