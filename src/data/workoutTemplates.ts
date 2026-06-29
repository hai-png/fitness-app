import { Exercise, WeeklyScheduleDay } from "../types";

export interface ExerciseDBItem {
  name: string;
  targetMuscle: string;
  instruction: string;
  restSeconds: number;
  sets: number;
  reps: string;
  videoUrl: string;
  steps: string[];
}

export const EXERCISE_DATABASE: ExerciseDBItem[] = [
  // CHEST
  {
    name: "Flat Barbell Bench Press",
    targetMuscle: "Chest",
    instruction: "Touch lower sternum and press up vertically.",
    restSeconds: 120,
    sets: 3,
    reps: "6-8 reps",
    videoUrl: "flat-bench-press",
    steps: [
      "Lie flat, eyes under bar, grip slightly wider than shoulders.",
      "Pull shoulder blades together, plant feet firmly on the floor.",
      "Unrack bar, lower slowly to lower sternum/nipple line.",
      "Drive heels and press bar forcefully to locked out start position."
    ]
  },
  {
    name: "Incline Dumbbell Press",
    targetMuscle: "Chest",
    instruction: "Keep elbows at 45 degrees, squeeze chest at peak.",
    restSeconds: 90,
    sets: 4,
    reps: "8-10 reps",
    videoUrl: "incline-dumbbell-press",
    steps: [
      "Set the bench to a 30-degree incline.",
      "Sit back with dumbbells at chest height, elbows under wrists.",
      "Press dumbbells straight up, squeezing chest at the top.",
      "Lower under control until dumbbells touch outer chest."
    ]
  },
  {
    name: "Cable Chest Flys",
    targetMuscle: "Chest",
    instruction: "Focus on a deep stretch and wrapping arms around a tree.",
    restSeconds: 60,
    sets: 3,
    reps: "12-15 reps",
    videoUrl: "cable-chest-fly",
    steps: [
      "Set pulleys to shoulder-height, stand midway with one foot forward.",
      "Grip handles, maintain a slight bend in your elbows.",
      "Bring hands together in a wide hugging arc in front of chest.",
      "Squeeze for 1s, then return slowly to feel a deep stretch."
    ]
  },
  {
    name: "Standard Push-Ups",
    targetMuscle: "Chest",
    instruction: "Full range of motion, touch chest to floor.",
    restSeconds: 60,
    sets: 4,
    reps: "15-20 reps",
    videoUrl: "push-up",
    steps: [
      "Start in high plank, hands slightly wider than shoulders.",
      "Keep body in perfect straight line from head to heels.",
      "Lower chest to ground by bending elbows to 45 degrees.",
      "Press up forcefully to lock out start position."
    ]
  },
  {
    name: "Decline Push-Ups",
    targetMuscle: "Upper Chest",
    instruction: "Place feet on chair/bed for upper chest focus.",
    restSeconds: 60,
    sets: 3,
    reps: "12-15 reps",
    videoUrl: "decline-push-up",
    steps: [
      "Place feet on elevated chair or bed, hands on floor.",
      "Establish straight body alignment, squeeze core.",
      "Lower chest towards floor, keeping elbows controlled.",
      "Press floor away, returning to starting alignment."
    ]
  },

  // BACK
  {
    name: "Lat Pulldown (Wide Grip)",
    targetMuscle: "Lats",
    instruction: "Pull with your elbows, retracting scapula fully.",
    restSeconds: 90,
    sets: 4,
    reps: "10-12 reps",
    videoUrl: "lat-pulldown",
    steps: [
      "Sit, adjust knee pads, grip bar wider than shoulder-width.",
      "Lean back slightly (10-15 degrees), keep core tight.",
      "Pull bar down to upper chest, leading with elbows.",
      "Squeeze lats, then let bar return slowly with full stretch."
    ]
  },
  {
    name: "Seated Cable Row",
    targetMuscle: "Mid Back",
    instruction: "Keep spine neutral, pull handle to belly button.",
    restSeconds: 90,
    sets: 3,
    reps: "10-12 reps",
    videoUrl: "seated-cable-row",
    steps: [
      "Sit on bench, feet on footplates, knees slightly bent.",
      "Grip close-grip attachment, sit tall with neutral spine.",
      "Pull handle to lower abdomen, pulling shoulders back.",
      "Squeeze shoulder blades, then slowly return to start."
    ]
  },
  {
    name: "Dumbbell Single-Arm Row",
    targetMuscle: "Upper Back",
    instruction: "Support knee on bench, pull weight to hip pocket.",
    restSeconds: 90,
    sets: 3,
    reps: "8-10 reps",
    videoUrl: "dumbbell-row",
    steps: [
      "Place same-side knee and hand on bench, other foot flat on floor.",
      "Hold dumbbell with straight arm, spine neutral.",
      "Pull elbow up and back towards your hip pocket.",
      "Squeeze upper back, then lower dumbbell slowly."
    ]
  },
  {
    name: "Doorframe Row Pulls",
    targetMuscle: "Upper Back",
    instruction: "Grip doorframe, lean back, pull torso to hand.",
    restSeconds: 60,
    sets: 4,
    reps: "15-20 reps",
    videoUrl: "doorframe-row",
    steps: [
      "Stand facing a sturdy doorframe, toes close to frame edge.",
      "Grasp frame with both hands, lean back until arms are straight.",
      "Pull chest to the frame edge, squeezing shoulder blades.",
      "Extend arms slowly, resisting bodyweight on the way back."
    ]
  },

  // LEGS
  {
    name: "Barbell Back Squats",
    targetMuscle: "Quads",
    instruction: "Hips back, descend to parallel, press through mid-foot.",
    restSeconds: 120,
    sets: 4,
    reps: "6-8 reps",
    videoUrl: "barbell-back-squat",
    steps: [
      "Position bar on upper traps, grip tightly, lift off rack.",
      "Step back, feet shoulder-width, toes flared 15 degrees.",
      "Hinge hips back, bend knees, descend deep to parallel.",
      "Drive through mid-foot, stand up, keeping chest tall."
    ]
  },
  {
    name: "Romanian Deadlifts (RDL)",
    targetMuscle: "Hamstrings",
    instruction: "Hinge at hips, keep bar close to shins, squeeze glutes.",
    restSeconds: 90,
    sets: 3,
    reps: "10-12 reps",
    videoUrl: "romanian-deadlift",
    steps: [
      "Stand holding barbell at hips, feet hip-width apart.",
      "Push hips backward, keeping knees soft but static.",
      "Lower barbell along thighs, keeping spine completely flat.",
      "Once hamstrings stretch fully, drive hips forward and stand."
    ]
  },
  {
    name: "Leg Extensions",
    targetMuscle: "Quads",
    instruction: "Squeeze quads for 1 second at full extension.",
    restSeconds: 60,
    sets: 3,
    reps: "15 reps",
    videoUrl: "leg-extension",
    steps: [
      "Sit on machine, back flat, shins behind roller pad.",
      "Grip side handles, engage core, extend legs upward fully.",
      "Squeeze quadriceps intensely at the peak for 1 second.",
      "Lower weight slowly to starting position under control."
    ]
  },
  {
    name: "Bodyweight Bulgarian Split Squats",
    targetMuscle: "Quads",
    instruction: "One foot back on chair, sink hip low, keep trunk upright.",
    restSeconds: 60,
    sets: 3,
    reps: "12 reps/side",
    videoUrl: "bulgarian-split-squat",
    steps: [
      "Place one foot flat behind you on a chair or couch.",
      "Step other foot forward about 2-3 feet.",
      "Lower hips vertically until front thigh is parallel to floor.",
      "Drive up through front heel to starting height."
    ]
  },

  // SHOULDERS
  {
    name: "Dumbbell Shoulder Press",
    targetMuscle: "Shoulders",
    instruction: "Press straight up, do not flare elbows excessively.",
    restSeconds: 90,
    sets: 4,
    reps: "8-10 reps",
    videoUrl: "dumbbell-shoulder-press",
    steps: [
      "Sit on bench with vertical back support, feet flat.",
      "Hold dumbbells at shoulder height, elbows slightly forward.",
      "Press dumbbells straight up, locking overhead.",
      "Lower with control to ear level to complete the rep."
    ]
  },
  {
    name: "Dumbbell Lateral Raises",
    targetMuscle: "Side Deltoid",
    instruction: "Lead with elbows, keep pinkies slightly elevated.",
    restSeconds: 60,
    sets: 4,
    reps: "12-15 reps",
    videoUrl: "lateral-raise",
    steps: [
      "Stand tall, dumbbells at sides, slight hinge forward.",
      "Raise arms to the sides, leading with your elbows.",
      "Keep arms almost straight, tilt pinkies up at peak.",
      "Lower dumbbells slowly, avoiding swinging for momentum."
    ]
  },
  {
    name: "Face Pulls",
    targetMuscle: "Rear Deltoid",
    instruction: "Pull rope to nose, flaring elbows out, squeeze rear delts.",
    restSeconds: 60,
    sets: 3,
    reps: "15 reps",
    videoUrl: "cable-face-pull",
    steps: [
      "Attach rope to high pulley, grasp ends with palms facing down.",
      "Step back, engage core, hold arms fully extended.",
      "Pull rope towards bridge of nose, flaring elbows wide.",
      "External rotate hands at peak, squeeze rear delts."
    ]
  },

  // ARMS
  {
    name: "Dumbbell Incline Bicep Curls",
    targetMuscle: "Biceps",
    instruction: "Full stretch at bottom, pin elbows to sides.",
    restSeconds: 60,
    sets: 3,
    reps: "10-12 reps",
    videoUrl: "incline-bicep-curl",
    steps: [
      "Lie back on a 45-degree incline bench with dumbbells.",
      "Let arms hang straight down, palms facing forward.",
      "Curl dumbbells up, keeping elbows pinned in place.",
      "Squeeze biceps, then lower with full eccentric control."
    ]
  },
  {
    name: "Tricep Overhead Cable Press",
    targetMuscle: "Triceps",
    instruction: "Extend overhead fully, focus on the long head.",
    restSeconds: 60,
    sets: 3,
    reps: "12-15 reps",
    videoUrl: "overhead-tricep-extension",
    steps: [
      "Attach rope to low pulley, face away, hold rope behind neck.",
      "Step forward into split stance, lean torso slightly.",
      "Extend elbows fully overhead, squeezing triceps at peak.",
      "Lower rope slowly behind head, feeling deep stretch."
    ]
  },
  {
    name: "Bodyweight Bench Dips",
    targetMuscle: "Triceps",
    instruction: "Place hands on chair/bed behind you, dip hips, extend fully.",
    restSeconds: 60,
    sets: 3,
    reps: "12-15 reps",
    videoUrl: "bench-dip",
    steps: [
      "Sit on edge of sturdy chair, palms on edge, fingers forward.",
      "Slide hips off edge, feet flat or legs straight forward.",
      "Lower hips by bending elbows to 90 degrees.",
      "Press back up vertically, squeezing triceps at peak."
    ]
  },

  // CORE
  {
    name: "Hanging Knee Raises",
    targetMuscle: "Lower Abs",
    instruction: "Avoid swinging; curl hips upward at peak.",
    restSeconds: 60,
    sets: 3,
    reps: "12-15 reps",
    videoUrl: "hanging-knee-raise",
    steps: [
      "Hang from pull-up bar with overhand grip, arms straight.",
      "Engage shoulders, avoid swinging momentum.",
      "Raise knees towards chest, tucking hips up at top.",
      "Lower legs slowly to vertical under perfect control."
    ]
  },
  {
    name: "Plank holding",
    targetMuscle: "Core",
    instruction: "Squeeze glutes, quads, and pull belly button to spine.",
    restSeconds: 60,
    sets: 3,
    reps: "60 seconds",
    videoUrl: "plank-hold",
    steps: [
      "Place forearms on floor, shoulders stacked over elbows.",
      "Extend legs back, toes tucked, hips level with shoulders.",
      "Squeeze glutes, pull belly button up, tighten thighs.",
      "Maintain deep, steady breathing for the duration."
    ]
  },
  {
    name: "Bicycle Crunches",
    targetMuscle: "Core",
    instruction: "Alternate shoulder to opposite knee, slow control.",
    restSeconds: 45,
    sets: 3,
    reps: "20 reps total",
    videoUrl: "bicycle-crunch",
    steps: [
      "Lie flat on back, hands light behind ears, legs raised.",
      "Lift shoulder blades off floor, rotate elbow to opposite knee.",
      "Extend the opposite leg out straight, 2 inches from floor.",
      "Alternate sides in smooth, slow, continuous cadence."
    ]
  },

  // CARDIO
  {
    name: "Burpees",
    targetMuscle: "Cardio",
    instruction: "Squat, jump back, chest to floor, jump back up.",
    restSeconds: 60,
    sets: 3,
    reps: "10-12 reps",
    videoUrl: "burpee",
    steps: [
      "Stand tall, squat down, place hands flat on floor.",
      "Jump feet back into a high plank position.",
      "Lower chest completely to floor, push back up.",
      "Jump feet forward to hands, stand up and jump explosively."
    ]
  },
  {
    name: "Mountain Climbers",
    targetMuscle: "Cardio",
    instruction: "High plank, drive knees to chest rapidly with control.",
    restSeconds: 45,
    sets: 3,
    reps: "45 seconds",
    videoUrl: "mountain-climber",
    steps: [
      "Set up in rigid high plank, hands under shoulders.",
      "Drive right knee into chest, keep hips flat.",
      "Switch legs rapidly, pulling left knee in while extending right.",
      "Keep head and spine stable, maintain high speed."
    ]
  }
];

