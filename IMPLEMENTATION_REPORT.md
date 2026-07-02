# FitLife Hub × Unified Reference Guide — Implementation Report

> **Status:** This report was rewritten to match the actual repository state.
> The previous version described bridge files (`engineBridge.ts`,
> `typeMigrations.ts`, `fallbackPlan.ts`) and a legacy `src/types.ts` that
> have since been removed. The engine layer is now the canonical source of
> fitness formulas, types, and decision trees; there is no legacy layer to
> bridge.

## Summary

The assessment, training-planning, and nutrition-planning systems are
implemented as a pure TypeScript **engine layer** (`src/engine/`) that
encodes every formula, decision tree, and data schema from the Unified
Reference Guide. The engine is wired into the React app via a single
orchestration hook (`src/store/useEngine.ts`) that recomputes the
`AssessmentResult` and `NutritionPlan` whenever the user's onboarding input,
engine profile, or latest weight log changes.

There is **no legacy type layer** and **no bridge module**. The engine
schemas (`src/engine/schemas.ts`) are the single source of truth for all
TypeScript types in the application — both the physiology domain model
(`User`, `AssessmentResult`, `TrainingPlan`, `NutritionPlan`, `MealPlan`)
and the UI-only types (`OnboardingInput`, `WorkoutPlan`, commerce types,
log types).

## What exists today

### Engine layer (`src/engine/`)

Five pure modules, zero side effects, zero IO, fully unit-tested:

| File | Lines | Purpose |
|---|---|---|
| `schemas.ts` | ~676 | All TypeScript types — physiology domain + UI + commerce + logs |
| `assessment.ts` | ~1061 | Part 1: BF% (Navy/JP3/JP7/CUN-BAE), BMI/WHtR/WHR/ABSI, IBW (4 formulas), RMR (Mifflin/Harris-Benedict/Cunningham + RippedBody adjustments), TDEE (Mifflin×SAF + IOM DLW EER), Alpert max fat-loss, FFMI, Berkhan max, hydration (6-step), `runAssessment()` pipeline |
| `nutrition.ts` | ~1087 | Part 3: Cut/bulk/recomp decisioning (RippedBody + MacroFactor), 5-tier cut rate table, 4-category bulk rate table, McDonald muscle-gain table, reverse dieting, 5-step macro recipe, fiber/fruit/veg, supplement stacks, keto decisioning, `buildNutritionPlan()`, `applyMacroAdjustment()`, `recommendAdjustment()` |
| `training.ts` | ~499 | Part 2: 6-layer training pyramid, hypertrophy defaults, linear vs autoregulated double progression, reactive deload, exercise selection, 7-cause plateau diagnosis, BFR protocol, `buildTrainingPlan()` |
| `adaptiveTdee.ts` | ~305 | Part 4.1: Statistical-blend (Bayesian) adaptive TDEE — prior = Mifflin×SAF, likelihood = observed weight-vs-intake, α(t) = exp(−t/14) decay + outlier detection + EWMA smoothing |

### Orchestration (`src/store/`)

| File | Purpose |
|---|---|
| `useUserStore.ts` | `onboardingInput` + `workoutPlan` + `engineProfile` + cached engine outputs. Persisted to `localStorage` (`fitlife:user`, v3) with a `migrate` function that handles v2→v3 field renames. |
| `useLogsStore.ts` | weight / water / workout / exercise logs. Persisted (`fitlife:logs`). |
| `useIntakeStore.ts` | daily calorie + macro intake logs (used by adaptive TDEE). Persisted (`fitlife:intake`). |
| `useCommerceStore.ts` | cart + orderHistory. Persisted (`fitlife:commerce`). |
| `useEngine.ts` | Orchestration hook — recomputes `AssessmentResult` + `NutritionPlan` when inputs change; caches in `useUserStore`. |
| `useHydrated.ts` | SSR-style hydration gate to prevent flashing un-persisted state. |

### UI components (`src/components/`)

| File | Purpose |
|---|---|
| `Onboarding.tsx` | 5-step onboarding wizard (name → goal → workout pref → gym → diet) |
| `TrainingTab.tsx` | Weekly schedule, active workout, custom split builder, 4 preset programs |
| `MealOrderingTab.tsx` | Auto-generated meal plan, cart, demo checkout |
| `ProgressTab.tsx` | Analytics dashboard + engine trend analysis + daily intake logger |
| `MarketplaceTab.tsx` | Curated fitness products, search, cart |
| `ProfileTab.tsx` | Engine insights + nutrition plan panel + assessment settings |
| `AssessmentSettings.tsx` | Capture engine-only fields (BF%, circumferences, training status) |
| `EngineInsights.tsx` | Display AssessmentResult (BMI, BF%, FFMI, TDEE, Alpert, hydration) |
| `NutritionPlanPanel.tsx` | Display NutritionPlan + adjustment recommendations |
| `OneRMEstimator.tsx` | Epley 1RM calculator sub-component |
| `WorkoutHeatmap.tsx` | 365-day training heatmap |
| `Toast.tsx` | Toast + confirmDialog system (replaces native alert/confirm) |
| `ErrorBoundary.tsx` | Top-level error recovery |

