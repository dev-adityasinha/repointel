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

export async function fetchRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!res.ok) throw new Error("Repository not found or API rate limit exceeded");
  return res.json();
}

export async function fetchRepoLanguages(owner: string, repo: string): Promise<Record<string, number>> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
  if (!res.ok) return {};
  return res.json();
}

export async function fetchRepoContents(owner: string, repo: string): Promise<string[]> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`);
  if (!res.ok) return [];
  const data = await res.json();
  if (Array.isArray(data)) {
    return data.map((item: any) => item.name.toLowerCase());
  }
  return [];
}

export async function fetchReadme(owner: string, repo: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers: { Accept: "application/vnd.github.v3.raw" }
  });
  if (!res.ok) return "";
  return res.text();
}

export async function fetchIssues(owner: string, repo: string): Promise<Issue[]> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.filter((issue: any) => !issue.pull_request);
}
