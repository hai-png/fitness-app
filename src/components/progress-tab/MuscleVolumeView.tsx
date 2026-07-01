/**
 * MuscleVolumeView — extracted from ProgressTab.tsx (A-04 decomposition).
 *
 * Sub-tab 2: interactive anatomical muscle map, MEV/MAV/MRV volume zones,
 * muscle balance analysis (top-3 concentration), and lifetime tonnage tier
 * progress. Owns its hover/select + training-age UI state via props.
 */
import React from "react";
import { Award, Sliders, User } from "lucide-react";
import type { ProgressAnalytics } from "./types";

interface MuscleVolumeViewProps {
  analytics: ProgressAnalytics;
  selectedMuscle: string | null;
  setSelectedMuscle: (m: string) => void;
  hoveredMuscle: string | null;
  setHoveredMuscle: (m: string | null) => void;
  trainingAge: "Beginner" | "Intermediate" | "Advanced";
  setTrainingAge: (age: "Beginner" | "Intermediate" | "Advanced") => void;
}

export default function MuscleVolumeView({
  analytics,
  selectedMuscle,
  setSelectedMuscle,
  hoveredMuscle,
  setHoveredMuscle,
  trainingAge,
  setTrainingAge,
}: MuscleVolumeViewProps) {
  const {
    muscleZonesAndScores,
    muscleBalanceAnalysis,
    lifetimeVolumeTons,
    lifetimeTierInfo,
  } = analytics;

  const selectedMuscleData =
    muscleZonesAndScores.find((z) => z.muscle.toLowerCase() === selectedMuscle?.toLowerCase()) ||
    muscleZonesAndScores[0];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Dynamic configuration slider for training age */}
      <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-[#E63946] block">
              Zone Personalization
            </span>
            <h3 className="font-serif font-bold text-sm text-[#1A1A1A] mt-0.5">
              Adaptable Training Age
            </h3>
          </div>
          <select
            id="select-training-age"
            value={trainingAge}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setTrainingAge(e.target.value as "Beginner" | "Intermediate" | "Advanced")
            }
            className="bg-[#F9F8F6] border border-[#1A1A1A]/10 text-xs px-2 py-1 font-bold text-[#1A1A1A]"
          >
            <option value="Beginner">Beginner Age (&lt;1 yr)</option>
            <option value="Intermediate">Intermediate Age (1-3 yrs)</option>
            <option value="Advanced">Advanced Age (3+ yrs)</option>
          </select>
        </div>
        <p className="text-[10px] text-[#1A1A1A]/60 font-serif italic leading-relaxed">
          Training experience shifts your muscular adaptations limits. Minimum Effective Volume
          (MEV) and Max Recoverable Volume (MRV) zones are dynamically customized based on this
          setting.
        </p>
      </div>

      {/* Interactive Body Map Grid */}
      <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm relative">
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-3">
          <User className="w-4 h-4 text-[#E63946]" />
          Anatomical Load Map & Volume Zones
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Elegant SVG/Anatomical figure list selector representing anterior and posterior muscles */}
          <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
            <span className="text-[8px] font-mono font-bold text-[#1A1A1A]/40 block uppercase tracking-wider mb-1.5">
              Interactive Muscle Zones
            </span>

            {muscleZonesAndScores.map((z) => {
              const isSelected = selectedMuscle?.toLowerCase() === z.muscle.toLowerCase();
              const isHovered = hoveredMuscle?.toLowerCase() === z.muscle.toLowerCase();

              return (
                <button
                  key={z.muscle}
                  id={`btn-muscle-zone-${z.muscle}`}
                  type="button"
                  onClick={() => setSelectedMuscle(z.muscle)}
                  onMouseEnter={() => setHoveredMuscle(z.muscle)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className={`w-full text-left px-2.5 py-1.5 border transition-all text-[11px] flex items-center justify-between font-mono ${
                    isSelected
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                      : isHovered
                        ? "bg-[#E63946]/5 border-[#E63946]/35 text-[#E63946]"
                        : "bg-[#F9F8F6] border-[#1A1A1A]/5 text-[#1A1A1A]/85 hover:border-[#1A1A1A]/15"
                  }`}
                >
                  <span className="truncate">{z.muscle}</span>
                  <span className="text-[9px] opacity-70 font-bold">{z.weeklySets} sets</span>
                </button>
              );
            })}
          </div>

          {/* Muscle load details block */}
          <div className="bg-[#F9F8F6] border border-[#1A1A1A]/5 p-3.5 flex flex-col justify-between h-[220px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#E63946]/5 rounded-full blur-lg pointer-events-none" />

            <div>
              <span className="text-[7.5px] font-bold font-mono uppercase tracking-[0.2em] text-[#E63946] block">
                ACTIVE SECTOR DETAILS
              </span>
              <h4 className="font-serif italic font-black text-base text-[#1A1A1A] leading-tight mt-1">
                {selectedMuscleData.muscle}
              </h4>

              <div className="mt-3 space-y-2">
                <div>
                  <span className="text-[8px] font-mono font-bold text-[#1A1A1A]/40 block uppercase">
                    Weekly Sets Rate
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1A1A1A]">
                    {selectedMuscleData.weeklySets} working sets/week
                  </span>
                </div>

                <div>
                  <span className="text-[8px] font-mono font-bold text-[#1A1A1A]/40 block uppercase mb-0.5">
                    Stimulus Zone Badge
                  </span>
                  <span
                    className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 border uppercase tracking-wider block text-center rounded ${selectedMuscleData.colorClass}`}
                  >
                    {selectedMuscleData.zone.replace(/\(.*\)/, "")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1A1A1A]/5">
                  <div>
                    <span className="text-[8px] font-mono font-bold text-[#1A1A1A]/40 block uppercase">
                      Hypertrophy Score
                    </span>
                    <span className="text-xs font-mono font-bold text-[#E63946]">
                      {selectedMuscleData.score}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-mono font-bold text-[#1A1A1A]/40 block uppercase">
                      Load Share
                    </span>
                    <span className="text-xs font-mono font-bold text-[#1A1A1A]">
                      {selectedMuscleData.balancePct}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[9px] text-[#1A1A1A]/55 font-serif italic leading-tight border-t border-[#1A1A1A]/5 pt-2 mt-2">
              {selectedMuscleData.zone.includes("MEV")
                ? "Optimal minimal effective stimulus for growth."
                : selectedMuscleData.zone.includes("MAV")
                  ? "Perfect adaptive hypertrophy stimulus. Keep pushing!"
                  : selectedMuscleData.zone.includes("MRV")
                    ? "Warning: High recoverability exhaustion risk. Deload suggested."
                    : "Maintenance volume or recovery stage."}
            </p>
          </div>
        </div>
      </div>

      {/* Muscle Balance and flags */}
      <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none shadow-sm">
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-1.5">
          <Sliders className="w-4 h-4 text-[#E63946]" />
          Volume Distribution Balance
        </h3>
        <p className="text-[10px] text-[#1A1A1A]/60 mb-3 font-serif italic leading-relaxed">
          Identifies muscular asymmetry issues. Standard balanced ratio flags if the top 3 muscle
          groups account for &gt;70% of total weekly volume.
        </p>

        <div className="border border-[#1A1A1A]/5 bg-[#F9F8F6] p-3 mb-4 rounded flex items-center justify-between">
          <div>
            <span className="text-[8px] font-mono font-bold uppercase text-[#1A1A1A]/40 block">
              Top 3 Muscle Concentration
            </span>
            <span className="text-sm font-mono font-black text-[#1A1A1A]">
              {muscleBalanceAnalysis.top3Share}% of total
            </span>
          </div>
          {muscleBalanceAnalysis.isImbalanced ? (
            <span className="text-[9.5px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-100 px-2.5 py-1 uppercase rounded tracking-wide">
              ⚠️ Asymmetry Flagged
            </span>
          ) : (
            <span className="text-[9.5px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1 uppercase rounded tracking-wide">
              ✓ Symmetric Balance
            </span>
          )}
        </div>

        <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
          {muscleBalanceAnalysis.sortedMuscles.slice(0, 5).map((m, idx) => (
            <div
              key={m.muscle}
              className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-[#1A1A1A]/5"
            >
              <span className="font-bold text-[#1A1A1A]/70">
                {idx + 1}. {m.muscle}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-[#1A1A1A]/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#E63946]" style={{ width: `${m.balancePct}%` }} />
                </div>
                <span className="w-8 text-right font-bold text-[#1A1A1A]">{m.balancePct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lifetime Progress Tier Progress */}
      <div className="bg-[#1A1A1A] text-white p-4 rounded-none shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-[#E63946]/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[7.5px] font-mono font-bold uppercase tracking-[0.25em] text-[#E63946]">
              LIFETIME MASSIVE OUTPUT
            </span>
            <h3 className="font-serif italic font-black text-lg text-white mt-0.5">
              Tier {lifetimeTierInfo.tierIndex}: {lifetimeTierInfo.current}
            </h3>
          </div>
          <Award className="w-5 h-5 text-[#E63946]" />
        </div>

        <div className="text-2xl font-mono font-black text-white">
          {lifetimeVolumeTons.toFixed(1)}{" "}
          <span className="text-xs font-sans font-bold text-white/50">Tons Lifted</span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center text-[9px] font-bold font-mono text-white/55 uppercase mb-1">
            <span>Next Level: {lifetimeTierInfo.next}</span>
            <span>{lifetimeTierInfo.progressPercent}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E63946]"
              style={{ width: `${lifetimeTierInfo.progressPercent}%` }}
            />
          </div>
        </div>

        <p className="text-[10px] text-white/60 font-serif italic mt-3 leading-normal border-t border-white/5 pt-2">
          Based on current weekly volume, you are estimated to graduate to the{" "}
          <strong>{lifetimeTierInfo.next}</strong> tier in approximately{" "}
          <strong>{lifetimeTierInfo.weeksToNext}</strong> weeks.
        </p>
      </div>
    </div>
  );
}
