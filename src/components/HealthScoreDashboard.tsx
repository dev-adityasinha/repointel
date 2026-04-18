import React from "react";
import { Activity, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { HealthMetrics, getHealthRecommendations } from "../services/health";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";

export default function HealthScoreDashboard({ metrics }: { metrics: HealthMetrics }) {
  const recommendations = getHealthRecommendations(metrics);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return { bg: "from-green-500/20", text: "text-green-600", badge: "bg-green-100 text-green-800" };
      case "good":
        return { bg: "from-blue-500/20", text: "text-blue-600", badge: "bg-blue-100 text-blue-800" };
      case "fair":
        return { bg: "from-yellow-500/20", text: "text-yellow-600", badge: "bg-yellow-100 text-yellow-800" };
      case "poor":
        return { bg: "from-red-500/20", text: "text-red-600", badge: "bg-red-100 text-red-800" };
      default:
        return { bg: "from-gray-500/20", text: "text-gray-600", badge: "bg-gray-100 text-gray-800" };
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "critical":
        return "🔴";
      case "high":
        return "🟠";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const statusColor = getStatusColor(metrics.status);

  // Prepare data for metrics chart
  const metricsData = [
    { name: "Code Quality", value: metrics.codeQuality, fill: "#4dabf7" },
    { name: "Security", value: metrics.security, fill: "#ff6b6b" },
    { name: "Maintenance", value: metrics.maintenance, fill: "#51cf66" },
    { name: "Documentation", value: metrics.documentation, fill: "#b197fc" },
    { name: "Testing", value: metrics.testing, fill: "#ffa94d" },
  ];

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <div className={`bg-gradient-to-br ${statusColor.bg} to-transparent border border-[var(--border)] rounded-xl p-8`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className={`w-5 h-5 ${statusColor.text}`} />
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                Overall Health Score
              </span>
            </div>
            <div className="text-6xl font-bold text-[var(--text-main)]">{metrics.overallScore}</div>
            <div className={`mt-3 inline-block px-3 py-1.5 rounded-lg text-xs font-semibold ${statusColor.badge}`}>
              {metrics.status.toUpperCase()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[var(--text-muted)] mb-2">Risk Level</div>
            <div className="text-4xl mb-2">{getRiskIcon(metrics.riskLevel)}</div>
            <div className="text-sm font-bold text-[var(--text-main)] uppercase">{metrics.riskLevel}</div>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {[
          { label: "Code Quality", value: metrics.codeQuality, icon: "📝", color: "#4dabf7" },
          { label: "Security", value: metrics.security, icon: "🔒", color: "#ff6b6b" },
          { label: "Maintenance", value: metrics.maintenance, icon: "🔧", color: "#51cf66" },
          { label: "Documentation", value: metrics.documentation, icon: "📚", color: "#b197fc" },
          { label: "Testing", value: metrics.testing, icon: "🧪", color: "#ffa94d" },
          { label: "Activity", value: metrics.activity, icon: "📈", color: "#4dabf7" },
          { label: "Community", value: metrics.community, icon: "👥", color: "#69db7c" },
        ].map((metric, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3">
            <div className="text-2xl mb-1">{metric.icon}</div>
            <div className="relative h-1.5 bg-[var(--border)] rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full"
                style={{ width: `${metric.value}%`, backgroundColor: metric.color }}
              />
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-lg font-bold text-[var(--text-main)]">{metric.value}</span>
              <span className="text-xs text-[var(--text-muted)]">/100</span>
            </div>
            <div className="text-xs text-[var(--text-muted)]">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar-style Bar Chart */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-bold text-[var(--text-main)] mb-4">Metrics Overview</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsData}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderRadius: "8px", border: "1px solid var(--border)" }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {metricsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-bold text-[var(--text-main)] mb-4">Score Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Excellent (80-100)", value: metrics.overallScore >= 80 ? 100 : 0 },
                    { name: "Good (60-79)", value: metrics.overallScore >= 60 && metrics.overallScore < 80 ? 100 : 0 },
                    { name: "Fair (40-59)", value: metrics.overallScore >= 40 && metrics.overallScore < 60 ? 100 : 0 },
                    { name: "Poor (<40)", value: metrics.overallScore < 40 ? 100 : 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill="#51cf66" />
                  <Cell fill="#4dabf7" />
                  <Cell fill="#ffa94d" />
                  <Cell fill="#ff6b6b" />
                </Pie>
                <RechartsTooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent)]/5 border border-[var(--accent)]/30 rounded-xl p-5">
        <h3 className="text-sm font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Health Recommendations
        </h3>
        <ul className="space-y-3">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-main)]">
              <span className="flex-shrink-0 mt-1">
                {rec.includes("✅") ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
              </span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
