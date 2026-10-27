import React from 'react';
import {
  DeaeratorCalculationOutput,
  UnitSystem,
} from '../../lib/deaeratorTypes';
import { formatUnitVal } from '../../lib/unitConversions';
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, FileText, Award } from 'lucide-react';

interface ResultsValidationSheetProps {
  calc: DeaeratorCalculationOutput;
  unitSystem: UnitSystem;
}

export const ResultsValidationSheet: React.FC<ResultsValidationSheetProps> = ({
  calc,
  unitSystem,
}) => {
  const { summaryMetrics, validationItems, mechanicalDesign, overallStatus } = calc;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>Worksheet 5: Results & Automated Validation Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic identification of governing design cases, code compliance, velocity limits, mass/energy balance closure, and ASME/HEI checks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 ${
              overallStatus === 'PASS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : overallStatus === 'WARN'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            {overallStatus === 'PASS' && <CheckCircle2 className="w-4 h-4" />}
            {overallStatus === 'WARN' && <AlertTriangle className="w-4 h-4" />}
            {overallStatus === 'FAIL' && <XCircle className="w-4 h-4" />}
            <span>DESIGN STATUS: {overallStatus}</span>
          </span>
        </div>
      </div>

      {/* Executive Governing Values Grid */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Governing Process & Equipment Sizing Summary</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Net Feedwater Capacity</div>
            <div className="text-base font-bold text-white font-mono mt-1">
              {summaryMetrics.feedwaterCapacityTph} t/h
            </div>
            <div className="text-[10px] text-slate-500">100% Boiler Feed MCR</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Steam Consumption</div>
            <div className="text-base font-bold text-amber-400 font-mono mt-1">
              {summaryMetrics.steamConsumptionTph} t/h
            </div>
            <div className="text-[10px] text-slate-500">{summaryMetrics.steamToFeedRatioPercent}% of feedwater</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Operating Temperature</div>
            <div className="text-base font-bold text-cyan-300 font-mono mt-1">
              {formatUnitVal(summaryMetrics.deaeratorOperatingTempC, 'temp', unitSystem, 1)}
            </div>
            <div className="text-[10px] text-slate-500">At {formatUnitVal(summaryMetrics.deaeratorOperatingPressureBarG, 'pressureGauge', unitSystem, 2)}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Guaranteed Residual DO</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-1">
              {summaryMetrics.dissolvedO2OutletPpb} ppb
            </div>
            <div className="text-[10px] text-slate-500">&lt;= 7.0 ppb (HEI Standard)</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Gross Storage Volume</div>
            <div className="text-base font-bold text-white font-mono mt-1">
              {formatUnitVal(summaryMetrics.storageGrossVolumeM3, 'volume', unitSystem, 1)}
            </div>
            <div className="text-[10px] text-slate-500">{summaryMetrics.residenceTimeMin} min hold-up buffer</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Operating Weight</div>
            <div className="text-base font-bold text-purple-300 font-mono mt-1">
              {formatUnitVal(summaryMetrics.operatingWeightTonnes, 'weight', unitSystem, 1)}
            </div>
            <div className="text-[10px] text-slate-500">Normal liquid at NOL</div>
          </div>
        </div>
      </div>

      {/* Automated Validation Matrix Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Automated Code Compliance & Engineering Validation Matrix</h3>
          </div>
          <span className="text-xs text-slate-400">10 Multi-Discipline Engineering Criteria</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                <th className="py-2.5 px-3 font-semibold">ID</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Validation Parameter</th>
                <th className="py-2.5 px-3 font-semibold">Calculated Engineering Value</th>
                <th className="py-2.5 px-3 font-semibold">Allowable Criterion</th>
                <th className="py-2.5 px-3 font-semibold">Governing Standard</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {validationItems.map((val) => (
                <tr key={val.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{val.id}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-300">{val.category}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">
                    <div>{val.parameter}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{val.details}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-200">{val.calculatedValue}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{val.criterion}</td>
                  <td className="py-2.5 px-3 text-slate-400">{val.governingCode}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        val.status === 'PASS'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : val.status === 'WARN'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {val.status === 'PASS' && <CheckCircle2 className="w-3 h-3" />}
                      {val.status === 'WARN' && <AlertTriangle className="w-3 h-3" />}
                      {val.status === 'FAIL' && <XCircle className="w-3 h-3" />}
                      <span>{val.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NACE Safeguard Notice & Engineering Assumptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NACE SP0590 Notice */}
        <div className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>NACE SP0590 / MR0175 Deaerator Cracking Prevention Safeguard</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            {mechanicalDesign.naceNotice}
          </p>
          <div className="text-[11px] text-amber-300/70 pt-2 border-t border-amber-500/20">
            Historical industry failure analysis indicates residual welding tensile stress combined with dissolved oxygen spikes promotes Deaerator Stress Corrosion Cracking (DSCC). Full thermal PWHT is mandatory for carbon steel deaerator vessels.
          </div>
        </div>

        {/* Engineering Boundaries & Assumptions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
            <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Assumptions & Calculation Boundaries</span>
          </div>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Steam & water equilibrium properties verified against IAPWS-IF97 industrial formulations.</li>
            <li>Counter-current mass transfer assumed in the tray stack with Henry&apos;s law gas displacement.</li>
            <li>Storage vessel usable volume calculated strictly between LLL and HL liquid elevations.</li>
            <li>Nozzle diameter selections follow standard schedule 40 dimensions and velocity criteria.</li>
            <li>ASME BPVC Section VIII Div 1 thicknesses are preliminary engineering estimates and must be verified by certified pressure vessel manufacturer.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
