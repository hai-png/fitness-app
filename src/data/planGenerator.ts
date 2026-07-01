import type { OnboardingInput, WorkoutPlan, MealSuggestion, Exercise } from "../engine";

/**
 * Generate a workout plan from onboarding input.
 *
 * The nutrition plan is NOT generated here — it's computed by the engine
 * (runAssessment + buildNutritionPlan) via the useEngine hook.
 */
export function generateWorkoutPlan(input: OnboardingInput): WorkoutPlan {
  const { name, goal, workoutPreference, frequency } = input;
  // Decide difficulty and description based on goal. Every branch of the
  // if/else-if chain below assigns all four variables, so they are declared
  // without an initial value to avoid dead initial assignments.
  let title: string;
  let description: string;
  let difficulty: string;
  let tips: string[];

  if (goal === "weight-loss") {
    title = `Fat Shred & Cardio Burn for ${name}`;
    description = `Designed for rapid caloric burn, metabolic boosting, and lean muscle preservation. Combining structural resistance with targeted cardiovascular bursts.`;
    difficulty = "All Levels";
    tips = [
      "Prioritize neat activity (walking) outside of formal workouts (target 8k-10k daily steps).",
      "Drink a glass of water 15 minutes before every meal to support digestion and fullness.",
      "Never skip the dynamic warm-up; joint mobilization is key to high calorie expenditure.",
    ];
  } else if (goal === "muscle-gain") {
    title = `Hypertrophy & Strength Builder for ${name}`;
    description = `Optimized for mechanical tension, progressive overload, and high muscle recruitment. Ideal for accelerating muscle mass accretion.`;
    difficulty = "Intermediate";
    tips = [
      "Ensure you are lifting within 1-2 reps of muscular failure (RPE 8-9) on working sets.",
      "Track your weights and aim to increase either weight or reps slightly every week.",
      "Get at least 8 hours of sleep per night; muscle grows during deep recovery, not in the gym.",
    ];
  } else if (goal === "strength") {
    title = `Powerlifting & Core Strength for ${name}`;
    description = `Focused on compounding major mechanical movements, improving nervous system recruitment, and building bulletproof core stabilization.`;
    difficulty = "Advanced";
    tips = [
      "Prioritize rest periods: rest fully for 2-3 minutes between primary compound lifts.",
      "Maintain strict bracing of your core (valsalva maneuver) during heavy loads.",
      "Focus on bar path and movement efficiency before chasing high numbers.",
    ];
  } else if (goal === "endurance") {
    title = `Stamina & Athletic Conditioning for ${name}`;
    description = `Designed to elevate VO2 max, enhance lactic acid buffering, and build durable muscular stamina using higher repetition patterns and active recovery intervals.`;
    difficulty = "Intermediate";
    tips = [
      "Maintain a steady, rhythmic breathing pattern during high-intensity intervals.",
      "Integrate mobility work at least twice weekly to keep tendons and joints resilient.",
      "Focus on steady-state cardiovascular pacing; do not start your runs too fast.",
    ];
  } else {
    title = `Total Wellness & Vitality for ${name}`;
    description = `A balanced, sustainable program blending functional strength training, flexible mobility, and aerobic base building for long-term health.`;
    difficulty = "Beginner-Friendly";
    tips = [
      "Consistency always beats intensity. Focus on completing every scheduled session.",
      "Listen to your body; active stretching can replace a workout if you feel overly fatigued.",
      "Keep moving throughout the day; active hobbies are just as valuable as structured training.",
    ];
  }

  // Generate weekly workouts based on frequency preference
  const scheduleDays = [];
  // Annotated as Record<string, Exercise[]> so that the machine-swap maps
  // below (which widen `ex` to Exercise) can assign their results back to
  // the pool arrays without requiring `any` or a cast.
  const exercisePoolGym: Record<string, Exercise[]> = {
    chest: [
      {
        name: "Incline Dumbbell Press",
        sets: 4,
        reps: "8-10 reps",
        restSeconds: 90,
        instruction: "Keep elbows at 45 degrees, squeeze chest at peak.",
        targetMuscle: "Chest",
        videoUrl: "incline-dumbbell-press",
        steps: [
          "Set the bench to a 30-degree incline.",
          "Sit back with dumbbells at chest height, elbows under wrists.",
          "Press dumbbells straight up, squeezing chest at the top.",
          "Lower under control until dumbbells touch outer chest.",
        ],
      },
      {
        name: "Flat Barbell Bench Press",
        sets: 3,
        reps: "6-8 reps",
        restSeconds: 120,
        instruction: "Touch lower sternum and press up vertically.",
        targetMuscle: "Chest",
        videoUrl: "flat-bench-press",
        steps: [
          "Lie flat, eyes under bar, grip slightly wider than shoulders.",
          "Pull shoulder blades together, plant feet firmly.",
          "Unrack bar, lower slowly to lower sternum/nipple line.",
          "Drive heels and press bar forcefully to locked out start position.",
        ],
      },
      {
        name: "Cable Chest Flys",
        sets: 3,
        reps: "12-15 reps",
        restSeconds: 60,
        instruction: "Focus on a deep stretch and wrapping arms around a tree.",
        targetMuscle: "Chest",
        videoUrl: "cable-chest-fly",
        steps: [
          "Set pulleys to shoulder-height, stand midway with one foot forward.",
          "Grip handles, maintain a slight bend in your elbows.",
          "Bring hands together in a wide hugging arc in front of chest.",
          "Squeeze for 1s, then return slowly to feel a deep stretch.",
        ],
      },
    ],
    back: [
      {
        name: "Lat Pulldown (Wide Grip)",
        sets: 4,
        reps: "10-12 reps",
        restSeconds: 90,
        instruction: "Pull with your elbows, retracting scapula fully.",
        targetMuscle: "Lats",
        videoUrl: "lat-pulldown",
        steps: [
          "Sit, adjust knee pads, grip bar wider than shoulder-width.",
          "Lean back slightly (10-15 degrees), keep core tight.",
          "Pull bar down to upper chest, leading with elbows.",
          "Squeeze lats, then let bar return slowly with full stretch.",
        ],
      },
      {
        name: "Seated Cable Row",
        sets: 3,
        reps: "10-12 reps",
        restSeconds: 90,
        instruction: "Keep spine neutral, pull handle to belly button.",
        targetMuscle: "Mid Back",
        videoUrl: "seated-cable-row",
        steps: [
          "Sit on bench, feet on footplates, knees slightly bent.",
          "Grip close-grip attachment, sit tall with neutral spine.",
          "Pull handle to lower abdomen, pulling shoulders back.",
          "Squeeze shoulder blades, then slowly return to start.",
        ],
      },
      {
        name: "Dumbbell Single-Arm Row",
        sets: 3,
        reps: "8-10 reps",
        restSeconds: 90,
        instruction: "Support knee on bench, pull weight to hip pocket.",
        targetMuscle: "Upper Back",
        videoUrl: "dumbbell-row",
        steps: [
          "Place same-side knee and hand on bench, other foot flat on floor.",
          "Hold dumbbell with straight arm, spine neutral.",
          "Pull elbow up and back towards your hip pocket.",
          "Squeeze upper back, then lower dumbbell slowly.",
        ],
      },
    ],
    legs: [
      {
        name: "Barbell Back Squats",
        sets: 4,
        reps: "6-8 reps",
        restSeconds: 120,
        instruction: "Hips back, descend to parallel, press through mid-foot.",
        targetMuscle: "Quads",
        videoUrl: "barbell-back-squat",
        steps: [
          "Position bar on upper traps, grip tightly, lift off rack.",
          "Step back, feet shoulder-width, toes flared 15 degrees.",
          "Hinge hips back, bend knees, descend deep to parallel.",
          "Drive through mid-foot, stand up, keeping chest tall.",
        ],
      },
      {
        name: "Romanian Deadlifts (RDL)",
        sets: 3,
        reps: "10-12 reps",
        restSeconds: 90,
        instruction: "Hinge at hips, keep bar close to shins, squeeze glutes.",
        targetMuscle: "Hamstrings",
        videoUrl: "romanian-deadlift",
        steps: [
          "Stand holding barbell at hips, feet hip-width apart.",
          "Push hips backward, keeping knees soft but static.",
          "Lower barbell along thighs, keeping spine completely flat.",
          "Once hamstrings stretch fully, drive hips forward and stand.",
        ],
      },
      {
        name: "Leg Extensions",
        sets: 3,
        reps: "15 reps",
        restSeconds: 60,
        instruction: "Squeeze quads for 1 second at full extension.",
        targetMuscle: "Quads",
        videoUrl: "leg-extension",
        steps: [
          "Sit on machine, back flat, shins behind roller pad.",
          "Grip side handles, engage core, extend legs upward fully.",
          "Squeeze quadriceps intensely at the peak for 1 second.",
          "Lower weight slowly to starting position under control.",
        ],
      },
    ],
    shoulders: [
      {
        name: "Dumbbell Shoulder Press",
        sets: 4,
        reps: "8-10 reps",
        restSeconds: 90,
        instruction: "Press straight up, do not flare elbows excessively.",
        targetMuscle: "Shoulders",
        videoUrl: "dumbbell-shoulder-press",
        steps: [
          "Sit on bench with vertical back support, feet flat.",
          "Hold dumbbells at shoulder height, elbows slightly forward.",
          "Press dumbbells straight up, locking overhead.",
          "Lower with control to ear level to complete the rep.",
        ],
      },
      {
        name: "Dumbbell Lateral Raises",
        sets: 4,
        reps: "12-15 reps",
        restSeconds: 60,
        instruction: "Lead with elbows, keep pinkies slightly elevated.",
        targetMuscle: "Side Deltoid",
        videoUrl: "lateral-raise",
        steps: [
          "Stand tall, dumbbells at sides, slight hinge forward.",
          "Raise arms to the sides, leading with your elbows.",
          "Keep arms almost straight, tilt pinkies up at peak.",
          "Lower dumbbells slowly, avoiding swinging for momentum.",
        ],
      },
      {
        name: "Face Pulls",
        sets: 3,
        reps: "15 reps",
        restSeconds: 60,
        instruction: "Pull rope to nose, flaring elbows out, squeeze rear delts.",
        targetMuscle: "Rear Deltoid",
        videoUrl: "cable-face-pull",
        steps: [
          "Attach rope to high pulley, grasp ends with palms facing down.",
          "Step back, engage core, hold arms fully extended.",
          "Pull rope towards bridge of nose, flaring elbows wide.",
          "External rotate hands at peak, squeeze rear delts.",
        ],
      },
    ],
    arms: [
      {
        name: "Dumbbell Incline Bicep Curls",
        sets: 3,
        reps: "10-12 reps",
        restSeconds: 60,
        instruction: "Full stretch at bottom, pin elbows to sides.",
        targetMuscle: "Biceps",
        videoUrl: "incline-bicep-curl",
        steps: [
          "Lie back on a 45-degree incline bench with dumbbells.",
          "Let arms hang straight down, palms facing forward.",
          "Curl dumbbells up, keeping elbows pinned in place.",
          "Squeeze biceps, then lower with full eccentric control.",
        ],
      },
      {
        name: "Tricep Overhead Cable Press",
        sets: 3,
        reps: "12-15 reps",
        restSeconds: 60,
        instruction: "Extend overhead fully, focus on the long head.",
        targetMuscle: "Triceps",
        videoUrl: "overhead-tricep-extension",
        steps: [
          "Attach rope to low pulley, face away, hold rope behind neck.",
          "Step forward into split stance, lean torso slightly.",
          "Extend elbows fully overhead, squeezing triceps at peak.",
          "Lower rope slowly behind head, feeling deep stretch.",
        ],
      },
    ],
    core: [
      {
        name: "Hanging Knee Raises",
        sets: 3,
        reps: "12-15 reps",
        restSeconds: 60,
        instruction: "Avoid swinging; curl hips upward at peak.",
        targetMuscle: "Lower Abs",
        videoUrl: "hanging-knee-raise",
        steps: [
          "Hang from pull-up bar with overhand grip, arms straight.",
          "Engage shoulders, avoid swinging momentum.",
          "Raise knees towards chest, tucking hips up at top.",
          "Lower legs slowly to vertical under perfect control.",
        ],
      },
      {
        name: "Plank holding",
        sets: 3,
        reps: "60 seconds",
        restSeconds: 60,
        instruction: "Squeeze glutes, quads, and pull belly button to spine.",
        targetMuscle: "Core",
        videoUrl: "plank-hold",
        steps: [
          "Place forearms on floor, shoulders stacked over elbows.",
          "Extend legs back, toes tucked, hips level with shoulders.",
          "Squeeze glutes, pull belly button up, tighten thighs.",
          "Maintain deep, steady breathing for the duration.",
        ],
      },
    ],
    cardio: [
      {
        name: "Stationary Bike Sprint Intervals",
        sets: 4,
        reps: "8 mins",
        restSeconds: 60,
        instruction: "Pedal light for 2 mins, then sprint for 30s followed by 30s slow recovery.",
        targetMuscle: "Cardio",
        videoUrl: "bike-sprints",
        steps: [
          "Warm up at light intensity for 2 minutes.",
          "Increase resistance, sprint at max RPM for 30 seconds.",
          "Drop resistance, spin slowly for 30 seconds to recover.",
          "Repeat intervals, then cool down for 1 minute.",
        ],
      },
      {
        name: "Rowing Machine Tempo Work",
        sets: 1,
        reps: "15 mins",
        restSeconds: 0,
        instruction: "Maintain a steady stroke rate of 24-26 strokes per minute.",
        targetMuscle: "Cardio",
        videoUrl: "rowing-tempo",
        steps: [
          "Sit, strap feet, grip handle with straight arms.",
          "Drive with legs first, lean back, pull handle to ribs.",
          "Extend arms, lean forward, bend knees to slide forward.",
          "Maintain consistent rhythmic breathing every stroke.",
        ],
      },
    ],
  };

  const exercisePoolHome: Record<string, Exercise[]> = {
    chest: [
      {
        name: "Standard Push-Ups",
        sets: 4,
        reps: "15-20 reps",
        restSeconds: 60,
        instruction: "Full range of motion, touch chest to floor.",
        targetMuscle: "Chest",
        videoUrl: "push-up",
        steps: [
          "Start in high plank, hands slightly wider than shoulders.",
          "Keep body in perfect straight line from head to heels.",
          "Lower chest to ground by bending elbows to 45 degrees.",
          "Press up forcefully to lock out start position.",
        ],
      },
      {
        name: "Decline Push-Ups",
        sets: 3,
        reps: "12-15 reps",
        restSeconds: 60,
        instruction: "Place feet on chair/bed for upper chest focus.",
        targetMuscle: "Upper Chest",
        videoUrl: "decline-push-up",
        steps: [
          "Place feet on elevated chair or bed, hands on floor.",
          "Establish straight body alignment, squeeze core.",
          "Lower chest towards floor, keeping elbows controlled.",
          "Press floor away, returning to starting alignment.",
        ],
      },
      {
        name: "Wall Push-Ups (High Tempo)",
        sets: 3,
        reps: "20 reps",
        restSeconds: 45,
        instruction: "Lean against solid wall, press at a fast, controlled cadence.",
        targetMuscle: "Chest",
        videoUrl: "wall-push-up",
        steps: [
          "Stand arm-length away, hands on wall at chest level.",
          "Lean body forward towards wall, heels lifting slightly.",
          "Press back forcefully using your chest muscles.",
          "Keep tempo fast and repetitive to accumulate pump.",
        ],
      },
    ],
    back: [
      {
        name: "Doorframe Row Pulls",
        sets: 4,
        reps: "15-20 reps",
        restSeconds: 60,
        instruction: "Grip doorframe, lean back, pull torso to hand.",
        targetMuscle: "Upper Back",
        videoUrl: "doorframe-row",
        steps: [
          "Stand facing a sturdy doorframe, toes close to frame edge.",
          "Grasp frame with both hands, lean back until arms are straight.",
          "Pull chest to the frame edge, squeezing shoulder blades.",
          "Extend arms slowly, resisting bodyweight on the way back.",
        ],
      },
      {
        name: "Towel Resistance Back Row",
        sets: 3,
        reps: "15 reps",
        restSeconds: 60,
        instruction: "Pull towel apart with max tension while rowing.",
        targetMuscle: "Lats",
        videoUrl: "towel-row",
        steps: [
          "Hold a bath towel shoulder-width, stand in bent-over hinge.",
          "Pull outward on towel with max effort, generating tension.",
          "Draw towel to belly button, keeping elbows tucked close.",
          "Return slowly, keeping continuous outward ripping force.",
        ],
      },
      {
        name: "Superman Holds",
        sets: 3,
        reps: "30 seconds",
        restSeconds: 60,
        instruction: "Raise arms, chest, and legs off ground, squeeze back.",
        targetMuscle: "Lower Back",
        videoUrl: "superman-hold",
        steps: [
          "Lie face down on floor, arms extended overhead.",
          "Raise chest, arms, and legs off ground simultaneously.",
          "Squeeze your glutes and lower/upper back muscles intensely.",
          "Hold static peak position, breathing gently.",
        ],
      },
    ],
    legs: [
      {
        name: "Bodyweight Bulgarian Split Squats",
        sets: 3,
        reps: "12 reps/side",
        restSeconds: 60,
        instruction: "One foot back on chair, sink hip low, keep trunk upright.",
        targetMuscle: "Quads",
        videoUrl: "bulgarian-split-squat",
        steps: [
          "Place one foot flat behind you on a chair or couch.",
          "Step other foot forward about 2-3 feet.",
          "Lower hips vertically until front thigh is parallel to floor.",
          "Drive up through front heel to starting height.",
        ],
      },
      {
        name: "Jump Squats",
        sets: 3,
        reps: "15 reps",
        restSeconds: 60,
        instruction: "Descend into squat, explode upwards off ground.",
        targetMuscle: "Quads",
        videoUrl: "jump-squat",
        steps: [
          "Stand with feet shoulder-width, core actively braced.",
          "Descend into a full squat under complete control.",
          "Drive up explosively, jumping as high as possible.",
          "Land softly, immediately absorbing force into the next squat.",
        ],
      },
      {
        name: "Glute Bridges",
        sets: 3,
        reps: "20 reps",
        restSeconds: 45,
        instruction: "Lie flat, press heels down, lift hips, squeeze glutes.",
        targetMuscle: "Glutes",
        videoUrl: "glute-bridge",
        steps: [
          "Lie on back, knees bent, feet flat, hands by sides.",
          "Press heels into floor and squeeze glutes to lift hips.",
          "Ensure straight line from shoulders to knees at peak.",
          "Lower hips slowly, touching floor lightly before next rep.",
        ],
      },
    ],
    shoulders: [
      {
        name: "Pike Push-Ups",
        sets: 3,
        reps: "8-10 reps",
        restSeconds: 90,
        instruction: "Hips high in V-shape, lower head towards ground.",
        targetMuscle: "Shoulders",
        videoUrl: "pike-push-up",
        steps: [
          "Start in push-up stance, walk feet forward, lift hips high.",
          "Keep legs straight, looking back at your toes.",
          "Lower top of head towards floor, elbows flaring slightly.",
          "Press floor away using shoulders to return to high V.",
        ],
      },
      {
        name: "Doorframe Side Lateral Contractions",
        sets: 3,
        reps: "45 seconds",
        restSeconds: 45,
        instruction: "Press back of forearm against doorframe, contract rear delt.",
        targetMuscle: "Side Deltoid",
        videoUrl: "isometric-shoulder",
        steps: [
          "Stand sideways inside doorframe, forearm pressed against frame.",
          "Push arm outward against frame with maximum force.",
          "Maintain isometric contraction, focusing on lateral delt.",
          "Release, switch sides, and repeat.",
        ],
      },
      {
        name: "Arm Circles (Isometric)",
        sets: 3,
        reps: "60 seconds",
        restSeconds: 30,
        instruction: "Hold arms straight out to sides, perform small fast circles.",
        targetMuscle: "Shoulders",
        videoUrl: "arm-circles",
        steps: [
          "Stand tall, raise arms out to sides parallel to floor.",
          "Keep arms fully locked, fingers extended.",
          "Perform fast, small circles in forward direction.",
          "After 30s, reverse direction, maintaining shoulder height.",
        ],
      },
    ],
    arms: [
      {
        name: "Bodyweight Bench Dips",
        sets: 3,
        reps: "12-15 reps",
        restSeconds: 60,
        instruction: "Place hands on chair/bed behind you, dip hips, extend fully.",
        targetMuscle: "Triceps",
        videoUrl: "bench-dip",
        steps: [
          "Sit on edge of sturdy chair, palms on edge, fingers forward.",
          "Slide hips off edge, feet flat or legs straight forward.",
          "Lower hips by bending elbows to 90 degrees.",
          "Press back up vertically, squeezing triceps at peak.",
        ],
      },
      {
        name: "Towel Isometric Curls",
        sets: 3,
        reps: "10 reps",
        restSeconds: 60,
        instruction: "Step on towel, pull upwards with max effort for 10 seconds.",
        targetMuscle: "Biceps",
        videoUrl: "towel-curl",
        steps: [
          "Place towel under one foot, hold ends with palms up.",
          "Hinge slightly, elbows pinned to ribs in a bicep curl stance.",
          "Pull upwards on towel with maximum force.",
          "Hold isometric contraction for 10 seconds per rep.",
        ],
      },
    ],
    core: [
      {
        name: "Bicycle Crunches",
        sets: 3,
        reps: "20 reps total",
        restSeconds: 45,
        instruction: "Alternate shoulder to opposite knee, slow control.",
        targetMuscle: "Core",
        videoUrl: "bicycle-crunch",
        steps: [
          "Lie flat on back, hands light behind ears, legs raised.",
          "Lift shoulder blades off floor, rotate elbow to opposite knee.",
          "Extend the opposite leg out straight, 2 inches from floor.",
          "Alternate sides in smooth, slow, continuous cadence.",
        ],
      },
      {
        name: "Russian Twists",
        sets: 3,
        reps: "30 twists",
        restSeconds: 45,
        instruction: "Sit at 45 degrees, rotate shoulders side-to-side.",
        targetMuscle: "Obliques",
        videoUrl: "russian-twist",
        steps: [
          "Sit on floor, knees bent, lean torso back at 45 degrees.",
          "Clasp hands in front of chest, elevate feet if possible.",
          "Rotate shoulders fully to right, touching hand to floor.",
          "Rotate fully to left, keeping hips and legs stable.",
        ],
      },
    ],
    cardio: [
      {
        name: "Burpees",
        sets: 3,
        reps: "10-12 reps",
        restSeconds: 60,
        instruction: "Squat, jump back, chest to floor, jump back up.",
        targetMuscle: "Full Body",
        videoUrl: "burpee",
        steps: [
          "Stand tall, squat down, place hands flat on floor.",
          "Jump feet back into a high plank position.",
          "Lower chest completely to floor, push back up.",
          "Jump feet forward to hands, stand up and jump explosively.",
        ],
      },
      {
        name: "Mountain Climbers",
        sets: 3,
        reps: "45 seconds",
        restSeconds: 45,
        instruction: "High plank, drive knees to chest rapidly with control.",
        targetMuscle: "Cardio",
        videoUrl: "mountain-climber",
        steps: [
          "Set up in rigid high plank, hands under shoulders.",
          "Drive right knee into chest, keep hips flat.",
          "Switch legs rapidly, pulling left knee in while extending right.",
          "Keep head and spine stable, maintain high speed.",
        ],
      },
    ],
  };

  const isGym = workoutPreference === "gym" || workoutPreference === "hybrid";
  // Clone the selected pool so any local mutation below (e.g. replacing pool.legs[0])
  // never corrupts the module-level constant. Both branches must clone — the
  // previous code only cloned the gym branch, leaving exercisePoolHome shared
  // by reference (latent footgun if a future change mutates the home pool).
  const pool = structuredClone(isGym ? exercisePoolGym : exercisePoolHome);

  // Let's tune the gym exercise pool if availableMachines is specified
  if (isGym && input.availableMachines && input.availableMachines.length > 0) {
    const machines = input.availableMachines;

    // 1. Lat Pulldown Machine
    if (!machines.includes("Lat Pulldown")) {
      pool.back = pool.back.map((ex: Exercise) =>
        ex.name.includes("Lat Pulldown")
          ? {
              name: "Dumbbell Pull-Over",
              sets: 4,
              reps: "10-12 reps",
              restSeconds: 90,
              instruction:
                "Lie across bench, lower dumbbell behind head under control, pull back with lats.",
              targetMuscle: "Lats",
              videoUrl: "dumbbell-pullover",
              steps: [
                "Lie perpendicular to a flat bench, upper back supported by the cushion.",
                "Hold a dumbbell with both hands directly above your chest.",
                "Lower the dumbbell in a backward arc behind your head while keeping elbows slightly bent.",
                "Pull the dumbbell back up to the starting position, contracting your lats.",
              ],
            }
          : ex,
      );
    }

    // 2. Cable Crossover
    if (!machines.includes("Cable Crossover")) {
      pool.chest = pool.chest.map((ex: Exercise) =>
        ex.name.includes("Cable Chest")
          ? {
              name: "Flat Dumbbell Flys",
              sets: 3,
              reps: "12-15 reps",
              restSeconds: 60,
              instruction: "Maintain soft elbows, expand chest in a wide arc, squeeze at the peak.",
              targetMuscle: "Chest",
              videoUrl: "dumbbell-fly",
              steps: [
                "Lie flat on a bench holding dumbbells above your chest, palms facing each other.",
                "Lower the dumbbells out to the sides in a wide arc, maintaining a slight bend in your elbows.",
                "Feel a deep stretch across your pectorals.",
                "Reverse the movement to bring the dumbbells back to the top, squeezing your chest.",
              ],
            }
          : ex,
      );
      pool.arms = pool.arms.map((ex: Exercise) =>
        ex.name.includes("Cable")
          ? {
              name: "Dumbbell Overhead Tricep Extension",
              sets: 3,
              reps: "12-15 reps",
              restSeconds: 60,
              instruction:
                "Hold a dumbbell with both hands overhead, lower behind neck, extend fully.",
              targetMuscle: "Triceps",
              videoUrl: "dumbbell-overhead-extension",
              steps: [
                "Stand tall or sit on a bench with back support.",
                "Grasp a single dumbbell with both hands, lifting it straight overhead.",
                "Lower the weight behind your head by bending at the elbows, keeping upper arms vertical.",
                "Extend elbows to press the dumbbell back overhead, contracting triceps.",
              ],
            }
          : ex,
      );
    }

    // 3. Leg Extension Machine
    if (!machines.includes("Leg Extension Machine")) {
      pool.legs = pool.legs.map((ex: Exercise) =>
        ex.name.includes("Leg Extensions")
          ? {
              name: "Dumbbell Goblet Squats",
              sets: 3,
              reps: "12-15 reps",
              restSeconds: 60,
              instruction:
                "Hold a dumbbell vertically at your chest, squat deep, drive up vertically.",
              targetMuscle: "Quads",
              videoUrl: "goblet-squat",
              steps: [
                "Stand with feet slightly wider than shoulder-width, toes flared out.",
                "Hold a dumbbell vertically by one end close to your chest.",
                "Hinge at the hips and bend knees to lower your body into a deep squat.",
                "Drive through your heels to return to the starting standing position.",
              ],
            }
          : ex,
      );
    }

    // Swaps and enhancements based on logged machines
    if (machines.includes("Leg Press Machine")) {
      pool.legs[0] = {
        name: "Linear Leg Press",
        sets: 4,
        reps: "8-10 reps",
        restSeconds: 90,
        instruction:
          "Place feet shoulder-width on sled, lower to 90 degrees, press without locking knees.",
        targetMuscle: "Quads",
        videoUrl: "leg-press",
        steps: [
          "Sit on the leg press machine, placing feet flat on the sled platform.",
          "Release safety handles and lower the platform slowly towards your chest.",
          "Stop once knees are bent to 90 degrees.",
          "Press the platform back up forcefully, avoiding locking your knees out at the top.",
        ],
      };
    }

    if (machines.includes("Smith Machine")) {
      pool.chest[0] = {
        name: "Smith Machine Incline Press",
        sets: 4,
        reps: "8-10 reps",
        restSeconds: 90,
        instruction:
          "Adjust incline bench to 30 degrees inside Smith machine. Press barbell smoothly.",
        targetMuscle: "Chest",
        videoUrl: "smith-incline-press",
        steps: [
          "Position an incline bench in the center of the Smith Machine.",
          "Lie back and align the barbell with your upper collarbone.",
          "Unrack the bar and lower it under control to your chest.",
          "Press upward smoothly, squeezing your upper chest at the top.",
        ],
      };
    }

    if (machines.includes("Seated Row Machine")) {
      pool.back[1] = {
        name: "Plate-Loaded Seated Row Machine",
        sets: 3,
        reps: "10-12 reps",
        restSeconds: 90,
        instruction: "Chest supported against pad, pull handles back, squeeze shoulder blades.",
        targetMuscle: "Mid Back",
        videoUrl: "machine-row",
        steps: [
          "Adjust seat height so hands align with mid-chest.",
          "Firmly plant chest against the support cushion and grip handles.",
          "Pull elbows back, drawing shoulder blades tightly together.",
          "Extend arms forward under control to feel the mid-back stretch.",
        ],
      };
    }
  }

  // Let's build a schedule depending on how many days they workout
  if (frequency === 2) {
    scheduleDays.push(
      {
        day: "Monday - Full Body Power",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: isGym
          ? [pool.legs[0], pool.chest[0], pool.back[0], pool.shoulders[1], pool.core[1]]
          : [pool.legs[0], pool.chest[1], pool.back[0], pool.legs[2], pool.core[0]],
      },
      {
        day: "Tuesday - Active Recovery Walking",
        activityType: "Rest",
        durationMinutes: 30,
        exercises: [
          {
            name: "Brisk Walk & Mobility",
            sets: 1,
            reps: "30 min",
            restSeconds: 0,
            instruction: "Walk at 5-6 km/h, follow with gentle lower back stretches.",
          },
        ],
      },
      {
        day: "Thursday - Full Body Stamina",
        activityType: "Strength",
        durationMinutes: 50,
        exercises: isGym
          ? [pool.legs[1], pool.back[1], pool.chest[1], pool.shoulders[0], pool.arms[0]]
          : [pool.legs[1], pool.chest[0], pool.back[2], pool.core[1], pool.chest[2]],
      },
      {
        day: "Wednesday, Friday, Weekend - Recovery",
        activityType: "Rest",
        durationMinutes: 0,
        exercises: [
          {
            name: "Hydrate & Foam Roll",
            sets: 1,
            reps: "10 mins",
            restSeconds: 0,
            instruction: "Massage tight tissues, perform slow abdominal breathing.",
          },
        ],
      },
    );
  } else if (frequency === 3) {
    scheduleDays.push(
      {
        day: "Monday - Push Day (Upper Body)",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: isGym
          ? [pool.chest[0], pool.chest[1], pool.shoulders[0], pool.shoulders[1], pool.arms[1]]
          : [pool.chest[1], pool.chest[0], pool.chest[2], pool.core[1], pool.core[0]],
      },
      {
        day: "Wednesday - Pull Day (Back & Core)",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: isGym
          ? [pool.back[0], pool.back[1], pool.back[2], pool.arms[0], pool.core[0]]
          : [pool.back[0], pool.back[1], pool.back[2], pool.core[0], pool.cardio[1]],
      },
      {
        day: "Friday - Legs & Lower Body Focus",
        activityType: "Strength",
        durationMinutes: 50,
        exercises: isGym
          ? [pool.legs[0], pool.legs[1], pool.legs[2], pool.core[1]]
          : [pool.legs[0], pool.legs[1], pool.legs[2], pool.cardio[0]],
      },
      {
        day: "Tue, Thu, Weekend - Dynamic Recovery",
        activityType: "Rest",
        durationMinutes: 20,
        exercises: [
          {
            name: "Gentle Flow Yoga",
            sets: 1,
            reps: "20 min",
            restSeconds: 0,
            instruction: "Focus on hamstring flexibility and shoulder mobility.",
          },
        ],
      },
    );
  } else {
    // 4 or 5 days
    scheduleDays.push(
      {
        day: "Monday - Upper Body (A) Power",
        activityType: "Strength",
        durationMinutes: 50,
        exercises: isGym
          ? [pool.chest[0], pool.back[0], pool.shoulders[0], pool.arms[0], pool.core[0]]
          : [pool.chest[1], pool.back[0], pool.chest[2], pool.core[1]],
      },
      {
        day: "Tuesday - Lower Body (A) Quad Focus",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: isGym
          ? [pool.legs[0], pool.legs[2], pool.core[1]]
          : [pool.legs[0], pool.legs[1], pool.core[0]],
      },
      {
        day: "Thursday - Upper Body (B) Volume",
        activityType: "Strength",
        durationMinutes: 50,
        exercises: isGym
          ? [pool.chest[1], pool.back[1], pool.shoulders[1], pool.arms[1], pool.core[1]]
          : [pool.chest[0], pool.back[1], pool.cardio[1], pool.core[0]],
      },
      {
        day: "Friday - Lower Body (B) Posterior Focus",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: isGym
          ? [pool.legs[1], pool.back[2], pool.core[0]]
          : [pool.legs[1], pool.legs[2], pool.cardio[0]],
      },
      {
        day: "Wednesday/Weekend - Active Restoration",
        activityType: "Rest",
        durationMinutes: 15,
        exercises: [
          {
            name: "Deep Foam Rolling",
            sets: 1,
            reps: "15 min",
            restSeconds: 0,
            instruction: "Roll calves, glutes, lats, and thoracic spine.",
          },
        ],
      },
    );
  }
  return {
    title,
    description,
    difficulty,
    weeklySchedule: scheduleDays,
    tips,
    durationWeeks: 8,
    currentWeek: 1,
    goalType: goal,
  };
}

