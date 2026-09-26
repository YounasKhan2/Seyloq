import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/apps/seyloq/src-tauri/target/**"],
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["apps/seyloq/test/setup.ts"],
    include: ["apps/seyloq/**/*.test.{ts,tsx}"],
  },
});
