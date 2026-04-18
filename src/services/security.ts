// Security scanning service for detecting vulnerabilities and security issues

export interface SecurityIssue {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  type: string;
  title: string;
  description: string;
  recommendation: string;
}

export interface SecurityScan {
  score: number; // 0-100
  issues: SecurityIssue[];
  vulnerabilities: number;
  recommendations: string[];
}

export async function performSecurityScan(
  description: string,
  languages: Record<string, number>,
  contents: string[],
  readmeContent: string
): Promise<SecurityScan> {
  const issues: SecurityIssue[] = [];
  let score = 100;

  // Check for common security red flags in description and README
  const combinedContent = `${description || ""} ${readmeContent || ""}`.toLowerCase();

  // Check 1: Outdated dependencies warning
  if (
    combinedContent.includes("npm") ||
    combinedContent.includes("yarn") ||
    combinedContent.includes("dependency")
  ) {
    if (!combinedContent.includes("security") && !combinedContent.includes("audit")) {
      issues.push({
        id: "dep-audit-1",
        severity: "medium",
        type: "Dependency Management",
        title: "No dependency security audits mentioned",
        description:
          "The project doesn't appear to have regular security audits or dependency checks. Outdated packages can contain known vulnerabilities.",
        recommendation:
          "Run 'npm audit' or 'yarn audit' regularly. Set up GitHub security alerts for dependencies.",
      });
      score -= 5;
    }
  }

  // Check 2: No security policy
  if (!contents.includes("SECURITY.md") && !contents.includes("security.md")) {
    issues.push({
      id: "sec-policy-1",
      severity: "medium",
      type: "Security Policy",
      title: "No SECURITY.md file found",
      description:
        "Projects should have a SECURITY.md file that explains how to report vulnerabilities responsibly (responsible disclosure).",
      recommendation:
        "Create a SECURITY.md file in your repository root. Include contact info and guidelines for reporting security issues.",
    });
    score -= 3;
  }

  // Check 3: Authentication concerns
  if (
    combinedContent.includes("password") ||
    combinedContent.includes("api key") ||
    combinedContent.includes("secret")
  ) {
    if (!combinedContent.includes("hash") && !combinedContent.includes("encrypted")) {
      issues.push({
        id: "auth-concern-1",
        severity: "high",
        type: "Authentication",
        title: "Sensitive data handling - unclear encryption",
        description:
          "The project mentions passwords or API keys but doesn't clearly document how they're protected. Sensitive data must be encrypted/hashed.",
        recommendation:
          "Document your security practices. Use industry-standard encryption (bcrypt for passwords, secure vaults for API keys).",
      });
      score -= 10;
    }
  }

  // Check 4: No license (security/legal concern)
  if (!contents.includes("LICENSE") && !contents.includes("license")) {
    issues.push({
      id: "license-1",
      severity: "low",
      type: "Legal Compliance",
      title: "No LICENSE file found",
      description:
        "Without a license, the legal status of the code is unclear. This can create security and legal liability.",
      recommendation:
        "Choose an appropriate open-source license (MIT, Apache 2.0, GPL) and add LICENSE file to repository.",
    });
    score -= 2;
  }

  // Check 5: Risky language usage
  const hasRiskyLanguages = Object.keys(languages).some(
    (lang) =>
      lang.toLowerCase().includes("c") ||
      lang.toLowerCase() === "c++" ||
      lang.toLowerCase() === "php" ||
      lang.toLowerCase() === "perl"
  );

  if (hasRiskyLanguages) {
    if (!combinedContent.includes("secure") && !combinedContent.includes("validated")) {
      issues.push({
        id: "lang-risk-1",
        severity: "medium",
        type: "Language Security",
        title: "Memory-unsafe language detected",
        description:
          "This project uses a language known for memory safety issues (C, C++, etc.). Extra care must be taken with security.",
        recommendation:
          "Implement input validation, use security libraries, and run static analysis tools (clang-tidy, AddressSanitizer).",
      });
      score -= 5;
    }
  }

  // Check 6: No code of conduct
  if (
    !contents.includes("CODE_OF_CONDUCT") &&
    !contents.includes("conduct") &&
    !combinedContent.includes("code of conduct")
  ) {
    issues.push({
      id: "conduct-1",
      severity: "low",
      type: "Community Safety",
      title: "No Code of Conduct",
      description:
        "A Code of Conduct creates a safer, more inclusive community and helps prevent security-related social issues.",
      recommendation:
        "Add a CODE_OF_CONDUCT.md file. Consider using the Contributor Covenant (widely accepted standard).",
    });
    score -= 2;
  }

  // Check 7: HTTP vs HTTPS concerns
  if (combinedContent.includes("http://") && !combinedContent.includes("https://")) {
    issues.push({
      id: "https-1",
      severity: "high",
      type: "Transport Security",
      title: "Unencrypted HTTP detected",
      description:
        "Using HTTP instead of HTTPS for any communication creates security vulnerabilities (man-in-the-middle attacks).",
      recommendation:
        "Ensure all external communications use HTTPS. Update documentation to use HTTPS URLs only.",
    });
    score -= 8;
  }

  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, score));

  // Generate recommendations based on issues
  const recommendations = issues
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, 3)
    .map((issue) => issue.recommendation);

  return {
    score,
    issues,
    vulnerabilities: issues.filter((i) => i.severity === "critical" || i.severity === "high")
      .length,
    recommendations,
  };
}
