import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules/**", "dist/**", "playwright-report/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/test/**",
        "src/main.tsx",
        "src/components/ErrorBoundary.tsx", // hard to test without elaborate setup
      ],
      thresholds: {
        // E-32: raised from 0 to current coverage minus a safety margin so
        // coverage regressions fail CI. The previous 0% thresholds provided
        // no protection against silently shipping untested code paths.
        statements: 35,
        branches: 25,
        functions: 25,
        lines: 35,
      },
    },
  },
});
