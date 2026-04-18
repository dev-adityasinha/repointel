import React, { useState } from "react";
import { X, Plus, AlertCircle, Check, Trash2 } from "lucide-react";
import { fetchRepoInfo, fetchRepoLanguages, RepoInfo } from "../services/github";
import { analyzeRepo, RepoAnalysis } from "../services/gemini";
import { fetchReadme } from "../services/github";
import { cn } from "../lib/utils";

interface ComparisonRepo {
  info: RepoInfo;
  languages: Record<string, number>;
  analysis: RepoAnalysis;
  rating?: number;
}

interface RepositoryComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RepositoryComparison({ isOpen, onClose }: RepositoryComparisonProps) {
  const [repoInputs, setRepoInputs] = useState<string[]>(["", ""]);
  const [repos, setRepos] = useState<(ComparisonRepo | null)[]>([null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parseRepository = async (input: string): Promise<ComparisonRepo | null> => {
    const cleanUrl = input.trim().replace(/\/$/, "").replace(/\.git$/, "");
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
    const validInputs = repoInputs.filter(input => input.trim());
    if (validInputs.length < 2) return;

    setLoading(true);
    setError("");
    setRepos(repoInputs.map(() => null));

    try {
      const results = await Promise.all(
        repoInputs.map(input => input.trim() ? parseRepository(input) : null)
      );
      setRepos(results);
    } catch (err: any) {
      setError(err.message || "Failed to compare repositories");
    } finally {
      setLoading(false);
    }
  };

  const addRepository = () => {
    setRepoInputs([...repoInputs, ""]);
    setRepos([...repos, null]);
  };

  const removeRepository = (index: number) => {
    if (repoInputs.length > 2) {
      setRepoInputs(repoInputs.filter((_, i) => i !== index));
      setRepos(repos.filter((_, i) => i !== index));
    }
  };

  const updateRepoInput = (index: number, value: string) => {
    const newInputs = [...repoInputs];
    newInputs[index] = value;
    setRepoInputs(newInputs);
  };

  const resetComparison = () => {
    setRepoInputs(["", ""]);
    setRepos([null, null]);
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[var(--text-main)]">
                  Compare Repositories ({repoInputs.length})
                </label>
                {repoInputs.length < 5 && (
                  <button
                    type="button"
                    onClick={addRepository}
                    className="px-3 py-1 text-xs bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Repository
                  </button>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Enter repository names or GitHub URLs to compare code quality. You can compare up to 5 repositories!
              </p>
            </div>

            <div className="space-y-3 mb-4">
              {repoInputs.map((input, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2 block">
                      Repository {index + 1}
                    </label>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => updateRepoInput(index, e.target.value)}
                      placeholder="e.g., friend1/assignment or https://github.com/friend1/assignment"
                      className="w-full px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none text-sm"
                    />
                    {repos[index] && (
                      <div className="mt-2 text-xs text-[var(--success)] flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Loaded: {repos[index]!.info.owner.login}/{repos[index]!.info.name}
                      </div>
                    )}
                  </div>
                  {repoInputs.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeRepository(index)}
                      className="mt-7 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove this repository"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
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
                disabled={loading || repoInputs.filter(i => i.trim()).length < 2}
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
              {repos.some(r => r) && (
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
          {repos.every(r => r !== null) && repos.length > 0 && (() => {
            const loadedRepos = repos.filter((r): r is ComparisonRepo => r !== null);
            
            // Calculate rankings based on overall quality
            const rankedRepos = [...loadedRepos]
              .map((repo, idx) => ({
                repo,
                score: calculateOverallQuality(repo.analysis),
                originalIndex: idx
              }))
              .sort((a, b) => b.score - a.score);

            return (
              <div className="space-y-6">
                {/* Overall Rankings Section - Only show for 3+ repositories */}
                {loadedRepos.length > 2 && (
                  <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-[var(--text-main)] mb-4">🎖️ Overall Rankings</h3>
                    <div className="grid gap-3">
                      {rankedRepos.map((item, rank) => {
                        const medalEmoji = rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `#${rank + 1}`;
                        return (
                          <div
                            key={item.originalIndex}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-lg border-2",
                              rank === 0
                                ? "bg-yellow-500/10 border-yellow-500"
                                : rank === 1
                                ? "bg-gray-300/10 border-gray-400"
                                : rank === 2
                                ? "bg-orange-500/10 border-orange-500"
                                : "bg-[var(--surface)] border-[var(--border)]"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-3xl font-bold">{medalEmoji}</span>
                              <div>
                                <div className="font-bold text-[var(--text-main)]">
                                  {rank === 0 ? "1st Place" : rank === 1 ? "2nd Place" : rank === 2 ? "3rd Place" : `${rank + 1}th Place`}
                                </div>
                                <div className="text-sm text-[var(--text-muted)]">
                                  {item.repo.info.owner.login}/{item.repo.info.name}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[var(--accent)]">{item.score}</div>
                              <div className="text-xs text-[var(--text-muted)]">/ 10</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Winner Badge - Code Quality Focused */}
                <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-[var(--text-main)] mb-4">🏆 Code Quality Winners</h3>
                  <div className={cn("grid gap-4 text-sm", loadedRepos.length <= 2 ? "grid-cols-1 md:grid-cols-4" : "grid-cols-2 md:grid-cols-4")}>
                    {/* Best Overall Code */}
                    {(() => {
                      const topRepo = loadedRepos.reduce((top, current) => 
                        calculateOverallQuality(current.analysis) > calculateOverallQuality(top.analysis) ? current : top
                      );
                      return (
                        <div className="p-3 bg-[var(--surface)] rounded-lg border-2 border-yellow-500">
                          <div className="text-[var(--text-muted)] text-xs mb-1">🎯 Best Overall Code</div>
                          <div className="font-bold text-[var(--accent)]">{topRepo.info.owner.login}</div>
                          <div className="text-xs text-[var(--text-muted)] mt-1">{calculateOverallQuality(topRepo.analysis)}/10</div>
                        </div>
                      );
                    })()}
                    {/* Best Architecture */}
                    {(() => {
                      const topRepo = loadedRepos.reduce((top, current) => 
                        current.analysis.complexityScores.architecture > top.analysis.complexityScores.architecture ? current : top
                      );
                      return (
                        <div className="p-3 bg-[var(--surface)] rounded-lg">
                          <div className="text-[var(--text-muted)] text-xs mb-1">🏛️ Best Architecture</div>
                          <div className="font-bold text-[var(--accent)]">{topRepo.info.owner.login}</div>
                          <div className="text-xs text-[var(--text-muted)] mt-1">{topRepo.analysis.complexityScores.architecture}/10</div>
                        </div>
                      );
                    })()}
                    {/* Best Logic/Modularity */}
                    {(() => {
                      const topRepo = loadedRepos.reduce((top, current) => 
                        current.analysis.complexityScores.modularity > top.analysis.complexityScores.modularity ? current : top
                      );
                      return (
                        <div className="p-3 bg-[var(--surface)] rounded-lg">
                          <div className="text-[var(--text-muted)] text-xs mb-1">🧩 Best Logic Structure</div>
                          <div className="font-bold text-[var(--accent)]">{topRepo.info.owner.login}</div>
                          <div className="text-xs text-[var(--text-muted)] mt-1">{topRepo.analysis.complexityScores.modularity}/10</div>
                        </div>
                      );
                    })()}
                    {/* Most Testable */}
                    {(() => {
                      const topRepo = loadedRepos.reduce((top, current) => 
                        current.analysis.complexityScores.testability > top.analysis.complexityScores.testability ? current : top
                      );
                      return (
                        <div className="p-3 bg-[var(--surface)] rounded-lg">
                          <div className="text-[var(--text-muted)] text-xs mb-1">🧪 Most Testable</div>
                          <div className="font-bold text-[var(--accent)]">{topRepo.info.owner.login}</div>
                          <div className="text-xs text-[var(--text-muted)] mt-1">{topRepo.analysis.complexityScores.testability}/10</div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                {/* Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-4 font-semibold text-[var(--text-muted)] sticky left-0 bg-[var(--surface)] z-10">Metric</th>
                        {loadedRepos.map((repo, idx) => (
                          <th key={idx} className="text-left py-3 px-4 font-semibold text-[var(--text-main)]">
                            <div className="flex items-center gap-2">
                              <img src={repo.info.owner.avatar_url} alt={repo.info.owner.login} className="w-6 h-6 rounded-full" />
                              <div>
                                <div className="font-semibold text-sm">{repo.info.owner.login}/{repo.info.name}</div>
                                <div className="text-xs text-[var(--text-muted)]">{Object.keys(repo.languages)[0] || "Mixed"}</div>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                        <td colSpan={loadedRepos.length + 1} className="py-2 px-4 font-semibold text-[var(--text-muted)] text-xs uppercase">Overall Quality</td>
                      </tr>
                      {renderMultiScoreRowWithDesc(loadedRepos, "📊 Overall Code Quality", (r) => calculateOverallQuality(r.analysis), "Composite score of all metrics")}
                      <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                        <td colSpan={loadedRepos.length + 1} className="py-2 px-4 font-semibold text-[var(--text-muted)] text-xs uppercase">Code Techniques & Design</td>
                      </tr>
                      {renderMultiScoreRowWithDesc(loadedRepos, "🎯 Readability", (r) => r.analysis.complexityScores.readability, "How easy the code is to understand")}
                      {renderMultiScoreRowWithDesc(loadedRepos, "🏛️ Architecture", (r) => r.analysis.complexityScores.architecture, "Overall system design quality")}
                      {renderMultiScoreRowWithDesc(loadedRepos, "🧩 Modularity/Logic", (r) => r.analysis.complexityScores.modularity, "Code reusability and separation")}
                      <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                        <td colSpan={loadedRepos.length + 1} className="py-2 px-4 font-semibold text-[var(--text-muted)] text-xs uppercase">Testing & Reliability</td>
                      </tr>
                      {renderMultiScoreRowWithDesc(loadedRepos, "🧪 Testability", (r) => r.analysis.complexityScores.testability, "How well the code can be tested")}
                      <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                        <td colSpan={loadedRepos.length + 1} className="py-2 px-4 font-semibold text-[var(--text-muted)] text-xs uppercase">Documentation & Maintenance</td>
                      </tr>
                      {renderMultiScoreRowWithDesc(loadedRepos, "📚 Documentation", (r) => r.analysis.complexityScores.documentation, "Code comments and docs quality")}
                    </tbody>
                  </table>
                </div>
                {/* Strengths Grid */}
                <div className={cn("grid gap-6 mt-8", loadedRepos.length === 2 ? "grid-cols-1 md:grid-cols-2" : loadedRepos.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-4")}>
                  {loadedRepos.map((repo, idx) => (
                    <div key={idx} className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4">
                      <h4 className="font-bold text-[var(--text-main)] mb-3 break-words text-sm">{repo.info.owner.login}'s Strengths</h4>
                      <ul className="space-y-2">
                        {repo.analysis.strengths.map((strength, i) => (
                          <li key={i} className="text-xs text-[var(--text-main)] flex items-start gap-2">
                            <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {/* Improvements Grid */}
                <div className={cn("grid gap-6", loadedRepos.length === 2 ? "grid-cols-1 md:grid-cols-2" : loadedRepos.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-4")}>
                  {loadedRepos.map((repo, idx) => (
                    <div key={idx} className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4">
                      <h4 className="font-bold text-[var(--text-main)] mb-3 break-words text-sm">{repo.info.owner.login}'s Areas to Improve</h4>
                      <ul className="space-y-2">
                        {repo.analysis.weaknesses.map((weakness, i) => (
                          <li key={i} className="text-xs text-[var(--text-main)] flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5 flex-shrink-0">→</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {!repos.every(r => r !== null) && !loading && repos.every(r => r === null) && (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <p className="text-sm">Enter repository names or URLs above and click "Compare" to get started</p>
              <p className="text-xs mt-2 opacity-60">Perfect for comparing assignments between friends! You can compare up to 5 repositories.</p>
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

function renderMultiScoreRowWithDesc(
  repos: ComparisonRepo[],
  label: string,
  scoreExtractor: (repo: ComparisonRepo) => number,
  description: string
) {
  const scores = repos.map(scoreExtractor);
  const maxScore = Math.max(...scores);

  return (
    <tr key={label} className="border-b border-[var(--border)]">
      <td className="py-3 px-4 sticky left-0 bg-[var(--surface)] z-10">
        <div>
          <div className="font-semibold text-[var(--text-muted)]">{label}</div>
          <div className="text-xs text-[var(--text-muted)] opacity-70 mt-1">{description}</div>
        </div>
      </td>
      {repos.map((repo, idx) => {
        const score = scores[idx];
        const isMax = score === maxScore;
        return (
          <td key={idx} className={cn("py-3 px-4", isMax ? "bg-green-500/10 border-l-4 border-green-500" : "")}>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)]"
                  style={{ width: `${(score / 10) * 100}%` }}
                />
              </div>
              <span className="font-bold text-[var(--text-main)] w-12">{score}/10</span>
            </div>
          </td>
        );
      })}
    </tr>
  );
}

function renderScoreRowWithDesc(label: string, score1: number, score2: number, description: string) {
  return (
    <tr key={label} className="border-b border-[var(--border)]">
      <td className="py-3 px-4">
        <div>
          <div className="font-semibold text-[var(--text-muted)]">{label}</div>
          <div className="text-xs text-[var(--text-muted)] opacity-70 mt-1">{description}</div>
        </div>
      </td>
      <td className={cn("py-3 px-4", score1 >= score2 ? "bg-green-500/10 border-l-4 border-green-500" : "")}>
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
      <td className={cn("py-3 px-4", score2 >= score1 ? "bg-green-500/10 border-l-4 border-green-500" : "")}>
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

function calculateOverallQuality(analysis: RepoAnalysis): number {
  return Math.round(
    (analysis.complexityScores.readability +
      analysis.complexityScores.modularity +
      analysis.complexityScores.testability +
      analysis.complexityScores.documentation +
      analysis.complexityScores.architecture) /
      5
  );
}
