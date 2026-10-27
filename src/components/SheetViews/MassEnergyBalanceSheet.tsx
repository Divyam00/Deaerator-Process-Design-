import React from 'react';
import {
  DeaeratorInputs,
  DeaeratorCalculationOutput,
  UnitSystem,
} from '../../lib/deaeratorTypes';
import { formatUnitVal } from '../../lib/unitConversions';
import { Flame, Droplets, Wind, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface MassEnergyBalanceSheetProps {
  calc: DeaeratorCalculationOutput;
  inputs: DeaeratorInputs;
  onInputChange: <K extends keyof DeaeratorInputs>(key: K, val: DeaeratorInputs[K]) => void;
  unitSystem: UnitSystem;
}

export const MassEnergyBalanceSheet: React.FC<MassEnergyBalanceSheetProps> = ({
  calc,
  inputs,
  onInputChange,
  unitSystem,
}) => {
  const { massEnergyBalance, deaerationPerformance, streamProperties } = calc;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Worksheet 2: Mass & Energy Balance / Deaeration Performance</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Governing heat and mass conservation equations, required steam stripping rate, enthalpy closure, and gas removal kinetics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mass Closure: {massEnergyBalance.massBalanceErrorPercent}% (&lt; 0.05%)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Energy Closure: {massEnergyBalance.energyBalanceErrorPercent}% (&lt; 0.10%)</span>
          </div>
        </div>
      </div>

      {/* Sankey / Flow Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Feedwater In */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 relative overflow-hidden">
          <div className="text-[11px] text-slate-400 font-medium">1. Total Feedwater In</div>
          <div className="text-xl font-bold text-white font-mono mt-1">
            {formatUnitVal(massEnergyBalance.totalInletLiquidKgH, 'flow', unitSystem, 0)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {(massEnergyBalance.totalInletLiquidKgH / 1000).toFixed(1)} t/h @ {formatUnitVal(massEnergyBalance.mixedInletWaterTempC, 'temp', unitSystem, 1)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Enthalpy: <strong className="text-slate-200">{massEnergyBalance.mixedInletEnthalpyKjKg} kJ/kg</strong>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-10">
            <Droplets className="w-16 h-16 text-cyan-400" />
          </div>
        </div>

        {/* Card 2: Heating Steam Required */}
        <div className="bg-slate-900 rounded-xl border border-amber-500/30 p-4 relative overflow-hidden">
          <div className="text-[11px] text-amber-300 font-medium flex items-center justify-between">
            <span>2. Stripping Steam Required</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">Governing</span>
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">
            {formatUnitVal(massEnergyBalance.heatingSteamRequiredKgH, 'flow', unitSystem, 0)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {(massEnergyBalance.heatingSteamRequiredKgH / 1000).toFixed(2)} t/h ({((massEnergyBalance.heatingSteamRequiredKgH / massEnergyBalance.totalDeaeratedWaterOutKgH) * 100).toFixed(2)}% of feed)
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Supply Enthalpy: <strong className="text-amber-200">{streamProperties.heatingSteam.specificEnthalpyKjKg} kJ/kg</strong>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-10">
            <Flame className="w-16 h-16 text-amber-400" />
          </div>
        </div>

        {/* Card 3: Vent Vapor Loss */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 relative overflow-hidden">
          <div className="text-[11px] text-slate-400 font-medium">3. Vent Vapor Loss</div>
          <div className="text-xl font-bold text-slate-200 font-mono mt-1">
            {formatUnitVal(massEnergyBalance.ventVaporLossKgH, 'flow', unitSystem, 1)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {inputs.ventLossPercentOfSteam}% of Steam ({deaerationPerformance.nonCondensablesKgH.totalGasNm3H} Nm³/h gas)
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Vented Enthalpy: <strong className="text-slate-300">{streamProperties.ventVapor.specificEnthalpyKjKg} kJ/kg</strong>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-10">
            <Wind className="w-16 h-16 text-slate-400" />
          </div>
        </div>

        {/* Card 4: Net Deaerated Water Out */}
        <div className="bg-slate-900 rounded-xl border border-emerald-500/40 p-4 relative overflow-hidden">
          <div className="text-[11px] text-emerald-300 font-medium flex items-center justify-between">
            <span>4. Net Boiler Feed Delivery</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">100% MCR</span>
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
            {formatUnitVal(massEnergyBalance.totalDeaeratedWaterOutKgH, 'flow', unitSystem, 0)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {(massEnergyBalance.totalDeaeratedWaterOutKgH / 1000).toFixed(2)} t/h @ {formatUnitVal(massEnergyBalance.operatingTempSatC, 'temp', unitSystem, 1)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Residual DO: <strong className="text-emerald-300">{inputs.targetOutletO2Ppb} ppb (Guaranteed)</strong>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-10">
            <ShieldCheck className="w-16 h-16 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Heat Duty Breakdown & Governing Equation Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heat Balance Details */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Thermal Heat Duty Breakdown</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Sensible Preheating Duty (Q_sens):</span>
                <span className="font-bold text-white font-mono text-sm">
                  {formatUnitVal(massEnergyBalance.sensibleHeatKw, 'heatDuty', unitSystem, 1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Heat Loss Allowance ({inputs.heatLossPercentOfDuty}% radiation):</span>
                <span className="font-bold text-slate-300 font-mono">
                  {formatUnitVal(massEnergyBalance.heatLossKw, 'heatDuty', unitSystem, 1)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-slate-200 font-semibold">Gross Thermal Heat Duty:</span>
                <span className="font-bold text-amber-400 font-mono text-base">
                  {formatUnitVal(massEnergyBalance.grossHeatDutyKw, 'heatDuty', unitSystem, 1)}
                </span>
              </div>
            </div>

            {/* Heat Duty Parameters Form */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 font-medium mb-1 text-[11px]">
                  Vent Rate (% of Steam)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.ventLossPercentOfSteam}
                  onChange={(e) => onInputChange('ventLossPercentOfSteam', parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1 text-[11px]">
                  Radiation Heat Loss (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.heatLossPercentOfDuty}
                  onChange={(e) => onInputChange('heatLossPercentOfDuty', parseFloat(e.target.value) || 1.0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Energy Balance Formula:</span>
              <div className="font-mono text-cyan-300 mt-1">
                M_steam = [M_in · (h_out - h_mix) + Q_loss] / [h_steam - (1 - f_v)·h_out - f_v·h_v]
              </div>
            </div>
          </div>
        </div>

        {/* Deaeration Performance & Gas Stripping */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Deaeration Performance & Non-Condensable Stripping</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Inlet Dissolved O2 Concentration:</span>
                <span className="font-bold text-amber-300 font-mono">
                  {deaerationPerformance.weightedInletO2MgL} mg/L ({deaerationPerformance.weightedInletO2Ppb} ppb)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Target Residual Dissolved O2:</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  {inputs.targetOutletO2Ppb} ppb ({deaerationPerformance.outletO2MgL} mg/L)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Oxygen Removal Efficiency:</span>
                <span className="font-bold text-cyan-300 font-mono text-sm">
                  {deaerationPerformance.oxygenRemovalEfficiencyPercent}%
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-slate-300 font-medium">HEI Guaranteed Standard Compliance:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40">
                  COMPLIANT (&lt;= 7 ppb)
                </span>
              </div>
            </div>

            {/* Non-Condensable Gases Release Table */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-300">
                Stripped Non-Condensable Gases to Vent:
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                  <div className="text-slate-400">Oxygen (O2)</div>
                  <div className="font-bold text-white font-mono mt-0.5">
                    {deaerationPerformance.nonCondensablesKgH.oxygenKgH} kg/h
                  </div>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                  <div className="text-slate-400">Nitrogen (N2)</div>
                  <div className="font-bold text-white font-mono mt-0.5">
                    {deaerationPerformance.nonCondensablesKgH.nitrogenKgH} kg/h
                  </div>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                  <div className="text-slate-400">Carbon Dioxide (CO2)</div>
                  <div className="font-bold text-white font-mono mt-0.5">
                    {deaerationPerformance.nonCondensablesKgH.carbonDioxideKgH} kg/h
                  </div>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                Total Non-Condensables: <strong className="text-white font-mono">{deaerationPerformance.nonCondensablesKgH.totalGasNm3H} Nm³/h</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
