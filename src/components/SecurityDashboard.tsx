import React, { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, Lock } from "lucide-react";
import { SecurityScan } from "../services/security";

export default function SecurityDashboard({ securityScan }: { securityScan: SecurityScan }) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 border-red-500/50 text-red-700";
      case "high":
        return "bg-orange-500/20 border-orange-500/50 text-orange-700";
      case "medium":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-700";
      case "low":
        return "bg-blue-500/20 border-blue-500/50 text-blue-700";
      default:
        return "bg-gray-500/20 border-gray-500/50 text-gray-700";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return "🔴";
      case "high":
        return "🟠";
      case "medium":
        return "🟡";
      case "low":
        return "🔵";
      default:
        return "⚪";
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                Security Score
              </span>
            </div>
            <div className="text-5xl font-bold text-[var(--text-main)]">{securityScan.score}</div>
            <div className="text-sm text-[var(--text-muted)] mt-2">
              {securityScan.vulnerabilities} vulnerability/vulnerabilities found
            </div>
          </div>
          <div className="text-6xl opacity-50">🔒</div>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">
            {securityScan.issues.filter((i) => i.severity === "critical").length}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Critical</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {securityScan.issues.filter((i) => i.severity === "high").length}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">High</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {securityScan.issues.filter((i) => i.severity === "medium").length}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Medium</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {securityScan.issues.filter((i) => i.severity === "low").length}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Low</div>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-bold text-[var(--text-main)] mb-4">Security Issues</h3>
        <div className="space-y-3">
          {securityScan.issues.length === 0 ? (
            <div className="flex items-center gap-2 p-4 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600">✅ No security issues detected!</span>
            </div>
          ) : (
            securityScan.issues.map((issue) => (
              <div
                key={issue.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${getSeverityColor(issue.severity)}`}
                onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getSeverityIcon(issue.severity)}</span>
                      <span className="font-semibold text-sm">{issue.title}</span>
                    </div>
                    <div className="text-xs opacity-75">{issue.type}</div>
                  </div>
                  <span className="text-xs font-semibold uppercase opacity-70">
                    {issue.severity}
                  </span>
                </div>

                {/* Expanded Details */}
                {expandedIssue === issue.id && (
                  <div className="mt-3 pt-3 border-t border-current opacity-75 space-y-2 animate-in fade-in duration-200">
                    <div>
                      <div className="text-xs font-semibold mb-1">Details:</div>
                      <p className="text-xs leading-relaxed">{issue.description}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold mb-1">Recommendation:</div>
                      <p className="text-xs leading-relaxed">{issue.recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recommendations */}
      {securityScan.recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-xl p-5">
          <h3 className="text-sm font-bold text-[var(--text-main)] mb-3">Top Recommendations</h3>
          <ol className="space-y-2">
            {securityScan.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-sm text-[var(--text-main)]">
                <span className="font-bold text-purple-600">{i + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