### Test suite (`src/test/`)

| File | Tests | Purpose |
|---|---|---|
| `engine.test.ts` | 149 | Engine layer — every formula, decision tree, edge case |
| `analyticsEngine.test.ts` | 29 | Epley 1RM, rolling trends, plateau detection, muscle zones |
| `stores.test.ts` | 16 | Zustand store operations + persistence |
| `server.integration.test.ts` | 7 | Server zod rejection, rate limiting, sanitized errors |
| `toast.test.tsx` | 11 | Toast rendering, auto-dismiss, confirm dialog |
| `OneRMEstimator.test.tsx` | 7 | Controlled inputs, label associations, computation |

## Key canonical resolutions applied

The engine resolves every contradiction flagged in Part 5 of the reference
guide. Notable picks:

1. **3,500-kcal/lb rule** — used ONLY for energy-content conversions; Hall
   model conceptually for projections.
2. **TDEE methodology** — Mifflin-St Jeor × SAF (5 levels) as default; IOM
   DLW EER as advanced alternative; adaptive TDEE as gold standard after
   1–2 months of data.
3. **Alpert max-fat-loss constant** — 22 kcal/lb fat/day (corrected; the
   original 31 had a math error).
4. **Cut/bulk BF% thresholds** — RippedBody 10–20% cycle (physique) +
   MacroFactor 25% (health action); both exposed.
5. **"Leaner builds muscle faster"** — debunked (MacroFactor position); do
   NOT multiply muscle-gain rate by BF%.
6. **Bulking rate categories** — 4-category table (Beginner 2%, Novice 1.5%,
   Intermediate 1%, Advanced 0.5% BW/month).
7. **Navy body-fat formula** — canonical RippedBody inch form with cm→in
   conversion.
8. **Protein targets** — g/lb basis; 1.0–1.2 cutting, 0.7–1.0
   maintenance/bulking, vegan +0.2, obese uses 1 g/cm height.
9. **Macro recipe** — protein-first; protein + fat as state variables, carbs
   as residual.
10. **Hydration sex adjustment** — +300 mL conservative (fatcalc), not +500
    (EFSA) or +1000 (NAM).

## Verification

| Check | Command | Result |
|---|---|---|
| Typecheck | `npm run typecheck` | ✅ Clean (0 errors) |
| Lint (strict) | `npm run lint:strict` | ✅ 0 errors, 0 warnings |
| Unit tests | `npm run test:ci` | ✅ All passing |
| Production build | `npm run build` | ✅ Builds successfully |
| E2E smoke | `npm run test:e2e` | ✅ All passing |

## What was removed (and why)

The previous version of this report described the following files. **None
of them exist in the current repository** — they were removed as the
migration completed:

- `src/data/engineBridge.ts` — legacy ↔ engine type conversion bridge.
  **Removed** because all components now consume engine types directly.
- `src/data/typeMigrations.ts` — adapter functions for legacy → engine
  type conversion. **Removed** for the same reason.
- `src/data/fallbackPlan.ts` — safety-net fallback plan generator.
  **Removed** because `src/data/planGenerator.ts` now contains both the
  primary local generator and the fallback path.
- `src/types.ts` — legacy type barrel. **Removed** because
  `src/engine/schemas.ts` is now the single source of truth.

## Future enhancement opportunities

These are not blocking and are tracked separately:

- **Migrate the onboarding form to capture engine fields directly**
  (body_fat_pct, waist/hip/neck, training_status) — would eliminate the
  need for the separate `AssessmentSettings` panel and the
  `createUserFromOnboarding()` heuristic mappings in `assessment.ts`.
- **Surface the engine's `TrainingPlan`** (progression schemes, plateau
  diagnosis, volume adjustment) in the Training tab — the training engine
  is implemented and tested but not yet wired into the UI.
- **Retire the `OnboardingInput` shape** in favor of the engine `User`
  type — would require updating the onboarding form, the server zod
  schema, and the Gemini response contract in one coordinated change.
