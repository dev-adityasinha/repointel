import React, { useState, useEffect } from "react";
import { Search, Github, Activity, FileText, AlertCircle, CheckCircle2, XCircle, Star, GitFork, Eye, ExternalLink, Sun, Moon, MessageCircle, Download, GitCompare, TrendingUp } from "lucide-react";
import { fetchRepoInfo, fetchRepoLanguages, fetchRepoContents, fetchReadme, fetchIssues, RepoInfo, Issue } from "./services/github";
import { analyzeRepo, RepoAnalysis } from "./services/gemini";
import { exportAnalysisToPDF } from "./services/pdf";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { cn } from "./lib/utils";
import Chatbot from "./components/Chatbot";
import RepositoryComparison from "./components/RepositoryComparison";
import SearchAndTrending from "./components/SearchAndTrending";

interface AppData {
  info: RepoInfo;
  languages: Record<string, number>;
  contents: string[];
  issues: Issue[];
  analysis: RepoAnalysis;
}

export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    
    setLoading(true);
    setError("");
    setData(null);

    try {
      let owner = "";
      let repo = "";
      const cleanUrl = repoUrl.trim().replace(/\/$/, "");
      
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

      if (!owner || !repo) throw new Error("Could not parse owner and repository name.");

      const info = await fetchRepoInfo(owner, repo);
      const languages = await fetchRepoLanguages(owner, repo);
      const contents = await fetchRepoContents(owner, repo);
      const readme = await fetchReadme(owner, repo);
      const issues = await fetchIssues(owner, repo);
      const analysis = await analyzeRepo(info.description, languages, readme);

      setData({ info, languages, contents, issues, analysis });
      setActiveTab("Overview");
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchRepoSelect = (owner: string, repo: string) => {
    setRepoUrl(`${owner}/${repo}`);
    setSearchOpen(false);
  };

  const handleExportPDF = async () => {
    if (!data) return;
    setPdfLoading(true);
    try {
      const exportElement = document.getElementById("export-content");
      if (exportElement) {
        await exportAnalysisToPDF("export-content", `${data.info.owner.login}_${data.info.name}`, data.analysis);
      }
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to export PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const tabs = ["Overview", "Code Analysis", "Maintainability", "Issue Tracker", "Settings"];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] font-sans flex transition-colors duration-200">
      <aside className="w-[260px] bg-[var(--surface)] border-r border-[var(--border)] py-8 px-6 flex-col hidden md:flex shrink-0 sticky top-0 h-screen transition-colors duration-200">
        <div className="font-bold text-xl tracking-tight mb-10 flex items-center gap-2">
          <Github className="w-6 h-6" />
          RepoIntel.
        </div>
        <ul className="space-y-2">
          {tabs.map(tab => (
            <li
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors",
                activeTab === tab
                  ? "bg-[var(--surface-active)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
              )}
            >
              {tab}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between">
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)] transition-colors">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-10 py-8 flex flex-col md:flex-row gitmd:items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:hidden">
            <Github className="w-6 h-6" />
            <span className="font-bold text-xl">RepoIntel.</span>
          </div>
          
          <div className="flex items-center gap-3 flex-1">
            <form onSubmit={handleAnalyze} className="flex-1 max-w-2xl flex gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="e.g., facebook/react or https://github.com/facebook/react"
                  className="w-full pl-9 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all outline-none text-sm text-[var(--text-main)]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[var(--accent)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {loading ? "Scanning..." : "Re-Scan Repository"}
              </button>
            </form>
            <button
              onClick={() => setSearchOpen(true)}
              title="Search & Trending"
              className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] transition-all"
            >
              <TrendingUp className="w-6 h-6" />
            </button>
            <button
              onClick={() => setComparisonOpen(true)}
              title="Compare Repositories"
              className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] transition-all"
            >
              <GitCompare className="w-6 h-6" />
            </button>
            <button
              onClick={handleExportPDF}
              title="Export to PDF"
              disabled={!data || pdfLoading}
              className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Download className="w-6 h-6" />
            </button>
            <button
              onClick={() => setChatbotOpen(!chatbotOpen)}
              title="Chat with AI"
              disabled={!data}
              className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="px-10 pb-10 flex-1 flex flex-col">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2 mb-6 text-sm">
              <AlertCircle className="w-4 h-4" />
              <p>{error}</p>
            </div>
          )}

          {!data && !loading && !error && activeTab !== "Settings" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--surface)] border border-[var(--border)] mb-4 shadow-sm">
                <Activity className="w-6 h-6 text-[var(--text-muted)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-main)] mb-2">Analyze any GitHub Repository</h2>
              <p className="text-[var(--text-muted)] text-sm max-w-md mx-auto">
                Enter a repository URL to get AI-powered insights on code quality, complexity, recommended files, and issue distribution.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin"></div>
              <p className="text-[var(--text-muted)] text-sm font-medium animate-pulse">Analyzing repository with Gemini AI...</p>
            </div>
          )}

          {data && activeTab !== "Settings" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              {/* Hidden export content for PDF */}
              <div
                id="export-content"
                style={{ display: "none" }}
                className="bg-white p-8 text-black"
              >
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2">Repository Analysis Report</h1>
                  <p className="text-gray-600">{data.info.owner.login}/{data.info.name}</p>
                  <p className="text-gray-500 text-sm">{new Date().toLocaleDateString()}</p>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2">Summary</h2>
                  <p className="text-gray-700">{data.analysis.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-bold mb-3">Strengths</h3>
                    <ul className="space-y-2">
                      {data.analysis.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-gray-700">• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-3">Areas for Improvement</h3>
                    <ul className="space-y-2">
                      {data.analysis.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm text-gray-700">• {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-3">Metrics</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">Stars</td>
                        <td className="py-2 font-bold">{data.info.stargazers_count.toLocaleString()}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Forks</td>
                        <td className="py-2 font-bold">{data.info.forks_count.toLocaleString()}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Open Issues</td>
                        <td className="py-2 font-bold">{data.info.open_issues_count}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Readability</td>
                        <td className="py-2 font-bold">{data.analysis.complexityScores.readability}/10</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Modularity</td>
                        <td className="py-2 font-bold">{data.analysis.complexityScores.modularity}/10</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Testability</td>
                        <td className="py-2 font-bold">{data.analysis.complexityScores.testability}/10</td>
                      </tr>
                      <tr>
                        <td className="py-2">Documentation</td>
                        <td className="py-2 font-bold">{data.analysis.complexityScores.documentation}/10</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-2">
                <img src={data.info.owner.avatar_url} alt={data.info.owner.login} className="w-12 h-12 rounded-lg border border-[var(--border)]" />
                <div>
                  <h1 className="text-2xl font-semibold text-[var(--text-main)] flex items-center gap-2">
                    {data.info.owner.login}/{data.info.name}
                    <a href={`https://github.com/${data.info.owner.login}/${data.info.name}`} target="_blank" rel="noreferrer" className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </h1>
                  <p className="text-sm text-[var(--text-muted)]">{data.info.description}</p>
                </div>
              </div>

              {activeTab === "Overview" && <OverviewTab data={data} />}
              {activeTab === "Code Analysis" && <CodeAnalysisTab data={data} />}
              {activeTab === "Maintainability" && <MaintainabilityTab data={data} />}
              {activeTab === "Issue Tracker" && <IssueTrackerTab data={data} />}
            </div>
          )}

          {activeTab === "Settings" && <SettingsTab theme={theme} setTheme={setTheme} />}
        </div>

        {chatbotOpen && data && (
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setChatbotOpen(false)} />
        )}

        {chatbotOpen && data && (
          <aside className="fixed top-0 right-0 h-screen w-80 bg-[var(--surface)] border-l border-[var(--border)] z-50 flex flex-col shadow-lg md:w-96 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--text-main)] flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat
              </h2>
              <button
                onClick={() => setChatbotOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <Chatbot data={data} />
            </div>
          </aside>
        )}

        {/* Search & Trending Modal */}
        {searchOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between p-6 border-b border-[var(--border)] sticky top-0 bg-[var(--surface)]">
                <h2 className="text-xl font-semibold text-[var(--text-main)]">Search & Trending</h2>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <SearchAndTrending onSelectRepo={handleSearchRepoSelect} />
              </div>
            </div>
          </div>
        )}

        {/* Repository Comparison Modal */}
        <RepositoryComparison isOpen={comparisonOpen} onClose={() => setComparisonOpen(false)} />
      </main>
    </div>
  );
}

