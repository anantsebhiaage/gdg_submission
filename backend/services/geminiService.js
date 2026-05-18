import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_GUARDRAILS = `You are FanZone AI, the real-time engagement engine for a live sports second-screen platform.
You write exclusively in valid, minified JSON with zero markdown, backticks, or explanation.
Your output must be directly parseable by JSON.parse().`;

export async function generateLivePoll(matchContext) {
  const prompt = `${SYSTEM_GUARDRAILS}

Match context: "${matchContext}"

Generate a hyper-specific live sports prediction poll for this exact moment.
The question must be directly tied to what is happening right now.
Return ONLY this JSON structure, no other text:
{
  "question": "A sharp, specific prediction question under 15 words ending with a question mark",
  "options": [
    { "text": "Option A (under 6 words)" },
    { "text": "Option B (under 6 words)" },
    { "text": "Option C (under 6 words)" }
  ]
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      temperature: 0.85,
      maxOutputTokens: 300,
    },
  });

  let raw = response.text.trim();
  // Strip markdown code fences if model wraps output anyway
  raw = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  return JSON.parse(raw);
}

export async function generateHypeCommentary(matchContext) {
  const prompt = `${SYSTEM_GUARDRAILS}

Match moment: "${matchContext}"

Generate a single ultra-short (max 20 words), electric, Gen-Z-style hype reaction to this sports moment.
Use sports slang, energy words, occasional caps. No emojis.
Return ONLY this JSON:
{ "commentary": "your hype line here" }`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      temperature: 1.0,
      maxOutputTokens: 80,
    },
  });

  let raw = response.text.trim();
  raw = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  return JSON.parse(raw);
}
