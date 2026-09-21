import { CATALOG } from "./catalog";
import type {
  BodyConcern,
  Budget,
  CatalogProduct,
  QuizAnswers,
  RoutineResult,
  RoutineStepResult,
} from "./types";

const BUDGET_NEIGHBORS: Record<Budget, Budget[]> = {
  drugstore: ["drugstore", "mid", "splurge"],
  mid: ["mid", "drugstore", "splurge"],
  splurge: ["splurge", "mid", "drugstore"],
};

function budgetRank(product: CatalogProduct, budget: Budget): number {
  const idx = BUDGET_NEIGHBORS[budget].indexOf(product.budget);
  if (idx === 0) return 12;
  if (idx === 1) return 4;
  return 1;
}

function overlap<T>(have: T[] | undefined, want: T[]): number {
  if (!have || have.length === 0) return 0;
  return have.filter((item) => want.includes(item)).length;
}

function typeMatch<T>(have: T[] | undefined, value: T): number {
  if (!have || have.length === 0) return 1;
  return have.includes(value) ? 6 : -8;
}

function scoreSkin(product: CatalogProduct, answers: QuizAnswers): number {
  if (product.avoidSkinTypes?.includes(answers.skinType)) return -40;
  let score = budgetRank(product, answers.budget);
  score += typeMatch(product.skinTypes, answers.skinType);
  score += overlap(product.skinConcerns, answers.skinConcerns) * 7;
  if (answers.skinConcerns[0] && product.skinConcerns?.includes(answers.skinConcerns[0])) {
    score += 5;
  }
  return score;
}

function scoreHair(product: CatalogProduct, answers: QuizAnswers): number {
  let score = budgetRank(product, answers.budget);
  score += typeMatch(product.hairTypes, answers.hairType);
  score += typeMatch(product.scalpTypes, answers.scalpType);
  score += overlap(product.hairConcerns, answers.hairConcerns) * 7;
  return score;
}

function scoreBody(product: CatalogProduct, answers: QuizAnswers): number {
  const concerns = answers.bodyConcerns.filter((c) => c !== "none");
  const wants = concerns.length ? concerns : (["none"] as BodyConcern[]);
  let score = budgetRank(product, answers.budget);
  score += overlap(product.bodyConcerns, wants) * 8;
  if (wants.includes("none") && product.bodyConcerns?.includes("none")) score += 4;
  return score;
}

function pick(
  area: CatalogProduct["area"],
  step: string,
  answers: QuizAnswers,
  count = 2,
  scorer: (p: CatalogProduct, a: QuizAnswers) => number,
): CatalogProduct[] {
  const ranked = CATALOG.filter((p) => p.area === area && p.step === step)
    .map((p) => ({ p, score: scorer(p, answers) }))
    .filter((row) => row.score > -10)
    .sort((a, b) => b.score - a.score);

  const preferredBudget = ranked.filter((row) => row.p.budget === answers.budget);
  const pool = preferredBudget.length ? preferredBudget : ranked;
  const seen = new Set<string>();
  const out: CatalogProduct[] = [];
  for (const row of pool) {
    if (seen.has(row.p.id)) continue;
    seen.add(row.p.id);
    out.push(row.p);
    if (out.length >= count) break;
  }
  if (out.length < count) {
    for (const row of ranked) {
      if (seen.has(row.p.id)) continue;
      seen.add(row.p.id);
      out.push(row.p);
      if (out.length >= count) break;
    }
  }
  return out;
}

function step(
  id: string,
  order: number,
  name: string,
  when: string,
  category: string,
  why: string,
  lookFor: string[],
  products: CatalogProduct[],
): RoutineStepResult | null {
  if (!products.length) return null;
  const mergedLook = Array.from(new Set([...lookFor, ...products.flatMap((p) => p.lookFor)])).slice(
    0,
    6,
  );
  return { id, order, name, when, category, why, lookFor: mergedLook, products };
}

