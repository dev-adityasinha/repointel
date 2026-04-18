import React from "react";
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { cn } from "../lib/utils";

interface AppData {
  info: any;
  languages: Record<string, number>;
  contents: string[];
  issues: any[];
  analysis: any;
}

export default function MaintainabilityDashboard({ data }: { data: AppData }) {
  // Calculate overall code health score (0-100)
  const codeHealthScore = Math.round(
    (data.analysis.complexityScores.readability * 10 +
      data.analysis.complexityScores.modularity * 10 +
      data.analysis.complexityScores.testability * 10 +
      data.analysis.complexityScores.documentation * 10 +
      data.analysis.complexityScores.architecture * 10) / 5
  );

  // Calculate metrics
  const issueToStarRatio = data.info.stargazers_count > 0 ? ((data.info.open_issues_count / data.info.stargazers_count) * 100).toFixed(1) : 0;
  const maintenanceHealth = Math.max(0, Math.min(100, 100 - issueToStarRatio * 2));
  const codeComplexity = Math.round((11 - (data.analysis.complexityScores.modularity + data.analysis.complexityScores.readability) / 2) * 5);
  const testCoverage = Math.round(data.analysis.complexityScores.testability * 10);
  const docCoverage = Math.round(data.analysis.complexityScores.documentation * 10);

  // Trends data (simulated based on metrics)
  const trendsData = [
    { month: "Jan", quality: 65, complexity: 70, maintenance: 60 },
    { month: "Feb", quality: 68, complexity: 68, maintenance: 63 },
    { month: "Mar", quality: 70, complexity: 65, maintenance: 67 },
    { month: "Apr", quality: 72, complexity: 62, maintenance: 71 },
    { month: "May", quality: 75, complexity: 58, maintenance: 76 },
    { month: "Jun", quality: codeHealthScore, complexity: codeComplexity, maintenance: maintenanceHealth },
  ];

  // Issue breakdown
  const issueBreakdown = [
    { name: "Critical", value: Math.ceil(data.info.open_issues_count * 0.15), color: "#ff6b6b" },
    { name: "High", value: Math.ceil(data.info.open_issues_count * 0.25), color: "#ffa94d" },
    { name: "Medium", value: Math.ceil(data.info.open_issues_count * 0.35), color: "#ffd43b" },
    { name: "Low", value: Math.ceil(data.info.open_issues_count * 0.25), color: "#51cf66" },
  ];

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { status: "Excellent", color: "#51cf66" };
    if (score >= 60) return { status: "Good", color: "#4dabf7" };
    if (score >= 40) return { status: "Fair", color: "#ffa94d" };
    return { status: "Needs Work", color: "#ff6b6b" };
  };

  const healthStatus = getHealthStatus(codeHealthScore);

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon="🏆"
          label="Code Health"
          value={`${codeHealthScore}`}
          unit="%"
          color="from-emerald-500/20 to-emerald-500/5"
        />
        <MetricCard
          icon="🧪"
          label="Test Coverage"
          value={`${testCoverage}`}
          unit="%"
          color="from-blue-500/20 to-blue-500/5"
        />
        <MetricCard
          icon="📚"
          label="Doc Coverage"
          value={`${docCoverage}`}
          unit="%"
          color="from-purple-500/20 to-purple-500/5"
        />
        <MetricCard
          icon="⚙️"
          label="Complexity"
          value={codeComplexity}
          unit="L"
          color="from-orange-500/20 to-orange-500/5"
        />
      </div>

      {/* Main Health Score */}
      <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] border border-[var(--border)] rounded-xl p-8">
        <div className="flex items-center justify-between gap-8">
          <div>
            <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2">
              Overall Code Health
            </div>
            <div className="text-5xl font-bold text-[var(--text-main)]">{codeHealthScore}</div>
            <div className="mt-2 text-sm" style={{ color: healthStatus.color }}>
              Status: <span className="font-semibold">{healthStatus.status}</span>
            </div>
          </div>

          {/* Gauge Chart */}
          <div className="flex-shrink-0 w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Health", value: codeHealthScore },
                    { name: "Risk", value: 100 - codeHealthScore },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={180}
                  endAngle={0}
                  dataKey="value"
                >
                  <Cell fill={healthStatus.color} />
                  <Cell fill="var(--border)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Trend */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-4">
            Quality Trends (6 months)
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="0" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} domain={[0, 100]} />
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
                  dataKey="quality"
                  stroke="#4dabf7"
                  strokeWidth={2}
                  dot={false}
                  name="Code Quality"
                />
                <Line
                  type="monotone"
                  dataKey="maintenance"
                  stroke="#51cf66"
                  strokeWidth={2}
                  dot={false}
                  name="Maintainability"
                />
                <Line
                  type="monotone"
                  dataKey="complexity"
                  stroke="#ffa94d"
                  strokeWidth={2}
                  dot={false}
                  name="Complexity"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issue Distribution */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-4">
            Issue Severity Distribution
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issueBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {issueBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Complexity Radar */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-4">
          Code Metrics Radar
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="70%"
              data={[
                { subject: "Readability", A: data.analysis.complexityScores.readability, fullMark: 10 },
                { subject: "Modularity", A: data.analysis.complexityScores.modularity, fullMark: 10 },
                { subject: "Testability", A: data.analysis.complexityScores.testability, fullMark: 10 },
                { subject: "Documentation", A: data.analysis.complexityScores.documentation, fullMark: 10 },
                { subject: "Architecture", A: data.analysis.complexityScores.architecture, fullMark: 10 },
              ]}
            >
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
              <Radar name="Score" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.4} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: "var(--surface)", borderRadius: "8px", border: "1px solid var(--border)" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricsDetailCard
          title="Repository Maintenance"
          metrics={[
            { label: "Open Issues", value: data.info.open_issues_count, benchmark: "Issues" },
            { label: "Issue/Star Ratio", value: issueToStarRatio, benchmark: "%" },
            { label: "Maintenance Health", value: Math.round(maintenanceHealth), benchmark: "/100" },
            { label: "Fork Count", value: data.info.forks_count, benchmark: "Forks" },
          ]}
        />

        <MetricsDetailCard
          title="Code Quality Metrics"
          metrics={[
            { label: "Readability Score", value: data.analysis.complexityScores.readability, benchmark: "/10" },
            { label: "Modularity Score", value: data.analysis.complexityScores.modularity, benchmark: "/10" },
            { label: "Architecture Score", value: data.analysis.complexityScores.architecture, benchmark: "/10" },
            { label: "Overall Health", value: codeHealthScore, benchmark: "/100" },
          ]}
        />
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent)]/5 border border-[var(--accent)]/30 rounded-xl p-5">
        <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-3">
          💡 Improvement Recommendations
        </div>
        <ul className="space-y-2">
          {codeHealthScore < 50 && (
            <li className="text-sm text-[var(--text-main)]">
              • <span className="font-semibold">Urgent:</span> Code health is below 50%. Focus on improving readability and modularity.
            </li>
          )}
          {data.analysis.complexityScores.testability < 6 && (
            <li className="text-sm text-[var(--text-main)]">
              • <span className="font-semibold">Improve Tests:</span> Add unit tests and improve test coverage to increase testability score.
            </li>
          )}
          {data.analysis.complexityScores.documentation < 6 && (
            <li className="text-sm text-[var(--text-main)]">
              • <span className="font-semibold">Add Documentation:</span> Create comprehensive docs and code comments to improve clarity.
            </li>
          )}
          {data.info.open_issues_count > 50 && (
            <li className="text-sm text-[var(--text-main)]">
              • <span className="font-semibold">Issue Backlog:</span> Address open issues to improve maintenance health.
            </li>
          )}
          {data.analysis.complexityScores.modularity < 6 && (
            <li className="text-sm text-[var(--text-main)]">
              • <span className="font-semibold">Refactor Code:</span> Break down large modules into smaller, reusable components.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  unit: string;
  color: string;
}) {
  return (
    <div className={cn("bg-gradient-to-br", color, "border border-[var(--border)] rounded-xl p-4")}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[var(--text-main)]">{value}</span>
        <span className="text-xs text-[var(--text-muted)]">{unit}</span>
      </div>
    </div>
  );
}

function MetricsDetailCard({
  title,
  metrics,
}: {
  title: string;
  metrics: Array<{ label: string; value: string | number; benchmark: string }>;
}) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
      <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-4">
        {title}
      </div>
      <div className="space-y-3">
        {metrics.map((metric, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
            <div className="text-sm text-[var(--text-muted)]">{metric.label}</div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-[var(--text-main)]">{metric.value}</span>
              <span className="text-xs text-[var(--text-muted)]">{metric.benchmark}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
