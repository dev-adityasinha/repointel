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
