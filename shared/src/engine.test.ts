import { describe, expect, it } from "vitest";
import { recommend } from "./engine";
import { parsePhotoAnalysis } from "./photo";
import type { QuizAnswers } from "./types";

const base: QuizAnswers = {
  skinType: "oily",
  skinConcerns: ["acne", "pores"],
  hairType: "straight",
  hairConcerns: ["oiliness"],
  scalpType: "oily",
  bodyConcerns: ["keratosis"],
  budget: "drugstore",
};

describe("recommend", () => {
  it("returns ordered skin, hair, and body steps with products", () => {
    const result = recommend(base);
    expect(result.skin.length).toBeGreaterThan(3);
    expect(result.hair.length).toBeGreaterThan(2);
    expect(result.body.length).toBeGreaterThan(2);
    for (const section of [result.skin, result.hair, result.body]) {
      section.forEach((step, i) => {
        expect(step.order).toBe(i + 1);
        expect(step.products.length).toBeGreaterThan(0);
        expect(step.why.length).toBeGreaterThan(10);
        expect(step.lookFor.length).toBeGreaterThan(0);
      });
    }
    expect(result.skin.some((s) => s.id === "skin-spf")).toBe(true);
    expect(result.skin.some((s) => s.id === "skin-spot")).toBe(true);
    expect(result.body.some((s) => s.id === "body-exfoliant")).toBe(true);
  });

  it("respects budget when matching products", () => {
    const drugstore = recommend({ ...base, budget: "drugstore" });
    const splurge = recommend({ ...base, budget: "splurge" });
    const drugNames = drugstore.skin.flatMap((s) => s.products.map((p) => p.id)).join(" ");
    const splurgeNames = splurge.skin.flatMap((s) => s.products.map((p) => p.id)).join(" ");
    expect(drugNames).toMatch(/cerave|ordinary|panoxyl|timeless|beauty-of-joseon/i);
    expect(splurgeNames).not.toEqual(drugNames);
  });

  it("keeps a simple body routine when the user is feeling fine", () => {
    const result = recommend({ ...base, bodyConcerns: ["none"] });
    expect(result.body.some((s) => s.id === "body-exfoliant")).toBe(false);
    expect(result.body.some((s) => s.id === "body-moisturizer")).toBe(true);
  });
});

describe("parsePhotoAnalysis", () => {
  it("coerces unknown labels and fills defaults", () => {
    const parsed = parsePhotoAnalysis({
      skinType: "glass",
      skinConcerns: ["acne", "vampires", "pores"],
      hairType: "wavy",
      notes: "Soft shine on the T-zone.",
    });
    expect(parsed.skinType).toBe("combination");
    expect(parsed.skinConcerns).toEqual(["acne", "pores"]);
    expect(parsed.bodyConcerns).toEqual(["none"]);
    expect(parsed.notes).toContain("T-zone");
  });
});
