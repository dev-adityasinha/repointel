const getHeaders = () => {
  const headers: HeadersInit = {
    "Accept": "application/vnd.github.v3+json"
  };
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }
  return headers;
};

export interface SearchResult {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string;
  open_issues_count: number;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
}

export async function searchTrendingRepos(
  language?: string,
  sortBy: "stars" | "forks" | "updated" = "stars"
): Promise<SearchResult[]> {
  try {
    let query = `sort:${sortBy} stars:>1000`;
    
    if (language) {
      query += ` language:${language}`;
    }

    // Get repos updated in last 7 days for true trending
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    query += ` pushed:>${oneWeekAgo.toISOString().split("T")[0]}`;

    const res = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=30`,
      { headers: getHeaders() }
    );

    if (!res.ok) throw new Error("Failed to fetch trending repos");

    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error("Trending repos fetch failed:", error);
    return [];
  }
}

export async function searchRepositories(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=20`,
      { headers: getHeaders() }
    );

    if (!res.ok) throw new Error("Failed to search repositories");

    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error("Repository search failed:", error);
    return [];
  }
}

export const POPULAR_LANGUAGES = [
  "JavaScript",
  "Python",
  "TypeScript",
  "Go",
  "Rust",
  "Java",
  "C++",
  "PHP",
  "Ruby",
  "C#",
];
