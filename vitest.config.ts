import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
    exclude: ["e2e/**", ...configDefaults.exclude],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
