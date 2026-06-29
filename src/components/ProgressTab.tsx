import React, { useState } from "react";
import { WeightLog, WaterLog, WorkoutLog } from "../types";
import { 
  Plus, 
  Trash2, 
  Flame, 
  Droplet, 
  Scale, 
  CheckCircle2, 
  PlusCircle, 
  Calendar,
  Sparkles,
  TrendingDown
} from "lucide-react";

interface ProgressTabProps {
  weightLogs: WeightLog[];
  waterLogs: WaterLog[];
  workoutLogs: WorkoutLog[];
  onAddWeightLog: (weight: number) => void;
  onAddWaterLog: (amountMl: number) => void;
  onClearWaterLogs: () => void;
}

export default function ProgressTab({
  weightLogs,
  waterLogs,
  workoutLogs,
  onAddWeightLog,
  onAddWaterLog,
  onClearWaterLogs
}: ProgressTabProps) {
  const [newWeight, setNewWeight] = useState<string>("");

  // Get current date
  const todayStr = new Date().toISOString().split("T")[0];

  // Calculate totals
  const totalCaloriesBurned = workoutLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);
  const totalWorkoutsCount = workoutLogs.length;
  
  const todayWaterTotal = waterLogs
    .filter(log => log.date === todayStr)
    .reduce((sum, log) => sum + log.amountMl, 0);
  
  const waterTarget = 3000; // 3 Liters
  const waterPercent = Math.min(100, Math.round((todayWaterTotal / waterTarget) * 100));

  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].value : 75;
  const initialWeight = weightLogs.length > 0 ? weightLogs[0].value : 75;
  const weightDiff = currentWeight - initialWeight;

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeight);
    if (isNaN(val) || val <= 0) return;
    onAddWeightLog(val);
    setNewWeight("");
  };

  // Generate coordinate strings for an elegant SVG Line Chart
  const renderWeightChart = () => {
    if (weightLogs.length < 2) {
      return (
        <div className="flex flex-col items-center justify-center h-28 text-[#1A1A1A]/40 text-xs font-serif italic">
          <Scale className="w-5 h-5 mb-1.5 text-[#1A1A1A]/50" />
          <span>Log weight on multiple days to generate trend lines.</span>
        </div>
      );
    }

    const width = 300;
    const height = 80;
    const values = weightLogs.map((l) => l.value);
    const minVal = Math.min(...values) - 1;
    const maxVal = Math.max(...values) + 1;
    const valRange = maxVal - minVal || 1;

    const points = weightLogs.map((log, idx) => {
      const x = (idx / (weightLogs.length - 1)) * (width - 20) + 10;
      const y = height - ((log.value - minVal) / valRange) * (height - 20) - 10;
      return { x, y, value: log.value };
    });

    const linePath = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    
    // Gradient filled path below trend line
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return (
      <div className="relative pt-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
          <defs>
            <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E63946" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#E63946" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Guidelines */}
          <line x1="0" y1={height - 10} x2={width} y2={height - 10} stroke="#1A1A1A" strokeOpacity="0.08" strokeDasharray="3 3" />
          <line x1="0" y1={10} x2={width} y2={10} stroke="#1A1A1A" strokeOpacity="0.08" strokeDasharray="3 3" />

          {/* Filled Area */}
          <path d={areaPath} fill="url(#chart-grad)" />

          {/* Smooth Trend Line */}
          <path d={linePath} fill="none" stroke="#E63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Plot Data Dots */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="3.5" fill="#FFFFFF" stroke="#E63946" strokeWidth="2" />
              {/* Highlight weight values on first and last node */}
              {(idx === 0 || idx === points.length - 1) && (
                <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#1A1A1A" fontSize="8" fontWeight="bold" className="font-mono">
                  {p.value}kg
                </text>
              )}
            </g>
          ))}
        </svg>
        <div className="flex justify-between items-center text-[9px] text-[#1A1A1A]/40 mt-2 px-1 font-mono">
          <span>{weightLogs[0].date}</span>
          <span>{weightLogs[weightLogs.length - 1].date}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6] text-[#1A1A1A] overflow-y-auto p-4 md:p-6 pb-24">
      {/* Tab Title */}
      <div className="mb-5">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E63946] underline underline-offset-4 block mb-2">
          03 — Analytics & Metrics
        </span>
        <h1 className="text-3xl font-serif font-black italic text-[#1A1A1A] mt-3 tracking-tight">
          Your Performance Logs
        </h1>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-[#1A1A1A]/10 p-3.5 rounded-none text-center shadow-sm">
          <Flame className="w-4 h-4 text-[#E63946] mx-auto mb-1" />
          <span className="block text-[9px] uppercase font-bold text-[#1A1A1A]/40 tracking-wider">Kcal Out</span>
          <span className="text-sm font-extrabold text-[#1A1A1A]">{totalCaloriesBurned}</span>
        </div>

        <div className="bg-white border border-[#1A1A1A]/10 p-3.5 rounded-none text-center shadow-sm">
          <Droplet className="w-4 h-4 text-[#1A1A1A] mx-auto mb-1" />
          <span className="block text-[9px] uppercase font-bold text-[#1A1A1A]/40 tracking-wider">Hydration</span>
          <span className="text-sm font-extrabold text-[#1A1A1A]">{(todayWaterTotal/1000).toFixed(1)}L</span>
        </div>

        <div className="bg-white border border-[#1A1A1A]/10 p-3.5 rounded-none text-center shadow-sm">
          <Scale className="w-4 h-4 text-[#E63946] mx-auto mb-1" />
          <span className="block text-[9px] uppercase font-bold text-[#1A1A1A]/40 tracking-wider">Weight</span>
          <span className="text-sm font-extrabold text-[#1A1A1A]">{currentWeight}kg</span>
        </div>
      </div>

      {/* Water Hydro Logger */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 mb-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-[#1A1A1A]" />
              Liquid Hydro Charger
            </h3>
            <p className="text-[10px] text-[#1A1A1A]/60 mt-0.5 font-serif italic">
              Target: 3.0 Liters (3000ml) • Today: {todayWaterTotal}ml
            </p>
          </div>
          <button
            id="btn-clear-water"
            onClick={onClearWaterLogs}
            className="text-[9px] font-bold text-[#1A1A1A]/60 hover:text-[#E63946] transition-all border border-[#1A1A1A]/10 hover:border-[#E63946] px-2.5 py-1 rounded-none bg-white"
          >
            Reset
          </button>
        </div>

        {/* Cup Fluid Visual */}
        <div className="flex items-center gap-4 py-2">
          {/* Hydro cylinder glass mockup */}
          <div className="relative w-14 h-24 border border-[#1A1A1A]/20 rounded-none overflow-hidden bg-[#F9F8F6] flex flex-col justify-end">
            <div 
              style={{ height: `${waterPercent}%` }}
              className="w-full bg-[#E63946] transition-all duration-500 flex items-center justify-center"
            >
              {waterPercent > 20 && (
                <span className="text-[9px] font-bold text-white">
                  {waterPercent}%
                </span>
              )}
            </div>
            {/* Measuring line dashes */}
            <div className="absolute inset-0 flex flex-col justify-between p-1 opacity-40 text-[6px] pointer-events-none text-[#1A1A1A]/40 font-mono">
              <span>3L</span>
              <span>2L</span>
              <span>1L</span>
              <span>0L</span>
            </div>
          </div>

          {/* Quick Log Buttons */}
          <div className="flex-grow space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-add-water-250"
                onClick={() => onAddWaterLog(250)}
                className="py-2 text-center rounded-none border border-[#1A1A1A]/10 bg-white hover:border-[#1A1A1A] text-xs text-[#1A1A1A] font-bold uppercase tracking-wider transition-all"
              >
                +250ml Glass
              </button>
              <button
                id="btn-add-water-500"
                onClick={() => onAddWaterLog(500)}
                className="py-2 text-center rounded-none border border-[#1A1A1A]/10 bg-white hover:border-[#1A1A1A] text-xs text-[#1A1A1A] font-bold uppercase tracking-wider transition-all"
              >
                +500ml Bottle
              </button>
            </div>
            <button
              id="btn-add-water-1000"
              onClick={() => onAddWaterLog(1000)}
              className="w-full py-2.5 bg-[#1A1A1A] text-xs border border-[#1A1A1A] text-white font-bold rounded-none hover:opacity-90 uppercase tracking-widest transition-all"
            >
              +1.0L Shaker Jumbo
            </button>
          </div>
        </div>
      </div>

      {/* Weight History Logger & SVG Plotter */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-[#E63946]" />
            Weight Trajectory
          </h3>
          {weightDiff < 0 ? (
            <div className="flex items-center gap-1 text-[9px] text-white bg-[#E63946] px-2 py-0.5 rounded-none font-bold uppercase tracking-wider">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{weightDiff.toFixed(1)}kg Over Time</span>
            </div>
          ) : (
            weightDiff > 0 && (
              <div className="text-[9px] text-[#1A1A1A] bg-[#1A1A1A]/10 px-2 py-0.5 rounded-none font-bold uppercase tracking-wider">
                +{weightDiff.toFixed(1)}kg Over Time
              </div>
            )
          )}
        </div>

        {/* Dynamic Trend Chart */}
        {renderWeightChart()}

        {/* Log Input */}
        <form onSubmit={handleWeightSubmit} className="flex gap-2.5 mt-4">
          <input
            id="input-weight-log"
            type="number"
            step="0.1"
            placeholder="Log today's weight (kg)..."
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            required
            className="flex-grow bg-white border border-[#1A1A1A]/15 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-[#1A1A1A] text-[#1A1A1A]"
          />
          <button
            id="btn-submit-weight"
            type="submit"
            className="bg-[#1A1A1A] hover:opacity-90 text-white font-bold px-4 py-2 rounded-none text-xs flex items-center gap-1 transition-all uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" />
            Log Weight
          </button>
        </form>
      </div>

      {/* Workout History Log Feed */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4">
        <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 mb-3">
          <CheckCircle2 className="w-4 h-4 text-[#E63946]" />
          Completed Routines Journal
        </h3>
        {workoutLogs.length === 0 ? (
          <div className="text-center py-6 text-[#1A1A1A]/40 text-xs font-serif italic">
            Routines journal is empty. Click "Begin Routine" on the Training tab to log completed exercises!
          </div>
        ) : (
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {workoutLogs.map((log, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#F9F8F6] border border-[#1A1A1A]/5 rounded-none text-xs shadow-sm">
                <div>
                  <h4 className="font-bold text-[#1A1A1A] uppercase tracking-tight">{log.workoutTitle.split(" - ")[1] || log.workoutTitle}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-[#1A1A1A]/50 mt-1 font-mono">
                    <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {log.date}</span>
                    <span>•</span>
                    <span>{log.durationMinutes} min workout</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[#E63946] font-bold text-xs font-mono">
                    +{log.caloriesBurned} kcal
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
