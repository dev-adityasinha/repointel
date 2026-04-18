export interface RepoInfo {
  name: string;
  owner: { login: string; avatar_url: string };
  description: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  default_branch: string;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  labels: { name: string; color: string }[];
  created_at: string;
  user: { login: string; avatar_url: string };
}

const getHeaders = () => {
  const headers: HeadersInit = {
    "Accept": "application/vnd.github.v3+json"
  };
  // Add GitHub token if available in environment
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }
  return headers;
};

export async function fetchRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: getHeaders() });

    if (res.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" not found. Please check the repository name and try again.`);
    }

    if (res.status === 403) {
      const remaining = res.headers.get("x-ratelimit-remaining");
      const reset = res.headers.get("x-ratelimit-reset");
      if (remaining === "0") {
        const resetDate = reset ? new Date(parseInt(reset) * 1000).toLocaleTimeString() : "unknown";
        throw new Error(`GitHub API rate limit exceeded. Rate limit resets at ${resetDate}. Add a GitHub token to increase limits.`);
      }
      throw new Error("GitHub API error: Access forbidden");
    }

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (err: any) {
    throw new Error(err.message || "Failed to fetch repository information");
  }
}

export async function fetchRepoLanguages(owner: string, repo: string): Promise<Record<string, number>> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers: getHeaders() });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export async function fetchRepoContents(owner: string, repo: string): Promise<string[]> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers: getHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) {
      // Filter out special directories and files to avoid errors
      const excludedNames = new Set([
        '.git', '.gitignore', '.github', '.gitattributes',
        'node_modules', '.venv', 'venv', '__pycache__',
        '.env', '.env.local', '.env.*.local',
        '.DS_Store', 'Thumbs.db',
        '.next', 'dist', 'build', 'out'
      ]);

      return data
        .map((item: any) => item.name.toLowerCase())
        .filter((name: string) => !excludedNames.has(name));
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchReadme(owner: string, repo: string): Promise<string> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { ...getHeaders(), Accept: "application/vnd.github.v3.raw" }
    });
    if (!res.ok) return "";
    return res.text();
  } catch {
    return "";
  }
}

export async function fetchIssues(owner: string, repo: string): Promise<Issue[]> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`, { headers: getHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.filter((issue: any) => !issue.pull_request);
  } catch {
    return [];
  }
}
