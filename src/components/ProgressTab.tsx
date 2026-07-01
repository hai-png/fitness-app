import React, { useState, useMemo, useEffect } from "react";
import { useSafeTimeout } from "../hooks/useSafeTimeout";
import { DailyWeightLog, WaterLog, WorkoutLog } from "../engine";
import {
  Plus,
  Flame,
  Droplet,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Dumbbell,
  Sliders,
  Award,
  Clock,
  Info,
  ChevronUp,
  Share2,
  Filter,
  Zap,
  Activity,
  User,
  Check,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import {
  SetLog,
  ExerciseLog,
  LIFETIME_TIERS,
  calculateEpley1RM,
  calculateCoreMetrics,
  calculateRollingTrends,
  analyzeExerciseProgression,
  calculatePersonalRecords,
  calculateMuscleVolumesAndScores,
  MuscleVolumeZone,
  ExerciseAnalysis,
  PersonalRecord,
} from "../data/analyticsEngine";
import { EXERCISE_DATABASE } from "../data/workoutTemplates";
import { useLogsStore } from "../store/useLogsStore";
import { useUserStore } from "../store/useUserStore";
import { useIntakeStore } from "../store/useIntakeStore";
import { toast, confirmDialog } from "./Toast";
import { OneRMEstimator } from "./OneRMEstimator";
import {
  weeklyAverageWeightKg,
  weeklyRateLbPerWeek,
  interpretWeightTrend,
} from "../engine";
import { WorkoutHeatmap } from "./WorkoutHeatmap";

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
  workoutLogs,
  onAddWeightLog,
  onAddWaterLog,
  onClearWaterLogs,
}: ProgressTabProps) {
  // F-H4: useSafeTimeout guards the share-card copy-reset timeouts against
  // firing after unmount.
  const safeTimeout = useSafeTimeout();

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

  // Active Flex Card for sharing modal
  const [activeShareCard, setActiveShareCard] = useState<any | null>(null);
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
      (tier, idx) => lifetimeVolumeTons >= tier.minTons && lifetimeVolumeTons < tier.maxTons,
    );
    const currentTier = LIFETIME_TIERS[currentTierIndex] || LIFETIME_TIERS[0];
    const nextTier = LIFETIME_TIERS[currentTierIndex + 1] || null;

    let progressPercent = 100;
    let tonsToNext = 0;
    if (nextTier) {
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
      current: currentTier.name,
      next: nextTier ? nextTier.name : "Max Tier Reached",
      progressPercent,
      tonsToNext,
      weeksToNext,
      tierIndex: currentTierIndex + 1,
    };
  }, [lifetimeVolumeTons, exerciseLogs, filteredLogs]);

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

  // --- SUB TAB 1: CORE METRICS & ROLLING WINDOWS ---
  const renderCoreMetricsTab = () => {
    // Group sets by Focus
    let strengthSets = 0;
    let hypertrophySets = 0;
    let enduranceSets = 0;
    let totalWorking = 0;

    filteredLogs.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.isWarmUp) return;
        totalWorking++;
        if (s.reps <= 5) strengthSets++;
        else if (s.reps <= 12) hypertrophySets++;
        else enduranceSets++;
      });
    });

    const strengthPct = totalWorking > 0 ? Math.round((strengthSets / totalWorking) * 100) : 0;
    const hypertrophyPct =
      totalWorking > 0 ? Math.round((hypertrophySets / totalWorking) * 100) : 0;
    const endurancePct = totalWorking > 0 ? Math.round((enduranceSets / totalWorking) * 100) : 0;

    return (
      <div className="space-y-5 animate-fadeIn">
        {/* Overall summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm relative overflow-hidden">
            <span className="text-[8px] font-bold font-mono uppercase tracking-widest text-[#E63946] block mb-1">
              Active Volume
            </span>
            <div className="text-xl font-serif font-black italic tracking-tight text-[#1A1A1A]">
              {coreMetrics.totalVolume.toLocaleString()}{" "}
              <span className="text-xs not-italic font-sans font-medium text-[#1A1A1A]/50">kg</span>
            </div>
            <p className="text-[10px] text-[#1A1A1A]/60 font-serif italic mt-1 leading-normal">
              Based on {coreMetrics.totalWorkingSets} working sets (excl. warm-ups) with secondary
              muscles @ {multiplierSecondary}x.
            </p>
          </div>

          <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm relative overflow-hidden">
            <span className="text-[8px] font-bold font-mono uppercase tracking-widest text-[#E63946] block mb-1">
              Tempo & Density
            </span>
            <div className="text-xl font-serif font-black italic tracking-tight text-[#1A1A1A]">
              {coreMetrics.volumePerMinute}{" "}
              <span className="text-xs not-italic font-sans font-medium text-[#1A1A1A]/50">
                kg/min
              </span>
            </div>
            <p className="text-[10px] text-[#1A1A1A]/60 font-serif italic mt-1 leading-normal">
              Accumulating mechanical tension inside a total session length of{" "}
              {coreMetrics.totalDuration} minutes.
            </p>
          </div>
        </div>

        {/* Rolling Windows & Periodic Comparisons */}
        <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm">
          <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-3">
            <Activity className="w-4 h-4 text-[#E63946]" />
            Rolling Periodic Velocity
          </h3>
          <p className="text-[10px] text-[#1A1A1A]/60 mb-4 font-serif italic leading-relaxed">
            Compares absolute muscular load lifted across recent cycles against prior identical
            windows to verify systematic velocity.
          </p>

          <div className="grid grid-cols-3 gap-2 text-center">
            {/* 7 Days */}
            <div className="bg-[#F9F8F6] border border-[#1A1A1A]/5 p-2.5">
              <span className="text-[8px] uppercase tracking-wider font-bold text-[#1A1A1A]/40 block">
                Last 7 Days
              </span>
              <span className="text-xs font-mono font-bold block mt-1 text-[#1A1A1A]">
                {(rollingTrends.vol7 / 1000).toFixed(1)}t
              </span>
              <span
                className={`text-[9px] font-bold inline-flex items-center gap-0.5 mt-1 font-mono ${
                  rollingTrends.diff7 >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {rollingTrends.diff7 >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {rollingTrends.diff7 >= 0 ? "+" : ""}
                {rollingTrends.diff7.toFixed(1)}%
              </span>
            </div>

            {/* 30 Days */}
            <div className="bg-[#F9F8F6] border border-[#1A1A1A]/5 p-2.5">
              <span className="text-[8px] uppercase tracking-wider font-bold text-[#1A1A1A]/40 block">
                Last 30 Days
              </span>
              <span className="text-xs font-mono font-bold block mt-1 text-[#1A1A1A]">
                {(rollingTrends.vol30 / 1000).toFixed(1)}t
              </span>
              <span
                className={`text-[9px] font-bold inline-flex items-center gap-0.5 mt-1 font-mono ${
                  rollingTrends.diff30 >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {rollingTrends.diff30 >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {rollingTrends.diff30 >= 0 ? "+" : ""}
                {rollingTrends.diff30.toFixed(1)}%
              </span>
            </div>

            {/* 365 Days */}
            <div className="bg-[#F9F8F6] border border-[#1A1A1A]/5 p-2.5">
              <span className="text-[8px] uppercase tracking-wider font-bold text-[#1A1A1A]/40 block">
                Last Year
              </span>
              <span className="text-xs font-mono font-bold block mt-1 text-[#1A1A1A]">
                {(rollingTrends.vol365 / 1000).toFixed(1)}t
              </span>
              <span
                className={`text-[9px] font-bold inline-flex items-center gap-0.5 mt-1 font-mono ${
                  rollingTrends.diff365 >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {rollingTrends.diff365 >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {rollingTrends.diff365 >= 0 ? "+" : ""}
                {rollingTrends.diff365.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Training Focus splits based on reps range */}
        <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm">
          <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-2">
            <Sliders className="w-4 h-4 text-[#E63946]" />
            Muscular Conditioning Focus
          </h3>
          <p className="text-[10px] text-[#1A1A1A]/60 mb-4 font-serif italic leading-relaxed">
            Classifies working sets by target fiber recruitment: Strength (1-5 reps), Hypertrophy
            (6-12 reps), and Endurance (13+ reps).
          </p>

          <div className="space-y-3.5">
            {/* Strength */}
            <div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                <span>Strength Power (1-5 reps)</span>
                <span className="font-mono text-xs">{strengthPct}%</span>
              </div>
              <div className="h-2 bg-[#1A1A1A]/5 overflow-hidden">
                <div
                  className="h-full bg-[#E63946] transition-all"
                  style={{ width: `${strengthPct}%` }}
                />
              </div>
            </div>

            {/* Hypertrophy */}
            <div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                <span>Myofibrillar Hypertrophy (6-12 reps)</span>
                <span className="font-mono text-xs">{hypertrophyPct}%</span>
              </div>
              <div className="h-2 bg-[#1A1A1A]/5 overflow-hidden">
                <div
                  className="h-full bg-indigo-900 transition-all"
                  style={{ width: `${hypertrophyPct}%` }}
                />
              </div>
            </div>

            {/* Endurance */}
            <div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                <span>Sarcoplasmic Endurance (13+ reps)</span>
                <span className="font-mono text-xs">{endurancePct}%</span>
              </div>
              <div className="h-2 bg-[#1A1A1A]/5 overflow-hidden">
                <div
                  className="h-full bg-emerald-700 transition-all"
                  style={{ width: `${endurancePct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 1RM Estimation Calculator Widget (extracted to <OneRMEstimator />) */}
        <OneRMEstimator />

        {/* Configurable Multiplier settings */}
        <div className="bg-white border border-[#1A1A1A]/10 p-3.5 rounded-none shadow-sm flex items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-bold text-[#1A1A1A] uppercase tracking-tight block text-[10.5px]">
              Configure Load Parameters
            </span>
            <span className="text-[9px] text-[#1A1A1A]/50 italic block mt-0.5">
              Adjust synergy coefficients for secondary arms/shoulders.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#E63946] font-bold">
              {multiplierSecondary}x
            </span>
            <input
              id="slider-synergy-coefficient"
              type="range"
              min="0.0"
              max="1.0"
              step="0.1"
              value={multiplierSecondary}
              onChange={(e) => setMultiplierSecondary(parseFloat(e.target.value))}
              className="w-20 h-1 bg-[#1A1A1A]/10 accent-[#E63946]"
            />
          </div>
        </div>
      </div>
    );
  };

  // --- SUB TAB 2: MUSCLE BODY MAP & VOLUME ZONES ---
  const renderMuscleMapTab = () => {
    const selectedMuscleData =
      muscleZonesAndScores.find((z) => z.muscle.toLowerCase() === selectedMuscle?.toLowerCase()) ||
      muscleZonesAndScores[0];

    return (
      <div className="space-y-5 animate-fadeIn">
        {/* Dynamic configuration slider for training age */}
        <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-[#E63946] block">
                Zone Personalization
              </span>
              <h3 className="font-serif font-bold text-sm text-[#1A1A1A] mt-0.5">
                Adaptable Training Age
              </h3>
            </div>
            <select
              id="select-training-age"
              value={trainingAge}
              onChange={(e: any) => setTrainingAge(e.target.value)}
              className="bg-[#F9F8F6] border border-[#1A1A1A]/10 text-xs px-2 py-1 font-bold text-[#1A1A1A]"
            >
              <option value="Beginner">Beginner Age (&lt;1 yr)</option>
              <option value="Intermediate">Intermediate Age (1-3 yrs)</option>
              <option value="Advanced">Advanced Age (3+ yrs)</option>
            </select>
          </div>
          <p className="text-[10px] text-[#1A1A1A]/60 font-serif italic leading-relaxed">
            Training experience shifts your muscular adaptations limits. Minimum Effective Volume
            (MEV) and Max Recoverable Volume (MRV) zones are dynamically customized based on this
            setting.
          </p>
        </div>

        {/* Interactive Body Map Grid */}
        <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm relative">
          <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-3">
            <User className="w-4 h-4 text-[#E63946]" />
            Anatomical Load Map & Volume Zones
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Elegant SVG/Anatomical figure list selector representing anterior and posterior muscles */}
            <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
              <span className="text-[8px] font-mono font-bold text-[#1A1A1A]/40 block uppercase tracking-wider mb-1.5">
                Interactive Muscle Zones
              </span>

              {muscleZonesAndScores.map((z) => {
                const isSelected = selectedMuscle?.toLowerCase() === z.muscle.toLowerCase();
                const isHovered = hoveredMuscle?.toLowerCase() === z.muscle.toLowerCase();

                return (
                  <button
                    key={z.muscle}
                    id={`btn-muscle-zone-${z.muscle}`}
                    type="button"
                    onClick={() => setSelectedMuscle(z.muscle)}
                    onMouseEnter={() => setHoveredMuscle(z.muscle)}
                    onMouseLeave={() => setHoveredMuscle(null)}
                    className={`w-full text-left px-2.5 py-1.5 border transition-all text-[11px] flex items-center justify-between font-mono ${
                      isSelected
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                        : isHovered
                          ? "bg-[#E63946]/5 border-[#E63946]/35 text-[#E63946]"
                          : "bg-[#F9F8F6] border-[#1A1A1A]/5 text-[#1A1A1A]/85 hover:border-[#1A1A1A]/15"
                    }`}
                  >
                    <span className="truncate">{z.muscle}</span>
                    <span className="text-[9px] opacity-70 font-bold">{z.weeklySets} sets</span>
                  </button>
                );
              })}
            </div>

            {/* Muscle load details block */}
            <div className="bg-[#F9F8F6] border border-[#1A1A1A]/5 p-3.5 flex flex-col justify-between h-[220px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#E63946]/5 rounded-full blur-lg pointer-events-none" />

              <div>
                <span className="text-[7.5px] font-bold font-mono uppercase tracking-[0.2em] text-[#E63946] block">
                  ACTIVE SECTOR DETAILS
                </span>
                <h4 className="font-serif italic font-black text-base text-[#1A1A1A] leading-tight mt-1">
                  {selectedMuscleData.muscle}
                </h4>

                <div className="mt-3 space-y-2">
                  <div>
                    <span className="text-[8px] font-mono font-bold text-[#1A1A1A]/40 block uppercase">
                      Weekly Sets Rate
                    </span>
                    <span className="text-xs font-mono font-bold text-[#1A1A1A]">
                      {selectedMuscleData.weeklySets} working sets/week
                    </span>
                  </div>

                  <div>
                    <span className="text-[8px] font-mono font-bold text-[#1A1A1A]/40 block uppercase mb-0.5">
                      Stimulus Zone Badge
                    </span>
                    <span
                      className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 border uppercase tracking-wider block text-center rounded ${selectedMuscleData.colorClass}`}
                    >
                      {selectedMuscleData.zone.replace(/\(.*\)/, "")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1A1A1A]/5">
                    <div>
                      <span className="text-[8px] font-mono font-bold text-[#1A1A1A]/40 block uppercase">
                        Hypertrophy Score
                      </span>
                      <span className="text-xs font-mono font-bold text-[#E63946]">
                        {selectedMuscleData.score}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-mono font-bold text-[#1A1A1A]/40 block uppercase">
                        Load Share
                      </span>
                      <span className="text-xs font-mono font-bold text-[#1A1A1A]">
                        {selectedMuscleData.balancePct}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[9px] text-[#1A1A1A]/55 font-serif italic leading-tight border-t border-[#1A1A1A]/5 pt-2 mt-2">
                {selectedMuscleData.zone.includes("MEV")
                  ? "Optimal minimal effective stimulus for growth."
                  : selectedMuscleData.zone.includes("MAV")
                    ? "Perfect adaptive hypertrophy stimulus. Keep pushing!"
                    : selectedMuscleData.zone.includes("MRV")
                      ? "Warning: High recoverability exhaustion risk. Deload suggested."
                      : "Maintenance volume or recovery stage."}
              </p>
            </div>
          </div>
        </div>

        {/* Muscle Balance and flags */}
        <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm">
          <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-1.5">
            <Sliders className="w-4 h-4 text-[#E63946]" />
            Volume Distribution Balance
          </h3>
          <p className="text-[10px] text-[#1A1A1A]/60 mb-3 font-serif italic leading-relaxed">
            Identifies muscular asymmetry issues. Standard balanced ratio flags if the top 3 muscle
            groups account for &gt;70% of total weekly volume.
          </p>

          <div className="border border-[#1A1A1A]/5 bg-[#F9F8F6] p-3 mb-4 rounded flex items-center justify-between">
            <div>
              <span className="text-[8px] font-mono font-bold uppercase text-[#1A1A1A]/40 block">
                Top 3 Muscle Concentration
              </span>
              <span className="text-sm font-mono font-black text-[#1A1A1A]">
                {muscleBalanceAnalysis.top3Share}% of total
              </span>
            </div>
            {muscleBalanceAnalysis.isImbalanced ? (
              <span className="text-[9.5px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-100 px-2.5 py-1 uppercase rounded tracking-wide">
                ⚠️ Asymmetry Flagged
              </span>
            ) : (
              <span className="text-[9.5px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1 uppercase rounded tracking-wide">
                ✓ Symmetric Balance
              </span>
            )}
          </div>

          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
            {muscleBalanceAnalysis.sortedMuscles.slice(0, 5).map((m, idx) => (
              <div
                key={m.muscle}
                className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-[#1A1A1A]/5"
              >
                <span className="font-bold text-[#1A1A1A]/70">
                  {idx + 1}. {m.muscle}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-[#1A1A1A]/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#E63946]" style={{ width: `${m.balancePct}%` }} />
                  </div>
                  <span className="w-8 text-right font-bold text-[#1A1A1A]">{m.balancePct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lifetime Progress Tier Progress */}
        <div className="bg-[#1A1A1A] text-white p-4 rounded-none shadow-md relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-[#E63946]/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-[0.25em] text-[#E63946]">
                LIFETIME MASSIVE OUTPUT
              </span>
              <h3 className="font-serif italic font-black text-lg text-white mt-0.5">
                Tier {lifetimeTierInfo.tierIndex}: {lifetimeTierInfo.current}
              </h3>
            </div>
            <Award className="w-5 h-5 text-[#E63946]" />
          </div>

          <div className="text-2xl font-mono font-black text-white">
            {lifetimeVolumeTons.toFixed(1)}{" "}
            <span className="text-xs font-sans font-bold text-white/50">Tons Lifted</span>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center text-[9px] font-bold font-mono text-white/55 uppercase mb-1">
              <span>Next Level: {lifetimeTierInfo.next}</span>
              <span>{lifetimeTierInfo.progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E63946]"
                style={{ width: `${lifetimeTierInfo.progressPercent}%` }}
              />
            </div>
          </div>

          <p className="text-[10px] text-white/60 font-serif italic mt-3 leading-normal border-t border-white/5 pt-2">
            Based on current weekly volume, you are estimated to graduate to the{" "}
            <strong>{lifetimeTierInfo.next}</strong> tier in approximately{" "}
            <strong>{lifetimeTierInfo.weeksToNext}</strong> weeks.
          </p>
        </div>
      </div>
    );
  };

  // --- SUB TAB 3: EXERCISES, PLATEAUS & SET-BY-SET FEEDBACK ---
  const renderExercisesTab = () => {
    // Current selected exercise analysis details
    const selectedExAnalysis =
      exerciseProgressions.find((e) => e.name === selectedAnalysisEx) || exerciseProgressions[0];

    // Find PRs for selected
    const selectedPR = personalRecords.find((p) => p.exerciseName === selectedAnalysisEx);

    // Filter historical sets logs to plot SVG chart
    const selectedExHistory = [...filteredLogs]
      .filter((l) => l.exerciseName === selectedAnalysisEx)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // SVG Chart Plotter
    const renderTrendChart = () => {
      if (selectedExHistory.length < 2) {
        return (
          <div className="flex flex-col items-center justify-center h-28 text-[#1A1A1A]/40 text-xs font-serif italic border border-[#1A1A1A]/5 bg-[#F9F8F6] p-3 text-center">
            <Clock className="w-5 h-5 mb-1 text-[#1A1A1A]/30" />
            <span>
              Generate multiple sessions of {selectedAnalysisEx} to render trend trajectories.
            </span>
          </div>
        );
      }

      // Compute values depending on Smoothed toggle
      const rawPoints = selectedExHistory.map((sess, idx) => {
        const working = sess.sets.filter((s) => !s.isWarmUp).map((s) => s.weight);
        const maxWeight = working.length > 0 ? Math.max(...working) : 0;
        return { idx, weight: maxWeight, date: sess.date };
      });

      // Simple 3-session moving average
      const plottedPoints = rawPoints.map((pt, index) => {
        if (isSmoothedTrend) {
          const startIdx = Math.max(0, index - 2);
          const slice = rawPoints.slice(startIdx, index + 1);
          const sum = slice.reduce((s, p) => s + p.weight, 0);
          const avg = sum / slice.length;
          return { ...pt, weight: Math.round(avg * 10) / 10 };
        }
        return pt;
      });

      const width = 310;
      const height = 90;
      const weightsList = plottedPoints.map((p) => p.weight);
      // Guard against empty arrays (Math.max(...[]) returns -Infinity)
      const minW = weightsList.length > 0 ? Math.min(...weightsList) - 2.5 : 0;
      const maxW = weightsList.length > 0 ? Math.max(...weightsList) + 2.5 : 1;
      const range = maxW - minW || 1;

      const coords = plottedPoints.map((pt, i) => {
        const x = (i / (plottedPoints.length - 1)) * (width - 24) + 12;
        const y = height - ((pt.weight - minW) / range) * (height - 20) - 10;
        return { x, y, weight: pt.weight, date: pt.date };
      });

      const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");

      return (
        <div className="relative border border-[#1A1A1A]/10 p-3 bg-[#F9F8F6] rounded-none">
          <div className="flex justify-between items-center text-[8px] font-mono text-[#1A1A1A]/40 uppercase mb-2">
            <span>TRAJECTORY PLOT</span>
            <span className="text-[#E63946]">
              {isSmoothedTrend ? "Stable (Smoothed Moving Avg)" : "Reactive (Raw Peak)"}
            </span>
          </div>

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
            {/* Guidelines */}
            <line
              x1="0"
              y1={10}
              x2={width}
              y2={10}
              stroke="#1A1A1A"
              strokeOpacity="0.06"
              strokeDasharray="2 2"
            />
            <line
              x1="0"
              y1={height - 10}
              x2={width}
              y2={height - 10}
              stroke="#1A1A1A"
              strokeOpacity="0.06"
              strokeDasharray="2 2"
            />

            {/* Line Path */}
            <path
              d={path}
              fill="none"
              stroke="#E63946"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Nodes */}
            {coords.map((c, i) => (
              <g key={i}>
                <circle
                  cx={c.x}
                  cy={c.y}
                  r="2.5"
                  fill="#FFFFFF"
                  stroke="#E63946"
                  strokeWidth="1.5"
                />
                {(i === 0 || i === coords.length - 1) && (
                  <text
                    x={c.x}
                    y={c.y - 7}
                    textAnchor="middle"
                    fill="#1A1A1A"
                    fontSize="7"
                    fontWeight="bold"
                    className="font-mono"
                  >
                    {c.weight}kg
                  </text>
                )}
              </g>
            ))}
          </svg>

          <div className="flex justify-between items-center text-[7.5px] font-mono text-[#1A1A1A]/40 mt-1">
            <span>{coords[0].date}</span>
            <span>{coords[coords.length - 1].date}</span>
          </div>
        </div>
      );
    };

    // Stalled / Plateau exercises watcher
    const plateauExercises = exerciseProgressions.filter((e) => e.plateauDetected);

    // Latest Set-by-Set feedback details
    const recentExerciseWithAnomaly = filteredLogs.slice(-15).reverse();

    return (
      <div className="space-y-5 animate-fadeIn">
        {/* Dynamic selectors for exercise trend analysis */}
        <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-serif font-bold text-sm text-[#1A1A1A]">
              Trend Trajectory analysis
            </h3>
            <select
              id="select-analysis-ex"
              value={selectedAnalysisEx}
              onChange={(e) => setSelectedAnalysisEx(e.target.value)}
              className="bg-[#F9F8F6] border border-[#1A1A1A]/10 text-xs px-2 py-1 font-bold text-[#1A1A1A]"
            >
              {activeExNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector details & chart */}
          {selectedExAnalysis && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 border uppercase rounded ${
                      selectedExAnalysis.statusLabel === "Accelerating"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                        : selectedExAnalysis.statusLabel === "Slipping"
                          ? "bg-rose-50 text-rose-800 border-rose-100"
                          : "bg-neutral-50 text-neutral-800 border-neutral-100"
                    }`}
                  >
                    {selectedExAnalysis.statusLabel}
                  </span>
                  <span className="text-[9px] font-mono text-[#1A1A1A]/45">
                    Confidence: {selectedExAnalysis.confidence} ({selectedExAnalysis.sessionCount}{" "}
                    sessions)
                  </span>
                </div>

                {/* Smoothed Toggle Button */}
                <button
                  id="btn-toggle-smoothed"
                  onClick={() => setIsSmoothedTrend(!isSmoothedTrend)}
                  className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#E63946] border border-[#E63946]/15 hover:bg-[#E63946]/5 px-2 py-1"
                >
                  {isSmoothedTrend ? "Reactive (Raw)" : "Stable (Smoothed)"}
                </button>
              </div>

              {renderTrendChart()}

              {/* Personal Records panel */}
              {selectedPR && (
                <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-[#1A1A1A]/5 pt-3">
                  <div>
                    <span className="text-[8px] text-[#1A1A1A]/40 uppercase block">
                      Gold PR (All-Time)
                    </span>
                    <span className="font-bold text-[#1A1A1A]">{selectedPR.goldValue}kg</span>
                    <span className="text-[8.5px] text-[#1A1A1A]/45 block italic mt-0.5">
                      {selectedPR.dateGold}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] text-[#1A1A1A]/40 uppercase block">
                      Silver PR (Last 60 Days)
                    </span>
                    <span className="font-bold text-[#E63946]">{selectedPR.silverValue}kg</span>
                    <span className="text-[8.5px] text-[#1A1A1A]/45 block italic mt-0.5">
                      {selectedPR.dateSilver}
                    </span>
                  </div>

                  {/* Warn about premature PRs if detected */}
                  {selectedPR.prematureFlagged && (
                    <div className="col-span-2 bg-amber-50 text-amber-800 border border-amber-100 p-2.5 rounded-none text-[10.5px] mt-1.5 leading-normal">
                      <span className="font-bold uppercase tracking-wide block text-[8px] text-amber-700">
                        ⚠️ Premature Peak Detected
                      </span>
                      {selectedPR.prematureDetails}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Plateau Detection watch panel */}
        <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm">
          <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-1.5">
            <Sliders className="w-4 h-4 text-[#E63946]" />
            Plateau Watch & Recommendations
          </h3>
          <p className="text-[10px] text-[#1A1A1A]/60 mb-3 font-serif italic leading-relaxed">
            Checks if top weights have stalled or deteriorated across consecutive sessions, and
            provides specific athletic adjustments.
          </p>

          {plateauExercises.length === 0 ? (
            <div className="text-center py-4 bg-[#F9F8F6] border border-[#1A1A1A]/5 text-xs text-[#1A1A1A]/40 font-serif italic">
              No flat stall lines flagged! Consistent progressive overload detected across active
              movements.
            </div>
          ) : (
            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
              {plateauExercises.map((p) => (
                <div key={p.name} className="bg-amber-50/40 border border-amber-100 p-3 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#1A1A1A] uppercase tracking-tight text-[11px]">
                      {p.name}
                    </span>
                    <span className="text-[8px] font-mono bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                      STALLED
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#1A1A1A]/70 italic leading-normal font-serif">
                    {p.plateauRecommendation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Set-by-Set Analysis & Patterns Feedback */}
        <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm">
          <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-1">
            <Info className="w-4 h-4 text-[#E63946]" />
            Set-by-Set Patterns Feedback
          </h3>
          <p className="text-[10px] text-[#1A1A1A]/60 mb-3 font-serif italic leading-relaxed">
            Scans individual mechanical set structures (AMRAP, Failure, Drop Sets) to prescribe
            exact adjustments.
          </p>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {recentExerciseWithAnomaly.slice(0, 5).map((log, idx) => {
              // Find if this log has anomalies (e.g. Failure, AMRAP or Drop Set in sets)
              const anomalySets = log.sets.filter((s) => s.type !== "Normal" && !s.isWarmUp);
              if (anomalySets.length === 0) return null;

              return (
                <div
                  key={idx}
                  className="bg-[#F9F8F6] border border-[#1A1A1A]/5 p-3 rounded-none text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[#1A1A1A] uppercase tracking-tight text-[10.5px]">
                        {log.exerciseName}
                      </h4>
                      <span className="text-[8.5px] font-mono text-[#1A1A1A]/40 block">
                        {log.date}
                      </span>
                    </div>
                    <span className="text-[8px] bg-indigo-900 text-white font-mono font-bold px-1.5 py-0.5 rounded">
                      PATTERN DETECTED
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1.5">
                    {anomalySets.map((set, sIdx) => {
                      let tip = "";
                      if (set.type === "AMRAP") {
                        tip = `AMRAP completed successfully (${set.reps} reps @ ${set.weight}kg). Your neuromuscular endurance is high. Suggest increasing working load by +2.5kg next week to stimulate further mechanical hypertrophy.`;
                      } else if (set.type === "Failure") {
                        tip = `Hit failure early on set (${set.reps} reps @ ${set.weight}kg). Consider increasing rest length to 120-180 seconds between compound sets to allow ATP replenishment, or reduce weight by 5% to lock down your target rep volumes.`;
                      } else if (set.type === "Drop Set") {
                        tip = `Metabolic Drop Set completed (${set.reps} reps @ ${set.weight}kg). Executed high-volume depletion. Perfect for sarcoplasmic stimulation. Consume rapid-acting carbs post-workout.`;
                      }

                      return (
                        <div
                          key={sIdx}
                          className="border-l-2 border-[#E63946] pl-2.5 py-1 text-[10.5px] text-[#1A1A1A]/75 leading-relaxed font-serif italic"
                        >
                          <strong className="font-sans not-italic font-bold text-[8.5px] text-[#1A1A1A]/50 block uppercase mb-0.5">
                            SET {sIdx + 3} Focus ({set.type})
                          </strong>
                          {tip}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // --- SUB TAB 4: HEATMAP & SHAREABLE FLEX CARDS ---
  const renderVisualsTab = () => {
    // 1. Streak computation (the heatmap itself was extracted to <WorkoutHeatmap />,
    //    but currentStreak is still needed by the "Streak Warrior" flex card below).
    const today = new Date();

    // Map logs to dates count
    const workoutCountsByDate: Record<string, number> = {};
    exerciseLogs.forEach((l) => {
      workoutCountsByDate[l.date] = (workoutCountsByDate[l.date] || 0) + 1;
    });

    // Compute streak
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Simple streak calculator checking training consistency (at least 1 set logged within 3 days)
    for (let i = 0; i < 365; i++) {
      const checkDateStr = new Date(today);
      checkDateStr.setDate(today.getDate() - i);
      const formatted = checkDateStr.toISOString().split("T")[0];

      if (workoutCountsByDate[formatted]) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
        if (i <= tempStreak) currentStreak = tempStreak; // current active streak
      } else {
        // Allow a 2-day buffer for streak continuation
        const formattedBuffer1 = new Date(checkDateStr);
        formattedBuffer1.setDate(checkDateStr.getDate() - 1);
        const formattedBuffer2 = new Date(checkDateStr);
        formattedBuffer2.setDate(checkDateStr.getDate() - 2);

        if (
          !workoutCountsByDate[formattedBuffer1.toISOString().split("T")[0]] &&
          !workoutCountsByDate[formattedBuffer2.toISOString().split("T")[0]]
        ) {
          tempStreak = 0;
        }
      }
    }

    // (renderHeatmap was extracted to <WorkoutHeatmap /> — see component import.)

    // 2. Shareable Flex Cards list
    // Pre-calculate highlights data (guard against empty logs — Math.max(...[])
    // returns -Infinity which would render as "-Infinity kg" in the UI)
    const dayVolumes = exerciseLogs.map((l) =>
      l.sets.reduce((sum, s) => sum + (s.isWarmUp ? 0 : s.weight * s.reps), 0),
    );
    const maxDayVolume = dayVolumes.length > 0 ? Math.max(...dayVolumes) : 0;

    const session1RMs = exerciseLogs.map((l) =>
      Math.max(0, ...l.sets.map((s) => calculateEpley1RM(s.weight, s.reps))),
    );
    const highestCalculated1RM = session1RMs.length > 0 ? Math.max(...session1RMs) : 0;
    const topExercise = exerciseProgressions[0]?.name || "Bench Press";
    const topMuscleScore = muscleZonesAndScores[0]?.muscle || "Chest";
    const totalSessionsNum = Array.from(new Set(exerciseLogs.map((l) => l.date))).length;

    const flexCardsData = [
      {
        id: "volume-king",
        title: "The Volume King",
        badge: "Heavy Lifter",
        metric: `${maxDayVolume.toLocaleString()} kg`,
        subtitle: "Single-Day Max Volume Load",
        description:
          "You accumulated a staggering structural load in a single session, overloading muscle fibers with high mechanical stimulus.",
        quote: "True muscular progress is forged through heavy systematic volume.",
      },
      {
        id: "consistency-engine",
        title: "Consistency Engine",
        badge: "Elite Habit",
        metric: `${totalSessionsNum} Sessions`,
        subtitle: "90-Day Training Consistency",
        description:
          "Consistency creates absolute muscle adaptation. Your physical discipline outpaced the average practitioner.",
        quote: "We are what we repeatedly do. Excellence is a mechanical habit.",
      },
      {
        id: "strength-pinnacle",
        title: "Strength Pinnacle",
        badge: "Estimated 1RM Peak",
        metric: `${Math.round(highestCalculated1RM)} kg`,
        subtitle: "Maximum Estimated 1RM",
        description:
          "Your calculated absolute failure limits highlight an elite central nervous system synchronization rate.",
        quote: "Power is the mechanical output of neural adaptation and mass.",
      },
      {
        id: "hypertrophy-champion",
        title: "Hypertrophy Champion",
        badge: "Primary Stimulus Sector",
        metric: `${topMuscleScore}`,
        subtitle: "Max Stimulus Concentration",
        description:
          "This muscle group maintained the optimal set-rate ratios for systematic hypertrophy adaptation.",
        quote: "Growth occurs where high progressive load meets deep recovery.",
      },
      {
        id: "streak-warrior",
        title: "Streak Warrior",
        badge: "Consistent Momentum",
        metric: `${currentStreak} Days`,
        subtitle: "Active Consistency Streak",
        description:
          "Maintaining an uninterrupted physical load momentum prevents neural decline and ensures steady adaptations.",
        quote: "Never break the chain. Momentum is the wind in your progress sails.",
      },
      {
        id: "density-master",
        title: "Session Density Master",
        badge: "High Work Rate",
        metric: `${coreMetrics.volumePerMinute} kg/min`,
        subtitle: "Muscular Density Output",
        description:
          "You maximized your work capacity, minimizing empty rest gaps to sustain continuous muscle tension.",
        quote: "Density is the metric of focused athletic effort over time.",
      },
      {
        id: "hydraulic-charger",
        title: "Hydraulic Charger",
        badge: "Optimized Hydration",
        metric: `${(todayWaterTotal / 1000).toFixed(1)}L`,
        subtitle: "Daily Liquid Hydration",
        description:
          "Optimal cellular hydration ensures maximum muscle pump, fluid volume recovery, and joints cushioning.",
        quote: "A hydrated muscle is a strong, resilient, and responsive muscle.",
      },
      {
        id: "trajectory-conqueror",
        title: "Trajectory Conqueror",
        badge: "Overload Overlord",
        metric: `${weightDiff >= 0 ? "+" : ""}${weightDiff.toFixed(1)}kg`,
        subtitle: "Weight Change Over Time",
        description:
          "Body weight shifts demonstrate clean metabolic partitions or mass additions consistent with your program.",
        quote: "Mass moves mass. Control the trajectory to dominate the peak.",
      },
    ];

    const handleOpenShare = (card: any) => {
      setActiveShareCard(card);
      setCopiedShareText(false);
    };

    const handleCopyShare = async () => {
      const shareText = `My Training Card: [${activeShareCard.title} - ${activeShareCard.badge}]\nMetric Peak: ${activeShareCard.metric}\n"${activeShareCard.quote}"\nLogged on FitLife Hub!`;
      // navigator.clipboard is undefined in non-secure (HTTP) contexts and
      // can reject if the user denies the permission. Feature-detect + try/catch.
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareText);
          setCopiedShareText(true);
          safeTimeout(() => setCopiedShareText(false), 2000);
          toast.success("Copied!", "Share text is on your clipboard.");
        } else {
          // Fallback: select-and-execCommand for older browsers / non-secure contexts
          const ta = document.createElement("textarea");
          ta.value = shareText;
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          setCopiedShareText(true);
          safeTimeout(() => setCopiedShareText(false), 2000);
          toast.success("Copied!", "Share text is on your clipboard.");
        }
      } catch (err) {
        console.error("Clipboard write failed:", err);
        toast.error(
          "Copy failed",
          "Couldn't access the clipboard. Try selecting the text manually.",
        );
      }
    };

    return (
      <div className="space-y-5 animate-fadeIn">
        {/* Heatmap rendering (extracted to <WorkoutHeatmap />) */}
        <WorkoutHeatmap exerciseLogs={exerciseLogs} />

        {/* Flex cards header */}
        <div className="border-b border-[#1A1A1A]/10 pb-2 mt-2">
          <h3 className="font-serif font-bold text-sm text-[#1A1A1A] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#E63946]" />
            Annual Highlighting Flex Cards
          </h3>
          <p className="text-[10px] text-[#1A1A1A]/60 font-serif italic mt-0.5 leading-relaxed">
            Expand or share your physical highlights across social platforms. Crafted with athletic
            display layouts.
          </p>
        </div>

        {/* Visual grid of Cards */}
        <div className="grid grid-cols-2 gap-3.5">
          {flexCardsData.map((card) => (
            <div
              key={card.id}
              onClick={() => handleOpenShare(card)}
              className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none hover:border-[#1A1A1A]/35 transition-all relative flex flex-col justify-between cursor-pointer group shadow-sm overflow-hidden"
            >
              {/* Background watermark badge icon */}
              <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                <Sparkles className="w-20 h-20 text-[#1A1A1A]" />
              </div>

              <div>
                <span className="text-[7.5px] font-bold font-mono text-[#E63946] uppercase tracking-[0.15em] block mb-1">
                  {card.badge}
                </span>
                <h4 className="font-serif italic font-black text-sm text-[#1A1A1A] leading-tight group-hover:text-[#E63946] transition-colors">
                  {card.title}
                </h4>
              </div>

              <div className="mt-4 pt-2 border-t border-[#1A1A1A]/5 flex justify-between items-baseline gap-2">
                <span className="text-base font-mono font-black text-[#1A1A1A]">{card.metric}</span>
                <Share2 className="w-3.5 h-3.5 text-[#1A1A1A]/30 group-hover:text-[#E63946] transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* MODAL SHARE CARD POPUP */}
        {activeShareCard && (
          <div className="fixed inset-0 bg-[#1A1A1A]/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] text-white border border-white/10 w-full max-w-sm rounded-none overflow-hidden shadow-2xl flex flex-col">
              {/* Card visual showcase */}
              <div className="p-6 bg-black/40 border-b border-white/5 relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute right-4 top-4 text-[#E63946]">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>

                <span className="text-[8px] font-mono font-bold uppercase tracking-[0.25em] text-[#E63946] mb-1">
                  AETHER ATHLETIC ACCOMPLISHMENT
                </span>

                <h3 className="font-serif italic font-black text-xl text-white tracking-tight mt-1">
                  {activeShareCard.title}
                </h3>

                <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-0.5">
                  {activeShareCard.subtitle}
                </span>

                <div className="text-3xl font-mono font-black text-white mt-5 bg-white/5 px-5 py-2.5 border border-white/10 rounded-sm">
                  {activeShareCard.metric}
                </div>

                <p className="text-[11px] text-white/70 italic font-serif leading-relaxed mt-4 max-w-[280px]">
                  &quot;{activeShareCard.quote}&quot;
                </p>
              </div>

              {/* Explainer / Description */}
              <div className="p-4 bg-[#1A1A1A] space-y-3">
                <p className="text-xs text-white/80 leading-relaxed">
                  {activeShareCard.description}
                </p>
              </div>

              {/* Actions */}
              <div className="p-4 bg-black/20 border-t border-white/5 flex gap-2">
                <button
                  id="btn-close-share"
                  onClick={() => setActiveShareCard(null)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-bold uppercase tracking-wider text-center"
                >
                  Cancel
                </button>
                <button
                  id="btn-copy-share-text"
                  onClick={handleCopyShare}
                  className="flex-1 py-2.5 bg-[#E63946] hover:bg-[#d62828] text-white text-xs font-mono font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5"
                >
                  {copiedShareText ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5" />
                  )}
                  {copiedShareText ? "Copied!" : "Copy Flex Card"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
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

      {/* Active tab content container */}
      <div className="flex-grow">
        {activeSubTab === "metrics" && renderCoreMetricsTab()}
        {activeSubTab === "muscles" && renderMuscleMapTab()}
        {activeSubTab === "exercises" && renderExercisesTab()}
        {activeSubTab === "visuals" && renderVisualsTab()}
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
                aria-label="Close"
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
                    onChange={(e: any) => setLogExType(e.target.value)}
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

// ===========================================================================
// Engine Trend Analysis — uses the engine's weeklyRateLbPerWeek +
// interpretWeightTrend functions to surface evidence-based weight-trend
// insights in the Logs tab. Implements Step 1 of IMPLEMENTATION_REPORT.md.
// ===========================================================================

interface EngineTrendAnalysisProps {
  weightLogs: DailyWeightLog[];
}

function EngineTrendAnalysis({ weightLogs }: EngineTrendAnalysisProps) {
  // Pull the user's primary goal + engine profile to determine cut/bulk phase.
  const onboardingInput = useUserStore((s) => s.onboardingInput);
  const engineProfile = useUserStore((s) => s.engineProfile);
  // E-52 fix: read the cached NutritionPlan so we can compute daysIntoPhase
  // from the actual phase_start_date — NOT from the weight-log count. The
  // engine's 14-day adaptation guard depends on the real phase start.
  const nutritionPlan = useUserStore((s) => s.cachedNutritionPlan);
  const intakeLogs = useIntakeStore((s) => s.intakeLogs);

  // DailyWeightLog is an alias for engine DailyWeightLog — no mapping needed.
  const dailyWeights = weightLogs;

  // Compute weekly average + rate using the engine functions.
  const weeklyAvg = useMemo(() => weeklyAverageWeightKg(dailyWeights), [dailyWeights]);
  const rateLbPerWeek = useMemo(() => weeklyRateLbPerWeek(dailyWeights), [dailyWeights]);

  // Determine the phase for trend interpretation.
  const phase: "cut" | "bulk" | "recomp" | "maintain" = (() => {
    // Prefer the engine's resolved phase (which accounts for BF%-based goal
    // refinement) over the raw onboarding goal. interpretWeightTrend only
    // handles cut/bulk/recomp/maintain; a reverse_diet plan falls back to
    // "maintain" for trend-interpretation purposes (reverse diet is a
    // transition phase, not a weight-trend phase).
    const planPhase = nutritionPlan?.phase;
    if (planPhase === "cut" || planPhase === "bulk" || planPhase === "recomp" || planPhase === "maintain") {
      return planPhase;
    }
    const goal = onboardingInput?.goal;
    if (goal === "weight-loss") return "cut";
    if (goal === "muscle-gain" || goal === "strength") return "bulk";
    return "maintain";
  })();

  // E-52 fix: daysIntoPhase must be measured from the actual phase start
  // date (NutritionPlan.phase_start_date), not from the weight-log count.
  // The engine's interpretWeightTrend() uses days_into_phase to gate the
  // 14-day adaptation window ("first 14 days: water + glycogen + gut content
  // shifts dominate, do NOT adjust calories"). Computing it from log count
  // defeats this safety guard for any user with history from a prior phase.
  //
  // The lint rule against calling Date.now() during render is correct in
  // general, but here we genuinely need the current time to compute elapsed
  // days. We capture it in state via an effect (runs once per phase-start
  // change) so the render itself stays pure.
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  useEffect(() => {
    setNowMs(Date.now());
  }, [nutritionPlan?.phase_start_date]);
  const daysIntoPhase = useMemo(() => {
    const phaseStart = nutritionPlan?.phase_start_date;
    if (!phaseStart) return 0;
    const startMs = new Date(phaseStart).getTime();
    if (Number.isNaN(startMs)) return 0;
    return Math.max(0, Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24)));
  }, [nutritionPlan?.phase_start_date, nowMs]);
  const weeksIntoPhase = Math.floor(daysIntoPhase / 7);

  const trend = useMemo(
    () => interpretWeightTrend(dailyWeights, phase, daysIntoPhase, weeksIntoPhase),
    [dailyWeights, phase, daysIntoPhase, weeksIntoPhase],
  );

  // Intake logging stats (for adaptive TDEE convergence info).
  const intakeDays = intakeLogs.length;
  const avgIntake =
    intakeDays > 0
      ? Math.round(intakeLogs.reduce((s, l) => s + l.kcal, 0) / intakeDays)
      : null;

  // Show the panel only after we have at least 1 week of data.
  if (dailyWeights.length < 7) {
    return (
      <div className="mt-3 bg-[#E63946]/5 border border-[#E63946]/15 p-3 rounded-none">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-[#E63946] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-[#1A1A1A]">
              Engine trend analysis needs more data
            </p>
            <p className="text-[9px] text-[#1A1A1A]/60 font-serif italic mt-0.5">
              Log weight daily for at least 7 days to unlock evidence-based trend insights
              (weekly rate, adaptation-phase detection, cut/bulk adjustment recommendations).
              Currently have {dailyWeights.length}/7 days.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const actionColor =
    trend.action === "act"
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : trend.action === "wait"
        ? "text-blue-700 bg-blue-50 border-blue-200"
        : trend.action === "adaptation_phase"
          ? "text-purple-700 bg-purple-50 border-purple-200"
          : "text-emerald-700 bg-emerald-50 border-emerald-200";

  return (
    <div className="mt-3 bg-white border border-[#1A1A1A]/10 p-3 rounded-none">
      <div className="flex items-center gap-1.5 mb-2">
        <TrendingUp className="w-3.5 h-3.5 text-[#E63946]" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] font-mono">
          Engine Trend Analysis
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <div className="bg-[#F9F8F6] p-1.5 border border-[#1A1A1A]/5 text-center">
          <span className="block text-[8px] uppercase text-[#1A1A1A]/40">Weekly Avg</span>
          <span className="text-[11px] font-bold text-[#1A1A1A]">
            {weeklyAvg !== null ? `${weeklyAvg.toFixed(1)} kg` : "—"}
          </span>
        </div>
        <div className="bg-[#F9F8F6] p-1.5 border border-[#1A1A1A]/5 text-center">
          <span className="block text-[8px] uppercase text-[#1A1A1A]/40">Rate</span>
          <span
            className={`text-[11px] font-bold ${
              rateLbPerWeek !== null && rateLbPerWeek < 0
                ? "text-emerald-600"
                : rateLbPerWeek !== null && rateLbPerWeek > 0
                  ? "text-amber-600"
                  : "text-[#1A1A1A]"
            }`}
          >
            {rateLbPerWeek !== null ? `${rateLbPerWeek.toFixed(2)} lb/wk` : "—"}
          </span>
        </div>
        <div className="bg-[#F9F8F6] p-1.5 border border-[#1A1A1A]/5 text-center">
          <span className="block text-[8px] uppercase text-[#1A1A1A]/40">Phase</span>
          <span className="text-[11px] font-bold text-[#E63946] uppercase">{phase}</span>
        </div>
      </div>

      <div className={`p-2 border rounded-none ${actionColor}`}>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 flex-shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {trend.action.replace(/_/g, " ")}
          </span>
        </div>
        <p className="text-[9px] mt-0.5 font-serif italic">{trend.reason}</p>
      </div>

      {/* Intake logging status */}
      <div className="mt-2 flex items-center justify-between text-[9px] text-[#1A1A1A]/60 font-mono">
        <span>
          Intake logs: {intakeDays} day(s)
          {avgIntake !== null && ` · avg ${avgIntake} kcal`}
        </span>
        <span className="text-[#E63946]">
          {intakeDays >= 30
            ? "Adaptive TDEE ready"
            : `${30 - intakeDays} days to adaptive TDEE`}
        </span>
      </div>

      {engineProfile.is_currently_in_deficit !== undefined && (
        <p className="text-[8px] text-[#1A1A1A]/40 font-serif italic mt-1">
          Deficit flag: {engineProfile.is_currently_in_deficit ? "active (−5% BMR)" : "inactive"}
        </p>
      )}
    </div>
  );
}

// ===========================================================================
// Daily Intake Logger — feeds the adaptive TDEE engine with daily calorie
// + macro intake. Required for the adaptive TDEE to converge from prior-heavy
// (formula-based) to data-driven after ~30 days of paired intake+weight data.
// ===========================================================================

function DailyIntakeLogger() {
  const intakeLogs = useIntakeStore((s) => s.intakeLogs);
  const addIntakeLog = useIntakeStore((s) => s.addIntakeLog);
  const clearTodayIntakeLog = useIntakeStore((s) => s.clearTodayIntakeLog);
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const todayLog = intakeLogs.find((l) => l.date === todayStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const k = parseFloat(kcal);
    if (Number.isNaN(k) || k <= 0) {
      toast.error("Invalid calories", "Enter a positive number for kcal.");
      return;
    }
    addIntakeLog({
      kcal: k,
      protein_g: parseFloat(protein) || 0,
      carbs_g: parseFloat(carbs) || 0,
      fat_g: parseFloat(fat) || 0,
    });
    setKcal("");
    setProtein("");
    setCarbs("");
    setFat("");
    toast.success("Intake logged", `${k} kcal for today.`);
  };

  return (
    <div className="mt-3 bg-white border border-[#1A1A1A]/10 p-3 rounded-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-[#E63946]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] font-mono">
            Daily Intake Logger
          </span>
        </div>
        {todayLog && (
          <button
            type="button"
            onClick={() => {
              clearTodayIntakeLog();
              toast.info("Today's intake cleared");
            }}
            className="text-[9px] text-[#1A1A1A]/50 hover:text-[#E63946] font-mono uppercase tracking-wider"
          >
            Clear Today
          </button>
        )}
      </div>

      {todayLog ? (
        <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-none mb-2">
          <div className="flex items-center gap-1.5">
            <Check className="w-3 h-3 text-emerald-700" />
            <span className="text-[10px] font-bold text-emerald-700">
              Today: {todayLog.kcal} kcal · P{todayLog.protein_g}g · C{todayLog.carbs_g}g · F{todayLog.fat_g}g
            </span>
          </div>
        </div>
      ) : (
        <p className="text-[9px] text-[#1A1A1A]/50 font-serif italic mb-2">
          No intake logged today. Log your daily totals to feed the adaptive TDEE engine.
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-1.5">
        <input
          type="number"
          step="1"
          placeholder="kcal"
          value={kcal}
          onChange={(e) => setKcal(e.target.value)}
          required
          className="engine-input text-center"
          aria-label="Calories"
        />
        <input
          type="number"
          step="0.1"
          placeholder="P (g)"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          className="engine-input text-center"
          aria-label="Protein grams"
        />
        <input
          type="number"
          step="0.1"
          placeholder="C (g)"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          className="engine-input text-center"
          aria-label="Carbs grams"
        />
        <input
          type="number"
          step="0.1"
          placeholder="F (g)"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          className="engine-input text-center"
          aria-label="Fat grams"
        />
        <button
          type="submit"
          className="col-span-4 py-2 bg-[#1A1A1A] hover:bg-[#E63946] text-white text-[10px] font-bold uppercase tracking-wider font-mono transition-all"
        >
          Log Today's Intake
        </button>
      </form>

      <p className="text-[8px] text-[#1A1A1A]/40 font-serif italic mt-1.5">
        Macros are optional but help with future features. One entry per day — submitting
        overwrites today's log.
      </p>
    </div>
  );
}
