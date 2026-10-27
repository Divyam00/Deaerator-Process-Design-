import React from 'react';
import {
  DeaeratorInputs,
  DeaeratorCalculationOutput,
  UnitSystem,
} from '../../lib/deaeratorTypes';
import { formatUnitVal } from '../../lib/unitConversions';
import { Droplet, Flame, Layers, Info, CheckCircle2 } from 'lucide-react';

interface DesignBasisSheetProps {
  calc: DeaeratorCalculationOutput;
  inputs: DeaeratorInputs;
  onInputChange: <K extends keyof DeaeratorInputs>(key: K, val: DeaeratorInputs[K]) => void;
  unitSystem: UnitSystem;
}

export const DesignBasisSheet: React.FC<DesignBasisSheetProps> = ({
  calc,
  inputs,
  onInputChange,
  unitSystem,
}) => {
  const { streamProperties, massEnergyBalance, deaerationPerformance } = calc;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Worksheet 1: Design Basis & Fluid Properties</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operating pressure & temperature, inlet water streams (makeup + condensate), stripping steam state, and IAPWS-IF97 steam table properties.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
          <span className="text-slate-400">Thermodynamic Formulation:</span>
          <span className="font-bold text-cyan-300">IAPWS-IF97 Industrial Standard</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operating Conditions Card */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Operating & Ambient Basis</span>
            </h3>
            <span className="text-[11px] text-slate-400">Input Variables</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Operating Gauge Pressure */}
            <div>
              <label className="block text-slate-400 font-medium mb-1 flex justify-between">
                <span>Operating Gauge Pressure</span>
                <span className="text-cyan-400 font-mono">P_op,g</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  value={inputs.operatingPressureBarG}
                  onChange={(e) => onInputChange('operatingPressureBarG', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">
                  {unitSystem === 'SI' ? 'bar(g)' : 'psig'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Typical range: 0.2 to 1.5 bar(g) for low/medium pressure boiler deaerators.
              </p>
            </div>

            {/* Atmospheric Pressure */}
            <div>
              <label className="block text-slate-400 font-medium mb-1 flex justify-between">
                <span>Atmospheric Site Pressure</span>
                <span className="text-cyan-400 font-mono">P_atm</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.atmosphericPressureBarA}
                  onChange={(e) => onInputChange('atmosphericPressureBarA', parseFloat(e.target.value) || 1.013)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">
                  {unitSystem === 'SI' ? 'bar(a)' : 'psia'}
                </span>
              </div>
            </div>

            {/* Absolute Pressure & Saturation Temp Result Box */}
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Absolute Pressure:</span>
                <span className="font-bold text-white font-mono">
                  {formatUnitVal(inputs.operatingPressureBarG + inputs.atmosphericPressureBarA, 'pressureAbs', unitSystem, 3)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Operating Saturation Temp:</span>
                <span className="font-bold text-cyan-300 font-mono text-sm">
                  {formatUnitVal(massEnergyBalance.operatingTempSatC, 'temp', unitSystem, 2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Target Residual Dissolved O2:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {inputs.targetOutletO2Ppb} ppb ({deaerationPerformance.outletO2MgL} mg/L)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stripping Steam Supply Card */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Stripping Steam Conditions</span>
            </h3>
            <span className="text-[11px] text-slate-400">Header Supply</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Steam Pressure */}
            <div>
              <label className="block text-slate-400 font-medium mb-1 flex justify-between">
                <span>Steam Supply Gauge Pressure</span>
                <span className="text-cyan-400 font-mono">P_steam,g</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={inputs.steamPressureBarG}
                  onChange={(e) => onInputChange('steamPressureBarG', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">
                  {unitSystem === 'SI' ? 'bar(g)' : 'psig'}
                </span>
              </div>
            </div>

            {/* Steam Temperature */}
            <div>
              <label className="block text-slate-400 font-medium mb-1 flex justify-between">
                <span>Steam Supply Temperature</span>
                <span className="text-cyan-400 font-mono">T_steam</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={inputs.steamTempC}
                  onChange={(e) => onInputChange('steamTempC', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-500"
                />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">
                  {unitSystem === 'SI' ? '°C' : '°F'}
                </span>
              </div>
            </div>

            {/* Steam Enthalpy & Density Results Box */}
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Specific Enthalpy (hg):</span>
                <span className="font-bold text-white font-mono">
                  {streamProperties.heatingSteam.specificEnthalpyKjKg} kJ/kg
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Vapor Density (ρ_v):</span>
                <span className="font-bold text-white font-mono">
                  {streamProperties.heatingSteam.densityKgM3} kg/m³
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Vent Vapor Rate Allowance:</span>
                <span className="font-bold text-cyan-300 font-mono">
                  {inputs.ventLossPercentOfSteam}% of Steam Flow
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Thermodynamic Properties Comparison Card */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Fluid Equilibrium States</span>
            </h3>
            <span className="text-[11px] text-slate-400">IAPWS-IF97</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex justify-between">
              <div>
                <div className="text-slate-400 text-[11px]">Saturated Liquid Enthalpy (hf)</div>
                <div className="font-bold text-white font-mono mt-0.5">
                  {massEnergyBalance.operatingEnthalpyLiquidKjKg} kJ/kg
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-[11px]">Liquid Density (ρ_L)</div>
                <div className="font-bold text-cyan-300 font-mono mt-0.5">
                  {streamProperties.outletWater.densityKgM3} kg/m³
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex justify-between">
              <div>
                <div className="text-slate-400 text-[11px]">Saturated Vapor Enthalpy (hg)</div>
                <div className="font-bold text-white font-mono mt-0.5">
                  {streamProperties.ventVapor.specificEnthalpyKjKg} kJ/kg
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-[11px]">Dome Vapor Density (ρ_V)</div>
                <div className="font-bold text-amber-300 font-mono mt-0.5">
                  {streamProperties.ventVapor.densityKgM3} kg/m³
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex justify-between">
              <div>
                <div className="text-slate-400 text-[11px]">Latent Heat of Vaporization (hfg)</div>
                <div className="font-bold text-white font-mono mt-0.5">
                  {(streamProperties.ventVapor.specificEnthalpyKjKg - massEnergyBalance.operatingEnthalpyLiquidKjKg).toFixed(1)} kJ/kg
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-[11px]">Density Ratio (ρ_L / ρ_V)</div>
                <div className="font-bold text-purple-300 font-mono mt-0.5">
                  {Math.round(streamProperties.outletWater.densityKgM3 / streamProperties.ventVapor.densityKgM3)} : 1
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedwater Inlets Table & Form */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Inlet Feedwater Stream Summary & Parameters</h3>
          </div>
          <span className="text-xs text-slate-400">Edit flow rates and temperatures directly below</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="py-2.5 px-3 font-semibold">Feed Stream Name</th>
                <th className="py-2.5 px-3 font-semibold">Mass Flow ({unitSystem === 'SI' ? 'kg/h' : 'lb/hr'})</th>
                <th className="py-2.5 px-3 font-semibold">Temperature ({unitSystem === 'SI' ? '°C' : '°F'})</th>
                <th className="py-2.5 px-3 font-semibold">Dissolved O2 (mg/L)</th>
                <th className="py-2.5 px-3 font-semibold">Volumetric Flow ({unitSystem === 'SI' ? 'm³/h' : 'gpm'})</th>
                <th className="py-2.5 px-3 font-semibold">Heat Content (kW)</th>
                <th className="py-2.5 px-3 font-semibold">DO Load (kg/h O2)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {/* Makeup Water Row */}
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-medium text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>Treated Makeup Water</span>
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="number"
                    value={inputs.makeupFlowKgH}
                    onChange={(e) => onInputChange('makeupFlowKgH', parseFloat(e.target.value) || 0)}
                    className="w-28 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono focus:border-cyan-500"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="number"
                    value={inputs.makeupTempC}
                    onChange={(e) => onInputChange('makeupTempC', parseFloat(e.target.value) || 0)}
                    className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono focus:border-cyan-500"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.makeupDissolvedO2MgL}
                    onChange={(e) => onInputChange('makeupDissolvedO2MgL', parseFloat(e.target.value) || 0)}
                    className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono focus:border-cyan-500"
                  />
                </td>
                <td className="py-2.5 px-3 text-slate-300 font-mono">
                  {formatUnitVal(streamProperties.makeup.volumetricFlowM3H, 'volFlow', unitSystem, 1)}
                </td>
                <td className="py-2.5 px-3 text-slate-300 font-mono">
                  {streamProperties.makeup.heatContentKw.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-rose-300 font-mono">
                  {streamProperties.makeup.totalO2FlowKgH}
                </td>
              </tr>

              {/* HP Condensate Row */}
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-medium text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>HP Condensate Return</span>
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="number"
                    value={inputs.hpCondensateFlowKgH}
                    onChange={(e) => onInputChange('hpCondensateFlowKgH', parseFloat(e.target.value) || 0)}
                    className="w-28 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono focus:border-cyan-500"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="number"
                    value={inputs.hpCondensateTempC}
                    onChange={(e) => onInputChange('hpCondensateTempC', parseFloat(e.target.value) || 0)}
                    className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono focus:border-cyan-500"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.hpCondensateDissolvedO2MgL}
                    onChange={(e) => onInputChange('hpCondensateDissolvedO2MgL', parseFloat(e.target.value) || 0)}
                    className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono focus:border-cyan-500"
                  />
                </td>
                <td className="py-2.5 px-3 text-slate-300 font-mono">
                  {formatUnitVal(streamProperties.hpCondensate.volumetricFlowM3H, 'volFlow', unitSystem, 1)}
                </td>
                <td className="py-2.5 px-3 text-slate-300 font-mono">
                  {streamProperties.hpCondensate.heatContentKw.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-rose-300 font-mono">
                  {streamProperties.hpCondensate.totalO2FlowKgH}
                </td>
              </tr>

              {/* LP Condensate Row */}
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-medium text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  <span>LP Condensate Return</span>
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="number"
                    value={inputs.lpCondensateFlowKgH}
                    onChange={(e) => onInputChange('lpCondensateFlowKgH', parseFloat(e.target.value) || 0)}
                    className="w-28 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono focus:border-cyan-500"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="number"
                    value={inputs.lpCondensateTempC}
                    onChange={(e) => onInputChange('lpCondensateTempC', parseFloat(e.target.value) || 0)}
                    className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono focus:border-cyan-500"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.lpCondensateDissolvedO2MgL}
                    onChange={(e) => onInputChange('lpCondensateDissolvedO2MgL', parseFloat(e.target.value) || 0)}
                    className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono focus:border-cyan-500"
                  />
                </td>
                <td className="py-2.5 px-3 text-slate-300 font-mono">
                  {formatUnitVal(streamProperties.lpCondensate.volumetricFlowM3H, 'volFlow', unitSystem, 1)}
                </td>
                <td className="py-2.5 px-3 text-slate-300 font-mono">
                  {streamProperties.lpCondensate.heatContentKw.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-rose-300 font-mono">
                  {streamProperties.lpCondensate.totalO2FlowKgH}
                </td>
              </tr>

              {/* Total Mixed Liquid Total Row */}
              <tr className="bg-slate-950/80 font-bold border-t-2 border-slate-700 text-slate-100">
                <td className="py-3 px-3 text-cyan-300">Total Mixed Feedwater In</td>
                <td className="py-3 px-3 font-mono text-cyan-300">
                  {formatUnitVal(massEnergyBalance.totalInletLiquidKgH, 'flow', unitSystem, 0)}
                </td>
                <td className="py-3 px-3 font-mono text-cyan-300">
                  {formatUnitVal(massEnergyBalance.mixedInletWaterTempC, 'temp', unitSystem, 1)} (Mixed)
                </td>
                <td className="py-3 px-3 font-mono text-amber-300">
                  {deaerationPerformance.weightedInletO2MgL} mg/L ({deaerationPerformance.weightedInletO2Ppb} ppb)
                </td>
                <td className="py-3 px-3 font-mono text-slate-200">
                  {formatUnitVal(
                    streamProperties.makeup.volumetricFlowM3H +
                      streamProperties.hpCondensate.volumetricFlowM3H +
                      streamProperties.lpCondensate.volumetricFlowM3H,
                    'volFlow',
                    unitSystem,
                    1
                  )}
                </td>
                <td className="py-3 px-3 font-mono text-slate-200">
                  {(
                    streamProperties.makeup.heatContentKw +
                    streamProperties.hpCondensate.heatContentKw +
                    streamProperties.lpCondensate.heatContentKw
                  ).toLocaleString()} kW
                </td>
                <td className="py-3 px-3 font-mono text-rose-400">
                  {deaerationPerformance.totalInletO2KgH.toFixed(4)} kg/h
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
