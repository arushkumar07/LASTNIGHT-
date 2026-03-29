import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CompressedNotes {
  shortNotes: string;
  bulletPoints: string;
  lastNightRevision: string;
}

export async function compressNotes(text: string): Promise<CompressedNotes> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `You are an expert student-friendly tutor. Your task is to compress the following notes into three distinct formats:
1. Short Notes: A clear, simple explanation of the content.
2. Bullet Points: Crisp bullet points with key facts, definitions, and concepts.
3. Last Night Revision: An ultra-short version with only the most critical points for quick revision before an exam.

Text to compress:
${text}

Format the output as a JSON object with keys: "shortNotes", "bulletPoints", and "lastNightRevision". Use Markdown for the content within each string.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          shortNotes: { type: Type.STRING },
          bulletPoints: { type: Type.STRING },
          lastNightRevision: { type: Type.STRING },
        },
        required: ["shortNotes", "bulletPoints", "lastNightRevision"],
      },
    },
  });

  const result = JSON.parse(response.text);
  return result;
}
