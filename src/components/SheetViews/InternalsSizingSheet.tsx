import React from 'react';
import {
  DeaeratorInputs,
  DeaeratorCalculationOutput,
  UnitSystem,
} from '../../lib/deaeratorTypes';
import { formatUnitVal } from '../../lib/unitConversions';
import { Maximize2, Wind, Layers, Sliders, CheckCircle2 } from 'lucide-react';

interface InternalsSizingSheetProps {
  calc: DeaeratorCalculationOutput;
  inputs: DeaeratorInputs;
  onInputChange: <K extends keyof DeaeratorInputs>(key: K, val: DeaeratorInputs[K]) => void;
  unitSystem: UnitSystem;
}

export const InternalsSizingSheet: React.FC<InternalsSizingSheetProps> = ({
  calc,
  inputs,
  onInputChange,
  unitSystem,
}) => {
  const { vesselInternals } = calc;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Maximize2 className="w-5 h-5 text-cyan-400" />
            <span>Worksheet 3: Deaerator & Internals Sizing</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sizing of vertical deaerating tower, Souders-Brown vapor entrainment limit, hydraulic tray loading, and spring-loaded spray nozzles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Current Configuration:</span>
          <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 font-bold text-xs border border-blue-500/40 uppercase">
            {vesselInternals.deaeratorType} DEAERATOR
          </span>
        </div>
      </div>

      {/* Primary Tower Geometry & Souders-Brown Velocity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tower Diameter */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tower / Dome Diameter</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">D_dome</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatUnitVal(vesselInternals.domeDiameterMm, 'diameter', unitSystem, 0)}
          </div>
          <div className="text-xs text-slate-400">
            Cross-Sectional Area: <strong className="text-slate-200">{vesselInternals.crossSectionAreaM2} m²</strong>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            Sized to house tray stack envelope and maintain counter-current steam velocity below flooding thresholds.
          </div>
        </div>

        {/* Tower Height */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tower Overall Height</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">H_dome</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatUnitVal(vesselInternals.domeHeightMm, 'lengthSmall', unitSystem, 0)}
          </div>
          <div className="text-xs text-slate-400">
            Total Internal Volume: <strong className="text-slate-200">{vesselInternals.deaerationSectionTotalVolumeM3} m³</strong>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            Includes spray atomization zone (900mm), multi-tier tray cascade (if applicable), and vapor disengagement headroom.
          </div>
        </div>

        {/* Souders-Brown Vapor Velocity */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Vapor Velocity & Entrainment</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                vesselInternals.vaporVelocityRatio < 0.8
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {vesselInternals.vaporVelocityRatio < 0.8 ? 'PASS (< 80%)' : 'WARNING'}
            </span>
          </div>
          <div className="text-2xl font-bold text-cyan-300 font-mono">
            {formatUnitVal(vesselInternals.vaporVelocityActualMS, 'velocity', unitSystem, 2)}
          </div>
          <div className="text-xs text-slate-400">
            Allowable Limit: <strong className="text-slate-200">{formatUnitVal(vesselInternals.vaporVelocityAllowableMS, 'velocity', unitSystem, 2)}</strong> ({((vesselInternals.vaporVelocityRatio * 100)).toFixed(1)}%)
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            Souders-Brown: <code className="text-cyan-300 font-mono">v_allow = K_sb · √((ρ_L - ρ_V) / ρ_V)</code> with K_sb = {vesselInternals.soudersBrownK}.
          </div>
        </div>
      </div>

      {/* Detailed Internals: Tray Stack vs Spray Valves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tray Assembly Section */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Tray Stack Cascade Section</span>
            </h3>
            <span className="text-xs text-slate-400">HEI Standard Section 3.4</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Active Tray Area</div>
                <div className="font-bold text-white font-mono text-base mt-0.5">
                  {vesselInternals.trayStackAreaM2} m²
                </div>
                <div className="text-slate-500 text-[10px]">
                  {vesselInternals.trayWidthMm} mm × {vesselInternals.trayLengthMm} mm
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Tray Cascade Tiers</div>
                <div className="font-bold text-white font-mono text-base mt-0.5">
                  {vesselInternals.trayCountTiers} Rows
                </div>
                <div className="text-slate-500 text-[10px]">
                  Stack Height: {vesselInternals.activeTrayHeightMm} mm
                </div>
              </div>
            </div>

            {/* Tray Hydraulic Loading Input */}
            <div>
              <label className="block text-slate-400 font-medium mb-1 flex justify-between">
                <span>Design Tray Hydraulic Loading</span>
                <span className="text-cyan-400 font-mono">{formatUnitVal(vesselInternals.trayLoadingM3Hm2, 'loading', unitSystem, 1)}</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="5"
                  value={inputs.trayHydraulicLoadingM3Hm2}
                  onChange={(e) => onInputChange('trayHydraulicLoadingM3Hm2', parseFloat(e.target.value) || 100)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-cyan-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">
                  {unitSystem === 'SI' ? 'm³/(h·m²)' : 'gpm/ft²'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                HEI Recommended range: 80 to 150 m³/(h·m²) (35 - 65 gpm/ft²).
              </p>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[11px] space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Tray Metallurgy:</span>
                <strong className="text-white">{vesselInternals.trayMaterial}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tray Weir Height:</span>
                <strong className="text-white">{inputs.trayWeirHeightMm} mm (HEI standard)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Flow Pattern:</span>
                <strong className="text-cyan-300">Counter-current vertical cascade</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Spray Valve Atomization Section */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wind className="w-4 h-4 text-amber-400" />
              <span>Spray Valve Atomizing Section</span>
            </h3>
            <span className="text-xs text-slate-400">Spring-Loaded Variable-Area</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Spray Valves Required</div>
                <div className="font-bold text-amber-400 font-mono text-base mt-0.5">
                  {vesselInternals.sprayValveCount} Nozzles
                </div>
                <div className="text-slate-500 text-[10px]">
                  Circumferential header layout
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Flow per Spray Valve</div>
                <div className="font-bold text-white font-mono text-base mt-0.5">
                  {vesselInternals.sprayValveFlowPerValveM3H} m³/h
                </div>
                <div className="text-slate-500 text-[10px]">
                  {formatUnitVal(vesselInternals.sprayValveFlowPerValveM3H, 'volFlow', unitSystem, 1)}
                </div>
              </div>
            </div>

            {/* Spray Valve Delta P Input */}
            <div>
              <label className="block text-slate-400 font-medium mb-1 flex justify-between">
                <span>Design Spray Valve Differential Pressure (ΔP)</span>
                <span className="text-amber-400 font-mono">{inputs.sprayValveDeltaPBar} bar</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  value={inputs.sprayValveDeltaPBar}
                  onChange={(e) => onInputChange('sprayValveDeltaPBar', parseFloat(e.target.value) || 0.25)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-cyan-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">
                  {unitSystem === 'SI' ? 'bar' : 'psi'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Typical spring-loaded valve ΔP: 0.15 to 0.35 bar across 10-100% turn-down.
              </p>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[11px] space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Spray Pattern:</span>
                <strong className="text-white">Full hollow cone atomization</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cone Overlap Coverage:</span>
                <strong className="text-emerald-400">{vesselInternals.sprayConeCoveragePercent}% (Continuous water curtain)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valve Metallurgy:</span>
                <strong className="text-white">Cast 316L Stainless Steel with Inconel X750 Spring</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
