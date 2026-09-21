import { recommend } from "@glow/shared";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import RoutineBlocks from "../components/RoutineBlocks";
import type { Nav } from "../nav";
import { styles } from "../theme";

export default function ResultsScreen({ nav }: { nav: Nav }) {
  if (!nav.session) {
    return (
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>No routine yet.</Text>
          <Text style={styles.lede}>Take the quiz first — it does not need Ollama.</Text>
          <Pressable style={styles.primary} onPress={() => nav.go("quiz")}>
            <Text style={styles.primaryText}>Take the quiz</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const result = recommend(nav.session.answers);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>
          {nav.session.source === "photo" ? "From your photo" : "From your quiz"} ·{" "}
          {nav.session.answers.budget}
        </Text>
        <Text style={styles.title}>Your Glow Guide</Text>
        <Text style={styles.lede}>{result.summary}</Text>
        <RoutineBlocks result={result} notes={nav.session.notes} />
        <View style={styles.row}>
          <Pressable style={[styles.secondary, { flex: 1 }]} onPress={() => nav.go("quiz")}>
            <Text style={styles.secondaryText}>Retake quiz</Text>
          </Pressable>
          <Pressable style={[styles.secondary, { flex: 1 }]} onPress={() => nav.go("photo")}>
            <Text style={styles.secondaryText}>Photo</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => {
            nav.setSession(null);
            nav.go("home");
          }}
        >
          <Text style={styles.ghostText}>Start over</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
