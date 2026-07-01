import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DailyWeightLog, WaterLog, WorkoutLog } from "../engine";
import type { ExerciseLog } from "../data/analyticsEngine";

/**
 * Logs store — holds all user-entered progress data.
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

      addWorkoutLog: (log) => set((s) => ({ workoutLogs: [log, ...s.workoutLogs] })),
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
