<p align="center">
  <img src="docs/assets/banner.svg" alt="Glow Guide — quiz + photo care recommendations" width="720" />
</p>

<p align="center">
  <strong>Quiz + photo care routines for skin, hair, and body — powered by local AI.</strong>
</p>

<p align="center">
  <img src="docs/assets/logo.svg" alt="Glow Guide logo" width="96" />
</p>

# Glow Guide (Glowup)

A local **quiz + photo** app that recommends skin, hair, and body product types. Display name: **Glow Guide**. GitHub repo: [`Glowupapp`](https://github.com/rizxe134/Glowupapp).

No API keys. Recommendations come from a curated catalog and a TypeScript rules engine in `shared/`. Photo analysis uses **local Ollama vision only** — not OpenAI, not Hugging Face Inference, not any paid cloud API.

## Features

- **Guided quiz** — skin type & concerns, hair, scalp, body, and budget, with progress, back, and start over
- **Photo analysis** — drop a photo or use the camera; concerns run through a local Ollama vision model on your Mac
- **Skin / Hair / Body routines** — ordered steps, product categories, why it fits, example names, and “look for” label cues
- **iPhone app** — Expo mobile client; quiz works offline; photos talk to Ollama on your Mac over Wi‑Fi
- **Fully local** — no paid cloud APIs; swap models (`qwen3-vl:4b` default, `moondream` for low RAM)

## Project structure

```
Glowupapp/
  src/                 Vite + React + TypeScript web app
  shared/src/          Types, curated catalog, rules engine, vision prompt
  mobile/              Expo iPhone app
  docs/assets/         Logo and README banner
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

Quiz works offline. Photo analysis uses Ollama on the Mac (`http://127.0.0.1:11434` in Simulator, or the Mac’s LAN IP on a device — same Wi‑Fi). Configure the host in the app’s **Ollama settings**, then **Save & ping**.

## Disclaimer

Glow Guide is **not medical advice**. It does not diagnose or treat disease. Patch-test new products and talk to a clinician when something worries you.
