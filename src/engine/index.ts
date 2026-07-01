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
 */

export * from "./schemas";
export * from "./assessment";
export * from "./nutrition";
export * from "./adaptiveTdee";
