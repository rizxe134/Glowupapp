# Glow Guide for iPhone (Expo)

Same quiz, catalog, and rules engine as the web app (`../shared`). Photo analysis calls **Ollama on your Mac over Wi‑Fi**. There is no OpenAI, Hugging Face, or other paid vision API.

## Run on a Mac

From the repo root:

```bash
npm install
cd mobile
npm install
npx expo start
```

Then:

- Press `i` for the iOS Simulator, or
- Scan the QR code with the Expo Go app on your iPhone.

The quiz path does **not** need Ollama.

## Photo AI (Ollama on the Mac)

Default model: `qwen3-vl:4b`  
Low-RAM fallback: `moondream`

```bash
ollama pull qwen3-vl:4b
# optional:
ollama pull moondream

OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

In the app, open **Ollama settings**:

| Where the app runs | Base URL |
| --- | --- |
| iOS Simulator | `http://127.0.0.1:11434` |
| Physical iPhone | `http://YOUR_MAC_LAN_IP:11434` (System Settings → Wi‑Fi → Details) |

Phone and Mac must be on the same network. macOS firewall must allow port `11434`. Binding `0.0.0.0` is required; the default localhost-only server is invisible to a real device.

You can change the vision model name in settings (for example `moondream`).

## What ships

- Quiz with progress, back, and start over
- Results: Skin / Hair / Body, ordered steps, example products, “look for” cues, medical disclaimer
- Native camera + photo library
- Editable concern chips after vision analysis
- Friendly copy when Ollama or the model is missing
