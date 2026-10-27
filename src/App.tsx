import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ValidationSummaryBar } from './components/ValidationSummaryBar';
import {
  WorkbookTabs,
  WorksheetTabId,
  ViewMode,
} from './components/WorkbookTabs';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { VesselDiagram } from './components/VesselDiagram';
import { DesignBasisSheet } from './components/SheetViews/DesignBasisSheet';
import { MassEnergyBalanceSheet } from './components/SheetViews/MassEnergyBalanceSheet';
import { InternalsSizingSheet } from './components/SheetViews/InternalsSizingSheet';
import { StorageNozzlesSheet } from './components/SheetViews/StorageNozzlesSheet';
import { ResultsValidationSheet } from './components/SheetViews/ResultsValidationSheet';
import { FormulaTraceabilityModal } from './components/FormulaTraceabilityModal';
import { runDeaeratorCalculations } from './lib/deaeratorCalculations';
import { PRESET_CASES } from './lib/presets';
import { exportDeaeratorToExcel } from './lib/excelExport';
import { DeaeratorInputs, UnitSystem, DeaeratorType } from './lib/deaeratorTypes';

export default function App() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('case-1-ccpp');
  const [inputs, setInputs] = useState<DeaeratorInputs>(PRESET_CASES[0].inputs);
  const [activeTab, setActiveTab] = useState<WorksheetTabId>('design-basis');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [isTraceabilityOpen, setIsTraceabilityOpen] = useState<boolean>(false);

  // Run calculation engine whenever inputs change
  const calcOutput = useMemo(() => {
    return runDeaeratorCalculations(inputs);
  }, [inputs]);

  // Handle Preset Selection
  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_CASES.find((p) => p.id === presetId);
    if (found) {
      setSelectedPresetId(presetId);
      setInputs({ ...found.inputs });
    }
  };

  // Handle Unit System Change
  const handleUnitSystemChange = (unit: UnitSystem) => {
    setInputs((prev) => ({ ...prev, unitSystem: unit }));
  };

  // Handle Deaerator Type Change
  const handleDeaeratorTypeChange = (type: DeaeratorType) => {
    setInputs((prev) => ({ ...prev, deaeratorType: type }));
  };

  // Handle Input Changes
  const handleInputChange = <K extends keyof DeaeratorInputs>(
    key: K,
    val: DeaeratorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  };

  // Handle Reset to Current Preset
  const handleReset = () => {
    const found = PRESET_CASES.find((p) => p.id === selectedPresetId);
    if (found) {
      setInputs({ ...found.inputs });
    }
  };

  // Handle Export to Excel
  const handleExportExcel = () => {
    const filename = `${inputs.tagNumber || 'Deaerator'}_Process_Sizing_Report.xlsx`;
    exportDeaeratorToExcel(calcOutput, filename);
  };

  // Handle Print Dossier
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Application Header */}
      <Header
        unitSystem={inputs.unitSystem}
        onUnitSystemChange={handleUnitSystemChange}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        deaeratorType={inputs.deaeratorType}
        onDeaeratorTypeChange={handleDeaeratorTypeChange}
        onExportExcel={handleExportExcel}
        onPrintReport={handlePrintReport}
        onToggleTraceability={() => setIsTraceabilityOpen(true)}
        onReset={handleReset}
        overallStatus={calcOutput.overallStatus}
      />

      {/* Executive Key Metric & Validation Bar */}
      <ValidationSummaryBar
        calc={calcOutput}
        unitSystem={inputs.unitSystem}
        onOpenValidationSheet={() => setActiveTab('results-validation')}
      />

      {/* The 5 Worksheets Tabs Navigation & View Mode Switcher */}
      <WorkbookTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {viewMode === 'spreadsheet' ? (
          /* SPREADSHEET GRID VIEW (Classic Excel Appearance) */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Interactive Excel Grid:</span>
                <span>Select any cell to inspect its formula or click the pencil icon to modify process inputs directly.</span>
              </div>
              <button
                onClick={() => setViewMode('dashboard')}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Switch to Engineering Dashboard →
              </button>
            </div>

            <SpreadsheetGrid
              activeTab={activeTab}
              calc={calcOutput}
              inputs={inputs}
              onInputChange={handleInputChange}
              unitSystem={inputs.unitSystem}
            />
          </div>
        ) : (
          /* ENGINEERING DASHBOARD VIEW (Cards, Calculations, Equations, Diagrams) */
          <div className="space-y-6">
            {activeTab === 'design-basis' && (
              <DesignBasisSheet
                calc={calcOutput}
                inputs={inputs}
                onInputChange={handleInputChange}
                unitSystem={inputs.unitSystem}
              />
            )}

            {activeTab === 'mass-energy' && (
              <MassEnergyBalanceSheet
                calc={calcOutput}
                inputs={inputs}
                onInputChange={handleInputChange}
                unitSystem={inputs.unitSystem}
              />
            )}

            {activeTab === 'internals-sizing' && (
              <div className="space-y-6">
                <InternalsSizingSheet
                  calc={calcOutput}
                  inputs={inputs}
                  onInputChange={handleInputChange}
                  unitSystem={inputs.unitSystem}
                />
                <VesselDiagram
                  calc={calcOutput}
                  unitSystem={inputs.unitSystem}
                />
              </div>
            )}

            {activeTab === 'storage-mechanical' && (
              <div className="space-y-6">
                <StorageNozzlesSheet
                  calc={calcOutput}
                  inputs={inputs}
                  onInputChange={handleInputChange}
                  unitSystem={inputs.unitSystem}
                />
                <VesselDiagram
                  calc={calcOutput}
                  unitSystem={inputs.unitSystem}
                />
              </div>
            )}

            {activeTab === 'results-validation' && (
              <ResultsValidationSheet
                calc={calcOutput}
                unitSystem={inputs.unitSystem}
              />
            )}
          </div>
        )}
      </main>

      {/* Formula Traceability Modal Drawer */}
      <FormulaTraceabilityModal
        isOpen={isTraceabilityOpen}
        onClose={() => setIsTraceabilityOpen(false)}
        formulaTrace={calcOutput.formulaTrace}
      />

      {/* Application Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 text-xs py-4 px-6 text-center select-none print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            Deaerator Process Calculation &amp; Sizing Tool • Tray, Spray, and Combined Configurations
          </div>
          <div>
            ASME Boiler &amp; Pressure Vessel Code Sec VIII Div 1 • HEI 9th Ed • IAPWS-IF97 • API RP 14E • NACE SP0590
          </div>
        </div>
      </footer>
    </div>
  );
}
