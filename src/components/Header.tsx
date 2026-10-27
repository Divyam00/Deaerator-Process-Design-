import React from 'react';
import {
  FileSpreadsheet,
  Printer,
  Sparkles,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { UnitSystem, DeaeratorType } from '../lib/deaeratorTypes';
import { PRESET_CASES } from '../lib/presets';

interface HeaderProps {
  unitSystem: UnitSystem;
  onUnitSystemChange: (unit: UnitSystem) => void;
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  deaeratorType: DeaeratorType;
  onDeaeratorTypeChange: (type: DeaeratorType) => void;
  onExportExcel: () => void;
  onPrintReport: () => void;
  onToggleTraceability: () => void;
  onReset: () => void;
  overallStatus: 'PASS' | 'WARN' | 'FAIL';
}

export const Header: React.FC<HeaderProps> = ({
  unitSystem,
  onUnitSystemChange,
  selectedPresetId,
  onSelectPreset,
  deaeratorType,
  onDeaeratorTypeChange,
  onExportExcel,
  onPrintReport,
  onToggleTraceability,
  onReset,
  overallStatus,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-xl shadow-inner border border-emerald-400">
            <span className="text-white">DA</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Deaerator Process Calculation & Sizing Tool
              </h1>
              <span
                className={`text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1 ${
                  overallStatus === 'PASS'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : overallStatus === 'WARN'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {overallStatus === 'PASS' && <CheckCircle2 className="w-3 h-3" />}
                {overallStatus === 'WARN' && <AlertTriangle className="w-3 h-3" />}
                {overallStatus === 'FAIL' && <XCircle className="w-3 h-3" />}
                {overallStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ASME BPVC Sec VIII Div 1 • HEI Deaerator Standards • IAPWS-IF97 Steam Tables • ASME PTC 12.3
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Cases Selector */}
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 px-2 py-1 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
            <span className="text-slate-400 mr-1 hidden sm:inline">Case:</span>
            <select
              aria-label="Design Case Study Preset"
              value={selectedPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
            >
              {PRESET_CASES.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-slate-900 text-white">
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Deaerator Type Selector */}
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5 text-xs">
            <button
              onClick={() => onDeaeratorTypeChange('tray')}
              className={`px-2 py-1 rounded font-medium transition ${
                deaeratorType === 'tray'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Counter-flow multi-tier stainless steel tray stack"
            >
              Tray-Type
            </button>
            <button
              onClick={() => onDeaeratorTypeChange('spray')}
              className={`px-2 py-1 rounded font-medium transition ${
                deaeratorType === 'spray'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Spring-loaded variable-area spray valves with atomizing scrubber"
            >
              Spray-Type
            </button>
            <button
              onClick={() => onDeaeratorTypeChange('combined')}
              className={`px-2 py-1 rounded font-medium transition ${
                deaeratorType === 'combined'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Spray preheating zone followed by polishing tray cascade"
            >
              Combined
            </button>
          </div>

          {/* Unit Switcher */}
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5 text-xs">
            <button
              onClick={() => onUnitSystemChange('SI')}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                unitSystem === 'SI'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="SI Metric: kg/h, °C, bar, m, mm, m3/h"
            >
              SI Metric
            </button>
            <button
              onClick={() => onUnitSystemChange('US')}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                unitSystem === 'US'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="US Customary: lb/hr, °F, psig, ft, in, gpm"
            >
              US Customary
            </button>
          </div>

          {/* Formula Traceability Button */}
          <button
            onClick={onToggleTraceability}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-slate-600 transition"
            title="Inspect engineering formula derivations, numerical substitutions, and standard citations"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Formula Trace</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow transition"
            title="Download authentic 5-worksheet formatted Excel spreadsheet (.xlsx) with calculations"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          {/* Print / PDF */}
          <button
            onClick={onPrintReport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
            title="Print or save as PDF engineering dossier"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
            title="Reset to current preset defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
