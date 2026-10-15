import React, { useState, useId } from 'react';
import {
  WATTAGE_RATINGS,
  getNearestE24,
  getColorBands,
  formatResistance,
} from '../utils/resistorCalculations';
import { ResistorVisualizer3D } from './ResistorVisualizer3D';

interface SeriesPreset {
  label: string;
  vin: number;
  vtarget: number;
  ima: number;
}

const PRESETS: SeriesPreset[] = [
  { label: '3.3V Module @ 5V (100mA)', vin: 5, vtarget: 3, ima: 100 },
  { label: 'Red LED @ 5V (20mA)', vin: 5, vtarget: 2, ima: 20 },
  { label: 'Blue LED @ 12V (20mA)', vin: 12, vtarget: 3.2, ima: 20 },
  { label: '5V Relay @ 12V (500mA)', vin: 12, vtarget: 5, ima: 500 },
];

export const SeriesCalculator: React.FC = () => {
  const [vin, setVin] = useState<number>(5.0);
  const [vtarget, setVtarget] = useState<number>(3.0);
  const [ima, setIma] = useState<number>(100.0);
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(0);

  const numVinId = useId();
  const sliderVinId = useId();
  const numVtargetId = useId();
  const sliderVtargetId = useId();
  const numImaId = useId();
  const sliderImaId = useId();

  const isInvalid = vin <= vtarget;
  const vDrop = Math.max(0, vin - vtarget);
  const currentA = ima / 1000.0;
  const resistance = currentA > 0 && !isInvalid ? vDrop / currentA : 0;
  const powerW = vDrop * currentA;
  const powermW = powerW * 1000.0;

  const e24 = getNearestE24(resistance);
  const bands = getColorBands(e24);

  const recommendedW = powerW * 1.5;
  let selectedRating = WATTAGE_RATINGS[WATTAGE_RATINGS.length - 1];
  for (const r of WATTAGE_RATINGS) {
    if (r.watts >= recommendedW) {
      selectedRating = r;
      break;
    }
  }

  const capacityPct = selectedRating
    ? Math.round((powerW / selectedRating.watts) * 100)
    : 0;

  const vDropPct = vin > 0 ? ((vDrop / vin) * 100).toFixed(1) : '0';

  let statusBg = 'bg-emerald-950 border-emerald-700 text-emerald-400';
  let statusText = `Safe (${capacityPct}% load)`;
  if (isInvalid) {
    statusBg = 'bg-rose-950 border-rose-700 text-rose-400';
    statusText = 'Vin ≤ Vtarget';
  } else if (capacityPct > 100) {
    statusBg = 'bg-rose-950 border-rose-700 text-rose-400';
    statusText = `Overload (${capacityPct}%)`;
  } else if (capacityPct > 80) {
    statusBg = 'bg-amber-950 border-amber-700 text-amber-400';
    statusText = `Hot (${capacityPct}% load)`;
  }

  const handlePresetSelect = (preset: SeriesPreset, index: number) => {
    setActivePresetIndex(index);
    setVin(preset.vin);
    setVtarget(preset.vtarget);
    setIma(preset.ima);
  };

  return (
    <div className="space-y-6">
      {/* KPI Metric Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-xl">
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
            Required Resistor
          </span>
          <div className="text-2xl font-black text-white mt-1">
            {isInvalid ? '—' : formatResistance(resistance)}
          </div>
          <div className="text-xs text-indigo-300 mt-0.5">
            {isInvalid ? '—' : `Std E24: ${formatResistance(e24.value)}`}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Voltage Drop
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {isInvalid ? '—' : `${vDrop.toFixed(2)} V`}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {isInvalid ? '—' : `${vDropPct}% of Vin`}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Power Dissipated
          </span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {isInvalid
              ? '—'
              : powermW >= 1000
              ? `${powerW.toFixed(2)} W`
              : `${Math.round(powermW)} mW`}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {isInvalid ? '—' : `${powerW.toFixed(3)} W`}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Min Rating
          </span>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            {isInvalid ? '—' : selectedRating.name}
          </div>
          <div className="mt-1">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusBg}`}
            >
              {statusText}
            </span>
          </div>
        </div>
      </div>

      {/* Controls & 3D Visualizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls Deck */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-200">Circuit Parameters</h2>
            <p className="text-xs text-slate-400">
              Adjust parameters or pick from common presets.
            </p>
          </div>

          {/* Presets */}
          <div>
            <span className="block text-xs font-medium text-slate-400 mb-2">
              Quick Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, idx) => {
                const isSelected = activePresetIndex === idx;
                return (
                  <button
                    key={p.label}
                    onClick={() => handlePresetSelect(p, idx)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-medium'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Voltage */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor={numVinId} className="text-slate-300 font-medium">
                Source Voltage (Vin)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  id={numVinId}
                  value={vin}
                  min="0.5"
                  max="48"
                  step="0.1"
                  onChange={(e) => {
                    setActivePresetIndex(null);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setVin(Math.max(0.5, Math.min(48, val)));
                  }}
                  className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-white font-mono text-xs focus:border-indigo-500 outline-none"
                />
                <span className="text-slate-400">V</span>
              </div>
            </div>
            <input
              type="range"
              id={sliderVinId}
              min="0.5"
              max="48"
              step="0.1"
              value={vin}
              onChange={(e) => {
                setActivePresetIndex(null);
                setVin(parseFloat(e.target.value));
              }}
              className="w-full h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Target Voltage */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor={numVtargetId} className="text-slate-300 font-medium">
                Target / Load Voltage (Vtarget)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  id={numVtargetId}
                  value={vtarget}
                  min="0.1"
                  max="48"
                  step="0.1"
                  onChange={(e) => {
                    setActivePresetIndex(null);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setVtarget(Math.max(0.1, Math.min(48, val)));
                  }}
                  className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-white font-mono text-xs focus:border-indigo-500 outline-none"
                />
                <span className="text-slate-400">V</span>
              </div>
            </div>
            <input
              type="range"
              id={sliderVtargetId}
              min="0.1"
              max="48"
              step="0.1"
              value={vtarget}
              onChange={(e) => {
                setActivePresetIndex(null);
                setVtarget(parseFloat(e.target.value));
              }}
              className="w-full h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Load Current */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor={numImaId} className="text-slate-300 font-medium">
                Operating Current (Iload)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  id={numImaId}
                  value={ima}
                  min="1"
                  max="3000"
                  step="1"
                  onChange={(e) => {
                    setActivePresetIndex(null);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setIma(Math.max(1, Math.min(3000, val)));
                  }}
                  className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-white font-mono text-xs focus:border-indigo-500 outline-none"
                />
                <span className="text-slate-400">mA</span>
              </div>
            </div>
            <input
              type="range"
              id={sliderImaId}
              min="1"
              max="3000"
              step="1"
              value={ima}
              onChange={(e) => {
                setActivePresetIndex(null);
                setIma(parseFloat(e.target.value));
              }}
              className="w-full h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Warning Box */}
          {isInvalid && (
            <div className="text-amber-400 bg-amber-950/40 border border-amber-800 p-3 rounded-lg text-xs leading-relaxed">
              ⚠ Warning: Target voltage exceeds or equals supply voltage. A series resistor cannot step up voltage.
            </div>
          )}
        </div>

        {/* 3D Resistor Visualizer Card (Series) */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-200">3D Resistor Visualizer</h2>
            <span className="text-xs text-indigo-400 font-mono">
              E24 Standard: {formatResistance(e24.value)} ±5%
            </span>
          </div>

          {/* Three.js Canvas Container */}
          <ResistorVisualizer3D bands={bands} />

          {/* Color Band Pills Strip */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl">
            {bands.map((b, idx) => (
              <span
                key={idx}
                className="color-pill"
                style={{
                  backgroundColor: b.color,
                  color: b.textDark ? '#111827' : '#ffffff',
                }}
              >
                {b.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Formula Breakdown Callout */}
      <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-xl text-xs text-slate-300 leading-relaxed space-y-1">
        {isInvalid ? (
          <div>
            <strong className="text-rose-400">Error:</strong> Target voltage (
            {vtarget.toFixed(2)}V) cannot be greater than or equal to source voltage (
            {vin.toFixed(2)}V). A passive series resistor can only drop voltage, not
            boost it.
          </div>
        ) : (
          <>
            <div>
              <strong>Formula Breakdown:</strong>
            </div>
            <div>
              • Voltage Drop: <em>Vdrop = Vin - Vtarget</em> = {vin.toFixed(2)}V -{' '}
              {vtarget.toFixed(2)}V ={' '}
              <b className="text-emerald-400">{vDrop.toFixed(2)} V</b>
            </div>
            <div>
              • Required Resistance: <em>R = Vdrop / I</em> = {vDrop.toFixed(2)}V /{' '}
              {currentA.toFixed(3)}A ={' '}
              <b className="text-indigo-400">{resistance.toFixed(2)} Ω</b> (Nearest Standard:{' '}
              <b>{formatResistance(e24.value)}</b>)
            </div>
            <div>
              • Power Dissipation: <em>P = Vdrop × I</em> = {vDrop.toFixed(2)}V ×{' '}
              {currentA.toFixed(3)}A ={' '}
              <b className="text-amber-400">
                {powerW.toFixed(3)} W ({Math.round(powermW)} mW)
              </b>
            </div>
            <div>
              • Recommended Power Rating:{' '}
              <b className="text-cyan-400">
                {selectedRating.name} ({selectedRating.watts}W)
              </b>{' '}
              (operating at {capacityPct}% capacity for thermal reliability).
            </div>
          </>
        )}
      </div>
    </div>
  );
};
