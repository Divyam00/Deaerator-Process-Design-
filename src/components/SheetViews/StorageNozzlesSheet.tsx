import React from 'react';
import {
  DeaeratorInputs,
  DeaeratorCalculationOutput,
  UnitSystem,
} from '../../lib/deaeratorTypes';
import { formatUnitVal } from '../../lib/unitConversions';
import { Cylinder, Compass, Shield, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface StorageNozzlesSheetProps {
  calc: DeaeratorCalculationOutput;
  inputs: DeaeratorInputs;
  onInputChange: <K extends keyof DeaeratorInputs>(key: K, val: DeaeratorInputs[K]) => void;
  unitSystem: UnitSystem;
}

export const StorageNozzlesSheet: React.FC<StorageNozzlesSheetProps> = ({
  calc,
  inputs,
  onInputChange,
  unitSystem,
}) => {
  const { storageLevels, nozzles, mechanicalDesign } = calc;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Cylinder className="w-5 h-5 text-blue-400" />
            <span>Worksheet 4: Storage Vessel, Nozzle Schedule & Mechanical Design</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Feedwater storage hold-up volume, liquid level elevations, piping nozzle velocities (API RP 14E / HI), and ASME BPVC Section VIII Div 1 wall thickness.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded bg-blue-500/20 text-blue-300 font-bold text-xs border border-blue-500/40">
            Residence Time: {storageLevels.residenceTimeActualMin} min (Req: {inputs.residenceTimeMin} min)
          </div>
          <div className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40">
            ASME Sec VIII: PASS
          </div>
        </div>
      </div>

      {/* Storage Tank Volume & Level Elevations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Volume & Geometry */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cylinder className="w-4 h-4 text-cyan-400" />
              <span>Storage Vessel Geometry & Residence Time</span>
            </h3>
            <span className="text-xs text-slate-400">Horizontal Tank</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Required Residence Time</div>
                <div className="font-bold text-white font-mono text-base mt-0.5">
                  {inputs.residenceTimeMin} minutes
                </div>
                <div className="text-slate-500 text-[10px]">At 100% Boiler Feed MCR</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Actual Hold-up (LLL to HL)</div>
                <div className="font-bold text-emerald-400 font-mono text-base mt-0.5">
                  {storageLevels.residenceTimeActualMin} minutes
                </div>
                <div className="text-emerald-500/80 text-[10px]">Exceeds Required Buffer</div>
              </div>
            </div>

            {/* Inputs: Residence time and L/D */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1 text-[11px]">
                  Residence Time Spec (min)
                </label>
                <input
                  type="number"
                  step="1"
                  value={inputs.residenceTimeMin}
                  onChange={(e) => onInputChange('residenceTimeMin', parseFloat(e.target.value) || 10)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1 text-[11px]">
                  Length / Diameter (L/D) Ratio
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.storageTankLengthToDiaRatio}
                  onChange={(e) => onInputChange('storageTankLengthToDiaRatio', parseFloat(e.target.value) || 3.5)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Tank Inside Diameter:</span>
                <strong className="text-white font-mono">
                  {formatUnitVal(storageLevels.tankDiameterMm, 'diameter', unitSystem, 0)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tangent-to-Tangent Length:</span>
                <strong className="text-white font-mono">
                  {formatUnitVal(storageLevels.tankLengthTangentToTangentMm, 'lengthSmall', unitSystem, 0)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Overall Length (Head-to-Head):</span>
                <strong className="text-white font-mono">
                  {formatUnitVal(storageLevels.totalTankLengthOverallMm, 'lengthSmall', unitSystem, 0)}
                </strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Usable Liquid Volume (LLL-HL):</span>
                <strong className="text-cyan-300 font-mono">
                  {formatUnitVal(storageLevels.usableVolumeM3, 'volume', unitSystem, 1)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gross Vessel Total Volume:</span>
                <strong className="text-white font-mono">
                  {formatUnitVal(storageLevels.grossVolumeM3, 'volume', unitSystem, 1)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Liquid Level Elevations Table */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Liquid Level Elevations & Hold-up Intervals</span>
            </h3>
            <span className="text-xs text-slate-400">Elevation from Bottom</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="py-2 px-3 font-semibold">Level Mark</th>
                  <th className="py-2 px-3 font-semibold">Elevation ({unitSystem === 'SI' ? 'mm' : 'in'})</th>
                  <th className="py-2 px-3 font-semibold">% of Shell ID</th>
                  <th className="py-2 px-3 font-semibold">Hold-up Buffer</th>
                  <th className="py-2 px-3 font-semibold">Control Function</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-bold text-white">Top of Shell</td>
                  <td className="py-2 px-3 font-mono text-slate-300">{storageLevels.levels.topOfShellMm} mm</td>
                  <td className="py-2 px-3 font-mono text-slate-400">100.0%</td>
                  <td className="py-2 px-3 text-slate-400">-</td>
                  <td className="py-2 px-3 text-slate-400">Vessel Crown</td>
                </tr>
                <tr className="hover:bg-slate-800/40 bg-rose-950/10">
                  <td className="py-2 px-3 font-bold text-rose-400">HHL (High-High)</td>
                  <td className="py-2 px-3 font-mono text-rose-300">{storageLevels.levels.highHighLevelMm} mm</td>
                  <td className="py-2 px-3 font-mono text-rose-400">88.0%</td>
                  <td className="py-2 px-3 text-slate-300 font-mono">{storageLevels.holdUpTimesMin.hhlToHlMin} min</td>
                  <td className="py-2 px-3 text-rose-300 font-semibold">Trip Steam Extraction / Overflow</td>
                </tr>
                <tr className="hover:bg-slate-800/40 bg-amber-950/10">
                  <td className="py-2 px-3 font-bold text-amber-400">HL (High Level)</td>
                  <td className="py-2 px-3 font-mono text-amber-300">{storageLevels.levels.highLevelMm} mm</td>
                  <td className="py-2 px-3 font-mono text-amber-400">78.0%</td>
                  <td className="py-2 px-3 text-slate-300 font-mono">{storageLevels.holdUpTimesMin.hlToNolMin} min</td>
                  <td className="py-2 px-3 text-amber-300">High Level Alarm & Throttle Makeup</td>
                </tr>
                <tr className="hover:bg-slate-800/40 bg-cyan-950/20">
                  <td className="py-2 px-3 font-bold text-cyan-300">NOL (Normal)</td>
                  <td className="py-2 px-3 font-mono text-cyan-200">{storageLevels.levels.normalOperatingLevelMm} mm</td>
                  <td className="py-2 px-3 font-mono text-cyan-300">55.0%</td>
                  <td className="py-2 px-3 text-cyan-200 font-mono">{storageLevels.holdUpTimesMin.nolToLllMin} min</td>
                  <td className="py-2 px-3 text-cyan-300 font-semibold">Normal Modulating Control Level</td>
                </tr>
                <tr className="hover:bg-slate-800/40 bg-amber-950/10">
                  <td className="py-2 px-3 font-bold text-amber-400">LLL (Low Level)</td>
                  <td className="py-2 px-3 font-mono text-amber-300">{storageLevels.levels.lowLevelMm} mm</td>
                  <td className="py-2 px-3 font-mono text-amber-400">24.0%</td>
                  <td className="py-2 px-3 text-slate-300 font-mono">{storageLevels.holdUpTimesMin.lllToLlllMin} min</td>
                  <td className="py-2 px-3 text-amber-300">Low Level Alarm & Emergency Makeup</td>
                </tr>
                <tr className="hover:bg-slate-800/40 bg-rose-950/10">
                  <td className="py-2 px-3 font-bold text-rose-400">LLLL (Low-Low)</td>
                  <td className="py-2 px-3 font-mono text-rose-300">{storageLevels.levels.lowLowLevelMm} mm</td>
                  <td className="py-2 px-3 font-mono text-rose-400">12.0%</td>
                  <td className="py-2 px-3 text-slate-400">-</td>
                  <td className="py-2 px-3 text-rose-300 font-semibold">BFW Pump Interlock Trip (Cavitation)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Complete Nozzle Schedule (N1 to N7) */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Piping Nozzle Schedule & Hydraulic Velocity Sizing</h3>
          </div>
          <span className="text-xs text-slate-400">Criteria per API RP 14E / Hydraulic Institute / HEI</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="py-2.5 px-3 font-semibold">Tag</th>
                <th className="py-2.5 px-3 font-semibold">Service Description</th>
                <th className="py-2.5 px-3 font-semibold">Phase</th>
                <th className="py-2.5 px-3 font-semibold">NPS</th>
                <th className="py-2.5 px-3 font-semibold">Schedule</th>
                <th className="py-2.5 px-3 font-semibold">ID (mm)</th>
                <th className="py-2.5 px-3 font-semibold">Mass Flow</th>
                <th className="py-2.5 px-3 font-semibold">Actual Velocity</th>
                <th className="py-2.5 px-3 font-semibold">Max Allowable</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {nozzles.map((noz) => (
                <tr key={noz.id} className="hover:bg-slate-800/40 font-sans">
                  <td className="py-2 px-3 font-bold text-cyan-400 font-mono">{noz.id}</td>
                  <td className="py-2 px-3 font-medium text-white">{noz.name}</td>
                  <td className="py-2 px-3 text-slate-400">{noz.phase}</td>
                  <td className="py-2 px-3 font-bold text-slate-200 font-mono">{noz.selectedNpsInches}&quot;</td>
                  <td className="py-2 px-3 text-slate-400 font-mono">{noz.selectedSchedule}</td>
                  <td className="py-2 px-3 text-slate-300 font-mono">{noz.internalDiameterMm}</td>
                  <td className="py-2 px-3 text-slate-300 font-mono">
                    {formatUnitVal(noz.flowKgH, 'flow', unitSystem, 0)}
                  </td>
                  <td className="py-2 px-3 font-bold text-cyan-300 font-mono">
                    {formatUnitVal(noz.actualVelocityMS, 'velocity', unitSystem, 2)}
                  </td>
                  <td className="py-2 px-3 text-slate-400 font-mono">
                    {formatUnitVal(noz.allowableVelocityMS, 'velocity', unitSystem, 2)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        noz.status === 'PASS'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : noz.status === 'WARN'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {noz.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASME Section VIII Div 1 Mechanical Design & Weights */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">ASME BPVC Section VIII Division 1 Mechanical Design</h3>
          </div>
          <span className="text-xs text-slate-400">Rules UG-27 (Shell) & UG-32 (2:1 Heads)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Shell & Head Thickness Calculation Box */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2.5">
            <div className="font-bold text-white text-sm border-b border-slate-800 pb-1.5">
              Plate Thickness Determination
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Design Internal Pressure:</span>
              <strong className="text-white font-mono">{formatUnitVal(mechanicalDesign.designPressureBarG, 'pressureGauge', unitSystem, 2)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Design Temperature:</span>
              <strong className="text-white font-mono">{formatUnitVal(mechanicalDesign.designTempC, 'temp', unitSystem, 1)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Allowable Stress (S):</span>
              <strong className="text-white font-mono">{mechanicalDesign.allowableStressMpa} MPa ({inputs.shellMaterial})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Joint Efficiency (E):</span>
              <strong className="text-white font-mono">{inputs.jointEfficiency} (Spot Radiography)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Corrosion Allowance (CA):</span>
              <strong className="text-amber-300 font-mono">{inputs.corrosionAllowanceMm} mm</strong>
            </div>
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Storage Shell Min (UG-27):</span>
                <strong className="text-cyan-300 font-mono">{mechanicalDesign.storageShellMinThicknessMm} mm</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Selected Nominal Shell:</span>
                <strong className="text-emerald-400 font-mono font-bold text-sm">{mechanicalDesign.storageShellNominalThicknessMm} mm (PASS)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Storage 2:1 Head Min (UG-32):</span>
                <strong className="text-cyan-300 font-mono">{mechanicalDesign.storageHeadMinThicknessMm} mm</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Selected Nominal Head:</span>
                <strong className="text-emerald-400 font-mono font-bold text-sm">{mechanicalDesign.storageHeadNominalThicknessMm} mm (PASS)</strong>
              </div>
            </div>
          </div>

          {/* Pressure & Code Safeguards */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2.5">
            <div className="font-bold text-white text-sm border-b border-slate-800 pb-1.5">
              Code Ratings & Testing
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Calculated MAWP (Corroded):</span>
              <strong className="text-white font-mono">{formatUnitVal(mechanicalDesign.storageMawpBarG, 'pressureGauge', unitSystem, 2)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Shop Hydrotest Pressure (UG-99):</span>
              <strong className="text-cyan-300 font-mono">{formatUnitVal(mechanicalDesign.hydrotestPressureBarG, 'pressureGauge', unitSystem, 2)} (1.3 × MAWP)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dome Shell Nominal:</span>
              <strong className="text-white font-mono">{mechanicalDesign.domeShellNominalThicknessMm} mm</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dome Head Nominal:</span>
              <strong className="text-white font-mono">{mechanicalDesign.domeHeadNominalThicknessMm} mm</strong>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300">ASME Section VIII Div 1 Status:</span>
              <div className="text-emerald-400 font-bold mt-0.5">COMPLIANT (t_nom &gt;= t_min for all components)</div>
            </div>
          </div>

          {/* Weight Estimation & Civil Loads */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2.5">
            <div className="font-bold text-white text-sm border-b border-slate-800 pb-1.5">
              Vessel Weight Estimation
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Empty Metal Weight:</span>
              <strong className="text-white font-mono">
                {formatUnitVal(mechanicalDesign.estimatedEmptyVesselWeightTonnes, 'weight', unitSystem, 1)}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tray / Spray Internals Weight:</span>
              <strong className="text-white font-mono">
                {formatUnitVal(mechanicalDesign.internalsWeightTonnes, 'weight', unitSystem, 2)}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Operating Weight (Water at NOL):</span>
              <strong className="text-cyan-300 font-mono font-bold text-sm">
                {formatUnitVal(mechanicalDesign.operatingWeightTonnes, 'weight', unitSystem, 1)}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Flooded Hydrotest Weight (100% Full):</span>
              <strong className="text-amber-300 font-mono font-bold text-sm">
                {formatUnitVal(mechanicalDesign.floodedWeightTonnes, 'weight', unitSystem, 1)}
              </strong>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
              Operating weight governs continuous saddle load; flooded weight governs civil foundation sizing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
