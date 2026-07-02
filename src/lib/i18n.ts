/**
 * A-20: i18n scaffold.
 *
 * This module sets up react-i18next for future localization. Currently the
 * app is English-only with all strings hardcoded. This scaffold provides:
 *   - The i18n instance configured with English as the default locale
 *   - A translation namespace structure (common, onboarding, training, etc.)
 *   - A `useTranslation` hook wrapper for consistency
 *
 * The app is NOT yet migrated to use it — components still use hardcoded
 * strings. To migrate:
 *
 *   1. Call `initI18n()` in main.tsx before `createRoot().render()`
 *   2. Replace hardcoded strings with `t("key")` calls:
 *        <h1>Training</h1>  →  <h1>{t("training:title")}</h1>
 *   3. Add translation JSON files in src/locales/{en,zh,...}/
 *
 * This is a non-breaking scaffold — the app works without it.
 */
// ─────────────────────────────────────────────────────────────────────────────
// English translations (default locale)
// ─────────────────────────────────────────────────────────────────────────────
const en: Record<string, Record<string, string>> = {
  common: {
    loading: "Loading…",
    save: "Save",
    cancel: "Cancel",
    reset: "Reset",
    confirm: "Confirm",
    error: "Something went wrong",
    retry: "Try again",
  },
  tabs: {
    training: "Training",
    meals: "Meals Prep",
    progress: "Logs",
    marketplace: "Store",
    profile: "Profile",
  },
  onboarding: {
    title: "Tell Us About Yourself",
    step: "Step {{current}} of {{total}}",
    next: "Next Step",
    back: "Back",
    buildPlans: "Build My Plans",
  },
  training: {
    title: "Training",
    weeklySchedule: "Weekly Schedule",
    activeWorkout: "Active Workout",
    restTimer: "Rest Timer",
  },
  profile: {
    title: "Profile",
    engineInsights: "Engine Insights",
    nutritionPlan: "Nutrition Plan",
    assessmentSettings: "Assessment Settings",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// i18n instance (lazy-initialised on first use)
// ─────────────────────────────────────────────────────────────────────────────
let initialised = false;

/**
 * Initialise the i18n instance. Call this once in main.tsx before render.
 * No-op if already initialised or if i18next is not installed (graceful
 * degradation — the app works without i18n).
 */
export async function initI18n(locale = "en"): Promise<void> {
  if (initialised) return;
  try {
    const i18next = (await import("i18next")).default;
    const { initReactI18next } = await import("react-i18next");

    await i18next.use(initReactI18next).init({
      resources: {
        en: Object.fromEntries(
          Object.entries(en).map(([ns, keys]) => [ns, { translation: keys }]),
        ),
      },
      lng: locale,
      fallbackLng: "en",
      interpolation: { escapeValue: false },
    });
    initialised = true;
  } catch {
    // i18next not installed — the app continues with hardcoded strings.
    // This keeps i18n as an opt-in dependency.
  }
}

/**
 * Get the current locale. Returns "en" until initI18n is called.
 */
export function getCurrentLocale(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const i18next = require("i18next").default;
    return i18next.language || "en";
  } catch {
    return "en";
  }
}

export default { initI18n, getCurrentLocale };
