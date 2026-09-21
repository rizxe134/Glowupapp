import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import {
  DEFAULT_ANSWERS,
  QUIZ_STEPS,
  optionsForStep,
  type BodyConcern,
  type HairConcern,
  type QuizAnswers,
  type QuizField,
  type SkinConcern,
} from "@glow/shared";
import ChoiceList from "../components/ChoiceList";
import type { Nav } from "../nav";
import { styles } from "../theme";

function toggleIn<T extends string>(list: T[], id: T, max: number): T[] {
  if (list.includes(id)) return list.filter((item) => item !== id);
  if (list.length >= max) return [...list.slice(1), id];
  return [...list, id];
}

export default function QuizScreen({ nav }: { nav: Nav }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(DEFAULT_ANSWERS);
  const step = QUIZ_STEPS[index];
  const options = useMemo(() => optionsForStep(step), [step]);
  const progress = Math.round(((index + 1) / QUIZ_STEPS.length) * 100);

  function canContinue() {
    const value = answers[step.id];
    if (step.multi) return (value as string[]).length >= (step.min ?? 1);
    return Boolean(value);
  }

  function onToggle(id: string) {
    setAnswers((prev) => {
      const next = { ...prev };
      switch (step.id) {
        case "skinType":
        case "hairType":
        case "scalpType":
        case "budget":
          (next as Record<QuizField, unknown>)[step.id] = id;
          break;
        case "skinConcerns":
          next.skinConcerns = toggleIn(prev.skinConcerns, id as SkinConcern, step.max ?? 4);
          break;
        case "hairConcerns":
          next.hairConcerns = toggleIn(prev.hairConcerns, id as HairConcern, step.max ?? 3);
          break;
        case "bodyConcerns":
          if (id === "none") {
            next.bodyConcerns = ["none"];
            break;
          }
          next.bodyConcerns = toggleIn(
            prev.bodyConcerns.filter((c) => c !== "none"),
            id as BodyConcern,
            step.max ?? 4,
          );
          break;
      }
      return next;
    });
  }

  function next() {
    if (index < QUIZ_STEPS.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    nav.setSession({ answers, source: "quiz", notes: "" });
    nav.go("results");
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>
          Question {index + 1} of {QUIZ_STEPS.length} · {progress}%
        </Text>
        <View
          style={{
            height: 6,
            backgroundColor: "rgba(42,28,22,0.08)",
            borderRadius: 99,
            overflow: "hidden",
            marginTop: 10,
            marginBottom: 18,
          }}
        >
          <View style={{ width: `${progress}%`, height: 6, backgroundColor: "#C45C4A" }} />
        </View>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.lede}>{step.subtitle}</Text>
        <ChoiceList
          options={options}
          selected={answers[step.id]}
          multi={step.multi}
          onToggle={onToggle}
        />
        <View style={styles.row}>
          <Pressable
            style={[styles.secondary, { flex: 1 }]}
            onPress={() => (index === 0 ? nav.go("home") : setIndex((i) => i - 1))}
          >
            <Text style={styles.secondaryText}>{index === 0 ? "Home" : "Back"}</Text>
          </Pressable>
          <Pressable
            style={[styles.primary, { flex: 1, opacity: canContinue() ? 1 : 0.4 }]}
            disabled={!canContinue()}
            onPress={next}
          >
            <Text style={styles.primaryText}>
              {index === QUIZ_STEPS.length - 1 ? "See routine" : "Continue"}
            </Text>
          </Pressable>
        </View>
        <Pressable onPress={() => nav.go("home")}>
          <Text style={styles.ghostText}>Start over</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
