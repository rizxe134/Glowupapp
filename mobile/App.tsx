import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import HomeScreen from "./src/screens/HomeScreen";
import PhotoScreen from "./src/screens/PhotoScreen";
import QuizScreen from "./src/screens/QuizScreen";
import ResultsScreen from "./src/screens/ResultsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import type { Nav, ScreenName, Session } from "./src/nav";

export default function App() {
  const [screen, setScreen] = useState<ScreenName>("home");
  const [session, setSession] = useState<Session | null>(null);
  const nav: Nav = { go: setScreen, session, setSession };

  return (
    <>
      <StatusBar style="dark" />
      {screen === "home" ? <HomeScreen nav={nav} /> : null}
      {screen === "quiz" ? <QuizScreen nav={nav} /> : null}
      {screen === "photo" ? <PhotoScreen nav={nav} /> : null}
      {screen === "results" ? <ResultsScreen nav={nav} /> : null}
      {screen === "settings" ? <SettingsScreen nav={nav} /> : null}
    </>
  );
}
