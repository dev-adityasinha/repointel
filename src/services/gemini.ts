import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export interface RepoAnalysis {
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

export async function analyzeRepo(
  description: string,
  languages: Record<string, number>,
  readmeContent: string
): Promise<RepoAnalysis> {
  const prompt = `
Analyze the following GitHub repository based on its description, languages used, and README content.
Provide a qualitative assessment of its code quality and complexity.

Description: ${description || "No description provided."}
Languages: ${JSON.stringify(languages)}
README Snippet (first 1000 chars): ${readmeContent.substring(0, 1000)}

Provide the output in JSON format with the following structure:
- summary: A brief summary of the repository's purpose and overall quality (2-3 sentences).
- strengths: An array of 3 strings highlighting potential strengths based on the tech stack and README.
- weaknesses: An array of 3 strings highlighting potential weaknesses or areas for improvement.
- complexityScores: An object with scores from 1 to 10 (10 being highly complex/good) for:
  - readability
  - modularity
  - testability
  - documentation
  - architecture
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          complexityScores: {
            type: Type.OBJECT,
            properties: {
              readability: { type: Type.NUMBER },
              modularity: { type: Type.NUMBER },
              testability: { type: Type.NUMBER },
              documentation: { type: Type.NUMBER },
              architecture: { type: Type.NUMBER },
            },
            required: ["readability", "modularity", "testability", "documentation", "architecture"]
          }
        },
        required: ["summary", "strengths", "weaknesses", "complexityScores"]
      }
    }
  });

  return JSON.parse(response.text.trim());
}

export async function askRepositoryQuestion(
  question: string,
  repoInfo: any,
  languages: Record<string, number>,
  contents: string[],
  issues: any[],
  analysis: any
): Promise<string> {
  // Build repository context
  const repoContext = `
Repository Name: ${repoInfo.name}
Owner: ${repoInfo.owner.login}
Description: ${repoInfo.description || "No description"}
Primary Languages: ${Object.keys(languages).join(", ") || "Not specified"}
Open Issues: ${repoInfo.open_issues_count}
Stars: ${repoInfo.stargazers_count}
Forks: ${repoInfo.forks_count}

Repository Summary: ${analysis.summary}
Strengths: ${analysis.strengths.join(", ")}
Areas for Improvement: ${analysis.weaknesses.join(", ")}

Repository Contents: ${contents.join(", ")}

Code Quality Scores:
- Readability: ${analysis.complexityScores.readability}/10
- Modularity: ${analysis.complexityScores.modularity}/10
- Testability: ${analysis.complexityScores.testability}/10
- Documentation: ${analysis.complexityScores.documentation}/10
- Architecture: ${analysis.complexityScores.architecture}/10
`;

  const systemPrompt = `You are a helpful assistant that answers questions specifically about a GitHub repository. 
You have access to detailed information about the repository including its structure, languages, issues, and quality analysis.
Your responses should be focused, accurate, and relevant to the repository.
If the question is not related to the repository, politely redirect the user to ask about the repository instead.
Keep responses concise but informative.`;

  const userPrompt = `Repository Context:
${repoContext}

User Question: ${question}

Please answer the question based on the repository information provided. If you cannot answer based on the repository information, let the user know.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
      }
    ]
  });

  return response.text.trim();
}

export interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  codeExample: {
    problem: string;
    solution: string;
    language: string;
  };
  impact: string;
  effort: "quick" | "moderate" | "complex";
}

export async function getSmartSuggestions(
  analysis: any,
  languages: Record<string, number>,
  readmeContent: string
): Promise<SmartSuggestion[]> {
  const primaryLanguage = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "JavaScript";

  const prompt = `
Based on the following repository analysis, provide 3 specific, actionable smart suggestions for code improvements with concrete code examples.

Code Quality Analysis:
- Readability Score: ${analysis.complexityScores.readability}/10
- Modularity Score: ${analysis.complexityScores.modularity}/10
- Testability Score: ${analysis.complexityScores.testability}/10
- Documentation Score: ${analysis.complexityScores.documentation}/10
- Architecture Score: ${analysis.complexityScores.architecture}/10

Weaknesses: ${analysis.weaknesses.join(", ")}
Primary Language: ${primaryLanguage}
README (first 500 chars): ${readmeContent.substring(0, 500)}

For each suggestion, provide:
1. A title (short, actionable)
2. A description explaining the issue in simple terms
3. Priority level (critical/high/medium/low)
4. A code example with "problem" (current bad code) and "solution" (improved code) in the primary language
5. Impact (what will improve - e.g., "Performance +20%", "Readability +30%", etc.)
6. Effort level (quick/moderate/complex)

Return as JSON array with this structure:
[
  {
    "id": "suggestion-1",
    "title": "Add input validation",
    "description": "...",
    "priority": "high",
    "codeExample": {
      "problem": "// current code...",
      "solution": "// improved code...",
      "language": "${primaryLanguage}"
    },
    "impact": "Security +25%, Reliability +15%",
    "effort": "quick"
  }
]

Provide exactly 3 suggestions, ordered by priority (highest first).
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const suggestions = JSON.parse(response.text.trim());
    return Array.isArray(suggestions) ? suggestions.slice(0, 3) : [];
  } catch (error) {
    console.error("Error generating smart suggestions:", error);
    return [];
  }
}
