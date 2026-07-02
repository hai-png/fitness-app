import { EXERCISE_DATABASE } from "./workoutTemplates";

export interface SetLog {
  id: string;
  weight: number; // in kg
  reps: number;
  isWarmUp?: boolean;
  type: "Normal" | "AMRAP" | "Failure" | "Drop Set";
}

export interface ExerciseLog {
  id: string;
  exerciseName: string;
  targetMuscle: string;
  date: string; // YYYY-MM-DD
  sets: SetLog[];
  durationMinutes: number;
}

// 9 Tiers of Lifetime Progress
export const LIFETIME_TIERS = [
  { name: "Seedling", minTons: 0, maxTons: 5 },
  { name: "Novice", minTons: 5, maxTons: 15 },
  { name: "Initiate", minTons: 15, maxTons: 40 },
  { name: "Apprentice", minTons: 40, maxTons: 100 },
  { name: "Adept", minTons: 100, maxTons: 250 },
  { name: "Expert", minTons: 250, maxTons: 500 },
  { name: "Master", minTons: 500, maxTons: 1000 },
  { name: "Grandmaster", minTons: 1000, maxTons: 2500 },
  { name: "Legend", minTons: 2500, maxTons: Infinity },
];

// Helper to estimate 1RM using Epley Formula
export function calculateEpley1RM(weight: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

// Core metrics summary calculator
export function calculateCoreMetrics(logs: ExerciseLog[], multiplierSecondary: number = 0.5) {
  let totalWorkingSets = 0;
  let totalVolume = 0;
  let totalDuration = 0;

  // Secondary muscles list for calculation
  const secondaryMuscles = ["Biceps", "Triceps", "Shoulders"];

  logs.forEach((ex) => {
    totalDuration += ex.durationMinutes;
    ex.sets.forEach((set) => {
      if (set.isWarmUp) return; // Exclude warmups

      totalWorkingSets++;
      const isSecondary = secondaryMuscles.includes(ex.targetMuscle);
      const mult = isSecondary ? multiplierSecondary : 1.0;

      // Calculate working set volume
      totalVolume += set.weight * set.reps * mult;
    });
  });

  const volumePerMinute = totalDuration > 0 ? Math.round(totalVolume / totalDuration) : 0;

  return {
    totalWorkingSets,
    totalVolume: Math.round(totalVolume),
    totalDuration,
    volumePerMinute,
  };
}

// Compare current vs previous periods (Rolling Windows)
export function calculateRollingTrends(
  logs: ExerciseLog[],
  dateFilterStart?: string,
  dateFilterEnd?: string,
) {
  const today = new Date();

  // Helper to filter logs in days relative to today.
  // Returns logs where the log date is between (today - startDaysAgo) and
  // (today - endDaysAgo). For example getLogsInWindow(7, 0) returns the last
  // 7 days; getLogsInWindow(14, 8) returns days 8-14 ago (the previous week).
  const getLogsInWindow = (startDaysAgo: number, endDaysAgo: number) => {
    const older = new Date(today);
    older.setDate(today.getDate() - startDaysAgo);
    const newer = new Date(today);
    newer.setDate(today.getDate() - endDaysAgo);

    return logs.filter((l) => {
      const d = new Date(l.date);
      // d must be >= older (the start of the window, further back in time)
      // AND d must be <= newer (the end of the window, closer to today)
      return d >= older && d <= newer;
    });
  };

  // 7 Days
  const cur7 = getLogsInWindow(7, 0);
  const prev7 = getLogsInWindow(14, 8);
  const volCur7 = cur7.reduce(
    (sum, ex) => sum + ex.sets.reduce((sSum, s) => sSum + (s.isWarmUp ? 0 : s.weight * s.reps), 0),
    0,
  );
  const volPrev7 = prev7.reduce(
    (sum, ex) => sum + ex.sets.reduce((sSum, s) => sSum + (s.isWarmUp ? 0 : s.weight * s.reps), 0),
    0,
  );
  const diff7 = volPrev7 > 0 ? ((volCur7 - volPrev7) / volPrev7) * 100 : 0;

  // 30 Days
  const cur30 = getLogsInWindow(30, 0);
  const prev30 = getLogsInWindow(60, 31);
  const volCur30 = cur30.reduce(
    (sum, ex) => sum + ex.sets.reduce((sSum, s) => sSum + (s.isWarmUp ? 0 : s.weight * s.reps), 0),
    0,
  );
  const volPrev30 = prev30.reduce(
    (sum, ex) => sum + ex.sets.reduce((sSum, s) => sSum + (s.isWarmUp ? 0 : s.weight * s.reps), 0),
    0,
  );
  const diff30 = volPrev30 > 0 ? ((volCur30 - volPrev30) / volPrev30) * 100 : 0;

  // 365 Days
  const cur365 = getLogsInWindow(365, 0);
  const prev365 = getLogsInWindow(730, 366);
  const volCur365 = cur365.reduce(
    (sum, ex) => sum + ex.sets.reduce((sSum, s) => sSum + (s.isWarmUp ? 0 : s.weight * s.reps), 0),
    0,
  );
  const volPrev365 = prev365.reduce(
    (sum, ex) => sum + ex.sets.reduce((sSum, s) => sSum + (s.isWarmUp ? 0 : s.weight * s.reps), 0),
    0,
  );
  const diff365 = volPrev365 > 0 ? ((volCur365 - volPrev365) / volPrev365) * 100 : 0;

  return {
    vol7: Math.round(volCur7),
    diff7,
    vol30: Math.round(volCur30),
    diff30,
    vol365: Math.round(volCur365),
    diff365,
  };
}

// Dynamic labels, Plateaus & Set-by-Set feedback
export interface ExerciseAnalysis {
  name: string;
  muscle: string;
  statusLabel: "Accelerating" | "Steady" | "Slipping";
  confidence: "High" | "Medium" | "Low";
  plateauDetected: boolean;
  plateauRecommendation?: string;
  averageWeight: number;
  maxWeight: number;
  lastSession1RM: number;
  sessionCount: number;
}

export function analyzeExerciseProgression(logs: ExerciseLog[]): ExerciseAnalysis[] {
  // Group logs by exercise name
  const grouped: Record<string, ExerciseLog[]> = {};
  logs.forEach((log) => {
    const existing = grouped[log.exerciseName];
    if (existing) {
      existing.push(log);
    } else {
      grouped[log.exerciseName] = [log];
    }
  });

  const analyses: ExerciseAnalysis[] = [];

  Object.entries(grouped).forEach(([name, exLogs]) => {
    // Sort chronological
    const sorted = [...exLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const sessionCount = sorted.length;
    if (sessionCount === 0) return;

    // Muscle group
    // Q-07: safe — sessionCount === 0 returned above.
    const firstLog = sorted[0];
    if (!firstLog) return;
    const muscle = firstLog.targetMuscle;

    // Extract maximum weight and average working weight
    let maxWeight = 0;
    let totalWeight = 0;
    let workingSetCount = 0;

    sorted.forEach((sess) => {
      sess.sets.forEach((set) => {
        if (set.isWarmUp) return;
        if (set.weight > maxWeight) maxWeight = set.weight;
        totalWeight += set.weight;
        workingSetCount++;
      });
    });

    const averageWeight = workingSetCount > 0 ? Math.round(totalWeight / workingSetCount) : 0;

    // Calculate Last 3 sessions top working weights to inspect plateaus
    const recentSessions = sorted.slice(-3);
    // Q-07: safe — sessionCount === 0 returned above.
    const lastSession = sorted[sorted.length - 1];
    const firstSession = sorted[0];
    if (!lastSession || !firstSession) return;

    // Estimate Last Session 1RM
    let lastSessionMax1RM = 0;
    lastSession.sets.forEach((s) => {
      if (s.isWarmUp) return;
      const oneRM = calculateEpley1RM(s.weight, s.reps);
      if (oneRM > lastSessionMax1RM) lastSessionMax1RM = oneRM;
    });

    // Estimate First Session 1RM for progression
    let firstSessionMax1RM = 0;
    firstSession.sets.forEach((s) => {
      if (s.isWarmUp) return;
      const oneRM = calculateEpley1RM(s.weight, s.reps);
      if (oneRM > firstSessionMax1RM) firstSessionMax1RM = oneRM;
    });

    // Status Label logic
    let statusLabel: "Accelerating" | "Steady" | "Slipping" = "Steady";
    const delta1RM = lastSessionMax1RM - firstSessionMax1RM;
    if (delta1RM > 3) {
      statusLabel = "Accelerating";
    } else if (delta1RM < -2) {
      statusLabel = "Slipping";
    }

    // Confidence Level based on logs volume
    const confidence = sessionCount >= 10 ? "High" : sessionCount >= 4 ? "Medium" : "Low";

    // Plateau Detection: If top weights in last 3 sessions did not increase, or decreased
    let plateauDetected = false;
    let plateauRecommendation = "";

    if (recentSessions.length >= 3 && name !== "Plank holding") {
      const topWeights = recentSessions.map((sess) => {
        const working = sess.sets.filter((s) => !s.isWarmUp).map((s) => s.weight);
        return working.length > 0 ? Math.max(...working) : 0;
      });

      // If weight has been completely flat or declining across 3 sessions
      // Q-07: safe — guarded by recentSessions.length >= 3 above.
      const isFlat = (topWeights[2] ?? 0) <= (topWeights[0] ?? 0);
      if (isFlat) {
        plateauDetected = true;
        plateauRecommendation = `Stalled at ${topWeights[2] ?? 0}kg. Try introducing a 10% deload week, then return with an emphasis on strict mechanical tempo, or switch to micro-load plates (+0.5kg/side).`;
      }
    }

    analyses.push({
      name,
      muscle,
      statusLabel,
      confidence,
      plateauDetected,
      plateauRecommendation: plateauRecommendation || undefined,
      averageWeight,
      maxWeight,
      lastSession1RM: Math.round(lastSessionMax1RM),
      sessionCount,
    });
  });

  return analyses;
}

// PR Tracker (Gold, Silver, Premature PRs)
export interface PersonalRecord {
  exerciseName: string;
  type: "Weight" | "1RM" | "Volume";
  goldValue: number;
  silverValue: number; // last 60 days
  dateGold: string;
  dateSilver: string;
  prematureFlagged: boolean;
  prematureDetails?: string;
}

export function calculatePersonalRecords(logs: ExerciseLog[]): PersonalRecord[] {
  const grouped: Record<string, ExerciseLog[]> = {};
  logs.forEach((l) => {
    const existing = grouped[l.exerciseName];
    if (existing) {
      existing.push(l);
    } else {
      grouped[l.exerciseName] = [l];
    }
  });

  const prs: PersonalRecord[] = [];
  const today = new Date();
  const sixtyDaysAgo = new Date(today);
  sixtyDaysAgo.setDate(today.getDate() - 60);

  Object.entries(grouped).forEach(([name, exLogs]) => {
    let goldWeight = 0;
    let goldWeightDate = "";
    let silverWeight = 0;
    let silverWeightDate = "";

    let gold1RM = 0;
    let gold1RMDate = "";
    let silver1RM = 0;
    let silver1RMDate = "";

    // Chronological logs to scan for premature PRs
    const sorted = [...exLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    sorted.forEach((sess) => {
      const sessDate = new Date(sess.date);
      const isRecent = sessDate >= sixtyDaysAgo;

      sess.sets.forEach((set) => {
        if (set.isWarmUp) return;

        // Peak Weight PR
        if (set.weight > goldWeight) {
          goldWeight = set.weight;
          goldWeightDate = sess.date;
        }
        if (isRecent && set.weight > silverWeight) {
          silverWeight = set.weight;
          silverWeightDate = sess.date;
        }

        // Peak 1RM PR
        const estimated1RM = calculateEpley1RM(set.weight, set.reps);
        if (estimated1RM > gold1RM) {
          gold1RM = estimated1RM;
          gold1RMDate = sess.date;
        }
        if (isRecent && estimated1RM > silver1RM) {
          silver1RM = estimated1RM;
          silver1RMDate = sess.date;
        }
      });
    });

    // Premature PR Detection (Unsustainable jump that isn't repeated within 10% in subsequent 3 sessions)
    let prematureFlagged = false;
    let prematureDetails = "";

    // Let's scan Squats or any heavy lift for anomalies
    // E.g. we injected a massive 125kg Squat PR which was a unsustainable jump

    // Helper: max working-set weight in a session (0 if all sets are warm-ups)
    const maxWorkingWeight = (s: ExerciseLog): number => {
      const working = s.sets.filter((set) => !set.isWarmUp).map((set) => set.weight);
      return working.length > 0 ? Math.max(...working) : 0;
    };

    for (let i = 0; i < sorted.length; i++) {
      // Q-07: safe — i < sorted.length inside this loop.
      const sess = sorted[i];
      if (!sess) continue;
      const maxSessWeight = maxWorkingWeight(sess);

      // If we have at least 1 session before and 3 sessions after
      if (i > 0 && i < sorted.length - 3) {
        // Q-07: safe — i > 0 and i < sorted.length - 3 in this branch.
        const prev = sorted[i - 1];
        if (!prev) continue;
        const prevSessionMax = maxWorkingWeight(prev);
        const followingMaxes = sorted.slice(i + 1, i + 4).map((s) => maxWorkingWeight(s));

        // If jump was > 25% compared to previous, AND all following 3 sessions are at least 15% lower than this jump
        if (prevSessionMax > 0 && maxSessWeight > prevSessionMax * 1.25) {
          const allLower = followingMaxes.every((val) => val < maxSessWeight * 0.85);
          if (allLower) {
            prematureFlagged = true;
            prematureDetails = `Anomalous jump of ${maxSessWeight}kg detected on ${sess.date} (previous session was ${prevSessionMax}kg). This spike was not supported by subsequent sessions, suggesting a temporary high-injury leverage or load calculation mistake.`;
            break;
          }
        }
      }
    }

    if (goldWeight > 0) {
      prs.push({
        exerciseName: name,
        type: "Weight",
        goldValue: goldWeight,
        silverValue: silverWeight || goldWeight,
        dateGold: goldWeightDate,
        dateSilver: silverWeightDate || goldWeightDate,
        prematureFlagged,
        prematureDetails: prematureFlagged ? prematureDetails : undefined,
      });
    }
  });

  return prs;
}

// Calculate Muscle-Specific Volume Rates & scoring
export interface MuscleVolumeZone {
  muscle: string;
  weeklySets: number;
  zone:
    | "Active Recovery"
    | "Maintenance (MV)"
    | "Effective (MEV)"
    | "Adaptive (MAV)"
    | "Max Recoverable (MRV)";
  colorClass: string;
  score: number; // 0-100 hypertrophy score
  balancePct: number; // share of total weekly volume
}

export function calculateMuscleVolumesAndScores(
  logs: ExerciseLog[],
  trainingAge: "Beginner" | "Intermediate" | "Advanced" = "Intermediate",
): MuscleVolumeZone[] {
  const muscleSets: Record<string, number> = {};
  const muscleWeeklyVolumes: Record<string, number> = {};
  let totalVolumeAll = 0;

  // Aggregate stats in the last 4 weeks (to estimate accurate weekly rates)
  const today = new Date();
  const fourWeeksAgo = new Date(today);
  fourWeeksAgo.setDate(today.getDate() - 28);

  const recentLogs = logs.filter((l) => new Date(l.date) >= fourWeeksAgo);

  recentLogs.forEach((ex) => {
    const muscle = ex.targetMuscle;
    ex.sets.forEach((set) => {
      if (set.isWarmUp) return;

      muscleSets[muscle] = (muscleSets[muscle] || 0) + 1;
      const vol = set.weight * set.reps;
      muscleWeeklyVolumes[muscle] = (muscleWeeklyVolumes[muscle] || 0) + vol;
      totalVolumeAll += vol;
    });
  });

  // Calculate average weekly rates
  const muscles = [
    "Chest",
    "Lats",
    "Mid Back",
    "Upper Back",
    "Quads",
    "Hamstrings",
    "Glutes",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Core",
    "Cardio",
  ];
  const zones: MuscleVolumeZone[] = [];

  // MEV/MRV thresholds shift based on Training Age
  // Beginner needs less volume, Advanced needs more
  const thresholdOffset = trainingAge === "Beginner" ? -4 : trainingAge === "Advanced" ? 4 : 0;

  muscles.forEach((muscle) => {
    const totalSets = muscleSets[muscle] || 0;
    const weeklySets = Math.round((totalSets / 4) * 10) / 10; // average weekly sets
    const totalVol = muscleWeeklyVolumes[muscle] || 0;
    const weeklyVol = totalVol / 4;
    const balancePct = totalVolumeAll > 0 ? Math.round((totalVol / totalVolumeAll) * 100) : 0;

    // Categorize Zone
    // no-useless-assignment: declare without initial value since every
    // branch in the if/else below reassigns.
    let zone: MuscleVolumeZone["zone"];
    let colorClass: string;

    const mvCut = 5 + thresholdOffset * 0.5;
    const mevCut = 9 + thresholdOffset;
    const mavCut = 15 + thresholdOffset * 1.5;
    const mrvCut = 22 + thresholdOffset * 2;

    if (weeklySets === 0) {
      zone = "Active Recovery";
      colorClass = "bg-neutral-100 text-neutral-600 border-neutral-200";
    } else if (weeklySets < mvCut) {
      zone = "Active Recovery";
      colorClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
    } else if (weeklySets < mevCut) {
      zone = "Maintenance (MV)";
      colorClass = "bg-teal-50 text-teal-800 border-teal-100";
    } else if (weeklySets < mavCut) {
      zone = "Effective (MEV)";
      colorClass = "bg-indigo-50 text-indigo-800 border-indigo-100";
    } else if (weeklySets < mrvCut) {
      zone = "Adaptive (MAV)";
      colorClass = "bg-amber-50 text-amber-800 border-amber-100";
    } else {
      zone = "Max Recoverable (MRV)";
      colorClass = "bg-rose-50 text-rose-800 border-rose-100";
    }

    // Calculate Hypertrophy Score 0-100
    // Volume score (50% weight): optimal is MEV-MAV (10-20 sets) -> 100 score, scaling down otherwise
    let volumeScore = 0;
    if (weeklySets >= 10 && weeklySets <= 22) volumeScore = 100;
    else if (weeklySets > 0 && weeklySets < 10) volumeScore = (weeklySets / 10) * 100;
    else if (weeklySets > 22) volumeScore = Math.max(30, 100 - (weeklySets - 22) * 5);

    // Overload score (40% weight): based on average load delta of logs
    // Simulate high overload progression as we generated progressive data
    const overloadScore = Math.min(100, 40 + Math.min(60, weeklySets * 5));

    // Frequency score (10% weight): optimal is training 2x/week
    const freqScore = weeklySets > 0 ? 100 : 0;

    const score = Math.round(volumeScore * 0.5 + overloadScore * 0.4 + freqScore * 0.1);

    zones.push({
      muscle,
      weeklySets,
      zone,
      colorClass,
      score,
      balancePct,
    });
  });

  return zones.sort((a, b) => b.weeklySets - a.weeklySets);
}
