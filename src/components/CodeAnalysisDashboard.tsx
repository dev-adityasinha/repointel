import React from "react";
import { LineChart, Line, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell, ScatterChart, Scatter } from "recharts";
import { TrendingUp, Zap, AlertCircle, CheckCircle, ChevronDown } from "lucide-react";
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

// Easy-to-understand explanations and examples for common improvement areas
const improvementGuide: Record<string, { emoji: string; explanation: string; examples: string[] }> = {
  "test": { 
    emoji: "🧪",
    explanation: "Tests are like safety checks for your code. They automatically verify that your code works as expected. Without them, you might miss bugs!",
    examples: ["Example: Test that login function rejects wrong passwords", "Example: Test that shopping cart calculates total correctly", "Example: Test that API returns correct data format"]
  },
  "document": {
    emoji: "📚",
    explanation: "Documentation explains how your code works. It's like an instruction manual. People (including future you!) will understand the code much faster.",
    examples: ["Example: Add comments explaining what a complex function does", "Example: Write a README showing how to install and use", "Example: Document function parameters and what they do"]
  },
  "read": {
    emoji: "👁️",
    explanation: "Readability means code is easy to understand at first glance. Clear variable names, proper formatting, and logical structure make it much better.",
    examples: ["Example: Use 'userName' instead of 'un' for variable names", "Example: Break long functions into smaller, focused ones", "Example: Use consistent indentation and formatting"]
  },
  "modularity": {
    emoji: "🧩",
    explanation: "Modularity means breaking code into small, independent pieces. Each piece does one thing well. This makes code reusable and easy to fix.",
    examples: ["Example: Instead of one 500-line file, split into 5 focused files", "Example: Create reusable functions instead of copy-pasting code", "Example: Make components that work independently"]
  },
  "architecture": {
    emoji: "🏗️",
    explanation: "Architecture is the overall structure of your code. Good architecture makes it easy to add features, fix bugs, and understand the project.",
    examples: ["Example: Organize code by features instead of file types", "Example: Separate business logic from user interface code", "Example: Use design patterns to solve common problems"]
  },
  "complex": {
    emoji: "🎯",
    explanation: "Code complexity means the code is harder to understand. Simpler code is better! It's easier to debug and maintain.",
    examples: ["Example: Replace nested if statements with clearer logic", "Example: Use meaningful variable names instead of cryptic ones", "Example: Add comments explaining the 'why' not just the 'what'"]
  }
};

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
          <ul className="space-y-2">
            {analysis.weaknesses.map((weakness, i) => (
              <ImprovementItem key={i} weakness={weakness} />
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

// Component to display expandable improvement items with explanations
function ImprovementItem({ weakness }: { weakness: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Find matching guide entry
  let guide = null;
  const weaknessLower = weakness.toLowerCase();
  
  for (const [key, value] of Object.entries(improvementGuide)) {
    if (weaknessLower.includes(key)) {
      guide = value;
      break;
    }
  }

  // Fallback guide if no match found
  if (!guide) {
    guide = {
      emoji: "💡",
      explanation: "This area could be improved by focusing on code quality and best practices.",
      examples: ["Review similar projects for patterns", "Ask the community for suggestions", "Research best practices for this area"]
    };
  }

  return (
    <div className="text-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start gap-2 text-[var(--text-main)] hover:bg-amber-500/5 p-2 rounded-lg transition-all text-left"
      >
        <span className="flex-shrink-0 mt-0.5">!</span>
        <span className="flex-1">{weakness}</span>
        <ChevronDown className={cn("w-4 h-4 flex-shrink-0 text-amber-500 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Expandable Content */}
      {isOpen && (
        <div className="mt-2 ml-6 p-3 bg-[var(--bg)] rounded-lg border border-amber-500/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex gap-3">
            <span className="text-2xl flex-shrink-0">{guide.emoji}</span>
            <div className="flex-1">
              <p className="text-xs text-[var(--text-main)] leading-relaxed mb-3">
                {guide.explanation}
              </p>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase">Quick Examples:</div>
                {guide.examples.map((example, i) => (
                  <div key={i} className="text-xs text-[var(--text-muted)] flex gap-2">
                    <span className="flex-shrink-0">→</span>
                    <span>{example}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://developer.mozilla.org/docs/"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-xs px-3 py-1.5 bg-amber-500/20 text-amber-600 rounded hover:bg-amber-500/30 transition-colors"
              >
                Learn More →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
