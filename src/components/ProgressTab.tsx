import React, { useState, useMemo } from "react";
import { DailyWeightLog, WaterLog } from "../engine";
import {
  Plus,
  Flame,
  Droplet,
  Scale,
  Dumbbell,
  Filter,
  RotateCcw,
} from "lucide-react";
import {
  SetLog,
  ExerciseLog,
  LIFETIME_TIERS,
  calculateCoreMetrics,
  calculateRollingTrends,
  analyzeExerciseProgression,
  calculatePersonalRecords,
  calculateMuscleVolumesAndScores,
} from "../data/analyticsEngine";
import { EXERCISE_DATABASE } from "../data/workoutTemplates";
import { useLogsStore } from "../store/useLogsStore";
import { toast, confirmDialog } from "./Toast";
// A-01: extracted sub-components (feature folder: src/components/progress/)
import { EngineTrendAnalysis } from "./progress/EngineTrendAnalysis";
import { DailyIntakeLogger } from "./progress/DailyIntakeLogger";
// A-01 (r1-progresstab-split): the 4 render closures moved into named components.
import { CoreMetricsTab } from "./progress/CoreMetricsTab";
import { MuscleMapTab } from "./progress/MuscleMapTab";
import { ExercisesTab } from "./progress/ExercisesTab";
import { VisualsTab, FlexCardData } from "./progress/VisualsTab";

interface ProgressTabProps {
  weightLogs: DailyWeightLog[];
  waterLogs: WaterLog[];
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

  // Active Flex Card for sharing modal (FlexCardData shape lives in VisualsTab.tsx)
  const [activeShareCard, setActiveShareCard] = useState<FlexCardData | null>(null);
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
  // Q-07: safe — toISOString().split("T") always yields at least one element.
  const [todayStrPart] = new Date().toISOString().split("T");
  const todayStr = todayStrPart as string;

  // Weight metrics
  // Q-07: safe — guarded by weightLogs.length > 0.
  const currentWeight = weightLogs.length > 0 ? (weightLogs[weightLogs.length - 1]?.weight_kg ?? 75) : 75;
  const initialWeight = weightLogs.length > 0 ? (weightLogs[0]?.weight_kg ?? 75) : 75;
  const weightDiff = currentWeight - initialWeight;

  // Water metrics
  const todayWaterTotal = waterLogs
    .filter((log) => log.date === todayStr)
    .reduce((sum, log) => sum + log.amountMl, 0);
  const waterTarget = 3000;
  const waterPercent = Math.min(100, Math.round((todayWaterTotal / waterTarget) * 100));

  // Training volume and sets metrics
  const coreMetrics = useMemo(() => {
    return calculateCoreMetrics(filteredLogs, multiplierSecondary);
  }, [filteredLogs, multiplierSecondary]);

  // Rolling periods (using all-time data internally to query historical windows)
  const rollingTrends = useMemo(() => {
    return calculateRollingTrends(exerciseLogs);
  }, [exerciseLogs]);

  // Muscle Volume Zones & Hypertrophy Scores
  const muscleZonesAndScores = useMemo(() => {
    return calculateMuscleVolumesAndScores(filteredLogs, trainingAge);
  }, [filteredLogs, trainingAge]);

  // Muscle Balance Flags (Top 3 exceed 70% of total)
  const muscleBalanceAnalysis = useMemo(() => {
    const sortedMuscles = [...muscleZonesAndScores].sort((a, b) => b.balancePct - a.balancePct);
    const top3Share = sortedMuscles.slice(0, 3).reduce((sum, item) => sum + item.balancePct, 0);
    const isImbalanced = top3Share > 70;
    return {
      top3Share,
      isImbalanced,
      sortedMuscles,
    };
  }, [muscleZonesAndScores]);

  // Tiers / Lifetime progress (Total working mass in tons)
  const lifetimeVolumeTons = useMemo(() => {
    const rawVolume = exerciseLogs.reduce((sum, ex) => {
      return sum + ex.sets.reduce((sSum, s) => sSum + (s.isWarmUp ? 0 : s.weight * s.reps), 0);
    }, 0);
    return Math.round((rawVolume / 1000) * 10) / 10; // kg to tons
  }, [exerciseLogs]);

