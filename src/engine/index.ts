/**
 * Engine barrel — single import surface for the entire engine layer.
 *
 * Usage:
 *   import { runAssessment, buildNutritionPlan, buildTrainingPlan } from "../engine";
 *
 * The engine is intentionally pure (no IO, no React, no side effects).
 * All state lives in zustand stores; all UI lives in components.
 */

export * from "./schemas";
export * from "./assessment";
export * from "./nutrition";
export * from "./training";
export * from "./adaptiveTdee";
