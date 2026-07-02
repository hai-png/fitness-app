import { describe, it, expect } from "vitest";
import {
  calculateEpley1RM,
  calculateCoreMetrics,
  calculateRollingTrends,
  analyzeExerciseProgression,
  calculatePersonalRecords,
  calculateMuscleVolumesAndScores,
  LIFETIME_TIERS,
  type ExerciseLog,
  type SetLog,
} from "../data/analyticsEngine";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSet(overrides: Partial<SetLog> = {}): SetLog {
  return {
    id: `set-${Math.random().toString(36).slice(2, 8)}`,
    weight: 60,
    reps: 8,
    isWarmUp: false,
    type: "Normal",
    ...overrides,
  };
}

function makeExerciseLog(
  overrides: Partial<ExerciseLog> & { exerciseName?: string; date?: string } = {},
): ExerciseLog {
  return {
    id: `exlog-${Math.random().toString(36).slice(2, 8)}`,
    exerciseName: "Flat Barbell Bench Press",
    targetMuscle: "Chest",
    // Q-07: safe — toISOString().split("T") always yields at least one element.
    date: new Date().toISOString().split("T")[0]!,
    sets: [makeSet()],
    durationMinutes: 10,
    ...overrides,
  };
}

/** Returns a YYYY-MM-DD string for `daysAgo` days before today. */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  // Q-07: safe — toISOString().split("T") always yields at least one element.
  return d.toISOString().split("T")[0]!;
}

// ---------------------------------------------------------------------------
// calculateEpley1RM
// ---------------------------------------------------------------------------

describe("calculateEpley1RM", () => {
  it("returns 0 for 0 or negative reps (invalid input)", () => {
    expect(calculateEpley1RM(100, 0)).toBe(0);
    expect(calculateEpley1RM(100, -5)).toBe(0);
  });

  it("returns the weight itself for a 1-rep max", () => {
    expect(calculateEpley1RM(100, 1)).toBe(100);
    expect(calculateEpley1RM(135, 1)).toBe(135);
  });

  it("applies the Epley formula correctly for reps > 1", () => {
    // 100kg x 5 reps = 100 * (1 + 5/30) = 100 * 1.1666... = 116.67
    expect(calculateEpley1RM(100, 5)).toBeCloseTo(116.667, 2);
    // 80kg x 10 reps = 80 * (1 + 10/30) = 80 * 1.333... = 106.67
    expect(calculateEpley1RM(80, 10)).toBeCloseTo(106.667, 2);
  });

  it("is monotonically increasing in reps for fixed weight", () => {
    const w = 100;
    let prev = 0;
    for (let r = 1; r <= 20; r++) {
      const v = calculateEpley1RM(w, r);
      expect(v).toBeGreaterThan(prev);
      prev = v;
    }
  });
});

// ---------------------------------------------------------------------------
// calculateCoreMetrics
// ---------------------------------------------------------------------------

