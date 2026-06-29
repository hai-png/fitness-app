import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Assessment, PersonalPlan } from "../types";
import { generateLocalPlan } from "../data/fallbackPlan";
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
  ArrowRight
} from "lucide-react";

interface OnboardingProps {
  onComplete: (plan: PersonalPlan, assessment: Assessment) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMsg, setLoadingMsg] = useState<string>("Analyzing your physical baseline...");
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Assessment>({
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
    allergies: ""
  });

  const nextStep = () => {
    if (step === 0 && !form.name.trim()) {
      alert("Please enter your name to personalize your plans!");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleFieldChange = (field: keyof Assessment, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
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
      "Polishing final custom coaching dashboard..."
    ];

    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < msgs.length - 1) {
        msgIdx++;
        setLoadingMsg(msgs[msgIdx]);
      }
    }, 1200);

    if (forceFallback) {
      setTimeout(() => {
        clearInterval(interval);
        try {
          const plan = generateLocalPlan(form);
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

      clearInterval(interval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Generation endpoint returned an error");
      }

      const planData: PersonalPlan = await response.json();
      onComplete(planData, form);
    } catch (err: any) {
      console.warn("Gemini generation failed or unconfigured:", err);
      setError(
        err.message || 
        "The AI Coach could not connect. This is usually because your GEMINI_API_KEY is not configured yet."
      );
      setLoading(false);
    }
  };

  // Steps definitions
  const steps = [
    {
      title: "Tell Us About Yourself",
      subtitle: "Let's gather some basic metrics to construct your physical baseline.",
      icon: <User className="w-5 h-5 text-[#E63946]" />
    },
    {
      title: "Define Your Target",
      subtitle: "What is your primary fitness aspiration and weekly commitment?",
      icon: <Activity className="w-5 h-5 text-[#E63946]" />
    },
    {
      title: "Your Training Atmosphere",
      subtitle: "Where do you work out and what is your daily movement style?",
      icon: <Dumbbell className="w-5 h-5 text-[#E63946]" />
    },
    {
      title: "Nutritional Foundation",
      subtitle: "Your dietary habits and food sensitivities are vital.",
      icon: <Utensils className="w-5 h-5 text-[#E63946]" />
    }
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
                    <h4 className="text-sm font-serif font-bold text-[#E63946]">Coaching Server Offline</h4>
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
                          <option value="other">Non-binary</option>
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
                          onChange={(e) => handleFieldChange("weight", parseFloat(e.target.value) || 70)}
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
                          onChange={(e) => handleFieldChange("height", parseInt(e.target.value) || 170)}
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
                          { id: "weight-loss", title: "Fat Shred & Slimming", desc: "Burn calories, boost metabolism, lose body fat" },
                          { id: "muscle-gain", title: "Lean Muscle Hypertrophy", desc: "Build size, increase muscle mass, density" },
                          { id: "strength", title: "Pure Mechanical Strength", desc: "Lift heavier, improve power, core stabilization" },
                          { id: "endurance", title: "Cardio & Stamina Builder", desc: "Boost VO2 max, endurance, lung capacity" },
                          { id: "general", title: "Active Wellness & Tonus", desc: "Feel energetic, flexible, overall mobility" }
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
                            <h4 className="text-sm font-bold uppercase tracking-tight">{g.title}</h4>
                            <p className={`text-xs mt-1 leading-relaxed ${form.goal === g.id ? "text-white/70" : "text-[#1A1A1A]/50"}`}>{g.desc}</p>
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
                          { id: "home", title: "Home Gym (Calisthenics & Minimal Equipment)", desc: "Bodyweight focus, bands, chairs, dumbbells" },
                          { id: "gym", title: "Commercial Gym (Barbells, Cables & Machines)", desc: "Full power rack access, cables, leg machines" },
                          { id: "outdoor", title: "Outdoor Arena (Bars, Parks & Running)", desc: "Aerobic base, pullup bars, sprint loops" },
                          { id: "hybrid", title: "Hybrid Versatility", desc: "A blend of home bodyweight and commercial machinery" }
                        ].map((w) => (
                          <button
                            key={w.id}
                            id={`btn-pref-${w.id}`}
                            type="button"
                            onClick={() => handleFieldChange("workoutPreference", w.id)}
                            className={`w-full p-4 text-left rounded-none border transition-all duration-200 ${
                              form.workoutPreference === w.id
                                ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm"
                                : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#F9F8F6] hover:border-[#1A1A1A]/30"
                            }`}
                          >
                            <h4 className="text-sm font-bold uppercase tracking-tight">{w.title}</h4>
                            <p className={`text-xs mt-1 leading-relaxed ${form.workoutPreference === w.id ? "text-white/70" : "text-[#1A1A1A]/50"}`}>{w.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-2 uppercase tracking-wider mt-4">
                        Daily Baseline Activity Level
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "sedentary", label: "Sedentary", desc: "Desk job, few walks" },
                          { id: "light", label: "Lightly Active", desc: "1-2h light walk/day" },
                          { id: "moderate", label: "Moderately Active", desc: "Active stands, daily run" },
                          { id: "active", label: "Very Athlete Active", desc: "Labor work or heavy training" }
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
                            <h5 className="text-xs font-bold uppercase tracking-tight">{act.label}</h5>
                            <p className={`text-[10px] mt-1 leading-snug ${form.activityLevel === act.id ? "text-white/70" : "text-[#1A1A1A]/50"}`}>{act.desc}</p>
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
                          { id: "mediterranean", label: "Mediterranean" }
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
                        Our paid meal delivery service tab will badge or restrict recommended preps with these triggers.
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
