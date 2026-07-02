/**
 * GymMap
 *
 * Interactive regional SVG map rendered inside StepGymSelection when the
 * user has selected the "gym" workout preference. Plots each entry from
 * NEARBY_GYMS as a clickable pin; clicking a pin selects that gym (and
 * loads its default machines) via the `onSelectGym` callback.
 *
 * Pure presentational component — owns no state.
 */

import { NEARBY_GYMS } from "./gymData";

interface GymMapProps {
  /** Name of the currently-selected gym (drives pin highlight state). */
  selectedGymName: string;
  /** Called with the gym's name + defaultMachines when a pin is clicked. */
  onSelectGym: (name: string, defaultMachines: string[]) => void;
}

export default function GymMap({ selectedGymName, onSelectGym }: GymMapProps) {
  return (
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
        <line x1="10" y1="0" x2="10" y2="100" stroke="rgba(26,26,26,0.03)" strokeWidth="0.5" />
        <line x1="30" y1="0" x2="30" y2="100" stroke="rgba(26,26,26,0.03)" strokeWidth="0.5" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(26,26,26,0.03)" strokeWidth="0.5" />
        <line x1="70" y1="0" x2="70" y2="100" stroke="rgba(26,26,26,0.03)" strokeWidth="0.5" />
        <line x1="90" y1="0" x2="90" y2="100" stroke="rgba(26,26,26,0.03)" strokeWidth="0.5" />

        <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(26,26,26,0.03)" strokeWidth="0.5" />
        <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(26,26,26,0.03)" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(26,26,26,0.03)" strokeWidth="0.5" />
        <line x1="0" y1="70" x2="100" y2="70" stroke="rgba(26,26,26,0.03)" strokeWidth="0.5" />
        <line x1="0" y1="90" x2="100" y2="90" stroke="rgba(26,26,26,0.03)" strokeWidth="0.5" />

        <path d="M 0 55 Q 55 25 100 55" fill="none" stroke="rgba(26,26,26,0.08)" strokeWidth="3" />
        <path d="M 55 0 Q 25 55 55 100" fill="none" stroke="rgba(26,26,26,0.08)" strokeWidth="3" />
        <path d="M 5 5 Q 35 35 95 95" fill="none" stroke="rgba(26,26,26,0.04)" strokeWidth="1.5" />

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
          const isSelected = selectedGymName === g.name;
          return (
            <g
              key={g.id}
              className="cursor-pointer"
              onClick={() => onSelectGym(g.name, g.defaultMachines)}
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
  );
}