function compact(steps: Array<RoutineStepResult | null>): RoutineStepResult[] {
  return steps.filter((s): s is RoutineStepResult => Boolean(s)).map((s, i) => ({ ...s, order: i + 1 }));
}

function hasSkin(answers: QuizAnswers, ...concerns: QuizAnswers["skinConcerns"]): boolean {
  return concerns.some((c) => answers.skinConcerns.includes(c));
}

function hasHair(answers: QuizAnswers, ...concerns: QuizAnswers["hairConcerns"]): boolean {
  return concerns.some((c) => answers.hairConcerns.includes(c));
}

function hasBody(answers: QuizAnswers, ...concerns: BodyConcern[]): boolean {
  return concerns.some((c) => answers.bodyConcerns.includes(c));
}

function buildSkin(answers: QuizAnswers): RoutineStepResult[] {
  const oilyFamily = answers.skinType === "oily" || answers.skinType === "combination" || hasSkin(answers, "acne", "oiliness", "pores");
  const dryFamily = answers.skinType === "dry" || answers.skinType === "sensitive" || hasSkin(answers, "dryness", "redness");
  const cleanserWhy = oilyFamily
    ? "A gel or light foam keeps oil and leftover SPF from sitting in pores overnight."
    : "A non-foaming cream cleanser respects a thirsty or reactive barrier.";
  const treatWhy = hasSkin(answers, "acne")
    ? "Keep treatments targeted: one pore-clearing or retinoid path, not a five-acid pile-up."
    : hasSkin(answers, "dark-spots", "dullness")
      ? "Brightening belongs in the morning under sunscreen so pigment work is not wasted."
      : hasSkin(answers, "redness", "dryness")
        ? "Barrier first. Actives can wait until sting and flake settle."
        : "One well-chosen serum beats a cluttered shelf.";

  const moisturizerCat = dryFamily ? "Cream moisturizer" : "Gel or light lotion";
  const wantsExfoliant =
    hasSkin(answers, "pores", "texture", "dullness", "acne") && answers.skinType !== "sensitive" && !hasSkin(answers, "redness");
  const wantsEye = hasSkin(answers, "dark-circles", "fine-lines");
  const wantsSpot = hasSkin(answers, "acne");
  const wantsNightRetinoid =
    hasSkin(answers, "fine-lines", "texture", "acne", "pores") && answers.skinType !== "sensitive";
  const wantsHydrate = dryFamily || hasSkin(answers, "dryness", "dullness", "fine-lines");

  const treatStep = hasSkin(answers, "acne")
    ? pick("skin", "treat", answers, 2, scoreSkin)
    : hasSkin(answers, "dark-spots", "dullness")
      ? pick("skin", "treat", answers, 2, scoreSkin)
      : pick("skin", "treat", answers, 2, scoreSkin);

  return compact([
    step(
      "skin-cleanser",
      1,
      "Cleanse",
      "Morning and night",
      oilyFamily ? "Gel cleanser" : "Cream cleanser",
      cleanserWhy,
      oilyFamily ? ["gel or amino acid foam", "niacinamide"] : ["ceramides", "fragrance-free", "non-foaming"],
      pick("skin", "cleanser", answers, 2, scoreSkin),
    ),
    wantsExfoliant
      ? step(
          "skin-exfoliant",
          2,
          "Exfoliate",
          "2–3 nights a week, not with a retinoid",
          hasSkin(answers, "pores", "acne") ? "Leave-on BHA" : "Gentle AHA",
          "Chemical exfoliation beats a face scrub. Stop if you sting, peel, or flush.",
          hasSkin(answers, "pores", "acne")
            ? ["salicylic acid 0.5–2%", "leave-on"]
            : ["lactic or mandelic acid", "low percentage"],
          pick("skin", "exfoliant", answers, 2, scoreSkin),
        )
      : null,
    wantsHydrate
      ? step(
          "skin-hydrate",
          3,
          "Hydrate",
          "After cleansing, on damp skin",
          "Humectant serum",
          "Water-binding layers make whatever cream you use actually stay.",
          ["hyaluronic acid", "panthenol", "apply on damp skin"],
          pick("skin", "hydrate", answers, 2, scoreSkin),
        )
      : null,
    step(
      "skin-treat",
      4,
      "Treat",
      hasSkin(answers, "dark-spots", "dullness") ? "Morning (and night if tolerated)" : "Night, or twice daily if labeled",
      "Targeted serum",
      treatWhy,
      hasSkin(answers, "acne")
        ? ["niacinamide", "azelaic acid", "adapalene (night)"]
        : hasSkin(answers, "dark-spots")
          ? ["vitamin C", "tranexamic acid", "niacinamide"]
          : hasSkin(answers, "redness")
            ? ["azelaic acid", "centella / barrier lipids"]
            : ["one active family at a time"],
      treatStep,
    ),
    wantsNightRetinoid
      ? step(
          "skin-retinoid",
          5,
          "Retinoid (optional night)",
          "2–4 nights a week to start",
          "Retinol or adapalene",
          "Start slow, moisturize around it, and never skip SPF the next day.",
          ["pea size", "sandwich with moisturizer", "not with acids"],
          pick("skin", "treat-night", answers, 2, scoreSkin),
        )
      : null,
    wantsEye
      ? step(
          "skin-eye",
          6,
          "Eye",
          "Morning and night, tap — don't drag",
          "Eye cream",
          "Caffeine for puff, ceramides for dryness, patience for pigment.",
          ["caffeine", "peptides", "fragrance-free"],
          pick("skin", "eye", answers, 2, scoreSkin),
        )
      : null,
    wantsSpot
      ? step(
          "skin-spot",
          7,
          "Spot",
          "As needed on raised blemishes",
          "Patch or benzoyl peroxide",
          "Hands off. A patch or a thin peroxide layer beats a bathroom surgery.",
          ["hydrocolloid", "benzoyl peroxide 2.5–4%"],
          pick("skin", "spot", answers, 2, scoreSkin),
        )
      : null,
    step(
      "skin-moisturizer",
      8,
      "Moisturize",
      "Morning and night, last leave-on before SPF",
      moisturizerCat,
      dryFamily
        ? "Seal water in with ceramides, cholesterol, or a touch of petrolatum."
        : "A gel or light lotion stops oil-control products from rebound-drying you.",
      dryFamily ? ["ceramides", "occlusive"] : ["oil-free", "gel", "niacinamide"],
      pick("skin", "moisturizer", answers, 2, scoreSkin),
    ),
    step(
      "skin-spf",
      9,
      "Protect",
      "Every morning, reapply outdoors",
      "Broad-spectrum SPF 30+",
      "Pigment, lines, and leftover marks all stall without sunscreen. This is the non-negotiable.",
      ["broad spectrum SPF 30+", "enough product (1/4 tsp face)", "no white cast if that is why you skip"],
      pick("skin", "spf", answers, 2, scoreSkin),
    ),
  ]);
}

