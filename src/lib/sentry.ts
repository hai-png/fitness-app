/**
 * D-05: Sentry browser integration scaffold.
 *
 * When `VITE_SENTRY_DSN` is set at build time, this module initialises the
 * Sentry browser SDK and exports `captureException`. When the env var is
 * unset, `captureException` is a no-op so dev environments without a Sentry
 * account work normally.
 *
 * The ErrorBoundary calls `window.Sentry.captureException` directly (set
 * here via `window.Sentry`) so the boundary does not need to import this
 * module — it just checks for the global.
 */
let initialised = false;

export function initSentry(): void {
  if (initialised) return;
  const dsn = (import.meta as { env?: { VITE_SENTRY_DSN?: string } }).env?.VITE_SENTRY_DSN;
  if (!dsn) return;

  try {
    // Dynamic import so the SDK is only loaded when a DSN is configured.
    // The package is an optional peer dependency; if it's not installed,
    // this silently no-ops.
    import("@sentry/react")
      .then((Sentry) => {
        Sentry.init({
          dsn,
          environment: (import.meta as { env?: { MODE?: string } }).env?.MODE ?? "development",
          tracesSampleRate: 0.1,
        });
        // Expose on window for the ErrorBoundary
        (window as unknown as { Sentry: typeof Sentry }).Sentry = Sentry;
        initialised = true;
      })
      .catch((err) => console.warn("[sentry] init failed:", err));
  } catch (err) {
    console.warn("[sentry] init skipped:", err);
  }
}

/**
 * Capture an exception. No-op if Sentry is not initialised.
 */
export function captureException(err: unknown): void {
  if (typeof window !== "undefined") {
    const w = window as unknown as { Sentry?: { captureException: (e: unknown) => void } };
    w.Sentry?.captureException(err);
  }
}
