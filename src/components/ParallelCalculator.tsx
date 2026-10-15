import React, { useState, useId } from 'react';
import {
  getNearestE24,
  getColorBands,
  formatResistance,
} from '../utils/resistorCalculations';
import { ResistorVisualizer3D } from './ResistorVisualizer3D';

interface ParallelPreset {
  label: string;
  volt: number;
  branches: number[];
}

const PARALLEL_PRESETS: ParallelPreset[] = [
  { label: '12V: 100Ω | 220Ω | 470Ω', volt: 12, branches: [100, 220, 470] },
  { label: '5V: Dual 100Ω (Req: 50Ω)', volt: 5, branches: [100, 100] },
  { label: '12V: Quad 220Ω (Req: 55Ω)', volt: 12, branches: [220, 220, 220, 220] },
  { label: '24V: 1kΩ | 2.2kΩ | 4.7kΩ', volt: 24, branches: [1000, 2200, 4700] },
];

export const ParallelCalculator: React.FC = () => {
  const [busVoltage, setBusVoltage] = useState<number>(12.0);
  const [branches, setBranches] = useState<number[]>([100, 220, 470]);
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(0);

  const numPvoltId = useId();
  const sliderPvoltId = useId();

  const validBranches = branches.filter((r) => r > 0);
  const invSum = validBranches.reduce((sum, r) => sum + 1 / r, 0);
  const req = invSum > 0 ? 1 / invSum : 0;
  const iTotal = busVoltage > 0 && req > 0 ? busVoltage / req : 0;
  const pTotal = busVoltage * iTotal;
  const conductanceMS = invSum * 1000;

  const e24 = getNearestE24(req);
  const bands = getColorBands(e24);

  const handlePresetSelect = (preset: ParallelPreset, index: number) => {
    setActivePresetIndex(index);
    setBusVoltage(preset.volt);
    setBranches([...preset.branches]);
  };

  const handleBranchChange = (index: number, value: number) => {
    setActivePresetIndex(null);
    const updated = [...branches];
    updated[index] = Math.max(1, value);
    setBranches(updated);
  };

  const handleAddBranch = () => {
    setActivePresetIndex(null);
    setBranches([...branches, 100]);
  };

  const handleRemoveBranch = (index: number) => {
    if (branches.length > 2) {
      setActivePresetIndex(null);
      const updated = branches.filter((_, i) => i !== index);
      setBranches(updated);
    }
  };

  const branchFormulaString = validBranches.map((r) => `1/${r}Ω`).join(' + ');

  return (
    <div className="space-y-6">
      {/* KPI Metric Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-xl">
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
            Equivalent (Req)
          </span>
          <div className="text-2xl font-black text-white mt-1">
            {req >= 1000 ? `${(req / 1000).toFixed(2)} kΩ` : `${req.toFixed(2)} Ω`}
          </div>
          <div className="text-xs text-indigo-300 mt-0.5">
            Std E24: {formatResistance(e24.value)}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Total Current (Itotal)
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {iTotal >= 1 ? `${iTotal.toFixed(2)} A` : `${(iTotal * 1000).toFixed(1)} mA`}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            G: {conductanceMS.toFixed(2)} mS
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Total Circuit Power
          </span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {pTotal >= 1 ? `${pTotal.toFixed(2)} W` : `${(pTotal * 1000).toFixed(1)} mW`}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">P = V × Itotal</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Active Branches
          </span>
          <div className="text-2xl font-black text-cyan-400 mt-1">{branches.length}</div>
          <div className="text-xs text-slate-400 mt-0.5">Parallel bus circuit</div>
        </div>
      </div>

      {/* Controls & 3D Visualizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Controls Deck */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-200">Parallel Parameters</h2>
              <p className="text-xs text-slate-400">
                Adjust bus voltage and individual branch resistances.
              </p>
            </div>
            <button
              onClick={handleAddBranch}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              + Add Branch
            </button>
          </div>

          {/* Parallel Quick Presets */}
          <div>
            <span className="block text-xs font-medium text-slate-400 mb-2">
              Quick Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {PARALLEL_PRESETS.map((p, idx) => {
                const isSelected = activePresetIndex === idx;
                return (
                  <button
                    key={p.label}
                    onClick={() => handlePresetSelect(p, idx)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
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

          {/* Circuit Bus Voltage Control Row */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor={numPvoltId} className="text-slate-300 font-medium">
                Circuit Bus Voltage (Vbus)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  id={numPvoltId}
                  value={busVoltage}
                  min="0.5"
                  max="48"
                  step="0.1"
                  onChange={(e) => {
                    setActivePresetIndex(null);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setBusVoltage(Math.max(0.5, Math.min(48, val)));
                  }}
                  className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-white font-mono text-xs focus:border-indigo-500 outline-none"
                />
                <span className="text-slate-400">V</span>
              </div>
            </div>
            <input
              type="range"
              id={sliderPvoltId}
              min="0.5"
              max="48"
              step="0.1"
              value={busVoltage}
              onChange={(e) => {
                setActivePresetIndex(null);
                setBusVoltage(parseFloat(e.target.value));
              }}
              className="w-full h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Divider & Branches */}
          <div className="border-t border-slate-700/60 pt-2">
            <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Branch Resistances
            </span>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {branches.map((val, idx) => {
                const branchNumId = `num-pbranch-${idx}`;
                const branchSliderId = `slider-pbranch-${idx}`;
                return (
                  <div
                    key={idx}
                    className="space-y-1.5 bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/60"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <label htmlFor={branchNumId} className="text-xs font-bold text-indigo-400">
                          R{idx + 1}
                        </label>
                        <span className="text-slate-400 font-medium">Branch Resistor</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          id={branchNumId}
                          value={val}
                          min="1"
                          max="10000"
                          step="1"
                          onChange={(e) => {
                            const parsed = parseFloat(e.target.value);
                            if (!isNaN(parsed)) handleBranchChange(idx, parsed);
                          }}
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-white font-mono text-xs focus:border-indigo-500 outline-none"
                        />
                        <span className="text-slate-400 text-xs">Ω</span>
                        {branches.length > 2 ? (
                          <button
                            onClick={() => handleRemoveBranch(idx)}
                            title="Remove branch"
                            className="ml-1 p-1 text-slate-500 hover:text-rose-400 rounded transition-colors text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        ) : (
                          <div className="w-4" />
                        )}
                      </div>
                    </div>
                    <input
                      type="range"
                      id={branchSliderId}
                      min="1"
                      max="5000"
                      step="1"
                      value={Math.min(5000, val)}
                      onChange={(e) => handleBranchChange(idx, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3D Resistor Visualizer Card (Parallel Equivalent) */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-200">
                Req 3D Resistor Visualizer
              </h2>
              <p className="text-xs text-slate-400">
                Equivalent single resistor replacement
              </p>
            </div>
            <span className="text-xs text-indigo-400 font-mono">
              E24: {formatResistance(e24.value)} ±5%
            </span>
          </div>

          {/* Three.js Canvas Container (Parallel) */}
          <ResistorVisualizer3D bands={bands} />

          {/* Color Band Pills Strip (Parallel) */}
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

      {/* Parallel Circuit Breakdown Callout */}
      <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-xl text-xs text-slate-300 leading-relaxed space-y-1">
        <div>
          <strong>Equivalent Circuit Summary:</strong>
        </div>
        <div>
          • Reciprocal Sum (1/Req): <em>{branchFormulaString}</em> ={' '}
          <b>{invSum.toFixed(5)} S</b>
        </div>
        <div>
          • Equivalent Resistance (Req): <em>1 / ({invSum.toFixed(5)})</em> ={' '}
          <b className="text-indigo-400">{req.toFixed(2)} Ω</b> (Nearest Standard:{' '}
          <b>{formatResistance(e24.value)}</b>)
        </div>
        <div>
          • Total Bus Current: <em>Itotal = {busVoltage.toFixed(1)}V / {req.toFixed(2)}Ω</em> ={' '}
          <b className="text-emerald-400">
            {iTotal >= 1 ? `${iTotal.toFixed(3)} A` : `${(iTotal * 1000).toFixed(1)} mA`}
          </b>
        </div>
        <div>
          • Total Circuit Dissipation: <em>Ptotal = {busVoltage.toFixed(1)}V × {iTotal.toFixed(3)}A</em> ={' '}
          <b className="text-amber-400">
            {pTotal >= 1 ? `${pTotal.toFixed(2)} W` : `${(pTotal * 1000).toFixed(1)} mW`}
          </b>
        </div>
      </div>
    </div>
  );
};
