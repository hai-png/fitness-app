/**
 * Shared types for the ProgressTab sub-tab components.
 *
 * A-04 god-component decomposition: the four render functions that used to
 * live inline at the bottom of ProgressTab.tsx were extracted into
 * CoreMetricsView / MuscleVolumeView / ExerciseProgressionView / VisualsView.
 * Each receives a `ProgressAnalytics` bundle (the memoised analytics outputs
 * the parent already computes) plus any local UI state/setters it needs.
 */
import type { ExerciseLog } from "../../data/analyticsEngine";
import type {
  calculateCoreMetrics,
  calculateRollingTrends,
  analyzeExerciseProgression,
  calculatePersonalRecords,
  calculateMuscleVolumesAndScores,
} from "../../data/analyticsEngine";
import type { MuscleVolumeZone } from "../../data/analyticsEngine";

/**
 * Flex Card shape used by VisualsView's shareable highlight cards + modal.
 * (Was previously declared inline inside ProgressTab.tsx.)
 */
export interface FlexCard {
  id: string;
  title: string;
  badge: string;
  metric: string;
  subtitle: string;
  description: string;
  quote: string;
}

/**
 * Lifetime tonnage tier summary. Computed in ProgressTab from LIFETIME_TIERS.
 */
export interface LifetimeTierInfo {
  current: string;
  next: string;
  progressPercent: number;
  tonsToNext: number;
  weeksToNext: number;
  tierIndex: number;
}

/**
 * Top-3 muscle concentration analysis. Flags training asymmetry when the
 * top 3 muscle groups exceed 70% of total weekly volume.
 */
export interface MuscleBalanceAnalysis {
  top3Share: number;
  isImbalanced: boolean;
  sortedMuscles: MuscleVolumeZone[];
}

/**
 * Bundle of analytics values the parent computes once via useMemo and shares
 * with every sub-tab component. Centralising this avoids prop-drilling each
 * individual value and keeps the sub-tab signatures readable.
 */
export interface ProgressAnalytics {
  filteredLogs: ExerciseLog[];
  coreMetrics: ReturnType<typeof calculateCoreMetrics>;
  rollingTrends: ReturnType<typeof calculateRollingTrends>;
  muscleZonesAndScores: ReturnType<typeof calculateMuscleVolumesAndScores>;
  muscleBalanceAnalysis: MuscleBalanceAnalysis;
  lifetimeVolumeTons: number;
  lifetimeTierInfo: LifetimeTierInfo;
  exerciseProgressions: ReturnType<typeof analyzeExerciseProgression>;
  personalRecords: ReturnType<typeof calculatePersonalRecords>;
  activeExNames: string[];
  // VisualsView flex-card extras (derived from weight/water logs in parent)
  todayWaterTotal: number;
  weightDiff: number;
}