export interface SplitTemplate {
  name: string;
  description: string;
  difficulty: string;
  weeklySchedule: WeeklyScheduleDay[];
}

export const SPLIT_TEMPLATES: SplitTemplate[] = [
  {
    name: "Push / Pull / Legs (3-Day)",
    description: "The gold standard of athletic muscle growth. Grouping synergist muscle groups together for maximal loading and 48-72 hours of complete restoration.",
    difficulty: "Intermediate",
    weeklySchedule: [
      {
        day: "Day 1 - Push Focus (Chest, Shoulders & Triceps)",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: [
          EXERCISE_DATABASE.find(e => e.videoUrl === "flat-bench-press")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "incline-dumbbell-press")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "dumbbell-shoulder-press")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "lateral-raise")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "overhead-tricep-extension")!
        ]
      },
      {
        day: "Day 2 - Pull Focus (Lats, Upper Back & Biceps)",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: [
          EXERCISE_DATABASE.find(e => e.videoUrl === "lat-pulldown")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "seated-cable-row")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "dumbbell-row")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "incline-bicep-curl")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "hanging-knee-raise")!
        ]
      },
      {
        day: "Day 3 - Legs & Abs Focus",
        activityType: "Strength",
        durationMinutes: 50,
        exercises: [
          EXERCISE_DATABASE.find(e => e.videoUrl === "barbell-back-squat")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "romanian-deadlift")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "leg-extension")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "plank-hold")!
        ]
      }
    ]
  },
  {
    name: "Upper / Lower Split (4-Day)",
    description: "Highly versatile split with high frequency. Training each muscle group twice weekly for optimized progressive mechanical tension.",
    difficulty: "Advanced",
    weeklySchedule: [
      {
        day: "Day 1 - Upper Body Power A",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: [
          EXERCISE_DATABASE.find(e => e.videoUrl === "flat-bench-press")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "lat-pulldown")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "dumbbell-shoulder-press")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "seated-cable-row")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "bench-dip")!
        ]
      },
      {
        day: "Day 2 - Lower Body Power A",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: [
          EXERCISE_DATABASE.find(e => e.videoUrl === "barbell-back-squat")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "romanian-deadlift")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "hanging-knee-raise")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "plank-hold")!
        ]
      },
      {
        day: "Day 3 - Upper Body Hypertrophy B",
        activityType: "Strength",
        durationMinutes: 50,
        exercises: [
          EXERCISE_DATABASE.find(e => e.videoUrl === "incline-dumbbell-press")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "dumbbell-row")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "lateral-raise")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "incline-bicep-curl")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "overhead-tricep-extension")!
        ]
      },
      {
        day: "Day 4 - Lower Body Hypertrophy B",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: [
          EXERCISE_DATABASE.find(e => e.videoUrl === "bulgarian-split-squat")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "leg-extension")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "bicycle-crunch")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "glute-bridge")!
        ]
      }
    ]
  },
  {
    name: "Full Body Focus (2-Day)",
    description: "Time-efficient and incredibly potent. Maximizing full-body systemic fatigue twice a week. Perfect for busy professionals and wellness preservation.",
    difficulty: "Beginner-Friendly",
    weeklySchedule: [
      {
        day: "Day 1 - Full Body Power A",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: [
          EXERCISE_DATABASE.find(e => e.videoUrl === "barbell-back-squat")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "flat-bench-press")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "lat-pulldown")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "lateral-raise")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "plank-hold")!
        ]
      },
      {
        day: "Day 2 - Full Body Conditioning B",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: [
          EXERCISE_DATABASE.find(e => e.videoUrl === "romanian-deadlift")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "incline-dumbbell-press")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "seated-cable-row")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "bicycle-crunch")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "burpees")!
        ]
      }
    ]
  },
  {
    name: "Cardio & Core Calisthenics",
    description: "High-intensity metabolic boosting. Strictly bodyweight focused to accelerate caloric output, agility, and absolute core rigidity.",
    difficulty: "All Levels",
    weeklySchedule: [
      {
        day: "Day 1 - Aerobic Interval Blast",
        activityType: "Cardio",
        durationMinutes: 30,
        exercises: [
          EXERCISE_DATABASE.find(e => e.videoUrl === "burpees")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "mountain-climber")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "push-up")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "bicycle-crunch")!
        ]
      },
      {
        day: "Day 2 - Core Isometric Lock",
        activityType: "Cardio",
        durationMinutes: 35,
        exercises: [
          EXERCISE_DATABASE.find(e => e.videoUrl === "plank-hold")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "hanging-knee-raise")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "superman-hold")!,
          EXERCISE_DATABASE.find(e => e.videoUrl === "russian-twist")!
        ]
      }
    ]
  }
];

