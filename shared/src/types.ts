export type SkinType = "dry" | "oily" | "combination" | "normal" | "sensitive";

export type SkinConcern =
  | "acne"
  | "dryness"
  | "oiliness"
  | "dark-spots"
  | "redness"
  | "fine-lines"
  | "dullness"
  | "pores"
  | "texture"
  | "dark-circles";

export type HairType = "straight" | "wavy" | "curly" | "coily";

export type HairConcern =
  | "dryness"
  | "frizz"
  | "oiliness"
  | "dandruff"
  | "damage"
  | "thinning"
  | "color-treated"
  | "breakage";

export type ScalpType = "dry" | "oily" | "balanced" | "sensitive" | "flaky";

export type BodyConcern =
  | "dryness"
  | "keratosis"
  | "ingrown"
  | "stretch-marks"
  | "uneven-tone"
  | "odor"
  | "rough-patches"
  | "none";

export type Budget = "drugstore" | "mid" | "splurge";

export type Area = "skin" | "hair" | "body";

export interface QuizAnswers {
  skinType: SkinType;
  skinConcerns: SkinConcern[];
  hairType: HairType;
  hairConcerns: HairConcern[];
  scalpType: ScalpType;
  bodyConcerns: BodyConcern[];
  budget: Budget;
}

export interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  area: Area;
  category: string;
  step: string;
  budget: Budget;
  lookFor: string[];
  why: string;
  skinTypes?: SkinType[];
  skinConcerns?: SkinConcern[];
  hairTypes?: HairType[];
  hairConcerns?: HairConcern[];
  scalpTypes?: ScalpType[];
  bodyConcerns?: BodyConcern[];
  avoidSkinTypes?: SkinType[];
}

export interface RoutineStepResult {
  id: string;
  order: number;
  name: string;
  when: string;
  category: string;
  why: string;
  lookFor: string[];
  products: CatalogProduct[];
}

export interface RoutineResult {
  skin: RoutineStepResult[];
  hair: RoutineStepResult[];
  body: RoutineStepResult[];
  summary: string;
}

export interface PhotoAnalysis {
  skinType: SkinType;
  skinConcerns: SkinConcern[];
  hairType: HairType;
  hairConcerns: HairConcern[];
  scalpType: ScalpType;
  bodyConcerns: BodyConcern[];
  notes: string;
  confidence: "low" | "medium" | "high";
}

export interface ChoiceOption<T extends string = string> {
  id: T;
  label: string;
  hint: string;
}

export type QuizField =
  | "skinType"
  | "skinConcerns"
  | "hairType"
  | "hairConcerns"
  | "scalpType"
  | "bodyConcerns"
  | "budget";

export interface QuizStep {
  id: QuizField;
  title: string;
  subtitle: string;
  multi: boolean;
  min?: number;
  max?: number;
}

export const SKIN_TYPES: SkinType[] = [
  "dry",
  "oily",
  "combination",
  "normal",
  "sensitive",
];

export const SKIN_CONCERNS: SkinConcern[] = [
  "acne",
  "dryness",
  "oiliness",
  "dark-spots",
  "redness",
  "fine-lines",
  "dullness",
  "pores",
  "texture",
  "dark-circles",
];

export const HAIR_TYPES: HairType[] = ["straight", "wavy", "curly", "coily"];

export const HAIR_CONCERNS: HairConcern[] = [
  "dryness",
  "frizz",
  "oiliness",
  "dandruff",
  "damage",
  "thinning",
  "color-treated",
  "breakage",
];

export const SCALP_TYPES: ScalpType[] = [
  "dry",
  "oily",
  "balanced",
  "sensitive",
  "flaky",
];

export const BODY_CONCERNS: BodyConcern[] = [
  "dryness",
  "keratosis",
  "ingrown",
  "stretch-marks",
  "uneven-tone",
  "odor",
  "rough-patches",
  "none",
];

export const BUDGETS: Budget[] = ["drugstore", "mid", "splurge"];

export const DEFAULT_ANSWERS: QuizAnswers = {
  skinType: "combination",
  skinConcerns: [],
  hairType: "wavy",
  hairConcerns: [],
  scalpType: "balanced",
  bodyConcerns: ["none"],
  budget: "drugstore",
};

export const DEFAULT_VISION_MODEL = "qwen3-vl:4b";
export const LOW_RAM_VISION_MODEL = "moondream";
