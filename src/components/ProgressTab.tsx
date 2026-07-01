import React, { useState, useMemo } from "react";
// A-22: targeted imports split by domain. DailyWeightLog is engine-domain
// (consumed by adaptiveTdee + assessment); WaterLog + WorkoutLog are pure
// UI-domain logs. Importing from the types barrel keeps the engine barrel's
// `export * from "./assessment"` out of this component's bundle graph.
import type { DailyWeightLog } from "../engine/schemas";
import type { WaterLog, WorkoutLog } from "../types/logs";
// A-04 sub-tab extraction: the four giant render functions that used to live
// inline in this file are now standalone components under ./progress-tab/.
import CoreMetricsView from "./progress-tab/CoreMetricsView";
import MuscleVolumeView from "./progress-tab/MuscleVolumeView";
import ExerciseProgressionView from "./progress-tab/ExerciseProgressionView";
import VisualsView from "./progress-tab/VisualsView";
// A-04-further: extracted the legacy health logger + custom set logger modal
// out of this file into ./progress-tab/ for further size reduction.
import CustomSetLoggerModal from "./progress-tab/CustomSetLoggerModal";
import LegacyHealthLogger from "./progress-tab/LegacyHealthLogger";
import type { FlexCard } from "./progress-tab/types";
// A-06: the 13 inline useMemo calls that computed coreMetrics, rollingTrends,
// muscleZonesAndScores, muscleBalanceAnalysis, lifetimeVolumeTons,
// lifetimeTierInfo, exerciseProgressions, personalRecords, activeExNames,
// and the final analytics bundle are now consolidated in this hook.
import { useProgressAnalytics } from "../hooks/useProgressAnalytics";
import { Plus, Flame, Droplet, Scale, Filter, RotateCcw, Activity } from "lucide-react";
import { SetLog, ExerciseLog } from "../data/analyticsEngine";
import { EXERCISE_DATABASE } from "../data/workoutTemplates";
import { useLogsStore } from "../store/useLogsStore";
import { toast, confirmDialog } from "./Toast";

interface ProgressTabProps {
  weightLogs: DailyWeightLog[];
  waterLogs: WaterLog[];
  workoutLogs: WorkoutLog[];
  onAddWeightLog: (weight: number) => void;
  onAddWaterLog: (amountMl: number) => void;
  onClearWaterLogs: () => void;
}

