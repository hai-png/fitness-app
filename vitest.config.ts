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
        // Q-05: progressive coverage thresholds.
        // Current baseline: 38% statements / 30% branches (July 2026).
        // Phase 2 target: 50% statements / 40% branches (raise once god
        //   component splits land — A-01 — which makes the remaining
        //   uncovered code easier to test in isolation).
        // Phase 3 target: 80% statements / 70% branches.
        // These thresholds are gates: coverage BELOW these numbers fails CI.
        statements: 38,
        branches: 28,
        functions: 29,
        lines: 38,
      },
    },
  },
});