  const lifetimeTierInfo = useMemo(() => {
    const currentTierIndex = LIFETIME_TIERS.findIndex(
      (tier) => lifetimeVolumeTons >= tier.minTons && lifetimeVolumeTons < tier.maxTons,
    );
    const currentTier = LIFETIME_TIERS[currentTierIndex] ?? (LIFETIME_TIERS[0] as typeof LIFETIME_TIERS[number] | undefined);
    const nextTier = LIFETIME_TIERS[currentTierIndex + 1] ?? null;

    let progressPercent = 100;
    let tonsToNext = 0;
    if (!currentTier) {
      return {
        current: "Unknown",
        next: "Max Tier Reached",
        progressPercent,
        tonsToNext,
        weeksToNext: 100,
        tierIndex: currentTierIndex + 1,
      };
    }

    if (nextTier) {
      // Q-07: safe — currentTier is non-null via fallback to LIFETIME_TIERS[0].
      const range = nextTier.minTons - currentTier.minTons;
      const progress = lifetimeVolumeTons - currentTier.minTons;
      progressPercent = Math.min(100, Math.round((progress / range) * 100));
      tonsToNext = Math.round((nextTier.minTons - lifetimeVolumeTons) * 10) / 10;
    }

    // Estimate weeks to next tier based on average weekly volume
    const recent4WeeksVolume = filteredLogs
      .filter((l) => {
        const d = new Date(l.date);
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        return d >= fourWeeksAgo;
      })
      .reduce(
        (sum, ex) =>
          sum + ex.sets.reduce((sSum, s) => sSum + (s.isWarmUp ? 0 : s.weight * s.reps), 0),
        0,
      );

    const avgWeeklyTons = recent4WeeksVolume / 4 / 1000; // tons/week
    const weeksToNext =
      avgWeeklyTons > 0 && tonsToNext > 0 ? Math.ceil(tonsToNext / avgWeeklyTons) : 100;

    return {
      // Q-07: safe — currentTier is non-null via fallback to LIFETIME_TIERS[0].
      current: currentTier.name,
      next: nextTier ? nextTier.name : "Max Tier Reached",
      progressPercent,
      tonsToNext,
      weeksToNext,
      tierIndex: currentTierIndex + 1,
    };
  }, [lifetimeVolumeTons, filteredLogs]);

  // Exercise Analysis & Progression Grouping
  const exerciseProgressions = useMemo(() => {
    return analyzeExerciseProgression(filteredLogs);
  }, [filteredLogs]);

  // Personal Records
  const personalRecords = useMemo(() => {
    return calculatePersonalRecords(filteredLogs);
  }, [filteredLogs]);

  // Active exercises unique names
  const activeExNames = useMemo(() => {
    return Array.from(new Set(exerciseLogs.map((e) => e.exerciseName))).sort();
  }, [exerciseLogs]);

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
      // Q-07: safe — existingIndex !== -1 ensures the element exists.
      const existing = updated[existingIndex];
      if (existing) existing.sets.push(newSet);
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

      {/* Active tab content container — A-01 (r1-progresstab-split): each sub-tab
          is now a separate component under src/components/progress/. */}
      <div className="flex-grow">
        {activeSubTab === "metrics" && (
          <CoreMetricsTab
            coreMetrics={coreMetrics}
            rollingTrends={rollingTrends}
            multiplierSecondary={multiplierSecondary}
            setMultiplierSecondary={setMultiplierSecondary}
            filteredLogs={filteredLogs}
          />
        )}
        {activeSubTab === "muscles" && (
          <MuscleMapTab
            muscleZonesAndScores={muscleZonesAndScores}
            selectedMuscle={selectedMuscle}
            setSelectedMuscle={setSelectedMuscle}
            hoveredMuscle={hoveredMuscle}
            setHoveredMuscle={setHoveredMuscle}
            trainingAge={trainingAge}
            setTrainingAge={setTrainingAge}
            muscleBalanceAnalysis={muscleBalanceAnalysis}
            lifetimeTierInfo={lifetimeTierInfo}
            lifetimeVolumeTons={lifetimeVolumeTons}
          />
        )}
        {activeSubTab === "exercises" && (
          <ExercisesTab
            exerciseProgressions={exerciseProgressions}
            personalRecords={personalRecords}
            selectedAnalysisEx={selectedAnalysisEx}
            setSelectedAnalysisEx={setSelectedAnalysisEx}
            isSmoothedTrend={isSmoothedTrend}
            setIsSmoothedTrend={setIsSmoothedTrend}
            filteredLogs={filteredLogs}
            activeExNames={activeExNames}
          />
        )}
        {activeSubTab === "visuals" && (
          <VisualsTab
            exerciseLogs={exerciseLogs}
            muscleZonesAndScores={muscleZonesAndScores}
            coreMetrics={coreMetrics}
            todayWaterTotal={todayWaterTotal}
            weightDiff={weightDiff}
            activeShareCard={activeShareCard}
            setActiveShareCard={setActiveShareCard}
            copiedShareText={copiedShareText}
            setCopiedShareText={setCopiedShareText}
          />
        )}
      </div>

