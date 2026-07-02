import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

// P-09: function-based manualChunks deduplicates shared modules across lazy
// chunks. The previous static object literal could not detect that two lazy
// chunks share a common dependency, leading to duplicate code in the bundle.
function manualChunks(id: string): string | undefined {
  if (id.includes("node_modules")) {
    if (id.includes("react-dom") || id.includes("/react/")) return "react-vendor";
    if (id.includes("lucide-react")) return "lucide-icons";
    if (id.includes("motion")) return "motion-vendor";
    if (id.includes("zustand")) return "zustand-vendor";
    if (id.includes("@google/genai")) return "gemini-vendor";
    if (id.includes("zod")) return "zod-vendor";
  }
  // Engine layer gets its own chunk so it can be shared between the main
  // bundle and lazy-loaded tabs without duplication.
  if (id.includes("/src/engine/")) return "engine";
  return undefined;
}

export default defineConfig(() => {
  // P-10: bundle visualizer. Generates stats.html on every build so bundle
  // composition is visible. In CI, the report is uploaded as an artifact.
  const enableVisualizer = process.env.ANALYZE === "true" || process.env.CI === "true";

  return {
    plugins: [
      react(),
      tailwindcss(),
      enableVisualizer &&
        visualizer({
          filename: "dist/stats.html",
          template: "treemap",
          gzipSize: true,
          brotliSize: true,
          open: false,
        }),
    ].filter(Boolean),
    build: {
      rollupOptions: {
        output: {
          manualChunks,
        },
      },
      // P-13: bump the chunk size warning limit so the engine chunk (~50kB)
      // and the ProgressTab chunk (~65kB) don't print noisy warnings.
      chunkSizeWarningLimit: 100,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});
