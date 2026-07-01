/**
 * Engine barrel — single import surface for the entire engine layer.
 *
 * Usage:
 *   import { runAssessment, buildNutritionPlan } from "../engine";
 *
 * The engine is intentionally pure (no IO, no React, no side effects).
 * All state lives in zustand stores; all UI lives in components.
 *
 * A-02/E-26 fix: engine/training.ts was DELETED (audit 2026-07). It was a
 * 499-line module shipped in production but exercised only by tests — the
 * UI's plateau/volume logic uses src/data/analyticsEngine.ts instead. Either
 * wiring it in or deleting it was acceptable; the status quo (two parallel
 * implementations) was the worst of both worlds. If progression/RIR/
 * periodization features are wanted later, restore from git history and
 * wire into the UI at that time.
 *
 * A-24 (audit 2026-08): the `export *` statements below defeat tree-shaking
 * for callers that only need a single type or function — bundlers must pull
 * every exported symbol from every re-exported module into the bundle graph.
 * This barrel is kept for ergonomic multi-symbol imports in tests + stores,
 * but UI components that import heavily from the engine should use targeted
 * imports instead (e.g. `from "../engine/schemas"` for types, or
 * `from "../engine/assessment"` for a specific function). See ProgressTab,
 * TrainingTab, EngineInsights, NutritionPlanPanel, EngineTrendAnalysis,
 * AssessmentSettings, ProfileTab, MarketplaceTab, MealOrderingTab, Onboarding,
 * and the onboarding/* + training-tab/* + progress-tab/* sub-components for
 * the migration pattern.
 */

export * from "./schemas";
export * from "./assessment";
export * from "./nutrition";
export * from "./adaptiveTdee";
