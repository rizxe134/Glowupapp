import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["shared/src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@glow/shared": path.resolve(__dirname, "shared/src/index.ts"),
    },
  },
});
