# Glow Guide (Glowup)

A local **quiz + photo** app that recommends skin, hair, and body products. Display name: **Glow Guide**. GitHub repo: `Glowupapp`.

No API keys. Recommendations come from a curated catalog and a TypeScript rules engine in `shared/`. Photo analysis uses **local Ollama vision only** — not OpenAI, not Hugging Face Inference, not any paid cloud API.

```
Glowupapp/
  src/                 Vite + React web app
  shared/src/          Types, catalog, rules engine, vision prompt
  mobile/              Expo iPhone app
```

## Web (Mac)

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Useful scripts:

```bash
npm test          # rules-engine unit tests
npm run build     # production web build
```

### Quiz path

Skin type → skin concerns → hair type/concerns → scalp → body → budget. Progress, back, and start over are on every step. Results are split into **Skin / Hair / Body** with ordered steps, a product category, why it fits, example product names, and “look for” label cues.

### Photo path (local Ollama)

The Vite dev server proxies `/ollama` → `http://127.0.0.1:11434`.

1. Install [Ollama](https://ollama.com).
2. Pull the default vision model:

```bash
ollama pull qwen3-vl:4b
```

3. Serve it (binding all interfaces is required if the iPhone app will call this Mac):

```bash
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

4. Drop a photo or open the camera in the web app. After analysis, **edit the concern chips**, pick a budget, then generate a routine.

Override the model when starting Vite:

```bash
OLLAMA_VISION_MODEL=qwen3-vl:4b npm run dev
```

**Low-RAM fallback:** `moondream`

```bash
ollama pull moondream
OLLAMA_VISION_MODEL=moondream npm run dev
```

If Ollama is down or the model is missing, the photo page shows setup copy. The quiz still works with no model at all.

## iPhone app

See [`mobile/README.md`](mobile/README.md).

```bash
cd mobile
npm install
npx expo start
```

Quiz works offline. Photo analysis uses Ollama on the Mac (`http://127.0.0.1:11434` in Simulator, or the Mac’s LAN IP on a device).

## Disclaimer

Glow Guide is not medical advice. It does not diagnose or treat disease. Patch-test new products and talk to a clinician when something worries you.
