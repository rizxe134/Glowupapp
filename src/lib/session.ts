import type { QuizAnswers } from "@glow/shared";

const ANSWERS_KEY = "glow-guide.answers";
const SOURCE_KEY = "glow-guide.source";
const NOTES_KEY = "glow-guide.notes";

export type ResultSource = "quiz" | "photo";

export function saveSession(answers: QuizAnswers, source: ResultSource, notes = "") {
  sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  sessionStorage.setItem(SOURCE_KEY, source);
  sessionStorage.setItem(NOTES_KEY, notes);
}

export function loadSession(): { answers: QuizAnswers; source: ResultSource; notes: string } | null {
  const raw = sessionStorage.getItem(ANSWERS_KEY);
  if (!raw) return null;
  try {
    const answers = JSON.parse(raw) as QuizAnswers;
    const source = (sessionStorage.getItem(SOURCE_KEY) as ResultSource | null) ?? "quiz";
    const notes = sessionStorage.getItem(NOTES_KEY) ?? "";
    return { answers, source, notes };
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(ANSWERS_KEY);
  sessionStorage.removeItem(SOURCE_KEY);
  sessionStorage.removeItem(NOTES_KEY);
}
