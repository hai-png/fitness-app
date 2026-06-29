import { PersonalPlan, Assessment } from "../types";

export function generateLocalPlan(assessment: Assessment): PersonalPlan {
  const { name, goal, workoutPreference, dietType, frequency } = assessment;

  // Decide difficulty and description based on goal
  let title = "";
  let description = "";
  let difficulty = "Intermediate";
  let tips: string[] = [];

  if (goal === "weight-loss") {
    title = `Fat Shred & Cardio Burn for ${name}`;
    description = `Designed for rapid caloric burn, metabolic boosting, and lean muscle preservation. Combining structural resistance with targeted cardiovascular bursts.`;
    difficulty = "All Levels";
    tips = [
      "Prioritize neat activity (walking) outside of formal workouts (target 8k-10k daily steps).",
      "Drink a glass of water 15 minutes before every meal to support digestion and fullness.",
      "Never skip the dynamic warm-up; joint mobilization is key to high calorie expenditure."
    ];
  } else if (goal === "muscle-gain") {
    title = `Hypertrophy & Strength Builder for ${name}`;
    description = `Optimized for mechanical tension, progressive overload, and high muscle recruitment. Ideal for accelerating muscle mass accretion.`;
    difficulty = "Intermediate";
    tips = [
      "Ensure you are lifting within 1-2 reps of muscular failure (RPE 8-9) on working sets.",
      "Track your weights and aim to increase either weight or reps slightly every week.",
      "Get at least 8 hours of sleep per night; muscle grows during deep recovery, not in the gym."
    ];
  } else if (goal === "strength") {
    title = `Powerlifting & Core Strength for ${name}`;
    description = `Focused on compounding major mechanical movements, improving nervous system recruitment, and building bulletproof core stabilization.`;
    difficulty = "Advanced";
    tips = [
      "Prioritize rest periods: rest fully for 2-3 minutes between primary compound lifts.",
      "Maintain strict bracing of your core (valsalva maneuver) during heavy loads.",
      "Focus on bar path and movement efficiency before chasing high numbers."
    ];
  } else if (goal === "endurance") {
    title = `Stamina & Athletic Conditioning for ${name}`;
    description = `Designed to elevate VO2 max, enhance lactic acid buffering, and build durable muscular stamina using higher repetition patterns and active recovery intervals.`;
    difficulty = "Intermediate";
    tips = [
      "Maintain a steady, rhythmic breathing pattern during high-intensity intervals.",
      "Integrate mobility work at least twice weekly to keep tendons and joints resilient.",
      "Focus on steady-state cardiovascular pacing; do not start your runs too fast."
    ];
  } else {
    title = `Total Wellness & Vitality for ${name}`;
    description = `A balanced, sustainable program blending functional strength training, flexible mobility, and aerobic base building for long-term health.`;
    difficulty = "Beginner-Friendly";
    tips = [
      "Consistency always beats intensity. Focus on completing every scheduled session.",
      "Listen to your body; active stretching can replace a workout if you feel overly fatigued.",
      "Keep moving throughout the day; active hobbies are just as valuable as structured training."
    ];
  }

  // Generate weekly workouts based on frequency preference
  const scheduleDays = [];
  const exercisePoolGym = {
    chest: [
      { name: "Incline Dumbbell Press", sets: 4, reps: "8-10 reps", restSeconds: 90, instruction: "Keep elbows at 45 degrees, squeeze chest at peak." },
      { name: "Flat Barbell Bench Press", sets: 3, reps: "6-8 reps", restSeconds: 120, instruction: "Touch lower sternum and press up vertically." },
      { name: "Cable Chest Flys", sets: 3, reps: "12-15 reps", restSeconds: 60, instruction: "Focus on a deep stretch and wrapping arms around a tree." }
    ],
    back: [
      { name: "Lat Pulldown (Wide Grip)", sets: 4, reps: "10-12 reps", restSeconds: 90, instruction: "Pull with your elbows, retracting scapula fully." },
      { name: "Seated Cable Row", sets: 3, reps: "10-12 reps", restSeconds: 90, instruction: "Keep spine neutral, pull handle to belly button." },
      { name: "Dumbbell Single-Arm Row", sets: 3, reps: "8-10 reps", restSeconds: 90, instruction: "Support knee on bench, pull weight to hip pocket." }
    ],
    legs: [
      { name: "Barbell Back Squats", sets: 4, reps: "6-8 reps", restSeconds: 120, instruction: "Hips back, descend to parallel, press through mid-foot." },
      { name: "Romanian Deadlifts (RDL)", sets: 3, reps: "10-12 reps", restSeconds: 90, instruction: "Hinge at hips, keep bar close to shins, squeeze glutes." },
      { name: "Leg Extensions", sets: 3, reps: "15 reps", restSeconds: 60, instruction: "Squeeze quads for 1 second at full extension." }
    ],
    shoulders: [
      { name: "Dumbbell Shoulder Press", sets: 4, reps: "8-10 reps", restSeconds: 90, instruction: "Press straight up, do not flare elbows excessively." },
      { name: "Dumbbell Lateral Raises", sets: 4, reps: "12-15 reps", restSeconds: 60, instruction: "Lead with elbows, keep pinkies slightly elevated." },
      { name: "Face Pulls", sets: 3, reps: "15 reps", restSeconds: 60, instruction: "Pull rope to nose, flaring elbows out, squeeze rear delts." }
    ],
    arms: [
      { name: "Dumbbell Incline Bicep Curls", sets: 3, reps: "10-12 reps", restSeconds: 60, instruction: "Full stretch at bottom, pin elbows to sides." },
      { name: "Tricep Overhead Cable Press", sets: 3, reps: "12-15 reps", restSeconds: 60, instruction: "Extend overhead fully, focus on the long head." }
    ],
    core: [
      { name: "Hanging Knee Raises", sets: 3, reps: "12-15 reps", restSeconds: 60, instruction: "Avoid swinging; curl hips upward at peak." },
      { name: "Plank holding", sets: 3, reps: "60 seconds", restSeconds: 60, instruction: "Squeeze glutes, quads, and pull belly button to spine." }
    ],
    cardio: [
      { name: "Stationary Bike Sprint Intervals", sets: 4, reps: "8 mins", restSeconds: 60, instruction: "Pedal light for 2 mins, then sprint for 30s followed by 30s slow recovery." },
      { name: "Rowing Machine Tempo Work", sets: 1, reps: "15 mins", restSeconds: 0, instruction: "Maintain a steady stroke rate of 24-26 strokes per minute." }
    ]
  };

  const exercisePoolHome = {
    chest: [
      { name: "Standard Push-Ups", sets: 4, reps: "15-20 reps", restSeconds: 60, instruction: "Full range of motion, touch chest to floor." },
      { name: "Decline Push-Ups", sets: 3, reps: "12-15 reps", restSeconds: 60, instruction: "Place feet on chair/bed for upper chest focus." },
      { name: "Wall Push-Ups (High Tempo)", sets: 3, reps: "20 reps", restSeconds: 45, instruction: "Lean against solid wall, press at a fast, controlled cadence." }
    ],
    back: [
      { name: "Doorframe Row Pulls", sets: 4, reps: "15-20 reps", restSeconds: 60, instruction: "Grip doorframe, lean back, pull torso to hand." },
      { name: "Towel Resistance Back Row", sets: 3, reps: "15 reps", restSeconds: 60, instruction: "Pull towel apart with max tension while rowing." },
      { name: "Superman Holds", sets: 3, reps: "30 seconds", restSeconds: 60, instruction: "Raise arms, chest, and legs off ground, squeeze back." }
    ],
    legs: [
      { name: "Bodyweight Bulgarian Split Squats", sets: 3, reps: "12 reps/side", restSeconds: 60, instruction: "One foot back on chair, sink hip low, keep trunk upright." },
      { name: "Jump Squats", sets: 3, reps: "15 reps", restSeconds: 60, instruction: "Descend into squat, explode upwards off ground." },
      { name: "Glute Bridges", sets: 3, reps: "20 reps", restSeconds: 45, instruction: "Lie flat, press heels down, lift hips, squeeze glutes." }
    ],
    shoulders: [
      { name: "Pike Push-Ups", sets: 3, reps: "8-10 reps", restSeconds: 90, instruction: "Hips high in V-shape, lower head towards ground." },
      { name: "Doorframe Side Lateral Contractions", sets: 3, reps: "45 seconds", restSeconds: 45, instruction: "Press back of forearm against doorframe, contract rear delt." },
      { name: "Arm Circles (Isometric)", sets: 3, reps: "60 seconds", restSeconds: 30, instruction: "Hold arms straight out to sides, perform small fast circles." }
    ],
    arms: [
      { name: "Bodyweight Bench Dips", sets: 3, reps: "12-15 reps", restSeconds: 60, instruction: "Place hands on chair/bed behind you, dip hips, extend fully." },
      { name: "Towel Isometric Curls", sets: 3, reps: "10 reps", restSeconds: 60, instruction: "Step on towel, pull upwards with max effort for 10 seconds." }
    ],
    core: [
      { name: "Bicycle Crunches", sets: 3, reps: "20 reps total", restSeconds: 45, instruction: "Alternate shoulder to opposite knee, slow control." },
      { name: "Russian Twists", sets: 3, reps: "30 twists", restSeconds: 45, instruction: "Sit at 45 degrees, rotate shoulders side-to-side." }
    ],
    cardio: [
      { name: "Burpees", sets: 3, reps: "10-12 reps", restSeconds: 60, instruction: "Squat, jump back, chest to floor, jump back up." },
      { name: "Mountain Climbers", sets: 3, reps: "45 seconds", restSeconds: 45, instruction: "High plank, drive knees to chest rapidly with control." }
    ]
  };

  const isGym = workoutPreference === "gym" || workoutPreference === "hybrid";
  const pool = isGym ? exercisePoolGym : exercisePoolHome;

  // Let's build a schedule depending on how many days they workout
  if (frequency === 2) {
    scheduleDays.push(
      {
        day: "Monday - Full Body Power",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: isGym 
          ? [pool.legs[0], pool.chest[0], pool.back[0], pool.shoulders[1], pool.core[1]]
          : [pool.legs[0], pool.chest[1], pool.back[0], pool.legs[2], pool.core[0]]
      },
      {
        day: "Tuesday - Active Recovery Walking",
        activityType: "Rest",
        durationMinutes: 30,
        exercises: [{ name: "Brisk Walk & Mobility", sets: 1, reps: "30 min", restSeconds: 0, instruction: "Walk at 5-6 km/h, follow with gentle lower back stretches." }]
      },
      {
        day: "Thursday - Full Body Stamina",
        activityType: "Strength",
        durationMinutes: 50,
        exercises: isGym
          ? [pool.legs[1], pool.back[1], pool.chest[1], pool.shoulders[0], pool.arms[0]]
          : [pool.legs[1], pool.chest[0], pool.back[2], pool.core[1], pool.chest[2]]
      },
      {
        day: "Wednesday, Friday, Weekend - Recovery",
        activityType: "Rest",
        durationMinutes: 0,
        exercises: [{ name: "Hydrate & Foam Roll", sets: 1, reps: "10 mins", restSeconds: 0, instruction: "Massage tight tissues, perform slow abdominal breathing." }]
      }
    );
  } else if (frequency === 3) {
    scheduleDays.push(
      {
        day: "Monday - Push Day (Upper Body)",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: isGym
          ? [pool.chest[0], pool.chest[1], pool.shoulders[0], pool.shoulders[1], pool.arms[1]]
          : [pool.chest[1], pool.chest[0], pool.chest[2], pool.core[1], pool.core[0]]
      },
      {
        day: "Wednesday - Pull Day (Back & Core)",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: isGym
          ? [pool.back[0], pool.back[1], pool.back[2], pool.arms[0], pool.core[0]]
          : [pool.back[0], pool.back[1], pool.back[2], pool.core[0], pool.cardio[1]]
      },
      {
        day: "Friday - Legs & Lower Body Focus",
        activityType: "Strength",
        durationMinutes: 50,
        exercises: isGym
          ? [pool.legs[0], pool.legs[1], pool.legs[2], pool.core[1]]
          : [pool.legs[0], pool.legs[1], pool.legs[2], pool.cardio[0]]
      },
      {
        day: "Tue, Thu, Weekend - Dynamic Recovery",
        activityType: "Rest",
        durationMinutes: 20,
        exercises: [{ name: "Gentle Flow Yoga", sets: 1, reps: "20 min", restSeconds: 0, instruction: "Focus on hamstring flexibility and shoulder mobility." }]
      }
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
          : [pool.chest[1], pool.back[0], pool.chest[2], pool.core[1]]
      },
      {
        day: "Tuesday - Lower Body (A) Quad Focus",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: isGym
          ? [pool.legs[0], pool.legs[2], pool.core[1]]
          : [pool.legs[0], pool.legs[1], pool.core[0]]
      },
      {
        day: "Thursday - Upper Body (B) Volume",
        activityType: "Strength",
        durationMinutes: 50,
        exercises: isGym
          ? [pool.chest[1], pool.back[1], pool.shoulders[1], pool.arms[1], pool.core[1]]
          : [pool.chest[0], pool.back[1], pool.cardio[1], pool.core[0]]
      },
      {
        day: "Friday - Lower Body (B) Posterior Focus",
        activityType: "Strength",
        durationMinutes: 45,
        exercises: isGym
          ? [pool.legs[1], pool.back[2], pool.core[0]]
          : [pool.legs[1], pool.legs[2], pool.cardio[0]]
      },
      {
        day: "Wednesday/Weekend - Active Restoration",
        activityType: "Rest",
        durationMinutes: 15,
        exercises: [{ name: "Deep Foam Rolling", sets: 1, reps: "15 min", restSeconds: 0, instruction: "Roll calves, glutes, lats, and thoracic spine." }]
      }
    );
  }

  // Generate customized nutrition plan based on goals & diet type
  let dietName = dietType.charAt(0).toUpperCase() + dietType.slice(1);
  let dailyCalories = 2000;
  let p = 140, c = 200, f = 65; // macros

  if (goal === "weight-loss") {
    dailyCalories = Math.round(assessment.weight * 22); // conservative deficit
    p = Math.round(assessment.weight * 2.0); // high protein to preserve mass
    c = Math.round((dailyCalories * 0.35) / 4);
    f = Math.round((dailyCalories * 0.25) / 9);
  } else if (goal === "muscle-gain" || goal === "strength") {
    dailyCalories = Math.round(assessment.weight * 32); // surplus
    p = Math.round(assessment.weight * 2.2);
    c = Math.round((dailyCalories * 0.45) / 4);
    f = Math.round((dailyCalories * 0.25) / 9);
  } else {
    dailyCalories = Math.round(assessment.weight * 26); // maintenance
    p = Math.round(assessment.weight * 1.8);
    c = Math.round((dailyCalories * 0.45) / 4);
    f = Math.round((dailyCalories * 0.25) / 9);
  }

  if (dietType === "keto") {
    p = Math.round((dailyCalories * 0.25) / 4);
    c = 25; // strict keto limits
    f = Math.round((dailyCalories * 0.70) / 9);
  } else if (dietType === "low-carb") {
    p = Math.round((dailyCalories * 0.35) / 4);
    c = 75;
    f = Math.round((dailyCalories * 0.45) / 9);
  }

  const guidelines = [
    `Consume ${p}g of protein daily to support muscle recovery and satiety.`,
    `Aim to consume your largest carbohydrate meal within 2 hours after your workout.`,
    `Maintain strict hydration by drinking at least 3 liters of fresh water daily.`
  ];

  if (dietType === "vegan") {
    guidelines.push("Supplement with B12 daily and combine pea/brown-rice protein sources for a complete amino profile.");
  }
  if (assessment.allergies) {
    guidelines.push(`Strictly verify all food labels to remain completely free of: ${assessment.allergies}.`);
  }

  const mealSuggestions = [
    {
      mealType: "Breakfast",
      name: dietType === "vegan" ? "High-Protein Scrambled Tofu" : dietType === "vegetarian" ? "Avocado Toast & Egg Whites" : "Savory Turkey Sausage & Egg White Scramble",
      description: "Scrambled with baby spinach, tomatoes, and organic olive oil.",
      calories: Math.round(dailyCalories * 0.25),
      proteinGrams: Math.round(p * 0.28)
    },
    {
      mealType: "Lunch",
      name: dietType === "vegan" || dietType === "vegetarian" ? "Baked Sesame Tofu Bowl" : "Zesty Herb Grilled Chicken Breast",
      description: "Served with cauliflower rice, sautéed bell peppers, and fresh greens.",
      calories: Math.round(dailyCalories * 0.30),
      proteinGrams: Math.round(p * 0.32)
    },
    {
      mealType: "Dinner",
      name: dietType === "vegan" ? "Crispy Tempeh Buddha Quinoa Bowl" : dietType === "vegetarian" ? "Lentil Pasta & Herb Marinara" : "Seared Atlantic Salmon Fillet",
      description: "Accompanied by dark steamed greens and lemon herb seasoning.",
      calories: Math.round(dailyCalories * 0.35),
      proteinGrams: Math.round(p * 0.35)
    },
    {
      mealType: "Snack",
      name: dietType === "vegan" ? "Soy Protein & Almond Shake" : "Whey Isolate Shake & Handful of Almonds",
      description: "Blended with cold unsweetened almond milk and optional stevia.",
      calories: Math.round(dailyCalories * 0.10),
      proteinGrams: Math.round(p * 0.15)
    }
  ];

  return {
    workoutPlan: {
      title,
      description,
      difficulty,
      weeklySchedule: scheduleDays,
      tips
    },
    nutritionPlan: {
      dietType: dietName,
      dailyCalories,
      macros: { protein: p, carbs: c, fat: f },
      guidelines,
      mealSuggestions
    }
  };
}
