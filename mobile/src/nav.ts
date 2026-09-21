import type { QuizAnswers } from "@glow/shared";

export type ScreenName = "home" | "quiz" | "photo" | "results" | "settings";

export type ResultSource = "quiz" | "photo";

export interface Session {
  answers: QuizAnswers;
  source: ResultSource;
  notes: string;
}

export interface Nav {
  go: (screen: ScreenName) => void;
  session: Session | null;
  setSession: (session: Session | null) => void;
}
