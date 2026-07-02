import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DailyWeightLog, WaterLog, WorkoutLog } from "../engine";
import type { ExerciseLog } from "../data/analyticsEngine";
import { todayStr } from "../lib/date";

/**
 * Logs store — holds all user-entered progress data.
 *
 * A-07: all logs are stored in chronological order (oldest first). The
 * `addWorkoutLog` action previously prepended (newest first) which was
 * inconsistent with the other actions; it now appends for uniformity.
 * Consumers that need newest-first should `[...logs].reverse()` at the
 * call site.
 *
 * A-08: weight logs dedupe by date (one entry per day). Water and workout
 * logs do NOT dedupe (multiple entries per day are valid).
 */
interface LogsState {
  weightLogs: DailyWeightLog[];
  waterLogs: WaterLog[];
  workoutLogs: WorkoutLog[];
  exerciseLogs: ExerciseLog[];

  addWeightLog: (weight: number) => void;
  setWeightLogs: (logs: DailyWeightLog[]) => void;
  addWaterLog: (amountMl: number) => void;
  clearTodayWaterLogs: () => void;
  addWorkoutLog: (log: WorkoutLog) => void;
  setExerciseLogs: (logs: ExerciseLog[]) => void;
  addExerciseLog: (log: ExerciseLog) => void;
  reset: () => void;
}

export const useLogsStore = create<LogsState>()(
  persist(
    (set) => ({
      weightLogs: [],
      waterLogs: [],
      workoutLogs: [],
      exerciseLogs: [],

      addWeightLog: (weight) =>
        set((s) => {
          const today = todayStr();
          const cleaned = s.weightLogs.filter((l) => l.date !== today);
          return { weightLogs: [...cleaned, { date: today, weight_kg: weight }] };
        }),
      setWeightLogs: (logs) => set({ weightLogs: logs }),

      addWaterLog: (amountMl) =>
        set((s) => {
          const today = todayStr();
          return { waterLogs: [...s.waterLogs, { date: today, amountMl }] };
        }),
      clearTodayWaterLogs: () =>
        set((s) => {
          const today = todayStr();
          return { waterLogs: s.waterLogs.filter((l) => l.date !== today) };
        }),

      addWorkoutLog: (log) => set((s) => ({ workoutLogs: [...s.workoutLogs, log] })),
      setExerciseLogs: (logs) => set({ exerciseLogs: logs }),
      addExerciseLog: (log) => set((s) => ({ exerciseLogs: [...s.exerciseLogs, log] })),

      reset: () => set({ weightLogs: [], waterLogs: [], workoutLogs: [], exerciseLogs: [] }),
    }),
    {
      name: "fitlife:logs",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
