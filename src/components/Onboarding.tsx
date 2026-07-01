import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { OnboardingInput, WorkoutPlan } from "../engine";
import { toast } from "./Toast";
import { generateWorkoutPlan } from "../data/planGenerator";
import {
  Activity,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  User,
  Dumbbell,
  Utensils,
  ShieldAlert,
  Compass,
  ArrowRight,
  MapPin,
  Search,
  Check,
  Map,
  SlidersHorizontal,
} from "lucide-react";

interface GymOption {
  id: string;
  name: string;
  distance: string;
  rating: number;
  address: string;
  description: string;
  image: string;
  defaultMachines: string[];
  coordinates: { x: number; y: number };
}

const NEARBY_GYMS: GymOption[] = [
  {
    id: "gym-1",
    name: "Titan Iron Academy",
    distance: "0.4 miles away",
    rating: 4.9,
    address: "244 Heavy Metal Lane, District 4",
    description:
      "Hardcore powerlifting & bodybuilding sanctuary. Famous for its pristine equipment.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&auto=format&fit=crop&q=80",
    defaultMachines: [
      "Smith Machine",
      "Leg Press Machine",
      "Hack Squat",
      "Seated Row Machine",
      "Lat Pulldown",
      "Cable Crossover",
      "Pec Deck / Rear Delt Fly",
    ],
    coordinates: { x: 35, y: 40 },
  },
  {
    id: "gym-2",
    name: "Pulse Athletic Club",
    distance: "1.2 miles away",
    rating: 4.7,
    address: "902 Wellness Blvd, Aether Plaza",
    description:
      "Luxury modern athletic center focusing on functional performance and high-end selectors.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&auto=format&fit=crop&q=80",
    defaultMachines: [
      "Smith Machine",
      "Cable Crossover",
      "Lat Pulldown",
      "Leg Extension Machine",
      "Lying Leg Curl Machine",
      "Chest Press Machine",
    ],
    coordinates: { x: 75, y: 25 },
  },
  {
    id: "gym-3",
    name: "Metro Flex Gym",
    distance: "2.1 miles away",
    rating: 4.8,
    address: "410 Barbells Way, Industrial Sector",
    description:
      "No-nonsense bodybuilding temple equipped with vintage and plate-loaded heavy machinery.",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80",
    defaultMachines: [
      "Hack Squat",
      "Smith Machine",
      "Leg Press Machine",
      "Lying Leg Curl Machine",
      "Seated Row Machine",
      "Pec Deck / Rear Delt Fly",
    ],
    coordinates: { x: 20, y: 80 },
  },
  {
    id: "gym-4",
    name: "Aura Fit Studio",
    distance: "3.5 miles away",
    rating: 4.6,
    address: "12 Boutique Circle, Green Hills",
    description:
      "High-end coaching studio specializing in strength, aesthetics, and high-tech conditioning.",
    image:
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=300&auto=format&fit=crop&q=80",
    defaultMachines: ["Cable Crossover", "Smith Machine", "Lat Pulldown", "Leg Extension Machine"],
    coordinates: { x: 80, y: 70 },
  },
];

const MACHINE_CATEGORIES = {
  Push: [
    { name: "Smith Machine", desc: "For secure heavy chest presses & controlled squats" },
    { name: "Chest Press Machine", desc: "Isolates the pectoral muscles under stable load" },
    {
      name: "Pec Deck / Rear Delt Fly",
      desc: "For safe chest flyes and posterior deltoid training",
    },
  ],
  Pull: [
    { name: "Lat Pulldown", desc: "Prime compound vertical pull for back widening" },
    { name: "Seated Row Machine", desc: "Isolates the latissimus dorsi & middle back muscles" },
    {
      name: "Cable Crossover",
      desc: "Provides constant cable tension for chest and arm exercises",
    },
  ],
  Legs: [
    { name: "Leg Press Machine", desc: "Heavy quadriceps and glute compound loading" },
    { name: "Hack Squat", desc: "Decompresses spine while building massive quadricep force" },
    { name: "Leg Extension Machine", desc: "Isolated single-joint quadricep builder" },
    { name: "Lying Leg Curl Machine", desc: "Isolated single-joint hamstring builder" },
  ],
  Arms: [{ name: "Preacher Curl Bench", desc: "Pins the biceps for ultimate peak contractions" }],
};

