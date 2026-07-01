// ESLint 9 flat config — see https://eslint.org/docs/latest/use/configure/configuration-files
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
// A-32: eslint-plugin-import adds import/no-cycle to surface circular
// dependencies at lint time. The plugin ships a flat-config-ready default
// export; we activate just the rule we need (no preset) to keep the lint
// surface minimal.
import importPlugin from "eslint-plugin-import";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  // ---------------------------------------------------------------------------
  // Base JS recommendations
  // ---------------------------------------------------------------------------
  js.configs.recommended,

  // ---------------------------------------------------------------------------
  // TypeScript recommendations (type-aware rules are intentionally NOT enabled
  // here — they require a slow tsconfig program. The `tsc --noEmit` step in CI
  // catches type errors instead.)
  // ---------------------------------------------------------------------------
  ...tseslint.configs.recommended,

  // ---------------------------------------------------------------------------
  // Global ignores
  // ---------------------------------------------------------------------------
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "*.cjs",
    ],
  },

  // ---------------------------------------------------------------------------
  // React + React Hooks + JSX A11y
  // ---------------------------------------------------------------------------
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      // A-32: register the import plugin so import/no-cycle is available.
      import: importPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
      // A-32: tell eslint-plugin-import to resolve TS path aliases + extensionless
      // imports via the TypeScript resolver. Without this, import/no-cycle flags
      // false positives on `from "./schemas"` (no .ts extension).
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,

      // A-32: surface circular dependencies as errors. Cycles cause bundler
      // warnings, defeat tree-shaking, and create init-order hazards. If the
      // lint:strict gate fails because of an existing cycle, that cycle is a
      // real bug that should be tracked separately (do NOT silence this rule).
      "import/no-cycle": "error",

      // React 19 + react-jsx transform: default React import is not required
      "react/react-in-jsx-scope": "off",
      "react/jsx-curly-brace-presence": "off",
      "react/jsx-boolean-value": "off",
      "react/prop-types": "off",
      "react/jsx-props-no-spreading": "off",

      // --- Pre-existing-codebase relaxations ---
      // The original codebase has ~70 unused vars and ~14 `any` types across
      // 1,670-line god components. We surface them as warnings rather than
      // errors so the lint gate is usable today. P3 will clear the remaining
      // warnings and flip these to errors (tracking issue: see audit P3 DoD).
      // A-26 fix: the previous "Phase 4 will tighten these" comment had no
      // owner/date/tracking issue — replaced with a concrete P3 reference.
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "prefer-const": "warn",
      "no-useless-assignment": "warn",

      // Accessibility — real issues that need fixing in P2/P3 component
      // refactor. Downgrade to warnings so the gate runs but doesn't block.
      // F-C3 (label-has-associated-control) resolved 30→0 in P1; the rule
      // stays as "warn" to catch regressions. The remaining no-static-element-
      // interactions / click-events-have-key-events warnings are slated for P2.
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",

      // React patterns — pre-existing issues in god components.
      "react/no-unescaped-entities": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },

  // ---------------------------------------------------------------------------
  // Server-side TS files (no React rules here)
  // ---------------------------------------------------------------------------
  {
    files: ["server.ts"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
  },

  // ---------------------------------------------------------------------------
  // Test files — relax a few rules that conflict with testing patterns
  // ---------------------------------------------------------------------------
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx", "src/test/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "react/display-name": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  // ---------------------------------------------------------------------------
  // Turn OFF all formatting rules — Prettier owns formatting.
  // ---------------------------------------------------------------------------
  prettierConfig,
);
