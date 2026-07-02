/**
 * StepGymSelection
 *
 * Gym finder + machine logger — rendered conditionally inside StepWorkoutPreference
 * when the user has chosen the "gym" workout preference. Owns the location-search
 * input and the "scanning" pulse state (these were parent-owned in the original
 * Onboarding.tsx; moving them here changes only state ownership, not rendered
 * output — both states were consumed solely by this section).
 *
 * Composed of three sub-views:
 *  - Location search input + "Scan Area" button (toggles a 600ms scanning pulse).
 *  - Either the scanning placeholder OR (<GymMap> + the gym card list).
 *  - <MachinePicker> (only when a gym has been selected).
 */

import { useState } from "react";
import { MapPin, Search, Activity } from "lucide-react";
import type { OnboardingInput } from "../../engine";
import { NEARBY_GYMS } from "./gymData";
import GymMap from "./GymMap";
import MachinePicker from "./MachinePicker";

interface StepGymSelectionProps {
  /** Current onboarding form state (read for selectedGymName + availableMachines). */
  form: OnboardingInput;
  /** Update a single form field. Mirrors the parent's `handleFieldChange`. */
  onFieldChange: (field: keyof OnboardingInput, value: string | number | string[]) => void;
}

export default function StepGymSelection({ form, onFieldChange }: StepGymSelectionProps) {
  const [locationSearch, setLocationSearch] = useState<string>("Downtown Aether");
  const [isScanningGyms, setIsScanningGyms] = useState<boolean>(false);

  /** Shared click handler for both GymMap pins and the gym card buttons. */
  const handleSelectGym = (name: string, defaultMachines: string[]) => {
    onFieldChange("selectedGymName", name);
    onFieldChange("availableMachines", defaultMachines);
  };

  return (
    <div className="mt-6 border-t border-[#1A1A1A]/10 pt-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-[#E63946]" />
        <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">
          Nearby Gym Finder & Logger
        </h4>
      </div>
      <p className="text-[11px] text-[#1A1A1A]/60 font-serif italic mb-3">
        Select a nearby commercial facility or enter your location to automatically load its machine
        list and fine-tune your workouts.
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
          <GymMap selectedGymName={form.selectedGymName ?? ""} onSelectGym={handleSelectGym} />

          {/* Gym Cards */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {NEARBY_GYMS.map((g) => {
              const isSelected = form.selectedGymName === g.name;
              return (
                <button
                  key={g.id}
                  id={`btn-select-gym-${g.id}`}
                  type="button"
                  onClick={() => handleSelectGym(g.name, g.defaultMachines)}
                  className={`w-full p-2.5 text-left rounded-none border transition-all text-xs flex gap-2.5 items-center ${
                    isSelected
                      ? "bg-white border-[#E63946] shadow-sm"
                      : "bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30"
                  }`}
                >
                  <div className="w-12 h-12 flex-shrink-0 bg-gray-200 overflow-hidden relative border border-[#1A1A1A]/10">
                    <img
                      loading="lazy"
                      decoding="async"
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
      {form.selectedGymName && <MachinePicker form={form} onFieldChange={onFieldChange} />}
    </div>
  );
}