      {/* Standard weight and water log blocks rendered at bottom for compatibility with legacy props */}
      <div className="mt-8 border-t border-[#1A1A1A]/10 pt-6 space-y-6">
        <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1A1A1A]/40 mb-3">
          Standard Health Logger
        </h3>

        {/* Legacy Water glass */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-serif font-bold text-sm text-[#1A1A1A] flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-[#1A1A1A]" />
                Daily Liquid Hydration
              </h4>
              <p className="text-[10px] text-[#1A1A1A]/60 mt-0.5 font-serif italic">
                Target: 3.0 Liters • Today: {todayWaterTotal} ml
              </p>
            </div>
            <button
              id="btn-clear-water-legacy"
              onClick={onClearWaterLogs}
              className="text-[9px] font-mono font-bold text-[#1A1A1A]/60 hover:text-[#E63946] transition-all border border-[#1A1A1A]/10 hover:border-[#E63946] px-2.5 py-1 bg-white"
            >
              Reset
            </button>
          </div>

          <div className="flex items-center gap-4 py-1">
            <div className="relative w-12 h-18 border border-[#1A1A1A]/20 bg-[#F9F8F6] overflow-hidden flex flex-col justify-end">
              <div
                style={{ height: `${waterPercent}%` }}
                className="w-full bg-[#E63946] transition-all"
              />
              <div className="absolute inset-0 flex items-center justify-center text-[8.5px] font-mono font-bold text-[#1A1A1A]">
                {waterPercent}%
              </div>
            </div>

            <div className="flex-grow grid grid-cols-2 gap-2">
              <button
                id="btn-add-water-legacy-250"
                onClick={() => onAddWaterLog(250)}
                className="py-1.5 text-center bg-white border border-[#1A1A1A]/10 hover:border-[#1A1A1A] text-[10px] text-[#1A1A1A] font-bold uppercase tracking-wider"
              >
                +250ml Glass
              </button>
              <button
                id="btn-add-water-legacy-500"
                onClick={() => onAddWaterLog(500)}
                className="py-1.5 text-center bg-white border border-[#1A1A1A]/10 hover:border-[#1A1A1A] text-[10px] text-[#1A1A1A] font-bold uppercase tracking-wider"
              >
                +500ml Bottle
              </button>
            </div>
          </div>
        </div>

        {/* Legacy Weight history */}
        <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-serif font-bold text-sm text-[#1A1A1A] flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#E63946]" />
              Body Weight Trajectory
            </h4>
            <span className="text-[9px] font-mono text-[#E63946] font-bold">
              {weightDiff >= 0 ? "+" : ""}
              {weightDiff.toFixed(1)}kg Over Time
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = parseFloat(newWeight);
              if (!isNaN(val) && val > 0) {
                onAddWeightLog(val);
                setNewWeight("");
              }
            }}
            className="flex gap-2"
          >
            <input
              id="input-weight-log-legacy"
              type="number"
              step="0.1"
              placeholder="Log today's weight (kg)..."
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              required
              className="flex-grow bg-white border border-[#1A1A1A]/15 rounded-none px-2.5 py-1.5 text-xs focus:outline-none"
            />
            <button
              id="btn-submit-weight-legacy"
              type="submit"
              className="bg-[#1A1A1A] hover:bg-[#E63946] text-white font-bold px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono"
            >
              Log Weight
            </button>
          </form>

          {/* Engine Trend Analysis — uses the engine's weeklyRateLbPerWeek + interpretWeightTrend */}
          <EngineTrendAnalysis weightLogs={weightLogs} />

          {/* Daily intake logger — feeds the adaptive TDEE engine */}
          <DailyIntakeLogger />
        </div>
      </div>

      {/* MODAL: CUSTOM LOAD SET LOGGER FORM */}
      {isLogFormOpen && (
        <div className="fixed inset-0 bg-[#1A1A1A]/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F9F8F6] border border-[#1A1A1A]/20 w-full max-w-sm rounded-none overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="bg-[#1A1A1A] text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#E63946]" />
                <h3 className="font-serif italic font-bold text-base uppercase tracking-wider">
                  Log Manual Training Set
                </h3>
              </div>
              <button
                id="btn-close-log-form"
                onClick={() => setIsLogFormOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLogCustomSetSubmit} className="p-4 space-y-3.5">
              {/* Category selector */}
              <div>
                <label
                  htmlFor="select-custom-log-category"
                  className="block text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1"
                >
                  Muscle Category
                </label>
                <select
                  id="select-custom-log-category"
                  value={logExMuscle}
                  onChange={(e) => handleMuscleCategoryChange(e.target.value)}
                  className="w-full bg-white border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="Chest">Chest</option>
                  <option value="Lats">Lats</option>
                  <option value="Mid Back">Mid Back</option>
                  <option value="Upper Back">Upper Back</option>
                  <option value="Quads">Quads</option>
                  <option value="Hamstrings">Hamstrings</option>
                  <option value="Glutes">Glutes</option>
                  <option value="Shoulders">Shoulders</option>
                  <option value="Biceps">Biceps</option>
                  <option value="Triceps">Triceps</option>
                  <option value="Core">Core</option>
                  <option value="Cardio">Cardio</option>
                </select>
              </div>

              {/* Exercise Selection list depending on category */}
              <div>
                <label
                  htmlFor="select-custom-log-exercise-name"
                  className="block text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1"
                >
                  Exercise Name
                </label>
                <select
                  id="select-custom-log-exercise-name"
                  value={logExName}
                  onChange={(e) => setLogExName(e.target.value)}
                  className="w-full bg-white border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  {EXERCISE_DATABASE.filter(
                    (e) =>
                      e.targetMuscle.toLowerCase() === logExMuscle.toLowerCase() ||
                      (logExMuscle === "Core" &&
                        ["Core", "Lower Abs", "Obliques"].includes(e.targetMuscle)) ||
                      (logExMuscle === "Lats" &&
                        ["Lats", "Mid Back", "Upper Back"].includes(e.targetMuscle)) ||
                      (logExMuscle === "Mid Back" &&
                        ["Lats", "Mid Back", "Upper Back"].includes(e.targetMuscle)) ||
                      (logExMuscle === "Upper Back" &&
                        ["Lats", "Mid Back", "Upper Back"].includes(e.targetMuscle)) ||
                      (logExMuscle === "Quads" &&
                        ["Quads", "Hamstrings", "Glutes"].includes(e.targetMuscle)) ||
                      (logExMuscle === "Hamstrings" &&
                        ["Quads", "Hamstrings", "Glutes"].includes(e.targetMuscle)) ||
                      (logExMuscle === "Glutes" &&
                        ["Quads", "Hamstrings", "Glutes"].includes(e.targetMuscle)),
                  ).map((e) => (
                    <option key={e.name} value={e.name}>
                      {e.name}
                    </option>
                  ))}
                  {/* Default back up option if none filtered */}
                  <option value={logExName}>{logExName}</option>
                </select>
              </div>

              {/* Load weight & Reps */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="input-custom-log-weight"
                    className="block text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1"
                  >
                    Weight Load (kg)
                  </label>
                  <input
                    id="input-custom-log-weight"
                    type="number"
                    step="0.5"
                    value={logExWeight}
                    onChange={(e) => setLogExWeight(e.target.value)}
                    className="w-full bg-white border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#E63946]"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="input-custom-log-reps"
                    className="block text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1"
                  >
                    Repetitions
                  </label>
                  <input
                    id="input-custom-log-reps"
                    type="number"
                    value={logExReps}
                    onChange={(e) => setLogExReps(e.target.value)}
                    className="w-full bg-white border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#E63946]"
                    required
                  />
                </div>
              </div>

              {/* Set category type and Warm-Up toggle */}
              <div className="grid grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label
                    htmlFor="select-custom-log-set-type"
                    className="block text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1"
                  >
                    Set Intensity Type
                  </label>
                  <select
                    id="select-custom-log-set-type"
                    value={logExType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setLogExType(e.target.value as "Normal" | "AMRAP" | "Failure" | "Drop Set")
                    }
                    className="w-full bg-white border border-[#1A1A1A]/15 px-2.5 py-1.5 text-xs"
                  >
                    <option value="Normal">Normal Set</option>
                    <option value="AMRAP">AMRAP Set</option>
                    <option value="Failure">To Failure Set</option>
                    <option value="Drop Set">Drop Set</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    id="checkbox-custom-log-warmup"
                    type="checkbox"
                    checked={logExIsWarmUp}
                    onChange={(e) => setLogExIsWarmUp(e.target.checked)}
                    className="w-4 h-4 accent-[#E63946]"
                  />
                  <label
                    htmlFor="checkbox-custom-log-warmup"
                    className="text-[10px] font-bold uppercase text-[#1A1A1A]/60"
                  >
                    Warm-Up Set
                  </label>
                </div>
              </div>

              {/* Submit / Cancel buttons */}
              <div className="pt-4 border-t border-[#1A1A1A]/5 flex gap-2">
                <button
                  id="btn-cancel-custom-log"
                  type="button"
                  onClick={() => setIsLogFormOpen(false)}
                  className="flex-1 py-2 text-center border border-[#1A1A1A]/15 text-[#1A1A1A]/60 font-bold uppercase tracking-wider text-[10px] font-mono bg-white"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-custom-log"
                  type="submit"
                  className="flex-1 py-2 text-center bg-[#E63946] text-white font-bold uppercase tracking-wider text-[10px] font-mono hover:bg-[#d62828]"
                >
                  Log Set
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

