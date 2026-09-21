import {
  DEFAULT_VISION_MODEL,
  LOW_RAM_VISION_MODEL,
  VISION_PROMPT,
  extractJsonObject,
  isLikelyVisionModel,
  parsePhotoAnalysis,
  type PhotoAnalysis,
} from "@glow/shared";

const OLLAMA_PREFIX = "/ollama";

export function visionModelName(): string {
  return import.meta.env.VITE_OLLAMA_VISION_MODEL || DEFAULT_VISION_MODEL;
}

export type OllamaStatus =
  | { state: "unknown" }
  | { state: "offline"; error: string }
  | {
      state: "online";
      models: string[];
      hasPreferred: boolean;
      hasVision: boolean;
      suggested: string | null;
    };

export async function checkOllama(): Promise<OllamaStatus> {
  try {
    const res = await fetch(`${OLLAMA_PREFIX}/api/tags`, { method: "GET" });
    if (!res.ok) {
      return { state: "offline", error: `Ollama responded ${res.status}` };
    }
    const data = (await res.json()) as { models?: { name?: string }[] };
    const models = (data.models ?? []).map((m) => m.name ?? "").filter(Boolean);
    const preferred = visionModelName();
    const hasPreferred = models.some((n) => n === preferred || n.startsWith(`${preferred}`));
    const vision = models.filter(isLikelyVisionModel);
    const suggested =
      models.find((n) => n === preferred || n.startsWith(`${preferred}`)) ??
      models.find((n) => n.includes(LOW_RAM_VISION_MODEL)) ??
      vision[0] ??
      null;
    return {
      state: "online",
      models,
      hasPreferred,
      hasVision: vision.length > 0,
      suggested,
    };
  } catch (err) {
    return {
      state: "offline",
      error: err instanceof Error ? err.message : "Could not reach Ollama",
    };
  }
}

function stripDataUrl(image: string): string {
  const comma = image.indexOf(",");
  return image.startsWith("data:") && comma >= 0 ? image.slice(comma + 1) : image;
}

export async function analyzePhotoWithOllama(
  imageDataUrl: string,
  model = visionModelName(),
  signal?: AbortSignal,
): Promise<PhotoAnalysis> {
  const images = [stripDataUrl(imageDataUrl)];
  const body = {
    model,
    prompt: VISION_PROMPT,
    images,
    stream: false,
    format: "json",
    options: { temperature: 0.2 },
  };
  const res = await fetch(`${OLLAMA_PREFIX}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(friendlyOllamaError(res.status, text, model));
  }
  const data = (await res.json()) as { response?: string };
  const parsed = extractJsonObject(data.response ?? "");
  if (!parsed) {
    throw new Error(
      "The vision model replied, but not with usable JSON. Try another photo or switch to the quiz.",
    );
  }
  return parsePhotoAnalysis(parsed);
}

function friendlyOllamaError(status: number, text: string, model: string): string {
  const lower = text.toLowerCase();
  if (status === 404 || lower.includes("not found") || lower.includes("pull")) {
    return `Ollama does not have ${model} yet. Run: ollama pull ${model}`;
  }
  return `Ollama request failed (${status}). ${text.slice(0, 180)}`;
}
