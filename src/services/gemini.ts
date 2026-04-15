import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