describe("calculateCoreMetrics", () => {
  it("returns zeros for an empty log list", () => {
    const m = calculateCoreMetrics([]);
    expect(m.totalWorkingSets).toBe(0);
    expect(m.totalVolume).toBe(0);
    expect(m.totalDuration).toBe(0);
    expect(m.volumePerMinute).toBe(0);
  });

  it("excludes warm-up sets from working-set counts", () => {
    const log = makeExerciseLog({
      sets: [
        makeSet({ weight: 40, reps: 8, isWarmUp: true }),
        makeSet({ weight: 80, reps: 8, isWarmUp: false }),
        makeSet({ weight: 80, reps: 8, isWarmUp: false }),
      ],
      durationMinutes: 10,
    });
    const m = calculateCoreMetrics([log]);
    expect(m.totalWorkingSets).toBe(2);
    // 80*8 + 80*8 = 1280 (warmup excluded)
    expect(m.totalVolume).toBe(1280);
  });

  it("applies the secondary-muscle multiplier to Biceps/Triceps/Shoulders", () => {
    const chestLog = makeExerciseLog({
      exerciseName: "Bench",
      targetMuscle: "Chest",
      sets: [makeSet({ weight: 100, reps: 10 })], // 1000 volume
      durationMinutes: 5,
    });
    const bicepLog = makeExerciseLog({
      exerciseName: "Curl",
      targetMuscle: "Biceps",
      sets: [makeSet({ weight: 20, reps: 10 })], // 200 raw, * 0.5 = 100
      durationMinutes: 5,
    });
    const m = calculateCoreMetrics([chestLog, bicepLog], 0.5);
    expect(m.totalVolume).toBe(1100);
    expect(m.totalDuration).toBe(10);
    expect(m.volumePerMinute).toBe(110);
  });

  it("uses default 0.5 multiplier when none is passed", () => {
    const shoulderLog = makeExerciseLog({
      exerciseName: "Lateral Raise",
      targetMuscle: "Shoulders",
      sets: [makeSet({ weight: 10, reps: 10 })], // 100 raw, * 0.5 = 50
      durationMinutes: 5,
    });
    const m = calculateCoreMetrics([shoulderLog]);
    expect(m.totalVolume).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// calculateRollingTrends
// ---------------------------------------------------------------------------

describe("calculateRollingTrends", () => {
  it("returns zeros when there are no logs", () => {
    const t = calculateRollingTrends([]);
    expect(t.vol7).toBe(0);
    expect(t.vol30).toBe(0);
    expect(t.vol365).toBe(0);
    expect(t.diff7).toBe(0);
    expect(t.diff30).toBe(0);
    expect(t.diff365).toBe(0);
  });

  it("captures volume from this week in vol7 but not volPrev7", () => {
    const todayLog = makeExerciseLog({
      date: daysAgo(1),
      sets: [makeSet({ weight: 100, reps: 5 })], // 500 volume
      durationMinutes: 5,
    });
    const t = calculateRollingTrends([todayLog]);
    expect(t.vol7).toBe(500);
    // Previous window is empty → diff is 0 (division-by-zero guard)
    expect(t.diff7).toBe(0);
  });

  it("computes a positive trend when current window > previous window", () => {
    const current = makeExerciseLog({
      date: daysAgo(3),
      sets: [makeSet({ weight: 100, reps: 10 })], // 1000 volume
      durationMinutes: 5,
    });
    const previous = makeExerciseLog({
      date: daysAgo(10),
      sets: [makeSet({ weight: 50, reps: 10 })], // 500 volume
      durationMinutes: 5,
    });
    const t = calculateRollingTrends([current, previous]);
    expect(t.vol7).toBe(1000);
    // ((1000 - 500) / 500) * 100 = 100
    expect(t.diff7).toBeCloseTo(100, 1);
  });

  it("computes a negative trend when current window < previous window", () => {
    const current = makeExerciseLog({
      date: daysAgo(3),
      sets: [makeSet({ weight: 50, reps: 10 })], // 500
      durationMinutes: 5,
    });
    const previous = makeExerciseLog({
      date: daysAgo(10),
      sets: [makeSet({ weight: 100, reps: 10 })], // 1000
      durationMinutes: 5,
    });
    const t = calculateRollingTrends([current, previous]);
    // ((500 - 1000) / 1000) * 100 = -50
    expect(t.diff7).toBeCloseTo(-50, 1);
  });
});

// ---------------------------------------------------------------------------
// analyzeExerciseProgression
// ---------------------------------------------------------------------------

describe("analyzeExerciseProgression", () => {
  it("returns an empty array for no logs", () => {
    expect(analyzeExerciseProgression([])).toEqual([]);
  });

  it("groups logs by exercise name", () => {
    const bench1 = makeExerciseLog({
      exerciseName: "Bench Press",
      date: daysAgo(10),
      sets: [makeSet({ weight: 60, reps: 8 })],
    });
    const bench2 = makeExerciseLog({
      exerciseName: "Bench Press",
      date: daysAgo(5),
      sets: [makeSet({ weight: 65, reps: 8 })],
    });
    const squat1 = makeExerciseLog({
      exerciseName: "Squat",
      targetMuscle: "Quads",
      date: daysAgo(7),
      sets: [makeSet({ weight: 80, reps: 5 })],
    });
    const result = analyzeExerciseProgression([bench1, bench2, squat1]);
    expect(result).toHaveLength(2);
    const bench = result.find((r) => r.name === "Bench Press");
    expect(bench).toBeDefined();
    expect(bench?.sessionCount).toBe(2);
    expect(bench?.maxWeight).toBe(65);
  });

  it("flags a plateau when last 3 sessions show no weight increase", () => {
    const plateaued = [
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(20),
        sets: [makeSet({ weight: 100, reps: 5 })],
      }),
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(14),
        sets: [makeSet({ weight: 100, reps: 5 })],
      }),
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(7),
        sets: [makeSet({ weight: 100, reps: 5 })], // flat or declining
      }),
    ];
    const result = analyzeExerciseProgression(plateaued);
    expect(result).toHaveLength(1);
    // Q-07: safe — controlled test data, result has exactly 1 element.
    expect(result[0]!.plateauDetected).toBe(true);
    expect(result[0]!.plateauRecommendation).toContain("100kg");
  });

  it("does NOT flag a plateau when weights are progressing", () => {
    const progressing = [
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(20),
        sets: [makeSet({ weight: 90, reps: 5 })],
      }),
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(14),
        sets: [makeSet({ weight: 95, reps: 5 })],
      }),
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(7),
        sets: [makeSet({ weight: 100, reps: 5 })],
      }),
    ];
    const result = analyzeExerciseProgression(progressing);
    // Q-07: safe — controlled test data.
    expect(result[0]!.plateauDetected).toBe(false);
  });

  it("labels status as 'Accelerating' when 1RM grew by more than 3kg", () => {
    const accelerated = [
      makeExerciseLog({
        exerciseName: "Bench",
        date: daysAgo(20),
        sets: [makeSet({ weight: 60, reps: 5 })], // 1RM ≈ 70
      }),
      makeExerciseLog({
        exerciseName: "Bench",
        date: daysAgo(7),
        sets: [makeSet({ weight: 80, reps: 5 })], // 1RM ≈ 93.3 (delta > 3)
      }),
    ];
    const result = analyzeExerciseProgression(accelerated);
    // Q-07: safe — controlled test data.
    expect(result[0]!.statusLabel).toBe("Accelerating");
  });

  it("assigns confidence 'Low' for sessions < 4", () => {
    const few = [
      makeExerciseLog({ exerciseName: "Bench", date: daysAgo(10) }),
      makeExerciseLog({ exerciseName: "Bench", date: daysAgo(5) }),
    ];
    const result = analyzeExerciseProgression(few);
    // Q-07: safe — controlled test data.
    expect(result[0]!.confidence).toBe("Low");
  });

  it("assigns confidence 'High' for sessions >= 10", () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      makeExerciseLog({
        exerciseName: "Bench",
        date: daysAgo(30 - i * 3),
        sets: [makeSet({ weight: 60 + i, reps: 5 })],
      }),
    );
    const result = analyzeExerciseProgression(many);
    // Q-07: safe — controlled test data.
    expect(result[0]!.confidence).toBe("High");
  });
});

