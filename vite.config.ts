import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const visionModel =
  process.env.OLLAMA_VISION_MODEL ||
  process.env.VITE_OLLAMA_VISION_MODEL ||
  "qwen3-vl:4b";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@glow/shared": path.resolve(__dirname, "shared/src/index.ts"),
    },
  },
  define: {
    "import.meta.env.VITE_OLLAMA_VISION_MODEL": JSON.stringify(visionModel),
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/ollama": {
        target: "http://127.0.0.1:11434",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/ollama/, ""),
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      "/ollama": {
        target: "http://127.0.0.1:11434",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/ollama/, ""),
      },
    },
  },
});