function buildHair(answers: QuizAnswers): RoutineStepResult[] {
  const curlyFamily = answers.hairType === "curly" || answers.hairType === "coily";
  const flake = answers.scalpType === "flaky" || hasHair(answers, "dandruff");
  const oilyScalp = answers.scalpType === "oily" || hasHair(answers, "oiliness");
  const damaged = hasHair(answers, "damage", "breakage", "color-treated");
  const thin = hasHair(answers, "thinning");
  const frizz = hasHair(answers, "frizz") || curlyFamily;

  const shampooCat = flake
    ? "Medicated or scalp shampoo"
    : oilyScalp
      ? "Clarifying / lightweight shampoo"
      : curlyFamily
        ? "Sulfate-free cleanser"
        : "Everyday shampoo";

  return compact([
    step(
      "hair-shampoo",
      1,
      "Cleanse",
      flake ? "Medicated 2× weekly; gentle on other days" : oilyScalp ? "As often as the roots ask" : "2–4 times a week",
      shampooCat,
      flake
        ? "Give anti-dandruff actives a few minutes on the scalp, then rinse. Alternate with a gentler wash."
        : curlyFamily
          ? "Low-poo keeps the pattern. Clarify only when styles stop working."
          : "Wash the scalp, not the lengths. Let suds run down the ends.",
      flake
        ? ["ketoconazole", "selenium sulfide", "zinc pyrithione"]
        : curlyFamily
          ? ["sulfate-free", "slip"]
          : oilyScalp
            ? ["clarifying", "lightweight"]
            : ["color-safe"],
      pick("hair", "shampoo", answers, 2, scoreHair),
    ),
    step(
      "hair-conditioner",
      2,
      "Condition",
      "Every wash, mid-lengths to ends",
      curlyFamily ? "Rich conditioner" : "Lightweight conditioner",
      curlyFamily
        ? "Slip is breakage prevention. Detangle soaked, not dry."
        : "Keep conditioner off the roots if they flatten by noon.",
      curlyFamily ? ["slip", "shea or fatty alcohols"] : ["lengths only", "lightweight"],
      pick("hair", "conditioner", answers, 2, scoreHair),
    ),
    damaged || curlyFamily || hasHair(answers, "dryness")
      ? step(
          "hair-mask",
          3,
          "Mask / bond",
          damaged ? "1–2× weekly, or Olaplex-style 10+ minutes" : "Weekly",
          damaged ? "Bond treatment or repair mask" : "Moisture mask",
          damaged
            ? "Protein and bond builders belong on a schedule, not in every shower."
            : "A weekly mask is cheaper than cutting off the dry six inches.",
          damaged ? ["bond builder", "pre-shampoo treatment"] : ["shea", "humectants"],
          pick("hair", "mask", answers, 2, scoreHair),
        )
      : null,
    thin
      ? step(
          "hair-scalp",
          4,
          "Scalp treatment",
          "Nightly on a dry or towel-dried scalp",
          "Density serum or minoxidil",
          "Styling will not grow a part. A peptide serum is the gentle start; minoxidil is the evidence-backed one.",
          ["peptides", "minoxidil 5% if you want the labeled option"],
          pick("hair", "scalp-treat", answers, 2, scoreHair),
        )
      : null,
    step(
      "hair-leavein",
      5,
      "Leave-in",
      "On damp hair",
      curlyFamily ? "Curl cream" : damaged ? "Repair leave-in" : "Light leave-in spray",
      "This is where frizz, heat, and ends get a plan before they hit air.",
      curlyFamily ? ["cream", "prayer hands", "gel after"] : ["heat protectant", "ends"],
      pick("hair", "leavein", answers, 2, scoreHair),
    ),
    frizz || oilyScalp
      ? step(
          "hair-style",
          6,
          "Style / finish",
          frizz ? "On damp hair, then air or diffuse" : "Day two, at the roots",
          frizz
            ? answers.hairType === "straight" || answers.hairType === "wavy"
              ? "Humidity spray or gel"
              : "Defining gel"
            : "Dry shampoo",
          frizz
            ? "Lock the shape before the weather does it for you."
            : "Dry shampoo is a bridge, not a personality.",
          frizz ? ["humidity shield", "gel or heat-activated spray"] : ["rice starch", "spray at roots"],
          pick("hair", "style", answers, 2, scoreHair),
        )
      : null,
    damaged || hasHair(answers, "dryness", "frizz")
      ? step(
          "hair-oil",
          7,
          "Oil the ends",
          "1–3 drops on dry ends",
          "Finishing oil",
          "Shine lives on the last two inches. Keep it off the scalp unless the scalp asked.",
          ["lightweight oil", "ends only"],
          pick("hair", "oil", answers, 2, scoreHair),
        )
      : null,
  ]);
}

