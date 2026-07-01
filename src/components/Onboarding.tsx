import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { OnboardingInput, WorkoutPlan } from "../engine/schemas";
import { useSafeTimeout } from "../hooks/useSafeTimeout";
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
} from "lucide-react";
import Step0Profile from "./onboarding/Step0Profile";
import Step1Goal from "./onboarding/Step1Goal";
import Step2Setting from "./onboarding/Step2Setting";
import Step3Review from "./onboarding/Step3Review";

interface OnboardingProps {
  onComplete: (plan: WorkoutPlan, input: OnboardingInput) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  // F-H4: useSafeTimeout guards the fallback-plan-generation timeout and the
  // gym-scan timeout against firing after unmount.
  const safeTimeout = useSafeTimeout();

  // F-H11: Persist the onboarding form draft to localStorage so an accidental
  // refresh / tab-close / battery-death doesn't lose progress. The draft has
  // a 24-hour TTL; it's cleared on successful onComplete.
  const DRAFT_KEY = "fitlife:onboarding-draft";
  const DRAFT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  const DEFAULT_FORM: OnboardingInput = {
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
  };

  function loadDraft(): { form: OnboardingInput; step: number } | null {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { form: OnboardingInput; step: number; savedAt: number };
      if (Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
        localStorage.removeItem(DRAFT_KEY);
        return null;
      }
      return { form: parsed.form, step: parsed.step };
    } catch {
      return null;
    }
  }

  // F-H11: load the draft once via useState lazy initializer (sanctioned
  // pattern for impure initialization — runs once during the first render).
  const [draft] = useState(() => loadDraft());

  const [step, setStep] = useState<number>(draft?.step ?? 0);
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

  const [form, setForm] = useState<OnboardingInput>(draft?.form ?? DEFAULT_FORM);

  // F-H11: Save the draft whenever form or step changes.
  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ form, step, savedAt: Date.now() }),
      );
    } catch {
      // localStorage might be full or blocked (private mode) — silently skip.
    }
  }, [form, step]);

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

  const handleFieldChange = (
    field: keyof OnboardingInput,
    value: OnboardingInput[typeof field],
  ) => {
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
      safeTimeout(() => {
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
          // F-H11: clear the draft on successful completion.
          try { localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
        } catch {
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
      // F-H11: clear the draft on successful completion.
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
    } catch (err: unknown) {
      console.warn("Gemini generation failed or unconfigured:", err);
      const errMsg = err instanceof Error ? err.message : "";

      // A-13: When the server returns 400 because GEMINI_API_KEY is missing
      // (the most common failure in self-hosted deploys), auto-trigger the
      // local fallback plan generator so the user never has to click the
      // "Generate Local Calculated Plan Instead" button. Keep the loading
      // state visible — submitQuestionnaire(true) re-primes the message
      // interval — and surface a non-blocking toast so the user knows why
      // they're getting a local plan instead of an AI one.
      if (errMsg.includes("GEMINI_API_KEY is not configured")) {
        toast.info(
          "Using local plan generator",
          "AI coach not configured — falling back to local calculator.",
        );
        // submitQuestionnaire(true) resets error to null, restarts the
        // loading-message interval, and calls onComplete after ~2.5s.
        void submitQuestionnaire(true);
        return;
      }

      setError(
        errMsg ||
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
              {steps.map((s, i) => (
                <div
                  key={`step-dot-${i}-${s.title.slice(0, 12)}`}
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
                  <Step0Profile form={form} handleFieldChange={handleFieldChange} />
                )}

                {step === 1 && (
                  <Step1Goal form={form} handleFieldChange={handleFieldChange} />
                )}

                {step === 2 && (
                  <Step2Setting
                    form={form}
                    handleFieldChange={handleFieldChange}
                    locationSearch={locationSearch}
                    setLocationSearch={setLocationSearch}
                    isScanningGyms={isScanningGyms}
                    setIsScanningGyms={setIsScanningGyms}
                    safeTimeout={safeTimeout}
                  />
                )}

                {step === 3 && (
                  <Step3Review form={form} handleFieldChange={handleFieldChange} />
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
              disabled={step === 0}
              className={`flex items-center gap-1.5 px-5 py-3 rounded-none border text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:pointer-events-none ${
                step === 0
                  ? "border-[#1A1A1A]/5 text-[#1A1A1A]/30"
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
