import {
  BODY_CONCERNS,
  BUDGETS,
  DEFAULT_ANSWERS,
  HAIR_CONCERNS,
  HAIR_TYPES,
  SCALP_TYPES,
  SKIN_CONCERNS,
  SKIN_TYPES,
  type BodyConcern,
  type HairConcern,
  type HairType,
  type PhotoAnalysis,
  type QuizAnswers,
  type ScalpType,
  type SkinConcern,
  type SkinType,
} from "./types";

function includes<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}

function pickList<T extends string>(raw: unknown, allowed: readonly T[], max: number): T[] {
  if (!Array.isArray(raw)) return [];
  const out: T[] = [];
  for (const item of raw) {
    if (includes(allowed, item) && !out.includes(item)) out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

export const VISION_JSON_SHAPE = `{
  "skinType": "dry|oily|combination|normal|sensitive",
  "skinConcerns": ["acne","dryness","oiliness","dark-spots","redness","fine-lines","dullness","pores","texture","dark-circles"],
  "hairType": "straight|wavy|curly|coily",
  "hairConcerns": ["dryness","frizz","oiliness","dandruff","damage","thinning","color-treated","breakage"],
  "scalpType": "dry|oily|balanced|sensitive|flaky",
  "bodyConcerns": ["dryness","keratosis","ingrown","stretch-marks","uneven-tone","odor","rough-patches","none"],
  "notes": "one or two kind, non-diagnostic sentences about what you see",
  "confidence": "low|medium|high"
}`;

export const VISION_PROMPT = `You are a careful beauty-product matcher, not a doctor. Look at this photo of a person (face, hair, and/or body). Infer only what the image reasonably supports.

Return JSON only, matching this shape:
${VISION_JSON_SHAPE}

Rules:
- Never diagnose disease. Use everyday concern labels only.
- If the photo is only a face, still guess hairType if hair is visible; otherwise use "wavy" and leave hairConcerns modest.
- If body skin is not shown, use bodyConcerns: ["none"].
- Prefer combination skin when unsure between oily and dry.
- Pick 1–4 skinConcerns, 0–3 hairConcerns.
- Be conservative. confidence should be "low" if lighting is poor, makeup is heavy, or the crop is tight.
- notes must be friendly, specific, and under 280 characters. No medical claims.`;

export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function parsePhotoAnalysis(raw: unknown, fallbackNotes = ""): PhotoAnalysis {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const skinType: SkinType = includes(SKIN_TYPES, obj.skinType) ? obj.skinType : DEFAULT_ANSWERS.skinType;
  const hairType: HairType = includes(HAIR_TYPES, obj.hairType) ? obj.hairType : DEFAULT_ANSWERS.hairType;
  const scalpType: ScalpType = includes(SCALP_TYPES, obj.scalpType) ? obj.scalpType : DEFAULT_ANSWERS.scalpType;
  const skinConcerns = pickList(obj.skinConcerns, SKIN_CONCERNS, 4);
  const hairConcerns = pickList(obj.hairConcerns, HAIR_CONCERNS, 3);
  let bodyConcerns = pickList(obj.bodyConcerns, BODY_CONCERNS, 4);
  if (!bodyConcerns.length) bodyConcerns = ["none"];
  if (bodyConcerns.includes("none") && bodyConcerns.length > 1) {
    bodyConcerns = bodyConcerns.filter((c) => c !== "none");
  }
  const notes =
    typeof obj.notes === "string" && obj.notes.trim()
      ? obj.notes.trim().slice(0, 400)
      : fallbackNotes;
  const confidence =
    obj.confidence === "high" || obj.confidence === "medium" || obj.confidence === "low"
      ? obj.confidence
      : "medium";

  return {
    skinType,
    skinConcerns: skinConcerns.length ? skinConcerns : ["dullness"],
    hairType,
    hairConcerns,
    scalpType,
    bodyConcerns,
    notes,
    confidence,
  };
}

export function analysisToAnswers(analysis: PhotoAnalysis, budget: QuizAnswers["budget"]): QuizAnswers {
  return {
    skinType: analysis.skinType,
    skinConcerns: analysis.skinConcerns,
    hairType: analysis.hairType,
    hairConcerns: analysis.hairConcerns.length ? analysis.hairConcerns : ["dryness"],
    scalpType: analysis.scalpType,
    bodyConcerns: analysis.bodyConcerns,
    budget,
  };
}

export function isLikelyVisionModel(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.includes("vl") ||
    n.includes("vision") ||
    n.includes("moondream") ||
    n.includes("llava") ||
    n.includes("minicpm") ||
    n.includes("gemma3") ||
    n.includes("qwen2.5-vl") ||
    n.includes("qwen3-vl") ||
    n.includes("bakllava")
  );
}

export { BUDGETS };
