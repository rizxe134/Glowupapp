import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_VISION_MODEL } from "@glow/shared";

const URL_KEY = "glow.ollamaBaseUrl";
const MODEL_KEY = "glow.ollamaModel";

export const DEFAULT_OLLAMA_URL = "http://127.0.0.1:11434";

export async function loadOllamaSettings(): Promise<{ baseUrl: string; model: string }> {
  const [baseUrl, model] = await Promise.all([
    AsyncStorage.getItem(URL_KEY),
    AsyncStorage.getItem(MODEL_KEY),
  ]);
  return {
    baseUrl: (baseUrl || DEFAULT_OLLAMA_URL).replace(/\/$/, ""),
    model: model || DEFAULT_VISION_MODEL,
  };
}

export async function saveOllamaSettings(baseUrl: string, model: string) {
  await AsyncStorage.setItem(URL_KEY, baseUrl.replace(/\/$/, ""));
  await AsyncStorage.setItem(MODEL_KEY, model.trim() || DEFAULT_VISION_MODEL);
}