function buildBody(answers: QuizAnswers): RoutineStepResult[] {
  const simple = answers.bodyConcerns.length === 1 && answers.bodyConcerns[0] === "none";
  const wantsExfoliant = hasBody(answers, "keratosis", "ingrown", "rough-patches", "uneven-tone");
  const wantsMarks = hasBody(answers, "stretch-marks", "uneven-tone");
  const wantsOdor = hasBody(answers, "odor");
  const wantsSpf = hasBody(answers, "uneven-tone");

  return compact([
    step(
      "body-wash",
      1,
      "Wash",
      "Shower, lukewarm if you can stand it",
      simple || hasBody(answers, "dryness") ? "Cream or fragrance-free wash" : "Everyday body wash",
      wantsOdor
        ? "Soap the odor zones; do not sand the whole body. Follow with a smarter deodorant, not a hotter shower."
        : "If your skin is tight after you towel off, the wash is too hungry.",
      ["gentle surfactant", "fragrance-free if itchy"],
      pick("body", "wash", answers, 2, scoreBody),
    ),
    wantsExfoliant
      ? step(
          "body-exfoliant",
          2,
          "Smooth",
          "Nightly lotion or 2–3× weekly scrub",
          "AHA/BHA body treatment",
          "Keratosis and ingrowns prefer acids over a loofah vendetta. Then moisturize.",
          ["salicylic or lactic acid", "urea", "consistent beats harsh"],
          pick("body", "exfoliant", answers, 2, scoreBody),
        )
      : null,
    wantsMarks || wantsOdor
      ? step(
          "body-treat",
          3,
          "Treat",
          wantsOdor ? "After drying, especially at night for antiperspirant" : "Massage daily",
          wantsOdor ? "Deodorant / antiperspirant" : "Mark care oil or serum",
          wantsOdor
            ? "Clinical antiperspirant at night; acid deodorants for zones sticks miss."
            : "Oils and massages keep tissue supple. They do not erase anatomy overnight.",
          wantsOdor ? ["aluminum salt or mandelic acid"] : ["massage", "cocoa butter or targeted serum"],
          pick("body", "treat", answers, 2, scoreBody),
        )
      : null,
    step(
      "body-moisturizer",
      4,
      "Moisturize",
      "Within three minutes of the shower",
      hasBody(answers, "rough-patches", "dryness") ? "Urea or rich cream" : "Daily lotion",
      "Damp skin plus a bland cream is still the most effective body routine on earth.",
      ["ceramides", "urea", "apply damp"],
      pick("body", "moisturizer", answers, 2, scoreBody),
    ),
    wantsSpf
      ? step(
          "body-spf",
          5,
          "Protect exposed skin",
          "Morning on chest, arms, hands",
          "Body SPF 50",
          "Uneven body tone is often just last summer, still hanging around. Sunscreen is the fade plan.",
          ["broad spectrum SPF 50", "chest and hands"],
          pick("body", "spf", answers, 2, scoreBody),
        )
      : null,
  ]);
}

