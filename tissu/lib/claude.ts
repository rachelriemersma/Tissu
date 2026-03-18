import { AnalysisResult } from './supabase';

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY!;
const MODEL = 'claude-sonnet-4-20250514';

async function callClaude(messages: object[], system?: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${err}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function parseJSON(text: string): object {
  // Extract JSON from markdown code block if present
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = match ? match[1].trim() : text.trim();
  return JSON.parse(jsonStr);
}

export async function analyzeLabelImage(base64Image: string): Promise<AnalysisResult> {
  // Step 1: Extract raw data from label
  const extractPrompt = `This is a photo of a clothing care label. Extract only the fiber/textile composition and percentages, country of origin, care instructions, and manufacturer RN number if present. Return as JSON: { "fibers": [{"name": string, "percentage": number}], "country": string, "care": [string], "rn": string }. If any field is not visible, return null for that field.`;

  const extractText = await callClaude([
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: base64Image,
          },
        },
        { type: 'text', text: extractPrompt },
      ],
    },
  ]);

  const extracted = parseJSON(extractText) as {
    fibers: { name: string; percentage: number }[];
    country: string;
    care: string[];
    rn: string;
  };

  // Step 2: Analyze the extracted data
  const analyzePrompt = `Given this clothing fiber composition: ${JSON.stringify(extracted)}, provide: 1) A plain-language description of each fiber and how it feels/behaves. 2) A durability score out of 100 with a 2-3 sentence explanation and 2-3 tags (e.g. "PILLING RISK · MEDIUM"). 3) A sustainability score out of 100 with a 2-3 sentence explanation and 2-3 tags. Return as JSON: { "fiberDescriptions": [{"name": string, "description": string}], "durability": {"score": number, "summary": string, "tags": [string]}, "sustainability": {"score": number, "summary": string, "tags": [string]} }`;

  const analysisText = await callClaude([
    { role: 'user', content: analyzePrompt },
  ]);

  const analysis = parseJSON(analysisText) as {
    fiberDescriptions: { name: string; description: string }[];
    durability: { score: number; summary: string; tags: string[] };
    sustainability: { score: number; summary: string; tags: string[] };
  };

  return {
    fibers: extracted.fibers,
    country: extracted.country,
    care: extracted.care,
    rn: extracted.rn,
    fiberDescriptions: analysis.fiberDescriptions,
    durability: analysis.durability,
    sustainability: analysis.sustainability,
  };
}

export async function analyzeProductUrl(url: string): Promise<AnalysisResult> {
  const prompt = `Fetch this product page and extract: product name, brand, fiber/textile composition with percentages, country of origin if listed, and price. Then provide: 1) Plain-language fiber descriptions. 2) Durability score out of 100 with explanation and tags (e.g. "PILLING RISK · MEDIUM"). 3) Sustainability score out of 100 with explanation and tags. URL: ${url}. Return as JSON matching this schema: { "productName": string, "brand": string, "price": string, "imageUrl": string, "fibers": [{"name": string, "percentage": number}], "country": string, "fiberDescriptions": [{"name": string, "description": string}], "durability": {"score": number, "summary": string, "tags": [string]}, "sustainability": {"score": number, "summary": string, "tags": [string]} }`;

  const text = await callClaude([
    { role: 'user', content: prompt },
  ]);

  return parseJSON(text) as AnalysisResult;
}
