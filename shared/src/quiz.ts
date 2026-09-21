import type {
  BodyConcern,
  Budget,
  ChoiceOption,
  HairConcern,
  HairType,
  QuizStep,
  ScalpType,
  SkinConcern,
  SkinType,
} from "./types";

export const QUIZ_STEPS: QuizStep[] = [
  {
    id: "skinType",
    title: "How does your skin usually feel?",
    subtitle: "Think about mid-afternoon, not right after you wash.",
    multi: false,
  },
  {
    id: "skinConcerns",
    title: "What would you like your skin to do less of?",
    subtitle: "Pick up to four. We will rank treatments around these.",
    multi: true,
    min: 1,
    max: 4,
  },
  {
    id: "hairType",
    title: "What is your hair pattern?",
    subtitle: "Air-dried, without a hot tool, is the honest version.",
    multi: false,
  },
  {
    id: "hairConcerns",
    title: "Hair goals, not hair shame.",
    subtitle: "Choose up to three. We will keep the routine short.",
    multi: true,
    min: 1,
    max: 3,
  },
  {
    id: "scalpType",
    title: "How is the scalp behaving?",
    subtitle: "The scalp is skin. It gets its own cleanser logic.",
    multi: false,
  },
  {
    id: "bodyConcerns",
    title: "Anything the body is asking for?",
    subtitle: "Skip with “feeling fine” if you only want a simple wash + cream.",
    multi: true,
    min: 1,
    max: 4,
  },
  {
    id: "budget",
    title: "Where should we shop?",
    subtitle: "Every routine can stay complete at any budget. This only swaps examples.",
    multi: false,
  },
];

export const SKIN_TYPE_OPTIONS: ChoiceOption<SkinType>[] = [
  { id: "dry", label: "Dry", hint: "Tight, flaky, drinks moisturizer" },
  { id: "oily", label: "Oily", hint: "Shine by lunch, makeup slides" },
  { id: "combination", label: "Combination", hint: "Oily T-zone, drier cheeks" },
  { id: "normal", label: "Balanced", hint: "Comfortable most days" },
  { id: "sensitive", label: "Sensitive", hint: "Stings, flushes, easy to upset" },
];

export const SKIN_CONCERN_OPTIONS: ChoiceOption<SkinConcern>[] = [
  { id: "acne", label: "Breakouts", hint: "Clogs, spots, leftover marks" },
  { id: "dryness", label: "Dry patches", hint: "Tight, rough, thirsty" },
  { id: "oiliness", label: "Oil", hint: "Midday shine, makeup melt" },
  { id: "dark-spots", label: "Dark spots", hint: "Sun, acne, or hormone marks" },
  { id: "redness", label: "Redness", hint: "Flushing, irritation, uneven pink" },
  { id: "fine-lines", label: "Fine lines", hint: "Creasing, bounce, firmness" },
  { id: "dullness", label: "Dullness", hint: "Gray cast, no glow" },
  { id: "pores", label: "Pores", hint: "Visible, congested, textured" },
  { id: "texture", label: "Texture", hint: "Bumps, roughness, uneven feel" },
  { id: "dark-circles", label: "Dark circles", hint: "Under-eye shadow, puffiness" },
];

export const HAIR_TYPE_OPTIONS: ChoiceOption<HairType>[] = [
  { id: "straight", label: "Straight", hint: "Mostly 1A–1C, little bend" },
  { id: "wavy", label: "Wavy", hint: "S-shape, 2A–2C" },
  { id: "curly", label: "Curly", hint: "Spirals, 3A–3C" },
  { id: "coily", label: "Coily", hint: "Tight coils, 4A–4C" },
];

export const HAIR_CONCERN_OPTIONS: ChoiceOption<HairConcern>[] = [
  { id: "dryness", label: "Dryness", hint: "Straw feel, no slip" },
  { id: "frizz", label: "Frizz", hint: "Halo, weather puff" },
  { id: "oiliness", label: "Oil at the roots", hint: "Flat by day two" },
  { id: "dandruff", label: "Flakes", hint: "White or yellow, itchy" },
  { id: "damage", label: "Heat / bleach damage", hint: "Snags, stretch, dull" },
  { id: "thinning", label: "Thinning look", hint: "See-through parts, shed" },
  { id: "color-treated", label: "Color-treated", hint: "Fade, brass, dryness" },
  { id: "breakage", label: "Breakage", hint: "Short bits, weak lengths" },
];

export const SCALP_TYPE_OPTIONS: ChoiceOption<ScalpType>[] = [
  { id: "dry", label: "Dry", hint: "Tight, itchy, little oil" },
  { id: "oily", label: "Oily", hint: "Greasy within a day" },
  { id: "balanced", label: "Balanced", hint: "Comfortable between washes" },
  { id: "sensitive", label: "Sensitive", hint: "Burns with fragrance" },
  { id: "flaky", label: "Flaky", hint: "Visible flakes, buildup" },
];

export const BODY_CONCERN_OPTIONS: ChoiceOption<BodyConcern>[] = [
  { id: "dryness", label: "Dryness", hint: "Ashy, tight after shower" },
  { id: "keratosis", label: "Bumpy arms", hint: "KP, strawberry skin" },
  { id: "ingrown", label: "Ingrowns", hint: "Bikini, legs, underarm" },
  { id: "stretch-marks", label: "Stretch marks", hint: "Texture + fade over time" },
  { id: "uneven-tone", label: "Uneven tone", hint: "Spotting, leftover tan" },
  { id: "odor", label: "Odor", hint: "Wants a smarter wash" },
  { id: "rough-patches", label: "Rough elbows / knees", hint: "Thick, dull skin" },
  { id: "none", label: "Feeling fine", hint: "Keep body care simple" },
];

export const BUDGET_OPTIONS: ChoiceOption<Budget>[] = [
  {
    id: "drugstore",
    label: "Drugstore",
    hint: "Pharmacy staples, usually under $20",
  },
  {
    id: "mid",
    label: "Mid-range",
    hint: "The $20–$50 sweet spot",
  },
  {
    id: "splurge",
    label: "Splurge",
    hint: "Investment textures and actives",
  },
];

export function optionsForStep(step: QuizStep): ChoiceOption[] {
  switch (step.id) {
    case "skinType":
      return SKIN_TYPE_OPTIONS;
    case "skinConcerns":
      return SKIN_CONCERN_OPTIONS;
    case "hairType":
      return HAIR_TYPE_OPTIONS;
    case "hairConcerns":
      return HAIR_CONCERN_OPTIONS;
    case "scalpType":
      return SCALP_TYPE_OPTIONS;
    case "bodyConcerns":
      return BODY_CONCERN_OPTIONS;
    case "budget":
      return BUDGET_OPTIONS;
  }
}

export const MEDICAL_DISCLAIMER =
  "Glow Guide is a local product-matching tool, not medical advice. It does not diagnose, treat, or prevent disease. Patch-test new products, follow the label, and talk to a clinician for rashes, infections, sudden hair loss, or anything that worries you.";
