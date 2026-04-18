import React from "react";
import { LineChart, Line, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell, ScatterChart, Scatter } from "recharts";
import { TrendingUp, Zap, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "../lib/utils";

interface RepoAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  complexityScores: {
    readability: number;
    modularity: number;
    testability: number;
    documentation: number;
    architecture: number;
  };
}

export default function CodeAnalysisDashboard({ analysis }: { analysis: RepoAnalysis }) {
  const scores = analysis.complexityScores;
  
  // Calculate overall score
  const overallScore = Math.round(
    (scores.readability + scores.modularity + scores.testability + scores.documentation + scores.architecture) / 5
  );

  // Prepare radar data
  const radarData = [
    { subject: "Readability", A: scores.readability, fullMark: 10 },
    { subject: "Modularity", A: scores.modularity, fullMark: 10 },
    { subject: "Testability", A: scores.testability, fullMark: 10 },
    { subject: "Documentation", A: scores.documentation, fullMark: 10 },
    { subject: "Architecture", A: scores.architecture, fullMark: 10 },
  ];

  // Prepare bar data for comparison
  const barData = [
    { name: "Readability", value: scores.readability, fill: "#4dabf7" },
    { name: "Modularity", value: scores.modularity, fill: "#51cf66" },
    { name: "Testability", value: scores.testability, fill: "#ffa94d" },
    { name: "Documentation", value: scores.documentation, fill: "#b197fc" },
    { name: "Architecture", value: scores.architecture, fill: "#ff8787" },
  ];

  const getQualityLabel = (score: number) => {
    if (score >= 8) return { label: "Excellent", color: "#51cf66", bg: "from-emerald-500/20" };
    if (score >= 6) return { label: "Good", color: "#4dabf7", bg: "from-blue-500/20" };
    if (score >= 4) return { label: "Fair", color: "#ffa94d", bg: "from-orange-500/20" };
    return { label: "Needs Work", color: "#ff6b6b", bg: "from-red-500/20" };
  };

  const overallQuality = getQualityLabel(overallScore);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className={cn("bg-gradient-to-br", overallQuality.bg, "to-transparent border border-[var(--border)] rounded-xl p-6")}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2">
              Overall Code Quality
            </div>
            <div className="text-4xl font-bold text-[var(--text-main)]">{overallScore}/10</div>
            <div className="text-sm mt-2" style={{ color: overallQuality.color }}>
              {overallQuality.label}
            </div>
          </div>
          <div className="text-5xl opacity-20">✨</div>
        </div>
        <p className="text-sm text-[var(--text-main)] leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {barData.map((item) => {
          const quality = getQualityLabel(item.value);
          return (
            <div key={item.name} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3">
              <div className="text-xs text-[var(--text-muted)] font-semibold mb-2 truncate">{item.name}</div>
              <div className="relative h-1.5 bg-[var(--border)] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(item.value / 10) * 100}%`, backgroundColor: item.fill }}
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-[var(--text-main)]">{item.value}</span>
                <span className="text-xs text-[var(--text-muted)]">/10</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-4">
            Code Quality Radar
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                <Radar name="Score" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.4} />
                <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderRadius: "8px", border: "1px solid var(--border)" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-4">
            Score Breakdown
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 10]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderRadius: "8px", border: "1px solid var(--border)" }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs uppercase tracking-wider text-[var(--text-main)] font-semibold">
              Key Strengths
            </h4>
          </div>
          <ul className="space-y-3">
            {analysis.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-main)]">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs uppercase tracking-wider text-[var(--text-main)] font-semibold">
              Areas for Improvement
            </h4>
          </div>
          <ul className="space-y-3">
            {analysis.weaknesses.map((weakness, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-main)]">
                <span className="text-amber-500 font-bold mt-0.5">!</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-[var(--accent)]" />
          <h4 className="text-xs uppercase tracking-wider text-[var(--text-main)] font-semibold">
            Quick Insights
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-[var(--bg)] rounded-lg">
            <div className="text-xs text-[var(--text-muted)] mb-1">Strongest Metric</div>
            <div className="font-bold text-[var(--text-main)]">
              {Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0].charAt(0).toUpperCase() + 
               Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0].slice(1)}
            </div>
          </div>
          <div className="p-3 bg-[var(--bg)] rounded-lg">
            <div className="text-xs text-[var(--text-muted)] mb-1">Needs Attention</div>
            <div className="font-bold text-[var(--text-main)]">
              {Object.entries(scores).reduce((a, b) => a[1] < b[1] ? a : b)[0].charAt(0).toUpperCase() + 
               Object.entries(scores).reduce((a, b) => a[1] < b[1] ? a : b)[0].slice(1)}
            </div>
          </div>
          <div className="p-3 bg-[var(--bg)] rounded-lg">
            <div className="text-xs text-[var(--text-muted)] mb-1">Recommendation</div>
            <div className="font-bold text-[var(--text-main)]">
              {overallScore >= 7 ? "Production Ready" : overallScore >= 5 ? "Good Foundation" : "Focus on Core"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