// ---------------------------------------------------------------------------
// calculatePersonalRecords
// ---------------------------------------------------------------------------

describe("calculatePersonalRecords", () => {
  it("returns an empty array for no logs", () => {
    expect(calculatePersonalRecords([])).toEqual([]);
  });

  it("tracks the all-time gold weight PR across sessions", () => {
    const logs = [
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(30),
        sets: [makeSet({ weight: 80, reps: 5 })],
      }),
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(10),
        sets: [makeSet({ weight: 100, reps: 5 })],
      }),
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(2),
        sets: [makeSet({ weight: 90, reps: 5 })],
      }),
    ];
    const prs = calculatePersonalRecords(logs);
    expect(prs).toHaveLength(1);
    // Q-07: safe — controlled test data, prs has exactly 1 element.
    expect(prs[0]!.goldValue).toBe(100);
    expect(prs[0]!.silverValue).toBe(100); // 100 was within last 60 days
  });

  it("flags a premature PR when a >25% jump is not sustained in the next 3 sessions", () => {
    // Sessions: 80 → 110 (37.5% jump) → 80, 80, 80 (all < 110 * 0.85 = 93.5)
    const logs = [
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(40),
        sets: [makeSet({ weight: 80, reps: 5 })],
      }),
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(30),
        sets: [makeSet({ weight: 110, reps: 5 })], // anomalous jump
      }),
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(20),
        sets: [makeSet({ weight: 80, reps: 5 })],
      }),
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(10),
        sets: [makeSet({ weight: 80, reps: 5 })],
      }),
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(3),
        sets: [makeSet({ weight: 80, reps: 5 })],
      }),
    ];
    const prs = calculatePersonalRecords(logs);
    // Q-07: safe — controlled test data.
    expect(prs[0]!.prematureFlagged).toBe(true);
    expect(prs[0]!.prematureDetails).toContain("110kg");
  });

  it("does NOT flag a premature PR when the jump is sustained", () => {
    const logs = [
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(40),
        sets: [makeSet({ weight: 80, reps: 5 })],
      }),
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(30),
        sets: [makeSet({ weight: 110, reps: 5 })],
      }),
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(20),
        sets: [makeSet({ weight: 105, reps: 5 })], // within 85% of 110
      }),
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(10),
        sets: [makeSet({ weight: 108, reps: 5 })],
      }),
      makeExerciseLog({
        exerciseName: "Squat",
        targetMuscle: "Quads",
        date: daysAgo(3),
        sets: [makeSet({ weight: 110, reps: 5 })],
      }),
    ];
    const prs = calculatePersonalRecords(logs);
    // Q-07: safe — controlled test data.
    expect(prs[0]!.prematureFlagged).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// calculateMuscleVolumesAndScores
// ---------------------------------------------------------------------------

