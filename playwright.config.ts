import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration.
 *
 * Smoke E2E tests that walk the onboarding flow end-to-end. These run
 * against the production server bundle (npm run build && npm start) so
 * they exercise the full stack including the Express server, Vite-built
 * client, and the security middleware.
 *
 * Browser: Chromium only (to keep CI install time reasonable).
 * Add more browsers in `projects` below if cross-browser coverage is needed.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Run the local web server before the tests start.
  webServer: {
    command: "node dist/server.cjs",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: {
      NODE_ENV: "production",
      // No GEMINI_API_KEY — onboarding will fall back to the local plan generator
      GEMINI_API_KEY: "",
    },
  },
});