export interface ProgramPreset {
  id: string;
  name: string;
  goal: string;
  durationWeeks: number;
  description: string;
  splitTemplate: SplitTemplate;
  tips: string[];
}

export const DURATION_PROGRAMS: ProgramPreset[] = [
  {
    id: "4w-shred",
    name: "4-Week Metabolic Blitz",
    goal: "weight-loss",
    durationWeeks: 4,
    description: "An intensive shock cycle engineered for rapid thermogenesis, glycogen depletion, and maximal heart rate conditioning. Higher rest tempos and high cardio densities.",
    tips: [
      "Keep rest periods strictly under 45 seconds to maintain elevated fat-burning metabolics.",
      "Walk 10,000 steps daily outside of formal sessions to maximize thermal output.",
      "Perform interval sessions in a fasted state if preferred, but prioritize absolute consistency."
    ],
    splitTemplate: SPLIT_TEMPLATES[3] // Cardio & Core
  },
  {
    id: "8w-hypertrophy",
    name: "8-Week Hypertrophy System",
    goal: "muscle-gain",
    durationWeeks: 8,
    description: "A balanced 8-week progressive overload split focusing on micro-tearing muscle groups with high mechanical tension, and steady hypertrophy growth.",
    tips: [
      "Keep detailed notes of weights lifted. Increase weight or reps by 1-2% every week.",
      "Get 8+ hours of deep, uninterrupted sleep; muscle repair occurs exclusively in deep REM.",
      "Consume a post-workout high-protein meal within 2 hours of completion."
    ],
    splitTemplate: SPLIT_TEMPLATES[0] // Push/Pull/Legs
  },
  {
    id: "12w-strength",
    name: "12-Week Peak Strength Cycle",
    goal: "strength",
    durationWeeks: 12,
    description: "A comprehensive master cycle focused on central nervous system adaptations, heavy compound barbell lifts, and building deep structural core stability.",
    tips: [
      "Rest fully for 2-3 minutes between compound heavy lifts to allow ATP re-synthesis.",
      "Incorporate spinal bracing techniques (valsalva) with strict athletic focus.",
      "Avoid training to failure on every set; manage mechanical exhaustion carefully."
    ],
    splitTemplate: SPLIT_TEMPLATES[1] // Upper/Lower
  },
  {
    id: "8w-wellness",
    name: "8-Week Functional Longevity",
    goal: "general",
    durationWeeks: 8,
    description: "A functional full-body routine designed to enhance lean muscle mass, flexibility, joint resilience, and steady-state cardiovascular performance.",
    tips: [
      "Prioritize full range of motion over chasing heavier numbers.",
      "Incorporate dynamic stretching for 5 minutes before every session.",
      "Listen to physical signs of joint inflammation and substitute with isometric holds if sore."
    ],
    splitTemplate: SPLIT_TEMPLATES[2] // Full Body Focus
  }
];