interface OnboardingProps {
  onComplete: (plan: WorkoutPlan, input: OnboardingInput) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMsg, setLoadingMsg] = useState<string>("Analyzing your physical baseline...");
  const [error, setError] = useState<string | null>(null);

  // Ref to hold the loading-message interval ID so it can be cleared on
  // unmount (previously the interval was created inside an event handler with
  // no cleanup, causing "state update on unmounted component" warnings if the
  // user navigated away mid-loading).
  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
    };
  }, []);

  const [locationSearch, setLocationSearch] = useState<string>("Downtown Aether");
  const [isScanningGyms, setIsScanningGyms] = useState<boolean>(false);

  const [form, setForm] = useState<OnboardingInput>({
    name: "",
    age: 26,
    gender: "male",
    weight: 75,
    height: 175,
    goal: "weight-loss",
    activityLevel: "moderate",
    workoutPreference: "hybrid",
    frequency: 3,
    dietType: "anything",
    allergies: "",
    selectedGymName: "",
    availableMachines: [],
  });

  const nextStep = () => {
    if (step === 0 && !form.name.trim()) {
      toast.warning("Name required", "Please enter your name to personalize your plans.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleFieldChange = (field: keyof OnboardingInput, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Run the full-stack plan generation
  const submitQuestionnaire = async (forceFallback: boolean = false) => {
    setLoading(true);
    setError(null);

    // Sequence of loading states to feel incredibly immersive
    const msgs = [
      "Analyzing metabolic rate and physiological bio-markers...",
      "Engineering optimal compound workout splits...",
      "Matching macronutrient distributions with dietary targets...",
      "Synthesizing high-protein culinary recommendations...",
      "Polishing final custom coaching dashboard...",
    ];

    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < msgs.length - 1) {
        msgIdx++;
        setLoadingMsg(msgs[msgIdx]);
      }
    }, 1200);
    loadingIntervalRef.current = interval;

    if (forceFallback) {
      setTimeout(() => {
        if (loadingIntervalRef.current) {
          clearInterval(loadingIntervalRef.current);
          loadingIntervalRef.current = null;
        }
        try {
          // Generate the workout plan locally. The nutrition plan is computed
          // by the engine (runAssessment + buildNutritionPlan) via the useEngine
          // hook — no need to generate it here.
          const plan = generateWorkoutPlan(form);
          console.info("[planGenerator] Workout plan generated.", {
            title: plan.title,
            days: plan.weeklySchedule.length,
            durationWeeks: plan.durationWeeks,
          });
          onComplete(plan, form);
        } catch (e) {
          setError("Failed to generate fallback plan.");
          setLoading(false);
        }
      }, 2500);
      return;
    }

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Generation endpoint returned an error");
      }

      const planData: WorkoutPlan = await response.json();
      onComplete(planData, form);
    } catch (err: any) {
      console.warn("Gemini generation failed or unconfigured:", err);
      setError(
        err.message ||
          "The AI Coach could not connect. This is usually because your GEMINI_API_KEY is not configured yet.",
      );
      setLoading(false);
    }
  };

  // Steps definitions
  const steps = [
    {
      title: "Tell Us About Yourself",
      subtitle: "Let's gather some basic metrics to construct your physical baseline.",
      icon: <User className="w-5 h-5 text-[#E63946]" />,
    },
    {
      title: "Define Your Target",
      subtitle: "What is your primary fitness aspiration and weekly commitment?",
      icon: <Activity className="w-5 h-5 text-[#E63946]" />,
    },
    {
      title: "Your Training Atmosphere",
      subtitle: "Where do you work out and what is your daily movement style?",
      icon: <Dumbbell className="w-5 h-5 text-[#E63946]" />,
    },
    {
      title: "Nutritional Foundation",
      subtitle: "Your dietary habits and food sensitivities are vital.",
      icon: <Utensils className="w-5 h-5 text-[#E63946]" />,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6] text-[#1A1A1A] overflow-y-auto">
      {/* Loading Screen */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center bg-[#F9F8F6]">
          <div className="relative mb-8">
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-full bg-[#E63946]/10 animate-ping" />
            <div className="relative flex items-center justify-center w-20 h-20 bg-white border border-[#1A1A1A]/10 rounded-full shadow-sm">
              <Sparkles className="w-8 h-8 text-[#E63946] animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-serif font-black italic tracking-tight text-[#1A1A1A] mb-2">
            Formulating Your Plan
          </h2>
          <p className="text-[#1A1A1A]/60 text-xs font-serif italic max-w-xs animate-pulse">
            {loadingMsg}
          </p>
          <div className="w-48 h-1 bg-[#1A1A1A]/5 rounded-none overflow-hidden mt-6">
            <div className="h-full bg-[#1A1A1A] animate-[loadingBar_4s_ease-out_infinite]" />
          </div>
        </div>
      )}

      {/* Main Form */}
      {!loading && (
        <div className="flex flex-col flex-grow p-5 md:p-6 justify-between max-w-md mx-auto w-full">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1A1A1A]/5 border border-[#1A1A1A]/10">
                <Compass className="w-4 h-4 text-[#1A1A1A]" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/60">
                AETHER PERSONALIZED PLANNER
              </span>
            </div>

            {/* Steps Progress dots */}
            <div className="flex items-center gap-1.5 mb-6">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-none transition-all duration-300 ${
                    i === step
                      ? "w-8 bg-[#1A1A1A]"
                      : i < step
                        ? "w-4 bg-[#1A1A1A]/40"
                        : "w-2 bg-[#1A1A1A]/10"
                  }`}
                />
              ))}
            </div>

            <h1 className="text-3xl font-serif font-black italic tracking-tight text-[#1A1A1A] flex items-center gap-2 mb-2">
              {steps[step].title}
            </h1>
            <p className="text-[#1A1A1A]/60 text-xs mt-1.5 mb-6 font-serif italic leading-relaxed">
              {steps[step].subtitle}
            </p>

            {/* Error UI */}
            {error && (
              <div className="p-4 mb-6 rounded-none bg-white border border-[#E63946] text-[#1A1A1A]">
                <div className="flex items-start gap-3 mb-3">
                  <ShieldAlert className="w-5 h-5 text-[#E63946] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-serif font-bold text-[#E63946]">
                      Coaching Server Offline
                    </h4>
                    <p className="text-xs text-[#1A1A1A]/60 mt-1 font-serif italic">{error}</p>
                  </div>
                </div>
                <button
                  id="btn-use-fallback"
                  onClick={() => submitQuestionnaire(true)}
                  className="w-full py-3 bg-[#E63946] hover:bg-[#d62828] text-white font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Local Calculated Plan Instead
                </button>
              </div>
            )}

            {/* Form Steps */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider">
                        Your Name
                      </label>
                      <input
                        id="input-name"
                        type="text"
                        placeholder="e.g. John Doe"
                        value={form.name}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:border-[#1A1A1A] focus:outline-none focus:ring-0"
                        maxLength={40}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider">
                          Age
                        </label>
                        <input
                          id="input-age"
                          type="number"
                          value={form.age}
                          min={14}
                          max={100}
                          onChange={(e) => handleFieldChange("age", parseInt(e.target.value) || 25)}
                          className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:border-[#1A1A1A] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider">
                          Gender
                        </label>
                        <select
                          id="select-gender"
                          value={form.gender}
                          onChange={(e) => handleFieldChange("gender", e.target.value)}
                          className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:border-[#1A1A1A] focus:outline-none"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="non-binary">Non-binary</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider">
                          Weight (kg)
                        </label>
                        <input
                          id="input-weight"
                          type="number"
                          value={form.weight}
                          min={30}
                          max={250}
                          onChange={(e) =>
                            handleFieldChange("weight", parseFloat(e.target.value) || 70)
                          }
                          className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:border-[#1A1A1A] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider">
                          Height (cm)
                        </label>
                        <input
                          id="input-height"
                          type="number"
                          value={form.height}
                          min={100}
                          max={250}
                          onChange={(e) =>
                            handleFieldChange("height", parseInt(e.target.value) || 170)
                          }
                          className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:border-[#1A1A1A] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-2 uppercase tracking-wider">
                        Primary Aspiration
                      </label>
                      <div className="grid grid-cols-1 gap-2.5">
                        {[
                          {
                            id: "weight-loss",
                            title: "Fat Shred & Slimming",
                            desc: "Burn calories, boost metabolism, lose body fat",
                          },
                          {
                            id: "muscle-gain",
                            title: "Lean Muscle Hypertrophy",
                            desc: "Build size, increase muscle mass, density",
                          },
                          {
                            id: "strength",
                            title: "Pure Mechanical Strength",
                            desc: "Lift heavier, improve power, core stabilization",
                          },
                          {
                            id: "endurance",
                            title: "Cardio & Stamina Builder",
                            desc: "Boost VO2 max, endurance, lung capacity",
                          },
                          {
                            id: "general",
                            title: "Active Wellness & Tonus",
                            desc: "Feel energetic, flexible, overall mobility",
                          },
                        ].map((g) => (
                          <button
                            key={g.id}
                            id={`btn-goal-${g.id}`}
                            type="button"
                            onClick={() => handleFieldChange("goal", g.id)}
                            className={`w-full p-4 text-left rounded-none border transition-all duration-200 ${
                              form.goal === g.id
                                ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm"
                                : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#F9F8F6] hover:border-[#1A1A1A]/30"
                            }`}
                          >
                            <h4 className="text-sm font-bold uppercase tracking-tight">
                              {g.title}
                            </h4>
                            <p
                              className={`text-xs mt-1 leading-relaxed ${form.goal === g.id ? "text-white/70" : "text-[#1A1A1A]/50"}`}
                            >
                              {g.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-2 uppercase tracking-wider mt-4">
                        Weekly Workout Frequency
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            id={`btn-freq-${num}`}
                            type="button"
                            onClick={() => handleFieldChange("frequency", num)}
                            className={`py-3 text-center rounded-none border font-bold text-sm transition-all uppercase tracking-wider ${
                              form.frequency === num
                                ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                                : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A] hover:border-[#1A1A1A]/30"
                            }`}
                          >
                            {num} Days
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-2 uppercase tracking-wider">
                        Workout Setting Preference
                      </label>
                      <div className="grid grid-cols-1 gap-2.5">
                        {[
                          {
                            id: "home",
                            title: "Home Gym (Calisthenics & Minimal Equipment)",
                            desc: "Bodyweight focus, bands, chairs, dumbbells",
                          },
                          {
                            id: "gym",
                            title: "Commercial Gym (Barbells, Cables & Machines)",
                            desc: "Full power rack access, cables, leg machines",
                          },
                          {
                            id: "outdoor",
                            title: "Outdoor Arena (Bars, Parks & Running)",
                            desc: "Aerobic base, pullup bars, sprint loops",
                          },
                          {
                            id: "hybrid",
                            title: "Hybrid Versatility",
                            desc: "A blend of home bodyweight and commercial machinery",
                          },
                        ].map((w) => (
                          <button
                            key={w.id}
                            id={`btn-pref-${w.id}`}
                            type="button"
                            onClick={() => {
                              handleFieldChange("workoutPreference", w.id);
                              if (w.id !== "gym") {
                                handleFieldChange("selectedGymName", "");
                                handleFieldChange("availableMachines", []);
                              } else if (!form.selectedGymName) {
                                // Default select the first gym
                                handleFieldChange("selectedGymName", NEARBY_GYMS[0].name);
                                handleFieldChange(
                                  "availableMachines",
                                  NEARBY_GYMS[0].defaultMachines,
                                );
                              }
                            }}
                            className={`w-full p-4 text-left rounded-none border transition-all duration-200 ${
                              form.workoutPreference === w.id
                                ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm"
                                : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#F9F8F6] hover:border-[#1A1A1A]/30"
                            }`}
                          >
                            <h4 className="text-sm font-bold uppercase tracking-tight">
                              {w.title}
                            </h4>
                            <p
                              className={`text-xs mt-1 leading-relaxed ${form.workoutPreference === w.id ? "text-white/70" : "text-[#1A1A1A]/50"}`}
                            >
                              {w.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {form.workoutPreference === "gym" && (
                      <div className="mt-6 border-t border-[#1A1A1A]/10 pt-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-[#E63946]" />
                          <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">
                            Nearby Gym Finder & Logger
                          </h4>
                        </div>
                        <p className="text-[11px] text-[#1A1A1A]/60 font-serif italic mb-3">
                          Select a nearby commercial facility or enter your location to
                          automatically load its machine list and fine-tune your workouts.
                        </p>

                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1A1A1A]/40" />
                            <input
                              id="input-location-search"
                              type="text"
                              value={locationSearch}
                              onChange={(e) => setLocationSearch(e.target.value)}
                              placeholder="City, state, or postal code..."
                              className="w-full bg-white border border-[#1A1A1A]/15 rounded-none pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#1A1A1A] text-[#1A1A1A]"
                            />
                          </div>
                          <button
                            id="btn-scan-gyms"
                            type="button"
                            onClick={() => {
                              setIsScanningGyms(true);
                              setTimeout(() => setIsScanningGyms(false), 600);
                            }}
                            className="bg-[#1A1A1A] hover:opacity-90 text-white font-bold uppercase tracking-widest text-[9px] px-3 py-2 rounded-none transition-all"
                          >
                            Scan Area
                          </button>
                        </div>

                        {isScanningGyms ? (
                          <div className="bg-[#1A1A1A]/5 border border-[#1A1A1A]/5 p-4 text-center text-xs font-serif italic animate-pulse text-[#1A1A1A]/70 flex items-center justify-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-[#E63946] animate-spin" />
                            Searching satellite coordinates for local fitness hubs...
                          </div>
                        ) : (
                          <>
                            {/* SVG Interactive Map */}
                            <div className="border border-[#1A1A1A]/10 bg-white p-1">
                              <div className="text-[8px] uppercase font-bold text-[#1A1A1A]/50 tracking-wider p-1 flex items-center justify-between">
                                <span>Interactive Regional Map</span>
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-[#E63946] rounded-full animate-ping" />
                                  GPS Signal Active
                                </span>
                              </div>
                              <svg
                                viewBox="0 0 100 100"
                                className="w-full h-32 bg-[#F9F8F6] border-t border-[#1A1A1A]/5 relative overflow-hidden"
                              >
                                <line
                                  x1="10"
                                  y1="0"
                                  x2="10"
                                  y2="100"
                                  stroke="rgba(26,26,26,0.03)"
                                  strokeWidth="0.5"
                                />
                                <line
                                  x1="30"
                                  y1="0"
                                  x2="30"
                                  y2="100"
                                  stroke="rgba(26,26,26,0.03)"
                                  strokeWidth="0.5"
                                />
                                <line
                                  x1="50"
                                  y1="0"
                                  x2="50"
                                  y2="100"
                                  stroke="rgba(26,26,26,0.03)"
                                  strokeWidth="0.5"
                                />
                                <line
                                  x1="70"
                                  y1="0"
                                  x2="70"
                                  y2="100"
                                  stroke="rgba(26,26,26,0.03)"
                                  strokeWidth="0.5"
                                />
                                <line
                                  x1="90"
                                  y1="0"
                                  x2="90"
                                  y2="100"
                                  stroke="rgba(26,26,26,0.03)"
                                  strokeWidth="0.5"
                                />

                                <line
                                  x1="0"
                                  y1="10"
                                  x2="100"
                                  y2="10"
                                  stroke="rgba(26,26,26,0.03)"
                                  strokeWidth="0.5"
                                />
                                <line
                                  x1="0"
                                  y1="30"
                                  x2="100"
                                  y2="30"
                                  stroke="rgba(26,26,26,0.03)"
                                  strokeWidth="0.5"
                                />
                                <line
                                  x1="0"
                                  y1="50"
                                  x2="100"
                                  y2="50"
                                  stroke="rgba(26,26,26,0.03)"
                                  strokeWidth="0.5"
                                />
                                <line
                                  x1="0"
                                  y1="70"
                                  x2="100"
                                  y2="70"
                                  stroke="rgba(26,26,26,0.03)"
                                  strokeWidth="0.5"
                                />
                                <line
                                  x1="0"
                                  y1="90"
                                  x2="100"
                                  y2="90"
                                  stroke="rgba(26,26,26,0.03)"
                                  strokeWidth="0.5"
                                />

                                <path
                                  d="M 0 55 Q 55 25 100 55"
                                  fill="none"
                                  stroke="rgba(26,26,26,0.08)"
                                  strokeWidth="3"
                                />
                                <path
                                  d="M 55 0 Q 25 55 55 100"
                                  fill="none"
                                  stroke="rgba(26,26,26,0.08)"
                                  strokeWidth="3"
                                />
                                <path
                                  d="M 5 5 Q 35 35 95 95"
                                  fill="none"
                                  stroke="rgba(26,26,26,0.04)"
                                  strokeWidth="1.5"
                                />

                                <circle cx="50" cy="50" r="3.5" fill="#E63946" />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="8"
                                  fill="none"
                                  stroke="#E63946"
                                  strokeWidth="0.5"
                                  strokeDasharray="1,1"
                                />
                                <text
                                  x="50"
                                  y="44"
                                  textAnchor="middle"
                                  className="text-[5px] font-sans font-bold fill-[#E63946] uppercase"
                                >
                                  You
                                </text>

                                {NEARBY_GYMS.map((g) => {
                                  const isSelected = form.selectedGymName === g.name;
                                  return (
                                    <g
                                      key={g.id}
                                      className="cursor-pointer"
                                      onClick={() => {
                                        handleFieldChange("selectedGymName", g.name);
                                        handleFieldChange("availableMachines", g.defaultMachines);
                                      }}
                                    >
                                      {isSelected && (
                                        <circle
                                          cx={g.coordinates.x}
                                          cy={g.coordinates.y}
                                          r="7"
                                          fill="#1A1A1A"
                                          className="animate-ping opacity-25"
                                        />
                                      )}
                                      <circle
                                        cx={g.coordinates.x}
                                        cy={g.coordinates.y}
                                        r={isSelected ? "4" : "3"}
                                        fill={isSelected ? "#1A1A1A" : "#1A1A1A"}
                                        fillOpacity={isSelected ? "1" : "0.5"}
                                      />
                                      <circle
                                        cx={g.coordinates.x}
                                        cy={g.coordinates.y}
                                        r={isSelected ? "7" : "5"}
                                        fill="none"
                                        stroke={isSelected ? "#1A1A1A" : "#1A1A1A"}
                                        strokeWidth="0.5"
                                        strokeOpacity={isSelected ? "1" : "0.3"}
                                      />
                                      <text
                                        x={g.coordinates.x}
                                        y={g.coordinates.y - (isSelected ? 7 : 5)}
                                        textAnchor="middle"
                                        className={`text-[4px] font-bold ${isSelected ? "fill-[#1A1A1A] font-black" : "fill-[#1A1A1A]/40"} uppercase`}
                                      >
                                        {g.name.split(" ")[0]}
                                      </text>
                                    </g>
                                  );
                                })}
                              </svg>
                            </div>

                            {/* Gym Cards */}
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                              {NEARBY_GYMS.map((g) => {
                                const isSelected = form.selectedGymName === g.name;
                                return (
                                  <button
                                    key={g.id}
                                    id={`btn-select-gym-${g.id}`}
                                    type="button"
                                    onClick={() => {
                                      handleFieldChange("selectedGymName", g.name);
                                      handleFieldChange("availableMachines", g.defaultMachines);
                                    }}
                                    className={`w-full p-2.5 text-left rounded-none border transition-all text-xs flex gap-2.5 items-center ${
                                      isSelected
                                        ? "bg-white border-[#E63946] shadow-sm"
                                        : "bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30"
                                    }`}
                                  >
                                    <div className="w-12 h-12 flex-shrink-0 bg-gray-200 overflow-hidden relative border border-[#1A1A1A]/10">
                                      <img
                                        loading="lazy"
                                        src={g.image}
                                        alt={g.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                      <div className="flex justify-between items-start">
                                        <h5 className="font-bold uppercase text-[11px] text-[#1A1A1A] truncate">
                                          {g.name}
                                        </h5>
                                        <span className="text-[8px] font-bold bg-[#1A1A1A]/5 text-[#1A1A1A]/60 px-1 py-0.5 rounded-none shrink-0">
                                          {g.distance}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-[#1A1A1A]/50 line-clamp-1 mt-0.5 font-serif italic">
                                        {g.address}
                                      </p>
                                      <p className="text-[9px] text-[#1A1A1A]/70 line-clamp-1 mt-0.5 leading-snug">
                                        {g.description}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}

                        {/* Machine Checkboxes */}
                        {form.selectedGymName && (
                          <div className="bg-white border border-[#1A1A1A]/10 p-3 mt-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-[#1A1A1A]/5 pb-2">
                              <div>
                                <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">
                                  Log {form.selectedGymName} Machines
                                </h5>
                                <p className="text-[9px] text-[#1A1A1A]/50 font-serif italic">
                                  Toggle machines available at your branch.
                                </p>
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const all = Object.values(MACHINE_CATEGORIES).flatMap((c) =>
                                      c.map((m) => m.name),
                                    );
                                    handleFieldChange("availableMachines", all);
                                  }}
                                  className="text-[8px] font-bold uppercase tracking-wider text-[#E63946] hover:underline"
                                >
                                  Select All
                                </button>
                                <span className="text-[#1A1A1A]/20 text-[8px]">•</span>
                                <button
                                  type="button"
                                  onClick={() => handleFieldChange("availableMachines", [])}
                                  className="text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 hover:underline"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>

                            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                              {Object.entries(MACHINE_CATEGORIES).map(([category, machines]) => (
                                <div key={category} className="space-y-1.5">
                                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/40 bg-[#1A1A1A]/5 px-1.5 py-0.5 rounded-none inline-block">
                                    {category} Machines
                                  </span>
                                  <div className="grid grid-cols-1 gap-1.5">
                                    {machines.map((m) => {
                                      const isChecked = (form.availableMachines || []).includes(
                                        m.name,
                                      );
                                      return (
                                        <button
                                          key={m.name}
                                          type="button"
                                          onClick={() => {
                                            const current = form.availableMachines || [];
                                            const next = isChecked
                                              ? current.filter((x) => x !== m.name)
                                              : [...current, m.name];
                                            handleFieldChange("availableMachines", next);
                                          }}
                                          className={`w-full p-2 rounded-none border text-left transition-all flex items-center justify-between text-[11px] ${
                                            isChecked
                                              ? "bg-[#1A1A1A]/5 border-[#1A1A1A] text-[#1A1A1A]"
                                              : "bg-white border-[#1A1A1A]/5 text-[#1A1A1A]/60 hover:border-[#1A1A1A]/15"
                                          }`}
                                        >
                                          <div>
                                            <span className="font-bold uppercase tracking-wide text-[10px]">
                                              {m.name}
                                            </span>
                                            <p className="text-[9px] text-[#1A1A1A]/50 font-serif italic mt-0.5">
                                              {m.desc}
                                            </p>
                                          </div>
                                          <div
                                            className={`w-4 h-4 rounded-none border flex items-center justify-center shrink-0 ${
                                              isChecked
                                                ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                                                : "border-[#1A1A1A]/25"
                                            }`}
                                          >
                                            {isChecked && (
                                              <Check className="w-3 h-3 text-white stroke-[3px]" />
                                            )}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="bg-[#E63946]/5 border border-[#E63946]/10 p-2.5 text-[10px] text-[#1A1A1A]/80 font-serif italic flex items-center gap-2">
                              <SlidersHorizontal className="w-3.5 h-3.5 text-[#E63946]" />
                              <span>
                                {form.availableMachines && form.availableMachines.length > 0 ? (
                                  <>
                                    <strong>{form.availableMachines.length} machines</strong>{" "}
                                    logged. Workout recommendations will be dynamically tuned.
                                  </>
                                ) : (
                                  <>
                                    No machines logged. Workouts will default to standard barbell &
                                    dumbbell exercises.
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-2 uppercase tracking-wider mt-4">
                        Daily Baseline Activity Level
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "sedentary", label: "Sedentary", desc: "Desk job, few walks" },
                          { id: "light", label: "Lightly Active", desc: "1-2h light walk/day" },
                          {
                            id: "moderate",
                            label: "Moderately Active",
                            desc: "Active stands, daily run",
                          },
                          {
                            id: "active",
                            label: "Very Athlete Active",
                            desc: "Labor work or heavy training",
                          },
                        ].map((act) => (
                          <button
                            key={act.id}
                            id={`btn-act-${act.id}`}
                            type="button"
                            onClick={() => handleFieldChange("activityLevel", act.id)}
                            className={`p-4 text-left rounded-none border transition-all duration-200 ${
                              form.activityLevel === act.id
                                ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm"
                                : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#F9F8F6] hover:border-[#1A1A1A]/30"
                            }`}
                          >
                            <h5 className="text-xs font-bold uppercase tracking-tight">
                              {act.label}
                            </h5>
                            <p
                              className={`text-[10px] mt-1 leading-snug ${form.activityLevel === act.id ? "text-white/70" : "text-[#1A1A1A]/50"}`}
                            >
                              {act.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-2 uppercase tracking-wider">
                        Dietary Category
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "anything", label: "Anything / Balanced" },
                          { id: "vegetarian", label: "Vegetarian" },
                          { id: "vegan", label: "Vegan" },
                          { id: "keto", label: "Ketogenic (Low Carb)" },
                          { id: "low-carb", label: "Low Carb (Moderate)" },
                          { id: "gluten-free", label: "Gluten-Free" },
                          { id: "mediterranean", label: "Mediterranean" },
                        ].map((diet) => (
                          <button
                            key={diet.id}
                            id={`btn-diet-${diet.id}`}
                            type="button"
                            onClick={() => handleFieldChange("dietType", diet.id)}
                            className={`p-3 text-center rounded-none border text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                              form.dietType === diet.id
                                ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm"
                                : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#F9F8F6] hover:border-[#1A1A1A]/30"
                            }`}
                          >
                            {diet.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-1.5 uppercase tracking-wider mt-4">
                        Allergies & Food Sensitive Restrictions
                      </label>
                      <input
                        id="input-allergies"
                        type="text"
                        placeholder="e.g. Peanuts, Dairy, Seafood (or leave blank)"
                        value={form.allergies}
                        onChange={(e) => handleFieldChange("allergies", e.target.value)}
                        className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-4 py-3 text-[#1A1A1A] text-sm focus:border-[#1A1A1A] focus:outline-none focus:ring-0"
                      />
                      <p className="text-[10px] text-[#1A1A1A]/50 mt-2 font-serif italic leading-relaxed">
                        Our paid meal delivery service tab will badge or restrict recommended preps
                        with these triggers.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between gap-4 border-t border-[#1A1A1A]/10 pt-5 mt-6">
            <button
              id="btn-back"
              type="button"
              onClick={prevStep}
              className={`flex items-center gap-1.5 px-5 py-3 rounded-none border text-xs font-bold uppercase tracking-widest transition-all ${
                step === 0
                  ? "opacity-30 pointer-events-none border-[#1A1A1A]/5 text-[#1A1A1A]/30"
                  : "bg-white border-[#1A1A1A]/15 text-[#1A1A1A] hover:bg-[#F9F8F6]"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {step < steps.length - 1 ? (
              <button
                id="btn-next"
                type="button"
                onClick={nextStep}
                className="flex items-center gap-1.5 bg-[#1A1A1A] hover:opacity-90 text-white font-bold uppercase tracking-widest px-6 py-3 rounded-none text-xs transition-all shadow-sm"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-generate-plan"
                type="button"
                onClick={() => submitQuestionnaire(false)}
                className="flex items-center gap-2 bg-[#E63946] hover:bg-[#d62828] text-white font-bold uppercase tracking-widest px-6 py-3.5 rounded-none text-xs transition-all shadow-md"
              >
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                Build My Plans
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
