import React, { useState } from 'react';
import { SeriesCalculator } from './components/SeriesCalculator';
import { ParallelCalculator } from './components/ParallelCalculator';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'series' | 'parallel'>('series');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          ⚡ Circuit & Resistor Calculator
        </h1>
        <p className="text-slate-400 text-sm">
          Series drop, parallel equivalency, and real-time 3D color-coded resistor visualizers.
        </p>
      </header>

      {/* Tab Buttons */}
      <div className="flex bg-slate-800 p-1.5 rounded-xl border border-slate-700 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('series')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'series'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Series Calculator
        </button>
        <button
          onClick={() => setActiveTab('parallel')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'parallel'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Parallel Calculator
        </button>
      </div>

      {/* Main Tab Content */}
      <main>
        {activeTab === 'series' ? <SeriesCalculator /> : <ParallelCalculator />}
      </main>
    </div>
  );
};

export default App;
