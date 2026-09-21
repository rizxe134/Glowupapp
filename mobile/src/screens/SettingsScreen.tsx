import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { DEFAULT_VISION_MODEL, LOW_RAM_VISION_MODEL } from "@glow/shared";
import { pingOllama } from "../lib/ollama";
import { DEFAULT_OLLAMA_URL, loadOllamaSettings, saveOllamaSettings } from "../lib/settings";
import type { Nav } from "../nav";
import { styles } from "../theme";

export default function SettingsScreen({ nav }: { nav: Nav }) {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_OLLAMA_URL);
  const [model, setModel] = useState(DEFAULT_VISION_MODEL);
  const [status, setStatus] = useState("Not checked yet.");
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
    void loadOllamaSettings().then((s) => {
      setBaseUrl(s.baseUrl);
      setModel(s.model);
    });
  }, []);

  async function save() {
    await saveOllamaSettings(baseUrl, model);
    const ping = await pingOllama();
    setStatus(ping.ok ? ping.detail : `Offline: ${ping.detail}`);
    setModels(ping.models);
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>Ollama on your Mac</Text>
        <Text style={styles.title}>Where should photos go?</Text>
        <Text style={styles.lede}>
          Simulator can use {DEFAULT_OLLAMA_URL}. A physical iPhone needs your Mac’s LAN IP, and
          Ollama must listen on all interfaces:
        </Text>
        <Text selectable style={styles.cardBody}>
          OLLAMA_HOST=0.0.0.0:11434 ollama serve
        </Text>
        <Text style={[styles.choiceLabel, { marginTop: 18 }]}>Base URL</Text>
        <TextInput
          value={baseUrl}
          onChangeText={setBaseUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="http://192.168.x.x:11434"
          style={styles.input}
        />
        <Text style={[styles.choiceLabel, { marginTop: 18 }]}>Vision model</Text>
        <TextInput
          value={model}
          onChangeText={setModel}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <Text style={styles.lede}>
          Default {DEFAULT_VISION_MODEL}. Low-RAM fallback: {LOW_RAM_VISION_MODEL} (`ollama pull{" "}
          {LOW_RAM_VISION_MODEL}`).
        </Text>
        <Pressable style={styles.primary} onPress={() => void save()}>
          <Text style={styles.primaryText}>Save & ping</Text>
        </Pressable>
        <Text style={styles.lede}>{status}</Text>
        {models.length ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Models on this host</Text>
            {models.map((name) => (
              <Text key={name} style={styles.cardBody}>
                {name}
              </Text>
            ))}
          </View>
        ) : null}
        <Pressable style={styles.secondary} onPress={() => nav.go("home")}>
          <Text style={styles.secondaryText}>Back home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
