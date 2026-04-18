import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { TrendingUp, Package, GitBranch, AlertCircle, Eye } from "lucide-react";

interface AppData {
  info: any;
  languages: Record<string, number>;
  contents: string[];
  issues: any[];
  analysis: any;
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];

export default function OverviewDashboard({ data }: { data: AppData }) {
  // Prepare languages data for pie chart
  const languageData = Object.entries(data.languages)
    .map(([name, value]) => ({ name, value: Number(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Prepare trend data (simulated)
  const trendData = [
    { month: "Jan", activity: 45, stars: 120, issues: 8 },
    { month: "Feb", activity: 52, stars: 145, issues: 12 },
    { month: "Mar", activity: 48, stars: 168, issues: 10 },
    { month: "Apr", activity: 61, stars: 195, issues: 15 },
    { month: "May", activity: 75, stars: 230, issues: 18 },
    { month: "Jun", activity: 82, stars: data.info.stargazers_count, issues: Math.floor(data.info.open_issues_count) },
  ];

  // Calculate metrics
  const issueRatio = data.info.stargazers_count > 0 ? ((data.info.open_issues_count / data.info.stargazers_count) * 100).toFixed(2) : 0;
  const avgIssuePerFork = data.info.forks_count > 0 ? (data.info.open_issues_count / data.info.forks_count).toFixed(2) : 0;

  const metrics = [
    { 
      label: "Stars", 
      value: data.info.stargazers_count.toLocaleString(), 
      icon: "⭐",
      gradient: "from-pink-500 to-rose-500"
    },
    { 
      label: "Forks", 
      value: data.info.forks_count.toLocaleString(), 
      icon: "🍴",
      gradient: "from-purple-500 to-pink-500"
    },
    { 
      label: "Watchers", 
      value: data.info.watchers_count.toLocaleString(), 
      icon: "👁️",
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      label: "Open Issues", 
      value: data.info.open_issues_count.toLocaleString(), 
      icon: "⚠️",
      gradient: "from-orange-500 to-yellow-500"
    },
    { 
      label: "Quality Score", 
      value: Math.round((data.analysis.complexityScores.readability + data.analysis.complexityScores.modularity) / 2),
      icon: "🎯",
      gradient: "from-green-500 to-emerald-500"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${metric.gradient} rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs uppercase tracking-widest font-bold opacity-90 mb-2">
                  {metric.label}
                </div>
                <div className="text-2xl md:text-3xl font-bold">{metric.value}</div>
              </div>
              <span className="text-3xl">{metric.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Trend - Spans 2 columns */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
            <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Activity Trends
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="0" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="activity"
                  stroke="var(--accent)"
                  fillOpacity={1}
                  fill="url(#colorActivity)"
                  name="Activity"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language Distribution */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-[var(--accent)]" />
            <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Languages
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `${(Number(value) / 1024).toFixed(1)} KB`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-1 text-xs">
            {languageData.slice(0, 3).map((lang, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-[var(--text-muted)]">{lang.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stars & Issues Growth */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
            <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Growth Metrics
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="0" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="stars"
                  stroke="#FFD700"
                  strokeWidth={2}
                  name="Stars"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="issues"
                  stroke="#FF6B6B"
                  strokeWidth={2}
                  name="Issues"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1">
                  Issue Ratio
                </div>
                <div className="text-3xl font-bold text-[var(--text-main)]">{issueRatio}%</div>
              </div>
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-xs text-[var(--text-muted)]">Issues per star</p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1">
                  Fork Engagement
                </div>
                <div className="text-3xl font-bold text-[var(--text-main)]">{avgIssuePerFork}</div>
              </div>
              <GitBranch className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-xs text-[var(--text-muted)]">Avg issues per fork</p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1">
                  Sustainability
                </div>
                <div className="text-3xl font-bold text-[var(--text-main)]">
                  {data.info.forks_count > 100 ? "High" : data.info.forks_count > 20 ? "Good" : "Moderate"}
                </div>
              </div>
              <Eye className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-xs text-[var(--text-muted)]">Based on forks & activity</p>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent)]/5 border border-[var(--accent)]/30 rounded-xl p-5">
        <h3 className="text-sm font-bold text-[var(--text-main)] mb-3">📋 Quick Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-[var(--text-muted)]">Primary Language:</span>
            <span className="font-semibold text-[var(--text-main)] ml-2">
              {Object.entries(data.languages).length > 0
                ? Object.entries(data.languages)
                    .sort((a, b) => b[1] - a[1])[0][0]
                : "Unknown"}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Repository Type:</span>
            <span className="font-semibold text-[var(--text-main)] ml-2">
              {data.info.fork ? "Fork" : "Original"}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Status:</span>
            <span className="font-semibold text-[var(--text-main)] ml-2">
              {data.info.archived ? "Archived" : data.info.open_issues_count > 50 ? "Active" : "Maintained"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