export function summarize(answers: QuizAnswers): string {
  const skin = answers.skinConcerns.slice(0, 2).join(" + ") || "steady maintenance";
  const hair = answers.hairConcerns.slice(0, 2).join(" + ") || "simple upkeep";
  const body =
    answers.bodyConcerns.filter((c) => c !== "none").slice(0, 2).join(" + ") || "a short, kind body routine";
  return `A ${answers.budget} plan for ${answers.skinType} skin (${skin}), ${answers.hairType} hair (${hair}), and ${body}.`;
}

export function recommend(answers: QuizAnswers): RoutineResult {
  const skin = buildSkin(answers);
  const hair = buildHair(answers);
  const body = buildBody(answers);
  return {
    skin,
    hair,
    body,
    summary: summarize(answers),
  };
}

export function answersFromPartial(partial: Partial<QuizAnswers>): QuizAnswers {
  return {
    skinType: partial.skinType ?? "combination",
    skinConcerns: partial.skinConcerns?.length ? partial.skinConcerns : ["dullness"],
    hairType: partial.hairType ?? "wavy",
    hairConcerns: partial.hairConcerns?.length ? partial.hairConcerns : ["dryness"],
    scalpType: partial.scalpType ?? "balanced",
    bodyConcerns: partial.bodyConcerns?.length ? partial.bodyConcerns : ["none"],
    budget: partial.budget ?? "drugstore",
  };
}