/**
 * Generate meal suggestions from the engine NutritionPlan + onboarding input.
 * Used by the meal-ordering UI to display per-meal macro targets.
 */
export function generateMealSuggestions(args: {
  input: OnboardingInput;
  targetCalories: number;
  proteinG: number;
}): MealSuggestion[] {
  const { input, targetCalories, proteinG } = args;
  const { dietType } = input;

  return [
    {
      mealType: "Breakfast",
      name:
        dietType === "vegan"
          ? "High-Protein Scrambled Tofu"
          : dietType === "vegetarian"
            ? "Avocado Toast & Egg Whites"
            : "Savory Turkey Sausage & Egg White Scramble",
      description: "Scrambled with baby spinach, tomatoes, and organic olive oil.",
      calories: Math.round(targetCalories * 0.25),
      proteinGrams: Math.round(proteinG * 0.28),
    },
    {
      mealType: "Lunch",
      name:
        dietType === "vegan" || dietType === "vegetarian"
          ? "Baked Sesame Tofu Bowl"
          : "Zesty Herb Grilled Chicken Breast",
      description: "Served with cauliflower rice, sautéed bell peppers, and fresh greens.",
      calories: Math.round(targetCalories * 0.3),
      proteinGrams: Math.round(proteinG * 0.32),
    },
    {
      mealType: "Dinner",
      name:
        dietType === "vegan"
          ? "Crispy Tempeh Buddha Quinoa Bowl"
          : dietType === "vegetarian"
            ? "Lentil Pasta & Herb Marinara"
            : "Seared Atlantic Salmon Fillet",
      description: "Accompanied by dark steamed greens and lemon herb seasoning.",
      calories: Math.round(targetCalories * 0.35),
      proteinGrams: Math.round(proteinG * 0.35),
    },
    {
      mealType: "Snack",
      name:
        dietType === "vegan"
          ? "Soy Protein & Almond Shake"
          : "Whey Isolate Shake & Handful of Almonds",
      description: "Blended with cold unsweetened almond milk and optional stevia.",
      calories: Math.round(targetCalories * 0.1),
      proteinGrams: Math.round(proteinG * 0.15),
    },
  ];
}
