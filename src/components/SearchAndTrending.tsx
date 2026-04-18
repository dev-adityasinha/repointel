import React, { useState, useEffect } from "react";
import { Search, TrendingUp, Download, Copy, Check } from "lucide-react";
import { searchRepositories, searchTrendingRepos, POPULAR_LANGUAGES, SearchResult } from "../services/search";
import { cn } from "../lib/utils";

interface SearchAndTrendingProps {
  onSelectRepo: (owner: string, repo: string) => void;
}

export default function SearchAndTrending({ onSelectRepo }: SearchAndTrendingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTrending, setShowTrending] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    if (showTrending) {
      loadTrendingRepos();
    }
  }, [selectedLanguage, showTrending]);

  const loadTrendingRepos = async () => {
    setLoading(true);
    try {
      const data = await searchTrendingRepos(selectedLanguage || undefined);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setShowTrending(false);
    try {
      const data = await searchRepositories(searchQuery);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRepo = (result: SearchResult) => {
    const parts = result.full_name.split("/");
    onSelectRepo(parts[0], parts[1]);
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repositories..."
              className="w-full pl-9 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[var(--accent)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Language Filter */}
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-3">
          {showTrending ? (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending by Language
            </div>
          ) : (
            "Search Results"
          )}
        </div>
        {showTrending && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLanguage("")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2",
                selectedLanguage === ""
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] hover:border-[var(--accent)]"
              )}
            >
              All Languages
            </button>
            {POPULAR_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2",
                  selectedLanguage === lang
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] hover:border-[var(--accent)]"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {results.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <p className="text-sm">No repositories found</p>
            </div>
          ) : (
            results.map((repo) => (
              <div
                key={repo.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <img
                      src={repo.owner.avatar_url}
                      alt={repo.owner.login}
                      className="w-10 h-10 rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[var(--text-main)] truncate">
                        {repo.full_name}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                        {repo.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectRepo(repo)}
                    className="px-3 py-1.5 bg-[var(--accent)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--accent-hover)] transition-colors whitespace-nowrap"
                  >
                    Analyze
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 flex-wrap text-xs">
                  <div className="flex gap-4">
                    {repo.language && (
                      <span className="text-[var(--text-muted)]">
                        <strong className="text-[var(--text-main)]">{repo.language}</strong>
                      </span>
                    )}
                    <span className="text-[var(--text-muted)]">
                      ⭐ <strong className="text-[var(--text-main)]">{repo.stargazers_count.toLocaleString()}</strong>
                    </span>
                    <span className="text-[var(--text-muted)]">
                      🔀 <strong className="text-[var(--text-main)]">{repo.forks_count.toLocaleString()}</strong>
                    </span>
                    <span className="text-[var(--text-muted)]">
                      📋 <strong className="text-[var(--text-main)]">{repo.open_issues_count}</strong> issues
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(repo.full_name, repo.id)}
                    className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                  >
                    {copiedId === repo.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