function OverviewTab({ data }: { data: AppData }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard label="Stars" value={data.info.stargazers_count.toLocaleString()} />
        <StatCard label="Forks" value={data.info.forks_count.toLocaleString()} />
        <StatCard label="Watchers" value={data.info.watchers_count.toLocaleString()} />
        <StatCard label="Open Issues" value={data.info.open_issues_count.toLocaleString()} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-4">Repository Summary</div>
          <p className="text-sm text-[var(--text-main)] leading-relaxed">{data.analysis.summary}</p>
        </div>
        <LanguageDistributionChart languages={data.languages} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
      <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2">{label}</div>
      <div className="text-2xl font-bold text-[var(--text-main)]">{value}</div>
    </div>
  );
}

function CodeAnalysisTab({ data }: { data: AppData }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-4">AI Code Quality Analysis</div>
        <p className="text-sm text-[var(--text-main)] leading-relaxed mb-6">{data.analysis.summary}</p>
        
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[var(--success)] font-semibold mb-3 flex items-center gap-2">
              Strengths
            </h4>
            <ul className="space-y-2">
              {data.analysis.strengths.map((s, i) => (
                <li key={i} className="text-sm text-[var(--text-muted)] flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] mt-1.5 shrink-0"></div>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[var(--warning)] font-semibold mb-3 flex items-center gap-2">
              Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {data.analysis.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-[var(--text-muted)] flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] mt-1.5 shrink-0"></div>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function MaintainabilityTab({ data }: { data: AppData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-4">Complexity Radar</div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
              { subject: 'Readability', A: data.analysis.complexityScores.readability, fullMark: 10 },
              { subject: 'Modularity', A: data.analysis.complexityScores.modularity, fullMark: 10 },
              { subject: 'Testability', A: data.analysis.complexityScores.testability, fullMark: 10 },
              { subject: 'Docs', A: data.analysis.complexityScores.documentation, fullMark: 10 },
              { subject: 'Architecture', A: data.analysis.complexityScores.architecture, fullMark: 10 },
            ]}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
              <Radar name="Score" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.4} />
              <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-main)' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <Checklist contents={data.contents} />
    </div>
  );
}

