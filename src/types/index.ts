/**
 * Convenience barrel for all app-domain types. Engine-domain types live in
 * `src/engine/schemas.ts` and are also re-exported here for symmetry.
 *
 * Usage:
 *   import type { User, OnboardingInput, WorkoutPlan } from "../types";
 *
 * A-22 (audit 2026-08): introduced when `src/engine/schemas.ts` was split
 * by domain (engine / onboarding / workout / commerce / logs). The engine
 * module continues to re-export everything for backward compatibility, so
 * existing `import { X } from "../engine/schemas"` and
 * `import { X } from "../engine"` call sites keep working.
 */

// Engine domain — the single source of truth for these types.
export * from "../engine/schemas";

// UI / app-domain types — split out by A-22.
export * from "./onboarding";
export * from "./workout";
export * from "./commerce";
export * from "./logs";