describe("calculateMuscleVolumesAndScores", () => {
  it("returns Active Recovery zone for muscles with no recent sets", () => {
    const zones = calculateMuscleVolumesAndScores([]);
    const chest = zones.find((z) => z.muscle === "Chest");
    expect(chest?.zone).toBe("Active Recovery");
    expect(chest?.weeklySets).toBe(0);
  });

  it("categorizes into Effective (MEV) zone when weekly sets are 9-14", () => {
    // 12 sets of Chest in the last 28 days → 3 sets/week → MEV band
    // (Actually 12 sets / 4 weeks = 3/week, which is < 5, so Active Recovery)
    // Let me use 40 sets → 10/week → MEV band
    const logs = Array.from({ length: 40 }, (_, i) =>
      makeExerciseLog({
        exerciseName: `Bench-${i}`,
        targetMuscle: "Chest",
        date: daysAgo(i % 28),
        sets: [makeSet({ weight: 60, reps: 8 })],
        durationMinutes: 5,
      }),
    );
    const zones = calculateMuscleVolumesAndScores(logs);
    const chest = zones.find((z) => z.muscle === "Chest");
    expect(chest?.weeklySets).toBe(10);
    // 10 weekly sets → MEV band (9-14)
    expect(chest?.zone).toContain("Effective");
  });

  it("shifts thresholds based on training age (Beginner needs less)", () => {
    // Same 40 sets → 10/week
    const logs = Array.from({ length: 40 }, (_, i) =>
      makeExerciseLog({
        exerciseName: `Bench-${i}`,
        targetMuscle: "Chest",
        date: daysAgo(i % 28),
        sets: [makeSet({ weight: 60, reps: 8 })],
        durationMinutes: 5,
      }),
    );
    const intermediateZones = calculateMuscleVolumesAndScores(logs, "Intermediate");
    const beginnerZones = calculateMuscleVolumesAndScores(logs, "Beginner");

    const intermediateChest = intermediateZones.find((z) => z.muscle === "Chest");
    const beginnerChest = beginnerZones.find((z) => z.muscle === "Chest");
    // Beginner threshold offset is -4, so MEV cut is 9-4=5, MAV cut is 15-6=9
    // 10 sets → beginner is in MAV (Adaptive), intermediate in MEV (Effective)
    expect(beginnerChest?.zone).toContain("Adaptive");
    expect(intermediateChest?.zone).toContain("Effective");
  });

  it("sorts results by weeklySets descending", () => {
    const chestLogs = Array.from({ length: 40 }, (_, i) =>
      makeExerciseLog({
        exerciseName: `Bench-${i}`,
        targetMuscle: "Chest",
        date: daysAgo(i % 28),
        sets: [makeSet({ weight: 60, reps: 8 })],
        durationMinutes: 5,
      }),
    );
    const backLogs = Array.from({ length: 8 }, (_, i) =>
      makeExerciseLog({
        exerciseName: `Row-${i}`,
        targetMuscle: "Lats",
        date: daysAgo(i % 28),
        sets: [makeSet({ weight: 50, reps: 8 })],
        durationMinutes: 5,
      }),
    );
    const zones = calculateMuscleVolumesAndScores([...chestLogs, ...backLogs]);
    const chest = zones.find((z) => z.muscle === "Chest");
    const lats = zones.find((z) => z.muscle === "Lats");
    expect(chest?.weeklySets).toBeGreaterThan(lats?.weeklySets ?? 0);
    // The first entry should be the muscle with the most weekly sets
    // Q-07: safe — zones is non-empty (always populated by calculateMuscleVolumesAndScores).
    expect(zones[0]!.weeklySets).toBeGreaterThanOrEqual(zones[zones.length - 1]!.weeklySets);
  });
});

// ---------------------------------------------------------------------------
// LIFETIME_TIERS sanity check
// ---------------------------------------------------------------------------

describe("LIFETIME_TIERS", () => {
  it("contains 9 tiers in ascending order", () => {
    expect(LIFETIME_TIERS).toHaveLength(9);
    for (let i = 1; i < LIFETIME_TIERS.length; i++) {
      // Q-07: safe — i and i-1 both < LIFETIME_TIERS.length in this loop.
      expect(LIFETIME_TIERS[i]!.minTons).toBe(LIFETIME_TIERS[i - 1]!.maxTons);
      expect(LIFETIME_TIERS[i]!.maxTons).toBeGreaterThan(LIFETIME_TIERS[i]!.minTons);
    }
  });

  it("starts at 0 and ends at Infinity", () => {
    // Q-07: safe — controlled test data; LIFETIME_TIERS has 9 entries.
    expect(LIFETIME_TIERS[0]!.minTons).toBe(0);
    expect(LIFETIME_TIERS[LIFETIME_TIERS.length - 1]!.maxTons).toBe(Infinity);
  });
});
