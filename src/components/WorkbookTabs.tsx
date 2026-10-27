import React from 'react';
import {
  Layers,
  Flame,
  Maximize2,
  Cylinder,
  CheckCircle2,
  Table,
  LayoutDashboard,
} from 'lucide-react';

export type WorksheetTabId =
  | 'design-basis'
  | 'mass-energy'
  | 'internals-sizing'
  | 'storage-mechanical'
  | 'results-validation';

export type ViewMode = 'dashboard' | 'spreadsheet';

interface WorkbookTabsProps {
  activeTab: WorksheetTabId;
  onTabChange: (tab: WorksheetTabId) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const WORKBOOK_SHEETS: {
  id: WorksheetTabId;
  name: string;
  sheetNumber: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    id: 'design-basis',
    name: 'Design Basis & Properties',
    sheetNumber: 'Sheet 1',
    icon: Layers,
    description: 'Feedwater streams, steam conditions, IAPWS-IF97 steam tables & gas solubility',
  },
  {
    id: 'mass-energy',
    name: 'Mass/Energy Balance',
    sheetNumber: 'Sheet 2',
    icon: Flame,
    description: 'Feedwater mixing, thermal heat duty, steam consumption & vent losses',
  },
  {
    id: 'internals-sizing',
    name: 'Deaerator & Internals Sizing',
    sheetNumber: 'Sheet 3',
    icon: Maximize2,
    description: 'Dome diameter/height, tray stack hydraulics, spray valves & Souders-Brown velocity',
  },
  {
    id: 'storage-mechanical',
    name: 'Storage, Nozzles & Mechanical',
    sheetNumber: 'Sheet 4',
    icon: Cylinder,
    description: 'Storage tank volume, NOL/LLL/HHL levels, nozzle schedule & ASME Sec VIII Div 1',
  },
  {
    id: 'results-validation',
    name: 'Results & Validation',
    sheetNumber: 'Sheet 5',
    icon: CheckCircle2,
    description: 'Governing parameters, automated compliance matrix, NACE safeguards & assumptions',
  },
];

export const WorkbookTabs: React.FC<WorkbookTabsProps> = ({
  activeTab,
  onTabChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-750 px-4 pt-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* The 5 Worksheets Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          {WORKBOOK_SHEETS.map((sheet, index) => {
            const Icon = sheet.icon;
            const isActive = activeTab === sheet.id;
            return (
              <button
                key={sheet.id}
                onClick={() => onTabChange(sheet.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg transition border-t border-x ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 border-cyan-500/50 shadow-sm relative after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-cyan-400'
                    : 'bg-slate-900/60 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
                }`}
                title={sheet.description}
              >
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700/60 text-slate-300 font-mono">
                  {index + 1}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{sheet.name}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle: Interactive Engineering View vs Excel Spreadsheet Grid */}
        <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs mb-1.5">
          <button
            onClick={() => onViewModeChange('dashboard')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition ${
              viewMode === 'dashboard'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Visual process flow, interactive diagram, engineering calculation formulas"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Engineering View</span>
          </button>
          <button
            onClick={() => onViewModeChange('spreadsheet')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition ${
              viewMode === 'spreadsheet'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Classic Excel spreadsheet grid with rows, columns, cell selection and live formula bar"
          >
            <Table className="w-3.5 h-3.5" />
            <span>Excel Grid View</span>
          </button>
        </div>
      </div>
    </div>
  );
};
