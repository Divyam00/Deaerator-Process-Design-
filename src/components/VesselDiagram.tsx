import React, { useState } from 'react';
import { DeaeratorCalculationOutput, UnitSystem } from '../lib/deaeratorTypes';
import { formatUnitVal } from '../lib/unitConversions';
import { Info, CheckCircle2 } from 'lucide-react';

interface VesselDiagramProps {
  calc: DeaeratorCalculationOutput;
  unitSystem: UnitSystem;
}

export const VesselDiagram: React.FC<VesselDiagramProps> = ({ calc, unitSystem }) => {
  const { vesselInternals, storageLevels, nozzles, mechanicalDesign, inputs } = calc;
  const [selectedElement, setSelectedElement] = useState<string | null>('N4');

  const selectedNozzle = nozzles.find((n) => n.id === selectedElement);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Deaerator General Arrangement & Elevation Schematic</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-normal">
              {inputs.deaeratorType.toUpperCase()} TYPE
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Click any nozzle (N1–N7) or liquid level (NOL, LLL, HHL) to view hydraulic criteria & sizing details
          </p>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>Feedwater Liquid</span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 ml-2"></span>
          <span>Steam Vapor</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* SVG Drawing Canvas */}
        <div className="lg:col-span-8 bg-slate-950 rounded-lg p-2 border border-slate-800/80 flex justify-center items-center overflow-x-auto">
          <svg
            viewBox="0 0 680 440"
            className="w-full max-w-[680px] h-auto select-none font-sans"
            style={{ minWidth: '480px' }}
          >
            <defs>
              {/* Gradient for liquid water in storage tank */}
              <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
              </linearGradient>

              {/* Gradient for steam dome */}
              <linearGradient id="steamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Pattern for stainless steel trays */}
              <pattern id="trayPattern" width="10" height="8" patternUnits="userSpaceOnUse">
                <line x1="0" y1="4" x2="10" y2="4" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="5" cy="4" r="1.5" fill="#38bdf8" />
              </pattern>
            </defs>

            {/* Background gridlines */}
            <g opacity="0.15" stroke="#64748b" strokeWidth="0.5">
              <line x1="40" y1="50" x2="640" y2="50" strokeDasharray="4,4" />
              <line x1="40" y1="200" x2="640" y2="200" strokeDasharray="4,4" />
              <line x1="40" y1="360" x2="640" y2="360" strokeDasharray="4,4" />
            </g>

            {/* SADDLE SUPPORTS (Horizontal Tank) */}
            <g fill="#475569" stroke="#334155" strokeWidth="1.5">
              {/* Left Saddle */}
              <path d="M 170 340 L 155 390 L 215 390 L 200 340 Z" />
              {/* Right Saddle (Sliding) */}
              <path d="M 470 340 L 455 390 L 515 390 L 500 340 Z" />
              <rect x="140" y="390" width="90" height="8" rx="2" fill="#64748b" />
              <rect x="440" y="390" width="90" height="8" rx="2" fill="#64748b" />
              <text x="185" y="408" fill="#94a3b8" fontSize="9" textAnchor="middle">Fixed Saddle</text>
              <text x="485" y="408" fill="#94a3b8" fontSize="9" textAnchor="middle">Sliding Saddle</text>
            </g>

            {/* HORIZONTAL STORAGE VESSEL SHELL & HEADS */}
            <g>
              {/* Left 2:1 Ellipsoidal Head */}
              <path
                d="M 120 200 C 65 200, 65 340, 120 340 Z"
                fill="#1e293b"
                stroke="#64748b"
                strokeWidth="2.5"
              />
              {/* Right 2:1 Ellipsoidal Head */}
              <path
                d="M 550 200 C 605 200, 605 340, 550 340 Z"
                fill="#1e293b"
                stroke="#64748b"
                strokeWidth="2.5"
              />
              {/* Cylindrical Shell */}
              <rect
                x="120"
                y="200"
                width="430"
                height="140"
                fill="#1e293b"
                stroke="#64748b"
                strokeWidth="2.5"
              />

              {/* Water Liquid Layer in Horizontal Tank (NOL = 55% of height = 77px from bottom) */}
              {/* Bottom is y=340, Top is y=200, NOL is y = 340 - 77 = 263 */}
              <rect
                x="121"
                y="263"
                width="428"
                height="76"
                fill="url(#waterGrad)"
                opacity="0.85"
              />
              <path
                d="M 121 263 C 80 263, 80 340, 121 340 Z"
                fill="url(#waterGrad)"
                opacity="0.85"
              />
              <path
                d="M 549 263 C 590 263, 590 340, 549 340 Z"
                fill="url(#waterGrad)"
                opacity="0.85"
              />

              {/* Tangent Lines */}
              <line x1="120" y1="195" x2="120" y2="345" stroke="#94a3b8" strokeDasharray="3,3" strokeWidth="1" />
              <line x1="550" y1="195" x2="550" y2="345" stroke="#94a3b8" strokeDasharray="3,3" strokeWidth="1" />
              <text x="120" y="190" fill="#94a3b8" fontSize="8" textAnchor="middle">T.L.</text>
              <text x="550" y="190" fill="#94a3b8" fontSize="8" textAnchor="middle">T.L.</text>
            </g>

            {/* LIQUID LEVEL INDICATORS (Right Side) */}
            <g fontSize="8" fontFamily="monospace">
              {/* HHL: 88% -> y = 340 - 140*0.88 = 217 */}
              <line x1="100" y1="217" x2="570" y2="217" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="4,3" />
              <text
                x="575"
                y="220"
                fill="#ef4444"
                className="cursor-pointer font-bold"
                onClick={() => setSelectedElement('LEVEL-HHL')}
              >
                HHL ({storageLevels.levels.highHighLevelMm}mm)
              </text>

              {/* HL: 78% -> y = 340 - 140*0.78 = 231 */}
              <line x1="100" y1="231" x2="570" y2="231" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
              <text
                x="575"
                y="234"
                fill="#f59e0b"
                className="cursor-pointer"
                onClick={() => setSelectedElement('LEVEL-HL')}
              >
                HL ({storageLevels.levels.highLevelMm}mm)
              </text>

              {/* NOL: 55% -> y = 340 - 140*0.55 = 263 */}
              <line x1="95" y1="263" x2="570" y2="263" stroke="#38bdf8" strokeWidth="1.8" />
              <text
                x="575"
                y="266"
                fill="#38bdf8"
                className="cursor-pointer font-bold"
                onClick={() => setSelectedElement('LEVEL-NOL')}
              >
                NOL ({storageLevels.levels.normalOperatingLevelMm}mm)
              </text>

              {/* LLL: 24% -> y = 340 - 140*0.24 = 306 */}
              <line x1="100" y1="306" x2="570" y2="306" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
              <text
                x="575"
                y="309"
                fill="#f59e0b"
                className="cursor-pointer"
                onClick={() => setSelectedElement('LEVEL-LLL')}
              >
                LLL ({storageLevels.levels.lowLevelMm}mm)
              </text>

              {/* LLLL: 12% -> y = 340 - 140*0.12 = 323 */}
              <line x1="100" y1="323" x2="570" y2="323" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="4,3" />
              <text
                x="575"
                y="326"
                fill="#ef4444"
                className="cursor-pointer font-bold"
                onClick={() => setSelectedElement('LEVEL-LLLL')}
              >
                LLLL ({storageLevels.levels.lowLowLevelMm}mm)
              </text>
            </g>

            {/* VERTICAL DEAERATING DOME / TOWER */}
            <g>
              {/* Dome Shell */}
              <rect
                x="280"
                y="40"
                width="110"
                height="160"
                fill="#1e293b"
                stroke="#64748b"
                strokeWidth="2.5"
              />
              {/* Top Ellipsoidal Head */}
              <path
                d="M 280 40 C 280 15, 390 15, 390 40 Z"
                fill="#1e293b"
                stroke="#64748b"
                strokeWidth="2.5"
              />

              {/* Internals: Spray Valves */}
              <g>
                <circle cx="310" cy="55" r="5" fill="#f59e0b" stroke="#d97706" />
                <circle cx="335" cy="55" r="5" fill="#f59e0b" stroke="#d97706" />
                <circle cx="360" cy="55" r="5" fill="#f59e0b" stroke="#d97706" />
                {/* Spray Water Cones */}
                <path d="M 310 60 L 295 85 L 325 85 Z" fill="#38bdf8" opacity="0.4" />
                <path d="M 335 60 L 320 85 L 350 85 Z" fill="#38bdf8" opacity="0.4" />
                <path d="M 360 60 L 345 85 L 375 85 Z" fill="#38bdf8" opacity="0.4" />
                <text x="335" y="73" fill="#cbd5e1" fontSize="8" textAnchor="middle" fontWeight="bold">
                  {vesselInternals.sprayValveCount} Spray Valves
                </text>
              </g>

              {/* Internals: Tray Stack (if tray or combined) */}
              {inputs.deaeratorType !== 'spray' && (
                <g>
                  <rect
                    x="292"
                    y="95"
                    width="86"
                    height="65"
                    fill="url(#trayPattern)"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    rx="3"
                  />
                  <rect x="290" y="93" width="90" height="4" fill="#64748b" />
                  <rect x="290" y="113" width="90" height="4" fill="#64748b" />
                  <rect x="290" y="133" width="90" height="4" fill="#64748b" />
                  <rect x="290" y="153" width="90" height="4" fill="#64748b" />
                  <text x="335" y="128" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {vesselInternals.trayCountTiers} Tray Tiers (SS)
                  </text>
                </g>
              )}

              {/* Internals: Spray scrubber baffle (if spray type) */}
              {inputs.deaeratorType === 'spray' && (
                <g>
                  <path d="M 295 105 L 375 125 L 295 145" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
                  <text x="335" y="130" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">
                    Scrubber Baffle
                  </text>
                </g>
              )}

              {/* Steam Injection Sparger into Dome Base */}
              <line x1="285" y1="175" x2="385" y2="175" stroke="#f59e0b" strokeWidth="3" />
              <circle cx="300" cy="175" r="2" fill="#ffffff" />
              <circle cx="320" cy="175" r="2" fill="#ffffff" />
              <circle cx="340" cy="175" r="2" fill="#ffffff" />
              <circle cx="360" cy="175" r="2" fill="#ffffff" />
              <text x="335" y="170" fill="#f59e0b" fontSize="7" textAnchor="middle">
                Steam Distribution Sparger
              </text>
            </g>

            {/* VORTEX BREAKER at BFW Suction (N4) */}
            <g transform="translate(335, 335)">
              <rect x="-15" y="-5" width="30" height="5" fill="#94a3b8" />
              <line x1="-10" y1="-10" x2="10" y2="-10" stroke="#94a3b8" strokeWidth="2" />
              <line x1="0" y1="-10" x2="0" y2="0" stroke="#94a3b8" strokeWidth="2" />
            </g>

            {/* NOZZLES: CLICKABLE WITH HIGHLIGHT */}

            {/* N1: Makeup Water Inlet (Top Dome) */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedElement('N1')}
            >
              <rect x="300" y="10" width="16" height="15" fill="#38bdf8" stroke="#0284c7" />
              <circle
                cx="308"
                cy="7"
                r="10"
                fill={selectedElement === 'N1' ? '#38bdf8' : '#0284c7'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text x="308" y="10" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">N1</text>
            </g>

            {/* N5: Vent Nozzle (Top Dome Center) */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedElement('N5')}
            >
              <rect x="355" y="8" width="12" height="17" fill="#cbd5e1" stroke="#64748b" />
              <circle
                cx="361"
                cy="5"
                r="10"
                fill={selectedElement === 'N5' ? '#38bdf8' : '#475569'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text x="361" y="8" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">N5</text>
            </g>

            {/* N2: Condensate Return (Left Dome Side) */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedElement('N2')}
            >
              <rect x="262" y="75" width="18" height="14" fill="#38bdf8" stroke="#0284c7" />
              <circle
                cx="255"
                cy="82"
                r="10"
                fill={selectedElement === 'N2' ? '#38bdf8' : '#0284c7'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text x="255" y="85" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">N2</text>
            </g>

            {/* N3: Heating Steam Inlet (Right Dome Side) */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedElement('N3')}
            >
              <rect x="390" y="165" width="22" height="18" fill="#f59e0b" stroke="#d97706" />
              <circle
                cx="420"
                cy="174"
                r="10"
                fill={selectedElement === 'N3' ? '#38bdf8' : '#d97706'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text x="420" y="177" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">N3</text>
            </g>

            {/* N6: Overflow Nozzle (Storage Tank Left Shell) */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedElement('N6')}
            >
              <rect x="100" y="212" width="20" height="14" fill="#f43f5e" stroke="#e11d48" />
              <circle
                cx="90"
                cy="219"
                r="10"
                fill={selectedElement === 'N6' ? '#38bdf8' : '#e11d48'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text x="90" y="222" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">N6</text>
            </g>

            {/* N4: BFW Pump Suction Outlet (Storage Tank Bottom) */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedElement('N4')}
            >
              <rect x="325" y="340" width="20" height="25" fill="#0284c7" stroke="#0369a1" />
              <circle
                cx="335"
                cy="375"
                r="12"
                fill={selectedElement === 'N4' ? '#38bdf8' : '#0284c7'}
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text x="335" y="379" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">N4</text>
            </g>

            {/* N7: Vessel Drain Nozzle (Storage Tank Bottom Left) */}
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedElement('N7')}
            >
              <rect x="220" y="340" width="14" height="20" fill="#64748b" stroke="#475569" />
              <circle
                cx="227"
                cy="370"
                r="10"
                fill={selectedElement === 'N7' ? '#38bdf8' : '#475569'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text x="227" y="373" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">N7</text>
            </g>

            {/* DIMENSION ARROWS & LABELS */}
            {/* Storage Tank Length: 120 to 550 = 430 px */}
            <g stroke="#94a3b8" strokeWidth="1" fill="#94a3b8" fontSize="9">
              <line x1="120" y1="365" x2="550" y2="365" />
              <polygon points="120,365 126,362 126,368" />
              <polygon points="550,365 544,362 544,368" />
              <text x="335" y="360" textAnchor="middle" fill="#cbd5e1" fontWeight="bold">
                L_tt: {storageLevels.tankLengthTangentToTangentMm} mm ({formatUnitVal(storageLevels.tankLengthTangentToTangentMm, 'lengthSmall', unitSystem, 0)})
              </text>
            </g>

            {/* Storage Tank Diameter */}
            <g stroke="#94a3b8" strokeWidth="1" fill="#94a3b8" fontSize="9">
              <line x1="55" y1="200" x2="55" y2="340" />
              <polygon points="55,200 52,206 58,206" />
              <polygon points="55,340 52,334 58,334" />
              <text x="50" y="275" textAnchor="end" fill="#cbd5e1" fontWeight="bold">
                Ø{storageLevels.tankDiameterMm} mm
              </text>
            </g>

            {/* Dome Diameter: 280 to 390 = 110 px */}
            <g stroke="#94a3b8" strokeWidth="1" fill="#94a3b8" fontSize="9">
              <line x1="280" y1="30" x2="390" y2="30" />
              <polygon points="280,30 286,27 286,33" />
              <polygon points="390,30 384,27 384,33" />
              <text x="335" y="24" textAnchor="middle" fill="#cbd5e1" fontWeight="bold">
                Dome Ø{vesselInternals.domeDiameterMm} mm
              </text>
            </g>
          </svg>
        </div>

        {/* Selected Nozzle or Level Inspection Inspector Card */}
        <div className="lg:col-span-4 bg-slate-800/80 rounded-lg p-3.5 border border-slate-700 text-xs">
          {selectedNozzle ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
                    {selectedNozzle.id}
                  </span>
                  <div>
                    <div className="font-bold text-white text-sm">{selectedNozzle.name}</div>
                    <div className="text-[11px] text-slate-400">{selectedNozzle.service}</div>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedNozzle.status === 'PASS'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {selectedNozzle.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900/60 p-2 rounded">
                  <div className="text-slate-400">Nominal Pipe Size</div>
                  <div className="font-bold text-white text-xs">
                    {selectedNozzle.selectedNpsInches}&quot; ({selectedNozzle.selectedSchedule})
                  </div>
                  <div className="text-slate-500 text-[10px]">ID: {selectedNozzle.internalDiameterMm} mm</div>
                </div>

                <div className="bg-slate-900/60 p-2 rounded">
                  <div className="text-slate-400">Phase & Fluid</div>
                  <div className="font-bold text-white text-xs">{selectedNozzle.phase}</div>
                  <div className="text-slate-500 text-[10px]">
                    {unitSystem === 'SI'
                      ? `${(selectedNozzle.flowKgH / 1000).toFixed(1)} t/h`
                      : `${(selectedNozzle.flowKgH * 2.20462 / 1000).toFixed(1)} klb/hr`}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2 rounded">
                  <div className="text-slate-400">Actual Velocity</div>
                  <div className="font-bold text-cyan-300 text-xs">
                    {formatUnitVal(selectedNozzle.actualVelocityMS, 'velocity', unitSystem, 2)}
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    Max Limit: {formatUnitVal(selectedNozzle.allowableVelocityMS, 'velocity', unitSystem, 2)}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2 rounded">
                  <div className="text-slate-400">Dynamic Head (0.5ρv²)</div>
                  <div className="font-bold text-white text-xs">
                    {selectedNozzle.velocityHeadPa.toLocaleString()} Pa
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    ΔP/100m: {selectedNozzle.estimatedDeltaPBarPer100M} bar
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-2 rounded border border-slate-700/60">
                <div className="text-[10px] text-slate-400 font-semibold mb-0.5">Governing Design Rule:</div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedNozzle.governingRule}
                </div>
              </div>

              {selectedNozzle.id === 'N4' && (
                <div className="bg-blue-950/40 p-2 rounded border border-blue-500/30 text-[11px] text-blue-200">
                  <span className="font-semibold text-blue-300">Vortex Breaker Installed:</span> Cross-type vortex suppressor baffle prevents vapor pull-down into boiler feedwater pump suction.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="font-bold text-white text-sm border-b border-slate-700 pb-1.5 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Liquid Level Sizing & Volumes</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Normal Operating Level (NOL):</span>
                  <span className="font-bold text-cyan-300">{storageLevels.levels.normalOperatingLevelMm} mm (55% D)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">High Level Alarm (HL):</span>
                  <span className="font-bold text-amber-300">{storageLevels.levels.highLevelMm} mm (78% D)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">High-High Level Trip (HHL):</span>
                  <span className="font-bold text-rose-300">{storageLevels.levels.highHighLevelMm} mm (88% D)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Low Level Alarm (LLL):</span>
                  <span className="font-bold text-amber-300">{storageLevels.levels.lowLevelMm} mm (24% D)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Low-Low Level Trip (LLLL):</span>
                  <span className="font-bold text-rose-300">{storageLevels.levels.lowLowLevelMm} mm (12% D)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Usable Residence Time (LLL to HL):</span>
                  <span className="font-bold text-emerald-400">{storageLevels.residenceTimeActualMin} min @ MCR</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Gross Vessel Storage Volume:</span>
                  <span className="font-bold text-white">{formatUnitVal(storageLevels.grossVolumeM3, 'volume', unitSystem, 1)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Nozzle Selector Chips */}
          <div className="pt-2 border-t border-slate-700/80 mt-2">
            <div className="text-[10px] text-slate-400 mb-1.5 font-medium">Select Nozzle:</div>
            <div className="flex flex-wrap gap-1">
              {nozzles.map((noz) => (
                <button
                  key={noz.id}
                  onClick={() => setSelectedElement(noz.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                    selectedElement === noz.id
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {noz.id}
                </button>
              ))}
              <button
                onClick={() => setSelectedElement(null)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  selectedElement === null
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Levels
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
