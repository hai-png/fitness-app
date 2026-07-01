import { MapPin, Search, Activity, Check, SlidersHorizontal } from "lucide-react";
import type { OnboardingStepProps } from "./Step0Profile";
import { NEARBY_GYMS, MACHINE_CATEGORIES } from "./data";

/**
 * Step 2 — Setting + atmosphere.
 *
 * Renders:
 *  - Workout setting preference (home / gym / outdoor / hybrid)
 *  - When "gym" is selected: a location search input + "Scan Area" button,
 *    an interactive SVG regional map with markers for each nearby gym, and a
 *    scrollable list of gym cards.
 *  - When a gym is selected: a machine category picker (Push / Pull / Legs /
 *    Arms) with per-machine toggle buttons and a "Select All / Clear" toolbar.
 *  - Daily baseline activity level (sedentary / light / moderate / active).
 *
 * Extracted verbatim from Onboarding.tsx (A-05 decomposition). No JSX, CSS
 * classes, ids, or business logic were modified — only the wrapping
 * `{step === 2 && (...)}` conditional was removed.
 *
 * Props beyond the shared OnboardingStepProps:
 *  - `locationSearch` / `setLocationSearch` — controlled text input for the
 *    location search field.
 *  - `isScanningGyms` / `setIsScanningGyms` — toggles the scan-in-progress
 *    placeholder UI inside the gym finder.
 *  - `safeTimeout` — the useSafeTimeout() return value from the parent; used
 *    to schedule the 600ms scan animation. Kept in the parent (not
 *    re-instantiated here) so the timer is auto-cleared on parent unmount,
 *    matching the original F-H4 fix.
 */
export interface Step2SettingProps extends OnboardingStepProps {
  locationSearch: string;
  setLocationSearch: (value: string) => void;
  isScanningGyms: boolean;
  setIsScanningGyms: (value: boolean) => void;
  safeTimeout: (fn: () => void, ms: number) => void;
}

export default function Step2Setting({
  form,
  handleFieldChange,
  locationSearch,
  setLocationSearch,
  isScanningGyms,
  setIsScanningGyms,
  safeTimeout,
}: Step2SettingProps) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="btn-pref-home"
          className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-2 uppercase tracking-wider"
        >
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
                safeTimeout(() => setIsScanningGyms(false), 600);
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
        <label
          htmlFor="btn-act-sedentary"
          className="block text-[10px] font-bold text-[#1A1A1A]/60 mb-2 uppercase tracking-wider mt-4"
        >
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
  );
}
