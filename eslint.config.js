// ESLint 9 flat config — see https://eslint.org/docs/latest/use/configure/configuration-files
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
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
    },
    settings: {
      react: {
        version: "detect",
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

      // React 19 + react-jsx transform: default React import is not required
      "react/react-in-jsx-scope": "off",
      "react/jsx-curly-brace-presence": "off",
      "react/jsx-boolean-value": "off",
      "react/prop-types": "off",
      "react/jsx-props-no-spreading": "off",

      // --- Q-03: rules promoted back to ERROR (violations fixed in this pass) ---
      // These were downgraded to "warn" in the original codebase because the
      // god components had accumulated violations. The violations have been
      // fixed (or the code deleted) so the rules can be errors again.
      "@typescript-eslint/no-non-null-assertion": "error",
      "react/no-unescaped-entities": "error",
      "react-hooks/exhaustive-deps": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "no-useless-assignment": "error",

      // --- Rules still downgraded to "warn" (cleanup in progress) ---
      // These rules have 14+ remaining violations across the god components.
      // They will be promoted to "error" once the god-component split (A-01)
      // lands and the violations are fixed file-by-file. Until then, the
      // `lint` script allows up to 100 warnings; `lint:strict` requires 0.
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "warn",

      // Accessibility — 30 remaining violations in Onboarding/TrainingTab/
      // ProgressTab. Will be promoted to "error" after the god-component
      // split makes the forms tractable to fix.
      "jsx-a11y/label-has-associated-control": "warn",

      // React patterns — 7 remaining in god components.
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
