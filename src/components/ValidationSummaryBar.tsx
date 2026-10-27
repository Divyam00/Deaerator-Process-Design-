import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Thermometer,
  Gauge,
  Droplets,
  Clock,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { DeaeratorCalculationOutput, UnitSystem } from '../lib/deaeratorTypes';
import { formatUnitVal } from '../lib/unitConversions';

interface ValidationSummaryBarProps {
  calc: DeaeratorCalculationOutput;
  unitSystem: UnitSystem;
  onOpenValidationSheet: () => void;
}

export const ValidationSummaryBar: React.FC<ValidationSummaryBarProps> = ({
  calc,
  unitSystem,
  onOpenValidationSheet,
}) => {
  const { summaryMetrics, overallStatus, validationItems } = calc;
  const passCount = validationItems.filter((v) => v.status === 'PASS').length;
  const warnCount = validationItems.filter((v) => v.status === 'WARN').length;
  const failCount = validationItems.filter((v) => v.status === 'FAIL').length;

  return (
    <div className="bg-slate-850 border-b border-slate-750 bg-slate-900/90 backdrop-blur px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Pass/Warn/Fail Status Pill */}
        <button
          onClick={onOpenValidationSheet}
          className="flex items-center gap-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 transition text-left cursor-pointer group"
        >
          <div className="flex items-center gap-1.5">
            {overallStatus === 'PASS' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            {overallStatus === 'WARN' && (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            {overallStatus === 'FAIL' && (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Code Compliance
              </div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>{overallStatus === 'PASS' ? 'All Checks Passed' : overallStatus === 'WARN' ? 'Warnings Present' : 'Code Violations'}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-cyan-300">({passCount}/{validationItems.length})</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 border-l border-slate-700 pl-2 text-[11px]">
            <span className="text-emerald-400 font-semibold">{passCount} OK</span>
            {warnCount > 0 && <span className="text-amber-400 font-semibold">· {warnCount} Warn</span>}
            {failCount > 0 && <span className="text-rose-400 font-semibold">· {failCount} Fail</span>}
          </div>
        </button>

        {/* Governing Metrics Grid */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Outlet BFW Flow */}
          <div className="bg-slate-800/60 rounded px-2.5 py-1 border border-slate-700/60 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400">Net Feedwater</div>
              <div className="font-bold text-slate-100">
                {unitSystem === 'SI'
                  ? `${summaryMetrics.feedwaterCapacityTph} t/h`
                  : `${(summaryMetrics.feedwaterCapacityTph * 2.20462).toFixed(1)} klb/hr`}
              </div>
            </div>
          </div>

          {/* Steam Consumption */}
          <div className="bg-slate-800/60 rounded px-2.5 py-1 border border-slate-700/60 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400">Heating Steam</div>
              <div className="font-bold text-slate-100">
                {unitSystem === 'SI'
                  ? `${summaryMetrics.steamConsumptionTph} t/h (${summaryMetrics.steamToFeedRatioPercent}%)`
                  : `${(summaryMetrics.steamConsumptionTph * 2.20462).toFixed(1)} klb/hr`}
              </div>
            </div>
          </div>

          {/* Operating Saturation Conditions */}
          <div className="bg-slate-800/60 rounded px-2.5 py-1 border border-slate-700/60 flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-rose-400" />
            <div>
              <div className="text-[10px] text-slate-400">T_sat / P_op</div>
              <div className="font-bold text-slate-100">
                {formatUnitVal(summaryMetrics.deaeratorOperatingTempC, 'temp', unitSystem, 1)} @ {formatUnitVal(summaryMetrics.deaeratorOperatingPressureBarG, 'pressureGauge', unitSystem, 2)}
              </div>
            </div>
          </div>

          {/* Residual DO */}
          <div className="bg-slate-800/60 rounded px-2.5 py-1 border border-slate-700/60 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400">Residual DO</div>
              <div className="font-bold text-emerald-400">
                {summaryMetrics.dissolvedO2OutletPpb} ppb (HEI Guaranteed)
              </div>
            </div>
          </div>

          {/* Residence Time */}
          <div className="bg-slate-800/60 rounded px-2.5 py-1 border border-slate-700/60 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <div>
              <div className="text-[10px] text-slate-400">Hold-Up Time</div>
              <div className="font-bold text-slate-100">
                {summaryMetrics.residenceTimeMin} min @ MCR
              </div>
            </div>
          </div>

          {/* Storage Tank Dimensions */}
          <div className="bg-slate-800/60 rounded px-2.5 py-1 border border-slate-700/60 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-purple-400" />
            <div>
              <div className="text-[10px] text-slate-400">Storage Size (ID × L)</div>
              <div className="font-bold text-slate-100">
                {unitSystem === 'SI'
                  ? `Ø${(summaryMetrics.storageVesselDiaMm / 1000).toFixed(1)}m × ${(summaryMetrics.storageVesselLengthMm / 1000).toFixed(1)}m`
                  : `Ø${(summaryMetrics.storageVesselDiaMm * 0.03937).toFixed(0)}" × ${(summaryMetrics.storageVesselLengthMm * 0.03937 / 12).toFixed(1)}'`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
