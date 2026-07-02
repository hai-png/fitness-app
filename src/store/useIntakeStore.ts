import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DailyIntakeLog } from "../engine";
import { todayStr } from "../lib/date";

/**
 * Intake store — holds daily calorie + macro intake logs.
 *
 * Used by the adaptive TDEE engine (src/engine/adaptiveTdee.ts) to compute
 * observed TDEE from real intake vs weight-trend data. After ~30 days of
 * paired intake + weight logs, the adaptive TDEE becomes the gold-standard
 * estimate (replacing the formula-based Mifflin×SAF prior).
 *
 * Schema matches the engine's `DailyIntakeLog` interface exactly so the
 * adaptive TDEE module can consume the logs directly.
 *
 * A-07: stored in chronological order (oldest first), matching useLogsStore.
 * A-08: dedupes by date (one entry per day) — re-logging today overwrites.
 */
interface IntakeState {
  intakeLogs: DailyIntakeLog[];

  /** Add or replace today's intake log (one entry per day). */
  addIntakeLog: (log: Omit<DailyIntakeLog, "date"> & { date?: string }) => void;
  /** Set the entire intake log array (used for imports / resets). */
  setIntakeLogs: (logs: DailyIntakeLog[]) => void;
  /** Clear today's intake log (delete the entry for today). */
  clearTodayIntakeLog: () => void;
  /** Clear all intake logs. */
  reset: () => void;
}

export const useIntakeStore = create<IntakeState>()(
  persist(
    (set) => ({
      intakeLogs: [],

      addIntakeLog: (log) =>
        set((s) => {
          const date = log.date ?? todayStr();
          const cleaned = s.intakeLogs.filter((l) => l.date !== date);
          return {
            intakeLogs: [
              ...cleaned,
              {
                date,
                kcal: log.kcal,
                protein_g: log.protein_g,
                carbs_g: log.carbs_g,
                fat_g: log.fat_g,
              },
            ],
          };
        }),

      setIntakeLogs: (logs) => set({ intakeLogs: logs }),

      clearTodayIntakeLog: () =>
        set((s) => {
          const today = todayStr();
          return { intakeLogs: s.intakeLogs.filter((l) => l.date !== today) };
        }),

      reset: () => set({ intakeLogs: [] }),
    }),
    {
      name: "fitlife:intake",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