function IssueTrackerTab({ data }: { data: AppData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <IssueSection issues={data.issues} />
      </div>
      <div>
        <IssueDistributionChart issues={data.issues} />
      </div>
    </div>
  );
}

function SettingsTab({ theme, setTheme }: { theme: string, setTheme: (t: "light" | "dark") => void }) {
  return (
    <div className="max-w-2xl animate-in fade-in duration-500">
      <h2 className="text-2xl font-semibold text-[var(--text-main)] mb-6">Settings</h2>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-[var(--text-main)] mb-4">Appearance</h3>
          <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
            <div>
              <div className="text-sm font-medium text-[var(--text-main)]">Theme</div>
              <div className="text-xs text-[var(--text-muted)]">Switch between light and dark mode.</div>
            </div>
            <div className="flex bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1">
              <button 
                onClick={() => setTheme("light")}
                className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2", theme === "light" ? "bg-[var(--surface)] text-[var(--text-main)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)]")}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button 
                onClick={() => setTheme("dark")}
                className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2", theme === "dark" ? "bg-[var(--surface)] text-[var(--text-main)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)]")}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LanguageDistributionChart({ languages }: { languages: Record<string, number> }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
      <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-4">Language Distribution</div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={Object.entries(languages).map(([name, value]) => ({ name, value: Number(value) })).sort((a,b) => b.value - a.value).slice(0, 5)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} width={80} />
            <RechartsTooltip cursor={{fill: 'var(--surface-hover)'}} formatter={(value: any) => typeof value === 'number' ? value.toLocaleString() + ' bytes' : value} contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-main)' }} />
            <Bar dataKey="value" fill="var(--text-main)" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function IssueDistributionChart({ issues }: { issues: Issue[] }) {
  const labelCounts: Record<string, number> = {};
  issues.forEach(issue => {
    if (issue.labels.length === 0) {
      labelCounts["unlabeled"] = (labelCounts["unlabeled"] || 0) + 1;
    } else {
      issue.labels.forEach(label => {
        labelCounts[label.name] = (labelCounts[label.name] || 0) + 1;
      });
    }
  });

  const data = Object.entries(labelCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
      <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-4">Issue Distribution</div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <RechartsTooltip cursor={{fill: 'var(--surface-hover)'}} contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-main)' }} />
            <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Checklist({ contents }: { contents: string[] }) {
  const recommendedFiles = [
    { name: "README.md", desc: "Project documentation", match: (c: string[]) => c.some(f => f.startsWith("readme")) },
    { name: "LICENSE", desc: "Usage rights", match: (c: string[]) => c.some(f => f.startsWith("license")) },
    { name: "CONTRIBUTING.md", desc: "Contribution guidelines", match: (c: string[]) => c.some(f => f.startsWith("contributing")) },
    { name: "CODE_OF_CONDUCT.md", desc: "Community standards", match: (c: string[]) => c.some(f => f.startsWith("code_of_conduct")) },
    { name: ".gitignore", desc: "Ignored files config", match: (c: string[]) => c.includes(".gitignore") },
  ];

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
      <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-4">Repository Health</div>
      <div className="flex flex-col">
        {recommendedFiles.map((file, i) => {
          const exists = file.match(contents);
          return (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-0 text-sm">
              <div className={cn("w-2 h-2 rounded-full shrink-0", exists ? "bg-[var(--success)]" : "bg-[var(--border)]")}></div>
              <span className={cn(exists ? "text-[var(--text-main)]" : "text-[var(--text-muted)]")}>
                {file.name} {exists ? "present" : "missing"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IssueSection({ issues }: { issues: Issue[] }) {
  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());

  // Extract all unique labels with counts
  const labelCounts = new Map<string, { color: string; count: number }>();
  issues.forEach(issue => {
    issue.labels.forEach(label => {
      const current = labelCounts.get(label.name) || { color: label.color, count: 0 };
      labelCounts.set(label.name, { ...current, count: current.count + 1 });
    });
  });

  const sortedLabels = Array.from(labelCounts.entries())
    .sort((a, b) => b[1].count - a[1].count);

  // Filter issues based on selected labels
  const filteredIssues = selectedLabels.size === 0 
    ? issues 
    : issues.filter(issue => 
        issue.labels.some(label => selectedLabels.has(label.name))
      );

  const toggleLabel = (labelName: string) => {
    const newSelected = new Set(selectedLabels);
    if (newSelected.has(labelName)) {
      newSelected.delete(labelName);
    } else {
      newSelected.add(labelName);
    }
    setSelectedLabels(newSelected);
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-4">Issue Explorer</div>
        
        {/* Filter Labels Section */}
        <div className="mb-4">
          <div className="text-xs text-[var(--text-muted)] font-medium mb-2">Filter by label:</div>
          <div className="flex flex-wrap gap-2">
            {sortedLabels.map(([labelName, { color, count }]) => {
              const isSelected = selectedLabels.has(labelName);
              return (
                <button
                  key={labelName}
                  onClick={() => toggleLabel(labelName)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border-2 flex items-center gap-1.5",
                    isSelected 
                      ? "border-[#" + color + "] bg-[#" + color + "20] text-[#" + color + "]" 
                      : "border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"
                  )}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#" + color }}></span>
                  {labelName}
                  <span className="text-xs opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
          
          {/* Clear filters button */}
          {selectedLabels.size > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setSelectedLabels(new Set())}
                className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors"
              >
                Clear all filters
              </button>
              <span className="text-xs text-[var(--text-muted)]">
                ({selectedLabels.size} filter{selectedLabels.size !== 1 ? "s" : ""} applied)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Issues List */}
      <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)] text-sm">
            {selectedLabels.size > 0 
              ? "No issues found matching the selected filter" + (selectedLabels.size > 1 ? "s" : "") + "."
              : "No issues available."}
          </div>
        ) : (
          filteredIssues.map(issue => (
            <a
              key={issue.id}
              href={issue.html_url}
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-[var(--bg)] rounded-lg text-sm block hover:bg-[var(--surface-hover)] transition-colors border border-transparent hover:border-[var(--border)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <strong className="text-[var(--text-main)] mr-1">#{issue.number}</strong> 
                  <span className="text-[var(--text-main)]">{issue.title}</span>
                  {issue.labels.length > 0 && (
                    <span className="inline-flex flex-wrap gap-1.5 ml-2">
                      {issue.labels.map(label => {
                        const isSelected = selectedLabels.has(label.name);
                        const isEasy = label.name.toLowerCase().includes("easy") || label.name.toLowerCase().includes("good first issue");
                        const isHard = label.name.toLowerCase().includes("hard") || label.name.toLowerCase().includes("complex");
                        return (
                          <span
                            key={label.name}
                            className={cn(
                              "inline-block px-2 py-0.5 rounded text-[0.7rem] font-semibold",
                              isSelected ? "ring-1 ring-[#" + label.color + "]" : "",
                              isEasy ? "bg-[var(--tag-easy-bg)] text-[var(--tag-easy-text)]" :
                              isHard ? "bg-[var(--tag-hard-bg)] text-[var(--tag-hard-text)]" :
                              "bg-[var(--border)] text-[var(--text-muted)]"
                            )}
                          >
                            {label.name}
                          </span>
                        );
                      })}
                    </span>
                  )}
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
