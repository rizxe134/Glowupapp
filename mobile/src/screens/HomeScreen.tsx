import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { MEDICAL_DISCLAIMER } from "@glow/shared";
import type { Nav } from "../nav";
import { styles } from "../theme";

export default function HomeScreen({ nav }: { nav: Nav }) {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>Glowup · local ritual</Text>
        <Text style={styles.title}>Glow Guide for skin, hair, and body.</Text>
        <Text style={styles.lede}>
          The quiz works fully offline. Photo analysis talks only to Ollama on your Mac — never a
          paid cloud API.
        </Text>
        <Pressable style={styles.card} onPress={() => nav.go("quiz")}>
          <Text style={styles.cardTitle}>Take the quiz</Text>
          <Text style={styles.cardBody}>
            Skin, hair, scalp, body, budget. Back, progress, start over.
          </Text>
        </Pressable>
        <Pressable style={styles.card} onPress={() => nav.go("photo")}>
          <Text style={styles.cardTitle}>Analyze a photo</Text>
          <Text style={styles.cardBody}>
            Camera or library, then edit concern chips before the routine is built.
          </Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => nav.go("settings")}>
          <Text style={styles.secondaryText}>Ollama settings</Text>
        </Pressable>
        <Text style={styles.lede}>{MEDICAL_DISCLAIMER}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
