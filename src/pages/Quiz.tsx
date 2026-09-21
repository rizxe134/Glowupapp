import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import ChoiceGrid from "../components/ChoiceGrid";
import Shell from "../components/Shell";
import { saveSession } from "../lib/session";

function toggleIn<T extends string>(list: T[], id: T, max: number): T[] {
  if (list.includes(id)) return list.filter((item) => item !== id);
  if (list.length >= max) return [...list.slice(1), id];
  return [...list, id];
}

export default function Quiz() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(DEFAULT_ANSWERS);
  const step = QUIZ_STEPS[index];
  const options = useMemo(() => optionsForStep(step), [step]);
  const progress = ((index + 1) / QUIZ_STEPS.length) * 100;

  function selected() {
    const value = answers[step.id];
    return value;
  }

  function canContinue() {
    const value = answers[step.id];
    if (step.multi) {
      const list = value as string[];
      const min = step.min ?? 1;
      return list.length >= min;
    }
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
        case "skinConcerns": {
          let list = toggleIn(prev.skinConcerns, id as SkinConcern, step.max ?? 4);
          next.skinConcerns = list;
          break;
        }
        case "hairConcerns": {
          next.hairConcerns = toggleIn(prev.hairConcerns, id as HairConcern, step.max ?? 3);
          break;
        }
        case "bodyConcerns": {
          if (id === "none") {
            next.bodyConcerns = ["none"];
            break;
          }
          const withoutNone = prev.bodyConcerns.filter((c) => c !== "none");
          next.bodyConcerns = toggleIn(withoutNone, id as BodyConcern, step.max ?? 4);
          break;
        }
      }
      return next;
    });
  }

  function nextStep() {
    if (index < QUIZ_STEPS.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    saveSession(answers, "quiz");
    navigate("/results");
  }

  return (
    <Shell
      actions={
        <button className="ghost" type="button" onClick={() => navigate("/")}>
          Start over
        </button>
      }
    >
      <div className="progress-wrap">
        <span className="kicker">
          Question {index + 1} of {QUIZ_STEPS.length}
        </span>
        <span className="note">{Math.round(progress)}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <h1 className="quiz-title">{step.title}</h1>
      <p className="lede">{step.subtitle}</p>
      <ChoiceGrid
        options={options}
        selected={selected()}
        multi={step.multi}
        onToggle={onToggle}
      />
      <div className="quiz-nav">
        <button
          className="secondary"
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          Back
        </button>
        <button className="primary" type="button" disabled={!canContinue()} onClick={nextStep}>
          {index === QUIZ_STEPS.length - 1 ? "See my routine" : "Continue"}
        </button>
      </div>
    </Shell>
  );
}
