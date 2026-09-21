import { useEffect, useRef, useState } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import {
  BODY_CONCERN_OPTIONS,
  BUDGET_OPTIONS,
  HAIR_CONCERN_OPTIONS,
  HAIR_TYPE_OPTIONS,
  LOW_RAM_VISION_MODEL,
  SCALP_TYPE_OPTIONS,
  SKIN_CONCERN_OPTIONS,
  SKIN_TYPE_OPTIONS,
  analysisToAnswers,
  type BodyConcern,
  type Budget,
  type HairConcern,
  type HairType,
  type PhotoAnalysis,
  type ScalpType,
  type SkinConcern,
  type SkinType,
} from "@glow/shared";
import { analyzePhotoBase64, pingOllama } from "../lib/ollama";
import { loadOllamaSettings } from "../lib/settings";
import type { Nav } from "../nav";
import { styles } from "../theme";

function ChipRow<T extends string>({
  options,
  on,
  onToggle,
}: {
  options: { id: T; label: string }[];
  on: (id: T) => boolean;
  onToggle: (id: T) => void;
}) {
  return (
    <View style={styles.chipWrap}>
      {options.map((opt) => {
        const active = on(opt.id);
        return (
          <Pressable
            key={opt.id}
            onPress={() => onToggle(opt.id)}
            style={[styles.chip, active && styles.chipOn]}
          >
            <Text style={[styles.chipText, active && styles.chipTextOn]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function PhotoScreen({ nav }: { nav: Nav }) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cam, setCam] = useState(false);
  const [uri, setUri] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [budget, setBudget] = useState<Budget>("drugstore");
  const [hostNote, setHostNote] = useState("Checking Ollama…");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      const settings = await loadOllamaSettings();
      const ping = await pingOllama();
      if (!ping.ok) {
        setReady(false);
        setHostNote(
          `Cannot reach ${settings.baseUrl}. On a device, set your Mac LAN IP in Settings. Simulator: ${settings.baseUrl}. Start Ollama with OLLAMA_HOST=0.0.0.0:11434 ollama serve. Low RAM: ollama pull ${LOW_RAM_VISION_MODEL}. Quiz still works offline.`,
        );
        return;
      }
      const hasModel = ping.models.some(
        (n) => n === settings.model || n.startsWith(`${settings.model}`),
      );
      setReady(true);
      setHostNote(
        hasModel
          ? `Ollama ok · ${settings.model}`
          : `Ollama is up, but ${settings.model} is missing. Run ollama pull ${settings.model} (or ${LOW_RAM_VISION_MODEL}).`,
      );
    })();
  }, []);

  async function pickLibrary() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Photo library permission is needed to pick an existing picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.75,
      base64: true,
    });
    if (result.canceled || !result.assets[0]) return;
    setUri(result.assets[0].uri);
    setBase64(result.assets[0].base64 ?? null);
    setAnalysis(null);
    setCam(false);
  }

  async function snap() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.75, base64: true });
    if (!photo) return;
    setUri(photo.uri);
    setBase64(photo.base64 ?? null);
    setAnalysis(null);
    setCam(false);
  }

  async function analyze() {
    if (!base64) {
      setError("Could not read that image as base64. Try another photo.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setAnalysis(await analyzePhotoBase64(base64));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  function build() {
    if (!analysis) return;
    nav.setSession({
      answers: analysisToAnswers(analysis, budget),
      source: "photo",
      notes: analysis.notes,
    });
    nav.go("results");
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>Photo path · your Mac’s Ollama</Text>
        <Text style={styles.title}>Snap, then edit the chips.</Text>
        <Text style={styles.lede}>{hostNote}</Text>

        {cam && permission?.granted ? (
          <View style={{ height: 420, borderRadius: 22, overflow: "hidden", marginBottom: 12 }}>
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />
          </View>
        ) : null}

        {uri ? <Image source={{ uri }} style={styles.preview} /> : null}

        <Pressable
          style={styles.primary}
          onPress={() => {
            if (!permission?.granted) {
              void requestPermission().then((p) => {
                if (p.granted) setCam(true);
              });
              return;
            }
            setCam(true);
          }}
        >
          <Text style={styles.primaryText}>Open camera</Text>
        </Pressable>
        {cam ? (
          <Pressable style={styles.primary} onPress={() => void snap()}>
            <Text style={styles.primaryText}>Capture</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.secondary} onPress={() => void pickLibrary()}>
          <Text style={styles.secondaryText}>Choose from library</Text>
        </Pressable>
        <Pressable
          style={[styles.primary, { opacity: base64 && ready && !busy ? 1 : 0.4 }]}
          disabled={!base64 || !ready || busy}
          onPress={() => void analyze()}
        >
          <Text style={styles.primaryText}>{busy ? "Reading photo…" : "Analyze with Ollama"}</Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {analysis ? (
          <View>
            <Text style={[styles.cardTitle, { marginTop: 18 }]}>Edit what it noticed</Text>
            <Text style={styles.lede}>
              {analysis.confidence} confidence. {analysis.notes}
            </Text>
            <Text style={styles.choiceLabel}>Skin type</Text>
            <ChipRow
              options={SKIN_TYPE_OPTIONS}
              on={(id) => analysis.skinType === id}
              onToggle={(id) => setAnalysis({ ...analysis, skinType: id as SkinType })}
            />
            <Text style={[styles.choiceLabel, { marginTop: 12 }]}>Skin concerns</Text>
            <ChipRow
              options={SKIN_CONCERN_OPTIONS}
              on={(id) => analysis.skinConcerns.includes(id)}
              onToggle={(id) => {
                const has = analysis.skinConcerns.includes(id as SkinConcern);
                const skinConcerns = has
                  ? analysis.skinConcerns.filter((c) => c !== id)
                  : [...analysis.skinConcerns, id as SkinConcern].slice(-4);
                setAnalysis({ ...analysis, skinConcerns });
              }}
            />
            <Text style={[styles.choiceLabel, { marginTop: 12 }]}>Hair type</Text>
            <ChipRow
              options={HAIR_TYPE_OPTIONS}
              on={(id) => analysis.hairType === id}
              onToggle={(id) => setAnalysis({ ...analysis, hairType: id as HairType })}
            />
            <Text style={[styles.choiceLabel, { marginTop: 12 }]}>Hair concerns</Text>
            <ChipRow
              options={HAIR_CONCERN_OPTIONS}
              on={(id) => analysis.hairConcerns.includes(id)}
              onToggle={(id) => {
                const has = analysis.hairConcerns.includes(id as HairConcern);
                const hairConcerns = has
                  ? analysis.hairConcerns.filter((c) => c !== id)
                  : [...analysis.hairConcerns, id as HairConcern].slice(-3);
                setAnalysis({ ...analysis, hairConcerns });
              }}
            />
            <Text style={[styles.choiceLabel, { marginTop: 12 }]}>Scalp</Text>
            <ChipRow
              options={SCALP_TYPE_OPTIONS}
              on={(id) => analysis.scalpType === id}
              onToggle={(id) => setAnalysis({ ...analysis, scalpType: id as ScalpType })}
            />
            <Text style={[styles.choiceLabel, { marginTop: 12 }]}>Body</Text>
            <ChipRow
              options={BODY_CONCERN_OPTIONS}
              on={(id) => analysis.bodyConcerns.includes(id)}
              onToggle={(id) => {
                if (id === "none") {
                  setAnalysis({ ...analysis, bodyConcerns: ["none"] });
                  return;
                }
                const without: BodyConcern[] = analysis.bodyConcerns.filter((c) => c !== "none");
                const next = without.includes(id)
                  ? without.filter((c) => c !== id)
                  : [...without, id].slice(-4);
                setAnalysis({
                  ...analysis,
                  bodyConcerns: next.length ? next : ["none"],
                });
              }}
            />
            <Text style={[styles.choiceLabel, { marginTop: 12 }]}>Budget</Text>
            <ChipRow
              options={BUDGET_OPTIONS}
              on={(id) => budget === id}
              onToggle={(id) => setBudget(id as Budget)}
            />
            <Pressable style={styles.primary} onPress={build}>
              <Text style={styles.primaryText}>Build my routine</Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable onPress={() => nav.go("quiz")}>
          <Text style={styles.ghostText}>Skip to quiz (works offline)</Text>
        </Pressable>
        <Pressable onPress={() => nav.go("settings")}>
          <Text style={styles.ghostText}>Ollama settings</Text>
        </Pressable>
        <Pressable onPress={() => nav.go("home")}>
          <Text style={styles.ghostText}>Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
