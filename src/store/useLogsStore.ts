import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WeightLog, WaterLog, WorkoutLog } from "../types";
import type { ExerciseLog } from "../data/analyticsEngine";

/**
 * Logs store — holds all user-entered progress data.
 * Replaces the partial `aether_exercise_set_logs` localStorage logic that
 * previously only persisted fake generated history.
 */
interface LogsState {
  weightLogs: WeightLog[];
  waterLogs: WaterLog[];
  workoutLogs: WorkoutLog[];
  /** Set-level exercise logs (the data the ProgressTab analytics engine reads). */
  exerciseLogs: ExerciseLog[];

  // Weight
  addWeightLog: (weight: number) => void;
  setWeightLogs: (logs: WeightLog[]) => void;

  // Water
  addWaterLog: (amountMl: number) => void;
  clearTodayWaterLogs: () => void;

  // Workouts
  addWorkoutLog: (log: WorkoutLog) => void;

  // Exercise logs (set-level)
  setExerciseLogs: (logs: ExerciseLog[]) => void;
  addExerciseLog: (log: ExerciseLog) => void;

  reset: () => void;
}

/** Returns YYYY-MM-DD in the local timezone (not UTC). */
function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const useLogsStore = create<LogsState>()(
  persist(
    (set) => ({
      weightLogs: [],
      waterLogs: [],
      workoutLogs: [],
      exerciseLogs: [],

      // --- Weight ---
      addWeightLog: (weight) =>
        set((s) => {
          const today = todayStr();
          const cleaned = s.weightLogs.filter((l) => l.date !== today);
          return { weightLogs: [...cleaned, { date: today, value: weight }] };
        }),
      setWeightLogs: (logs) => set({ weightLogs: logs }),

      // --- Water ---
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

      // --- Workouts ---
      addWorkoutLog: (log) => set((s) => ({ workoutLogs: [log, ...s.workoutLogs] })),

      // --- Exercise logs ---
      setExerciseLogs: (logs) => set({ exerciseLogs: logs }),
      addExerciseLog: (log) => set((s) => ({ exerciseLogs: [log, ...s.exerciseLogs] })),

      reset: () => set({ weightLogs: [], waterLogs: [], workoutLogs: [], exerciseLogs: [] }),
    }),
    {
      name: "fitlife:logs",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
