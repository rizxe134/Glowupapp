import {
  VISION_PROMPT,
  extractJsonObject,
  parsePhotoAnalysis,
  type PhotoAnalysis,
} from "@glow/shared";
import { loadOllamaSettings } from "./settings";

export async function pingOllama(): Promise<{ ok: boolean; detail: string; models: string[] }> {
  const { baseUrl } = await loadOllamaSettings();
  try {
    const res = await fetch(`${baseUrl}/api/tags`);
    if (!res.ok) return { ok: false, detail: `HTTP ${res.status}`, models: [] };
    const data = (await res.json()) as { models?: { name?: string }[] };
    const models = (data.models ?? []).map((m) => m.name ?? "").filter(Boolean);
    return { ok: true, detail: `Reached ${baseUrl}`, models };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : "Could not reach Ollama",
      models: [],
    };
  }
}

export async function analyzePhotoBase64(base64: string): Promise<PhotoAnalysis> {
  const { baseUrl, model } = await loadOllamaSettings();
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: VISION_PROMPT,
      images: [base64],
      stream: false,
      format: "json",
      options: { temperature: 0.2 },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama error ${res.status}: ${text.slice(0, 180)}`);
  }
  const data = (await res.json()) as { response?: string };
  const parsed = extractJsonObject(data.response ?? "");
  if (!parsed) throw new Error("The vision model did not return usable JSON. Try another photo.");
  return parsePhotoAnalysis(parsed);
}
