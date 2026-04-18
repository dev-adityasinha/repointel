// Health score calculator - combines all metrics into a comprehensive score

export interface HealthMetrics {
  codeQuality: number;
  security: number;
  maintenance: number;
  documentation: number;
  testing: number;
  activity: number;
  community: number;
  overallScore: number;
  status: "excellent" | "good" | "fair" | "poor";
  riskLevel: "low" | "medium" | "high" | "critical";
}

export function calculateHealthScore(
  repoInfo: any,
  analysis: any,
  securityScore: number,
  issueCount: number,
  languageCount: number
): HealthMetrics {
  // 1. Code Quality (0-100)
  const codeQuality = Math.round(
    ((analysis.complexityScores.readability +
      analysis.complexityScores.modularity +
      analysis.complexityScores.architecture) /
      3) * 10
  );

  // 2. Security Score (0-100) - from security scan
  const security = securityScore;

  // 3. Maintenance Health (0-100)
  const issueRatio = repoInfo.stargazers_count > 0
    ? (issueCount / repoInfo.stargazers_count) * 100
    : issueCount > 0
    ? 50
    : 100;
  const maintenance = Math.max(0, Math.min(100, 100 - issueRatio * 2));

  // 4. Documentation (0-100)
  const documentation = Math.round(analysis.complexityScores.documentation * 10);

  // 5. Testing (0-100)
  const testing = Math.round(analysis.complexityScores.testability * 10);

  // 6. Activity Level (0-100)
  // Based on stars, forks, watchers
  const starScore = Math.min(50, (repoInfo.stargazers_count / 1000) * 50);
  const forkScore = Math.min(30, (repoInfo.forks_count / 500) * 30);
  const watchScore = Math.min(20, (repoInfo.watchers_count / 100) * 20);
  const activity = Math.round(starScore + forkScore + watchScore);

  // 7. Community Engagement (0-100)
  const hasReadme = repoInfo.description ? 20 : 0;
  const hasTopics = repoInfo.topics && repoInfo.topics.length > 0 ? 15 : 0;
  const hasWiki = repoInfo.has_wiki ? 15 : 0;
  const hasDiscussions = repoInfo.has_discussions ? 15 : 0;
  const isNotArchived = !repoInfo.archived ? 35 : 0;
  const community = hasReadme + hasTopics + hasWiki + hasDiscussions + isNotArchived;

  // Calculate Overall Score (weighted average)
  const overallScore = Math.round(
    codeQuality * 0.25 +      // 25% - Code Quality
    security * 0.25 +         // 25% - Security
    maintenance * 0.15 +      // 15% - Maintenance
    documentation * 0.1 +     // 10% - Documentation
    testing * 0.1 +           // 10% - Testing
    activity * 0.1 +          // 10% - Activity/Popularity
    community * 0.05          // 5%  - Community
  );

  // Determine Status
  let status: "excellent" | "good" | "fair" | "poor";
  if (overallScore >= 80) status = "excellent";
  else if (overallScore >= 60) status = "good";
  else if (overallScore >= 40) status = "fair";
  else status = "poor";

  // Determine Risk Level
  let riskLevel: "low" | "medium" | "high" | "critical";
  if (security < 40 || maintenance < 30) riskLevel = "critical";
  else if (security < 60 || maintenance < 50) riskLevel = "high";
  else if (security < 75 || maintenance < 70) riskLevel = "medium";
  else riskLevel = "low";

  return {
    codeQuality,
    security,
    maintenance,
    documentation,
    testing,
    activity,
    community,
    overallScore,
    status,
    riskLevel,
  };
}

export function getHealthRecommendations(metrics: HealthMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.codeQuality < 50) {
    recommendations.push("⚠️ Urgent: Code quality is below 50%. Focus on refactoring and architecture improvements.");
  }

  if (metrics.security < 50) {
    recommendations.push("🔒 Critical: Security score is low. Implement security audits and add SECURITY.md.");
  }

  if (metrics.maintenance < 40) {
    recommendations.push("🐛 Address the backlog: Too many open issues relative to project size. Prioritize issue resolution.");
  }

  if (metrics.documentation < 50) {
    recommendations.push("📚 Improve documentation: Add comprehensive docs, README, and code comments.");
  }

  if (metrics.testing < 50) {
    recommendations.push("🧪 Increase test coverage: Add unit tests and integration tests to improve reliability.");
  }

  if (metrics.activity < 30) {
    recommendations.push("📈 Consider promoting: Low activity might indicate lack of visibility. Share in communities.");
  }

  if (metrics.community < 50) {
    recommendations.push("👥 Improve community engagement: Add wiki, discussions, and Code of Conduct.");
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ Great job! Your repository is well-maintained and healthy.");
  }

  return recommendations.slice(0, 4); // Return top 4 recommendations
}