export default function ProgressTab({
  weightLogs,
  waterLogs,
  onAddWeightLog,
  onAddWaterLog,
  onClearWaterLogs,
}: ProgressTabProps) {
  // --- STATE ---
  const [newWeight, setNewWeight] = useState<string>("");

  // Exercise logs now come from the persisted useLogsStore instead of being
  // loaded/generated directly from localStorage. This removes the previous
  // "fake 90-day generated history" trap — real users start with an empty
  // log and build it up by actually logging workouts.
  const exerciseLogs = useLogsStore((s) => s.exerciseLogs);
  const setExerciseLogs = useLogsStore((s) => s.setExerciseLogs);

  const [trainingAge, setTrainingAge] = useState<"Beginner" | "Intermediate" | "Advanced">(
    "Intermediate",
  );
  const [multiplierSecondary, setMultiplierSecondary] = useState<number>(0.5);
  const [dateFilterStart, setDateFilterStart] = useState<string>("");
  const [dateFilterEnd, setDateFilterEnd] = useState<string>("");

  // Tab within Progress/Analytics
  const [activeSubTab, setActiveSubTab] = useState<"metrics" | "muscles" | "exercises" | "visuals">(
    "metrics",
  );

  // Interactive selected muscle on the body map
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>("Chest");

  // Selected exercise for detailed PR and Trend Analysis
  const [selectedAnalysisEx, setSelectedAnalysisEx] = useState<string>("Flat Barbell Bench Press");
  const [isSmoothedTrend, setIsSmoothedTrend] = useState<boolean>(true);

  // Active Flex Card for sharing modal. Shape matches the flexCardsData
  // entries below (defined inline as FlexCard).
  const [activeShareCard, setActiveShareCard] = useState<FlexCard | null>(null);
  const [copiedShareText, setCopiedShareText] = useState<boolean>(false);

  // Quick custom set logger state
  const [isLogFormOpen, setIsLogFormOpen] = useState<boolean>(false);
  const [logExName, setLogExName] = useState<string>("Flat Barbell Bench Press");
  const [logExMuscle, setLogExMuscle] = useState<string>("Chest");
  const [logExWeight, setLogExWeight] = useState<string>("60");
  const [logExReps, setLogExReps] = useState<string>("8");
  const [logExType, setLogExType] = useState<"Normal" | "AMRAP" | "Failure" | "Drop Set">("Normal");
  const [logExIsWarmUp, setLogExIsWarmUp] = useState<boolean>(false);

  // The previous useEffect that loaded `aether_exercise_set_logs` from
  // localStorage or generated fake 90-day history is intentionally REMOVED.
  // Logs now flow from useLogsStore (persisted) and start empty for new users.
  // The fake-data `generateWorkoutHistory()` call has been eliminated.

  const saveLogsToStorage = (updated: ExerciseLog[]) => {
    setExerciseLogs(updated);
  };

  // Reset exercise logs to a clean state (clears all logged sets).
  const handleResetHistory = async () => {
    const ok = await confirmDialog({
      title: "Clear training logs?",
      message:
        "Are you sure you want to clear all your logged training sets? This cannot be undone.",
      confirmLabel: "Clear All",
      cancelLabel: "Keep Logs",
      destructive: true,
    });
    if (ok) {
      setExerciseLogs([]);
      setDateFilterStart("");
      setDateFilterEnd("");
      toast.success("Logs cleared", "All training sets have been removed.");
    }
  };

  // --- FILTERED DATASETS ---
  const filteredLogs = useMemo(() => {
    return exerciseLogs.filter((log) => {
      if (dateFilterStart && log.date < dateFilterStart) return false;
      if (dateFilterEnd && log.date > dateFilterEnd) return false;
      return true;
    });
  }, [exerciseLogs, dateFilterStart, dateFilterEnd]);

  // --- COMPUTATIONS ---
  const todayStr = new Date().toISOString().split("T")[0];

  // Weight metrics
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight_kg : 75;
  const initialWeight = weightLogs.length > 0 ? weightLogs[0].weight_kg : 75;
  const weightDiff = currentWeight - initialWeight;

  // Water metrics
  const todayWaterTotal = waterLogs
    .filter((log) => log.date === todayStr)
    .reduce((sum, log) => sum + log.amountMl, 0);
  const waterTarget = 3000;
  const waterPercent = Math.min(100, Math.round((todayWaterTotal / waterTarget) * 100));

  // --- ANALYTICS BUNDLE ---
  // A-06: the 13 inline useMemo calls that computed coreMetrics,
  // rollingTrends, muscleZonesAndScores, muscleBalanceAnalysis,
  // lifetimeVolumeTons, lifetimeTierInfo, exerciseProgressions,
  // personalRecords, activeExNames, and the final analytics bundle
  // are now consolidated in the useProgressAnalytics hook.
  const analytics = useProgressAnalytics(
    exerciseLogs,
    filteredLogs,
    multiplierSecondary,
    trainingAge,
    todayWaterTotal,
    weightDiff,
  );
  const { coreMetrics } = analytics;

  // --- LOG WORKOUT SET HANDLER ---
  const handleLogCustomSetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(logExWeight);
    const reps = parseInt(logExReps);
    if (isNaN(weight) || isNaN(reps) || reps <= 0) return;

    const newSet: SetLog = {
      id: `customset-${Date.now()}`,
      weight,
      reps,
      isWarmUp: logExIsWarmUp,
      type: logExType,
    };

    const newExLog: ExerciseLog = {
      id: `customex-${Date.now()}`,
      exerciseName: logExName,
      targetMuscle: logExMuscle,
      date: todayStr,
      sets: [newSet],
      durationMinutes: 10,
    };

    // Check if we already logged an exercise with this name on this exact date
    const updated = [...exerciseLogs];
    const existingIndex = updated.findIndex(
      (l) => l.exerciseName === logExName && l.date === todayStr,
    );

    if (existingIndex !== -1) {
      updated[existingIndex].sets.push(newSet);
    } else {
      updated.push(newExLog);
    }

    saveLogsToStorage(updated);
    setIsLogFormOpen(false);
    toast.success("Set logged!", `${weight}kg × ${reps} reps for ${logExName}.`);
  };

  // Muscle Category to Muscle Groups mapper
  const handleMuscleCategoryChange = (cat: string) => {
    setLogExMuscle(cat);
    const firstExInCat = EXERCISE_DATABASE.find(
      (e) => e.targetMuscle.toLowerCase() === cat.toLowerCase(),
    );
    if (firstExInCat) {
      setLogExName(firstExInCat.name);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6] text-[#1A1A1A] overflow-y-auto p-4 md:p-6 pb-24 select-text">
      {/* 1. Header with Title & Date filter triggers */}
      <div className="mb-5 flex justify-between items-start flex-wrap gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E63946] underline underline-offset-4 block mb-2">
            03 — Analytics & Metrics
          </span>
          <h1 className="text-3xl font-serif font-black italic text-[#1A1A1A] tracking-tight">
            Performance Insights
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="btn-open-log-workout-sets"
            onClick={() => setIsLogFormOpen(true)}
            className="bg-[#E63946] hover:bg-[#d62828] text-white font-mono font-bold uppercase tracking-widest text-[10px] px-3 py-2 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Custom Set
          </button>

          <button
            aria-label="Reset analytics"
            id="btn-reset-performance-metrics"
            onClick={handleResetHistory}
            title="Reset to default pre-seeded metrics"
            className="border border-[#1A1A1A]/10 hover:border-[#1A1A1A] bg-white p-2 text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Date Filter & Calendar Filtering Block */}
      <div className="bg-white border border-[#1A1A1A]/10 p-3 mb-5 flex items-center justify-between gap-3 text-xs flex-wrap shadow-sm">
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#1A1A1A]/60 uppercase">
          <Filter className="w-3.5 h-3.5 text-[#E63946]" />
          <span>Calendar Range Filter</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-mono text-[#1A1A1A]/40 uppercase">From</span>
            <input
              id="input-date-filter-start"
              type="date"
              value={dateFilterStart}
              onChange={(e) => setDateFilterStart(e.target.value)}
              className="bg-[#F9F8F6] border border-[#1A1A1A]/10 p-1 text-[10px] font-mono focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-mono text-[#1A1A1A]/40 uppercase">To</span>
            <input
              id="input-date-filter-end"
              type="date"
              value={dateFilterEnd}
              onChange={(e) => setDateFilterEnd(e.target.value)}
              className="bg-[#F9F8F6] border border-[#1A1A1A]/10 p-1 text-[10px] font-mono focus:outline-none"
            />
          </div>

          {(dateFilterStart || dateFilterEnd) && (
            <button
              id="btn-clear-date-filter"
              onClick={() => {
                setDateFilterStart("");
                setDateFilterEnd("");
              }}
              className="text-[9px] font-bold uppercase tracking-wider text-[#E63946] hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Basic summary bar for weight/water */}
      <div className="grid grid-cols-3 gap-3.5 mb-5 text-center">
        <div className="bg-white border border-[#1A1A1A]/10 p-3 shadow-sm">
          <Flame className="w-3.5 h-3.5 text-[#E63946] mx-auto mb-1" />
          <span className="block text-[8px] uppercase font-bold text-[#1A1A1A]/40 tracking-wider">
            Loaded volume
          </span>
          <span className="text-xs font-mono font-black text-[#1A1A1A]">
            {coreMetrics.totalVolume.toLocaleString()}kg
          </span>
        </div>
        <div className="bg-white border border-[#1A1A1A]/10 p-3 shadow-sm">
          <Scale className="w-3.5 h-3.5 text-[#1A1A1A] mx-auto mb-1" />
          <span className="block text-[8px] uppercase font-bold text-[#1A1A1A]/40 tracking-wider">
            Current Weight
          </span>
          <span className="text-xs font-mono font-black text-[#1A1A1A]">{currentWeight}kg</span>
        </div>
        <div className="bg-white border border-[#1A1A1A]/10 p-3 shadow-sm">
          <Droplet className="w-3.5 h-3.5 text-[#E63946] mx-auto mb-1" />
          <span className="block text-[8px] uppercase font-bold text-[#1A1A1A]/40 tracking-wider">
            Hydration Today
          </span>
          <span className="text-xs font-mono font-black text-[#1A1A1A]">
            {(todayWaterTotal / 1000).toFixed(1)}L
          </span>
        </div>
      </div>

      {/* F-L7 fix: top-level empty state when the user hasn't logged any
          training sets yet. Mirrors the MarketplaceTab pattern (icon +
          heading + description + CTA). The sub-tabs below still render
          (with zeros and empty charts) for users who want to explore, but
          the banner makes it obvious how to populate the dashboard. */}
      {exerciseLogs.length === 0 && (
        <div className="bg-white border border-[#1A1A1A]/10 p-6 mb-5 text-center flex flex-col items-center">
          <Activity className="w-10 h-10 text-[#1A1A1A]/30 mb-2" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/80">
            No Training Logs Yet
          </h4>
          <p className="text-[10px] text-[#1A1A1A]/60 mt-1 font-serif italic max-w-xs leading-relaxed">
            Log your first working set to populate volume trends, muscle balance,
            PR tracking, and the workout heatmap. Weight and water logs work
            independently.
          </p>
          <button
            type="button"
            id="btn-empty-log-workout-sets"
            onClick={() => setIsLogFormOpen(true)}
            className="mt-4 px-4 py-2 bg-[#E63946] hover:bg-[#d62828] text-white text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Custom Set
          </button>
        </div>
      )}

      {/* Tab Selectors */}
      <div className="border-b border-[#1A1A1A]/10 mb-5 flex">
        <button
          id="btn-subtab-metrics"
          onClick={() => setActiveSubTab("metrics")}
          className={`flex-1 pb-2.5 text-center text-[10px] uppercase font-bold tracking-wider transition-all border-b-2 ${
            activeSubTab === "metrics"
              ? "border-[#E63946] text-[#1A1A1A]"
              : "border-transparent text-[#1A1A1A]/40 hover:text-[#1A1A1A]/70"
          }`}
        >
          Volume & Trends
        </button>
        <button
          id="btn-subtab-muscles"
          onClick={() => setActiveSubTab("muscles")}
          className={`flex-1 pb-2.5 text-center text-[10px] uppercase font-bold tracking-wider transition-all border-b-2 ${
            activeSubTab === "muscles"
              ? "border-[#E63946] text-[#1A1A1A]"
              : "border-transparent text-[#1A1A1A]/40 hover:text-[#1A1A1A]/70"
          }`}
        >
          Muscle Map
        </button>
        <button
          id="btn-subtab-exercises"
          onClick={() => setActiveSubTab("exercises")}
          className={`flex-1 pb-2.5 text-center text-[10px] uppercase font-bold tracking-wider transition-all border-b-2 ${
            activeSubTab === "exercises"
              ? "border-[#E63946] text-[#1A1A1A]"
              : "border-transparent text-[#1A1A1A]/40 hover:text-[#1A1A1A]/70"
          }`}
        >
          Lifts & Plateaus
        </button>
        <button
          id="btn-subtab-visuals"
          onClick={() => setActiveSubTab("visuals")}
          className={`flex-1 pb-2.5 text-center text-[10px] uppercase font-bold tracking-wider transition-all border-b-2 ${
            activeSubTab === "visuals"
              ? "border-[#E63946] text-[#1A1A1A]"
              : "border-transparent text-[#1A1A1A]/40 hover:text-[#1A1A1A]/70"
          }`}
        >
          Heatmap & Flex
        </button>
      </div>

      {/* Active tab content container — each sub-tab is now a self-contained
          component that receives the shared analytics bundle + its own UI
          state/setters. */}
      <div className="flex-grow">
        {activeSubTab === "metrics" && (
          <CoreMetricsView
            analytics={analytics}
            multiplierSecondary={multiplierSecondary}
            setMultiplierSecondary={setMultiplierSecondary}
          />
        )}
        {activeSubTab === "muscles" && (
          <MuscleVolumeView
            analytics={analytics}
            selectedMuscle={selectedMuscle}
            setSelectedMuscle={setSelectedMuscle}
            hoveredMuscle={hoveredMuscle}
            setHoveredMuscle={setHoveredMuscle}
            trainingAge={trainingAge}
            setTrainingAge={setTrainingAge}
          />
        )}
        {activeSubTab === "exercises" && (
          <ExerciseProgressionView
            analytics={analytics}
            selectedAnalysisEx={selectedAnalysisEx}
            setSelectedAnalysisEx={setSelectedAnalysisEx}
            isSmoothedTrend={isSmoothedTrend}
            setIsSmoothedTrend={setIsSmoothedTrend}
          />
        )}
        {activeSubTab === "visuals" && (
          <VisualsView
            analytics={analytics}
            exerciseLogs={exerciseLogs}
            activeShareCard={activeShareCard}
            setActiveShareCard={setActiveShareCard}
            copiedShareText={copiedShareText}
            setCopiedShareText={setCopiedShareText}
          />
        )}
      </div>

      {/* Standard weight and water log blocks rendered at bottom for compatibility with legacy props */}
      <LegacyHealthLogger
        newWeight={newWeight}
        setNewWeight={setNewWeight}
        weightLogs={weightLogs}
        onAddWeightLog={onAddWeightLog}
        onAddWaterLog={onAddWaterLog}
        onClearWaterLogs={onClearWaterLogs}
        todayWaterTotal={todayWaterTotal}
        waterPercent={waterPercent}
        weightDiff={weightDiff}
      />

      {/* MODAL: CUSTOM LOAD SET LOGGER FORM — F-C2: uses the accessible
          <Modal> component. The dark custom header was replaced by the
          Modal's standard header; the form fields are preserved verbatim.

          Stays at the ProgressTab root (not inside ExerciseProgressionView)
          because the "Log Custom Set" trigger button lives in the page
          header and must open the modal regardless of which sub-tab is
          active. Moving it into the exercises sub-tab component would
          silently no-op when the user clicks "Log Custom Set" from another
          sub-tab. */}
      <CustomSetLoggerModal
        isLogFormOpen={isLogFormOpen}
        setIsLogFormOpen={setIsLogFormOpen}
        logExName={logExName}
        setLogExName={setLogExName}
        logExMuscle={logExMuscle}
        logExWeight={logExWeight}
        setLogExWeight={setLogExWeight}
        logExReps={logExReps}
        setLogExReps={setLogExReps}
        logExType={logExType}
        setLogExType={setLogExType}
        logExIsWarmUp={logExIsWarmUp}
        setLogExIsWarmUp={setLogExIsWarmUp}
        handleLogCustomSetSubmit={handleLogCustomSetSubmit}
        handleMuscleCategoryChange={handleMuscleCategoryChange}
      />
    </div>
  );
}
