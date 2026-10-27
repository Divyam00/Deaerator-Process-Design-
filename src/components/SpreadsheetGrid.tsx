import React, { useState } from 'react';
import {
  DeaeratorInputs,
  DeaeratorCalculationOutput,
  UnitSystem,
} from '../lib/deaeratorTypes';
import { WorksheetTabId } from './WorkbookTabs';
import { formatUnitVal } from '../lib/unitConversions';
import { Edit3, Check, HelpCircle } from 'lucide-react';

interface SpreadsheetGridProps {
  activeTab: WorksheetTabId;
  calc: DeaeratorCalculationOutput;
  inputs: DeaeratorInputs;
  onInputChange: <K extends keyof DeaeratorInputs>(key: K, val: DeaeratorInputs[K]) => void;
  unitSystem: UnitSystem;
}

interface GridCell {
  address: string; // e.g. "B5"
  row: number;
  col: string;
  label: string;
  value: string | number;
  displayValue: string;
  formula?: string;
  isEditable?: boolean;
  inputKey?: keyof DeaeratorInputs;
  category?: 'header' | 'input' | 'calculated' | 'text' | 'badge';
  status?: 'PASS' | 'WARN' | 'FAIL';
  explanation?: string;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  activeTab,
  calc,
  inputs,
  onInputChange,
  unitSystem,
}) => {
  const [selectedCellAddress, setSelectedCellAddress] = useState<string>('B8');
  const [editingKey, setEditingKey] = useState<keyof DeaeratorInputs | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const { streamProperties, massEnergyBalance, deaerationPerformance, vesselInternals, storageLevels, nozzles, mechanicalDesign, validationItems } = calc;

  // Build grid data dynamically based on the activeTab
  const buildSheetRows = (): GridCell[][] => {
    const rows: GridCell[][] = [];

    const addSectionHeader = (rowNum: number, title: string) => {
      rows.push([
        {
          address: `A${rowNum}`,
          row: rowNum,
          col: 'A',
          label: 'Section',
          value: title,
          displayValue: title,
          category: 'header',
        },
        { address: `B${rowNum}`, row: rowNum, col: 'B', label: '', value: '', displayValue: '', category: 'header' },
        { address: `C${rowNum}`, row: rowNum, col: 'C', label: '', value: '', displayValue: '', category: 'header' },
        { address: `D${rowNum}`, row: rowNum, col: 'D', label: '', value: '', displayValue: '', category: 'header' },
        { address: `E${rowNum}`, row: rowNum, col: 'E', label: '', value: '', displayValue: '', category: 'header' },
        { address: `F${rowNum}`, row: rowNum, col: 'F', label: '', value: '', displayValue: '', category: 'header' },
      ]);
    };

    if (activeTab === 'design-basis') {
      addSectionHeader(1, '1. OPERATING & SITE CONDITIONS');
      rows.push([
        { address: 'A2', row: 2, col: 'A', label: 'Parameter', value: 'Project Title', displayValue: 'Project Title', category: 'text' },
        { address: 'B2', row: 2, col: 'B', label: 'Value', value: inputs.projectTitle, displayValue: inputs.projectTitle, category: 'text' },
        { address: 'C2', row: 2, col: 'C', label: 'Unit', value: '-', displayValue: '-', category: 'text' },
        { address: 'D2', row: 2, col: 'D', label: 'Type', value: 'Metadata', displayValue: 'Metadata', category: 'text' },
        { address: 'E2', row: 2, col: 'E', label: 'Source', value: 'Project Specification', displayValue: 'Project Specification', category: 'text' },
        { address: 'F2', row: 2, col: 'F', label: 'Formula', value: 'INPUT', displayValue: 'INPUT', category: 'text' },
      ]);
      rows.push([
        { address: 'A3', row: 3, col: 'A', label: 'Parameter', value: 'Tag Number', displayValue: 'Tag Number', category: 'text' },
        { address: 'B3', row: 3, col: 'B', label: 'Value', value: inputs.tagNumber, displayValue: inputs.tagNumber, category: 'text' },
        { address: 'C3', row: 3, col: 'C', label: 'Unit', value: '-', displayValue: '-', category: 'text' },
        { address: 'D3', row: 3, col: 'D', label: 'Type', value: 'Metadata', displayValue: 'Equipment Tag', category: 'text' },
        { address: 'E3', row: 3, col: 'E', label: 'Source', value: 'P&ID Reference', displayValue: 'P&ID Reference', category: 'text' },
        { address: 'F3', row: 3, col: 'F', label: 'Formula', value: 'INPUT', displayValue: 'INPUT', category: 'text' },
      ]);
      rows.push([
        { address: 'A4', row: 4, col: 'A', label: 'Parameter', value: 'Operating Gauge Pressure', displayValue: 'Operating Gauge Pressure', category: 'text' },
        {
          address: 'B4',
          row: 4,
          col: 'B',
          label: 'Value',
          value: inputs.operatingPressureBarG,
          displayValue: formatUnitVal(inputs.operatingPressureBarG, 'pressureGauge', unitSystem, 3),
          isEditable: true,
          inputKey: 'operatingPressureBarG',
          category: 'input',
          formula: 'USER_INPUT',
          explanation: 'Operating gauge pressure in deaerator dome and storage tank.',
        },
        { address: 'C4', row: 4, col: 'C', label: 'Unit', value: 'bar(g)', displayValue: unitSystem === 'SI' ? 'bar(g)' : 'psig', category: 'text' },
        { address: 'D4', row: 4, col: 'D', label: 'Type', value: 'Independent Variable', displayValue: 'Operating Var', category: 'text' },
        { address: 'E4', row: 4, col: 'E', label: 'Source', value: 'Steam Plant Balance', displayValue: 'Process Design', category: 'text' },
        { address: 'F4', row: 4, col: 'F', label: 'Formula', value: '=INPUT()', displayValue: '=INPUT()', category: 'text' },
      ]);
      rows.push([
        { address: 'A5', row: 5, col: 'A', label: 'Parameter', value: 'Operating Absolute Pressure', displayValue: 'Operating Absolute Pressure', category: 'text' },
        {
          address: 'B5',
          row: 5,
          col: 'B',
          label: 'Value',
          value: inputs.operatingPressureBarG + inputs.atmosphericPressureBarA,
          displayValue: formatUnitVal(inputs.operatingPressureBarG + inputs.atmosphericPressureBarA, 'pressureAbs', unitSystem, 3),
          category: 'calculated',
          formula: '=B4+1.013',
          explanation: 'P_abs = P_gauge + P_atm (Absolute pressure governing boiling equilibrium)',
        },
        { address: 'C5', row: 5, col: 'C', label: 'Unit', value: 'bar(a)', displayValue: unitSystem === 'SI' ? 'bar(a)' : 'psia', category: 'text' },
        { address: 'D5', row: 5, col: 'D', label: 'Type', value: 'Thermodynamic', displayValue: 'Thermodynamic', category: 'text' },
        { address: 'E5', row: 5, col: 'E', label: 'Source', value: 'IAPWS-IF97', displayValue: 'IAPWS-IF97', category: 'text' },
        { address: 'F5', row: 5, col: 'F', label: 'Formula', value: '=B4+B_ATM', displayValue: '=B4+B_ATM', category: 'text' },
      ]);
      rows.push([
        { address: 'A6', row: 6, col: 'A', label: 'Parameter', value: 'Operating Saturation Temperature', displayValue: 'Operating Saturation Temperature', category: 'text' },
        {
          address: 'B6',
          row: 6,
          col: 'B',
          label: 'Value',
          value: massEnergyBalance.operatingTempSatC,
          displayValue: formatUnitVal(massEnergyBalance.operatingTempSatC, 'temp', unitSystem, 2),
          category: 'calculated',
          formula: '=IAPWS_TSAT(B5)',
          explanation: 'Saturation temperature computed from IAPWS-IF97 Region 4 equation.',
        },
        { address: 'C6', row: 6, col: 'C', label: 'Unit', value: '°C', displayValue: unitSystem === 'SI' ? '°C' : '°F', category: 'text' },
        { address: 'D6', row: 6, col: 'D', label: 'Type', value: 'Thermodynamic Saturation', displayValue: 'Saturation Temp', category: 'text' },
        { address: 'E6', row: 6, col: 'E', label: 'Source', value: 'IAPWS-IF97 Region 4', displayValue: 'IAPWS-IF97', category: 'text' },
        { address: 'F6', row: 6, col: 'F', label: 'Formula', value: '=T_SAT(B5)', displayValue: '=T_SAT(B5)', category: 'text' },
      ]);

      addSectionHeader(7, '2. FEEDWATER INLET STREAMS & COMPOSITIONS');
      rows.push([
        { address: 'A8', row: 8, col: 'A', label: 'Stream', value: 'Makeup Water Flow Rate', displayValue: 'Makeup Water Flow Rate', category: 'text' },
        {
          address: 'B8',
          row: 8,
          col: 'B',
          label: 'Value',
          value: inputs.makeupFlowKgH,
          displayValue: formatUnitVal(inputs.makeupFlowKgH, 'flow', unitSystem, 0),
          isEditable: true,
          inputKey: 'makeupFlowKgH',
          category: 'input',
          formula: 'USER_INPUT',
          explanation: 'Treated demineralized makeup water mass flow entering the deaerator.',
        },
        { address: 'C8', row: 8, col: 'C', label: 'Unit', value: 'kg/h', displayValue: unitSystem === 'SI' ? 'kg/h' : 'lb/hr', category: 'text' },
        { address: 'D8', row: 8, col: 'D', label: 'Temp', value: inputs.makeupTempC, displayValue: formatUnitVal(inputs.makeupTempC, 'temp', unitSystem, 1), category: 'text' },
        { address: 'E8', row: 8, col: 'E', label: 'DO (mg/L)', value: inputs.makeupDissolvedO2MgL, displayValue: `${inputs.makeupDissolvedO2MgL} mg/L`, category: 'text' },
        { address: 'F8', row: 8, col: 'F', label: 'Enthalpy', value: streamProperties.makeup.specificEnthalpyKjKg, displayValue: `${streamProperties.makeup.specificEnthalpyKjKg} kJ/kg`, category: 'text' },
      ]);
      rows.push([
        { address: 'A9', row: 9, col: 'A', label: 'Stream', value: 'HP Condensate Return', displayValue: 'HP Condensate Return', category: 'text' },
        {
          address: 'B9',
          row: 9,
          col: 'B',
          label: 'Value',
          value: inputs.hpCondensateFlowKgH,
          displayValue: formatUnitVal(inputs.hpCondensateFlowKgH, 'flow', unitSystem, 0),
          isEditable: true,
          inputKey: 'hpCondensateFlowKgH',
          category: 'input',
          formula: 'USER_INPUT',
          explanation: 'High-pressure clean turbine/heater condensate returned to deaerator.',
        },
        { address: 'C9', row: 9, col: 'C', label: 'Unit', value: 'kg/h', displayValue: unitSystem === 'SI' ? 'kg/h' : 'lb/hr', category: 'text' },
        { address: 'D9', row: 9, col: 'D', label: 'Temp', value: inputs.hpCondensateTempC, displayValue: formatUnitVal(inputs.hpCondensateTempC, 'temp', unitSystem, 1), category: 'text' },
        { address: 'E9', row: 9, col: 'E', label: 'DO (mg/L)', value: inputs.hpCondensateDissolvedO2MgL, displayValue: `${inputs.hpCondensateDissolvedO2MgL} mg/L`, category: 'text' },
        { address: 'F9', row: 9, col: 'F', label: 'Enthalpy', value: streamProperties.hpCondensate.specificEnthalpyKjKg, displayValue: `${streamProperties.hpCondensate.specificEnthalpyKjKg} kJ/kg`, category: 'text' },
      ]);
      rows.push([
        { address: 'A10', row: 10, col: 'A', label: 'Stream', value: 'LP Condensate Return', displayValue: 'LP Condensate Return', category: 'text' },
        {
          address: 'B10',
          row: 10,
          col: 'B',
          label: 'Value',
          value: inputs.lpCondensateFlowKgH,
          displayValue: formatUnitVal(inputs.lpCondensateFlowKgH, 'flow', unitSystem, 0),
          isEditable: true,
          inputKey: 'lpCondensateFlowKgH',
          category: 'input',
          formula: 'USER_INPUT',
          explanation: 'Low-pressure process condensate returned to deaerator.',
        },
        { address: 'C10', row: 10, col: 'C', label: 'Unit', value: 'kg/h', displayValue: unitSystem === 'SI' ? 'kg/h' : 'lb/hr', category: 'text' },
        { address: 'D10', row: 10, col: 'D', label: 'Temp', value: inputs.lpCondensateTempC, displayValue: formatUnitVal(inputs.lpCondensateTempC, 'temp', unitSystem, 1), category: 'text' },
        { address: 'E10', row: 10, col: 'E', label: 'DO (mg/L)', value: inputs.lpCondensateDissolvedO2MgL, displayValue: `${inputs.lpCondensateDissolvedO2MgL} mg/L`, category: 'text' },
        { address: 'F10', row: 10, col: 'F', label: 'Enthalpy', value: streamProperties.lpCondensate.specificEnthalpyKjKg, displayValue: `${streamProperties.lpCondensate.specificEnthalpyKjKg} kJ/kg`, category: 'text' },
      ]);
      rows.push([
        { address: 'A11', row: 11, col: 'A', label: 'Stream', value: 'Total Combined Feedwater In', displayValue: 'Total Combined Feedwater In', category: 'text' },
        {
          address: 'B11',
          row: 11,
          col: 'B',
          label: 'Value',
          value: massEnergyBalance.totalInletLiquidKgH,
          displayValue: formatUnitVal(massEnergyBalance.totalInletLiquidKgH, 'flow', unitSystem, 0),
          category: 'calculated',
          formula: '=SUM(B8:B10)',
          explanation: 'Total inlet liquid mass entering spray/tray section.',
        },
        { address: 'C11', row: 11, col: 'C', label: 'Unit', value: 'kg/h', displayValue: unitSystem === 'SI' ? 'kg/h' : 'lb/hr', category: 'text' },
        { address: 'D11', row: 11, col: 'D', label: 'Mixed Temp', value: massEnergyBalance.mixedInletWaterTempC, displayValue: formatUnitVal(massEnergyBalance.mixedInletWaterTempC, 'temp', unitSystem, 1), category: 'text' },
        { address: 'E11', row: 11, col: 'E', label: 'Weighted DO', value: deaerationPerformance.weightedInletO2MgL, displayValue: `${deaerationPerformance.weightedInletO2MgL} mg/L`, category: 'text' },
        { address: 'F11', row: 11, col: 'F', label: 'Enthalpy', value: massEnergyBalance.mixedInletEnthalpyKjKg, displayValue: `${massEnergyBalance.mixedInletEnthalpyKjKg} kJ/kg`, category: 'text' },
      ]);

      addSectionHeader(12, '3. HEATING STEAM SUPPLY CONDITIONS');
      rows.push([
        { address: 'A13', row: 13, col: 'A', label: 'Parameter', value: 'Steam Supply Gauge Pressure', displayValue: 'Steam Supply Gauge Pressure', category: 'text' },
        {
          address: 'B13',
          row: 13,
          col: 'B',
          label: 'Value',
          value: inputs.steamPressureBarG,
          displayValue: formatUnitVal(inputs.steamPressureBarG, 'pressureGauge', unitSystem, 2),
          isEditable: true,
          inputKey: 'steamPressureBarG',
          category: 'input',
          formula: 'USER_INPUT',
          explanation: 'Extraction or auxiliary header steam supply pressure before control valve.',
        },
        { address: 'C13', row: 13, col: 'C', label: 'Unit', value: 'bar(g)', displayValue: unitSystem === 'SI' ? 'bar(g)' : 'psig', category: 'text' },
        { address: 'D13', row: 13, col: 'D', label: 'Type', value: 'Header Supply', displayValue: 'Steam Supply', category: 'text' },
        { address: 'E13', row: 13, col: 'E', label: 'Source', value: 'Turbine Extraction', displayValue: 'Plant Header', category: 'text' },
        { address: 'F13', row: 13, col: 'F', label: 'Formula', value: '=INPUT()', displayValue: '=INPUT()', category: 'text' },
      ]);
      rows.push([
        { address: 'A14', row: 14, col: 'A', label: 'Parameter', value: 'Steam Supply Temperature', displayValue: 'Steam Supply Temperature', category: 'text' },
        {
          address: 'B14',
          row: 14,
          col: 'B',
          label: 'Value',
          value: inputs.steamTempC,
          displayValue: formatUnitVal(inputs.steamTempC, 'temp', unitSystem, 1),
          isEditable: true,
          inputKey: 'steamTempC',
          category: 'input',
          formula: 'USER_INPUT',
          explanation: 'Stripping steam temperature (includes superheat if present).',
        },
        { address: 'C14', row: 14, col: 'C', label: 'Unit', value: '°C', displayValue: unitSystem === 'SI' ? '°C' : '°F', category: 'text' },
        { address: 'D14', row: 14, col: 'D', label: 'Type', value: 'Thermal State', displayValue: 'Steam Temp', category: 'text' },
        { address: 'E14', row: 14, col: 'E', label: 'Source', value: 'Turbine Bleed', displayValue: 'Header Spec', category: 'text' },
        { address: 'F14', row: 14, col: 'F', label: 'Formula', value: '=INPUT()', displayValue: '=INPUT()', category: 'text' },
      ]);
    } else if (activeTab === 'mass-energy') {
      addSectionHeader(1, '1. THERMAL MASS & ENERGY BALANCE RESULTS');
      rows.push([
        { address: 'A2', row: 2, col: 'A', label: 'Stream', value: 'Required Stripping Steam Flow', displayValue: 'Required Stripping Steam Flow', category: 'text' },
        {
          address: 'B2',
          row: 2,
          col: 'B',
          label: 'Value',
          value: massEnergyBalance.heatingSteamRequiredKgH,
          displayValue: formatUnitVal(massEnergyBalance.heatingSteamRequiredKgH, 'flow', unitSystem, 1),
          category: 'calculated',
          formula: '=Q_DUTY/(h_steam - (1-f_v)*h_out - f_v*h_v)',
          explanation: 'Governing steam consumption required to heat water to saturation and strip non-condensables.',
        },
        { address: 'C2', row: 2, col: 'C', label: 'Unit', value: 'kg/h', displayValue: unitSystem === 'SI' ? 'kg/h' : 'lb/hr', category: 'text' },
        { address: 'D2', row: 2, col: 'D', label: 'Capacity', value: `${(massEnergyBalance.heatingSteamRequiredKgH / 1000).toFixed(2)} t/h`, displayValue: `${(massEnergyBalance.heatingSteamRequiredKgH / 1000).toFixed(2)} t/h`, category: 'text' },
        { address: 'E2', row: 2, col: 'E', label: 'Steam Ratio', value: `${((massEnergyBalance.heatingSteamRequiredKgH / massEnergyBalance.totalDeaeratedWaterOutKgH) * 100).toFixed(2)}%`, displayValue: `${((massEnergyBalance.heatingSteamRequiredKgH / massEnergyBalance.totalDeaeratedWaterOutKgH) * 100).toFixed(2)}% of feed`, category: 'text' },
        { address: 'F2', row: 2, col: 'F', label: 'Status', value: 'PASS', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);
      rows.push([
        { address: 'A3', row: 3, col: 'A', label: 'Stream', value: 'Vent Vapor Loss Rate', displayValue: 'Vent Vapor Loss Rate', category: 'text' },
        {
          address: 'B3',
          row: 3,
          col: 'B',
          label: 'Value',
          value: massEnergyBalance.ventVaporLossKgH,
          displayValue: formatUnitVal(massEnergyBalance.ventVaporLossKgH, 'flow', unitSystem, 2),
          category: 'calculated',
          formula: '=B2 * (VENT_PCT / 100)',
          explanation: 'Steam vapor vented with stripped gases to prevent back-pressure accumulation.',
        },
        { address: 'C3', row: 3, col: 'C', label: 'Unit', value: 'kg/h', displayValue: unitSystem === 'SI' ? 'kg/h' : 'lb/hr', category: 'text' },
        { address: 'D3', row: 3, col: 'D', label: 'Vent %', value: `${inputs.ventLossPercentOfSteam}%`, displayValue: `${inputs.ventLossPercentOfSteam}% of steam`, category: 'text' },
        { address: 'E3', row: 3, col: 'E', label: 'Standard', value: 'HEI Section 3.8', displayValue: 'HEI 0.1-0.2%', category: 'text' },
        { address: 'F3', row: 3, col: 'F', label: 'Status', value: 'PASS', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);
      rows.push([
        { address: 'A4', row: 4, col: 'A', label: 'Stream', value: 'Net Deaerated Feedwater Out', displayValue: 'Net Deaerated Feedwater Out', category: 'text' },
        {
          address: 'B4',
          row: 4,
          col: 'B',
          label: 'Value',
          value: massEnergyBalance.totalDeaeratedWaterOutKgH,
          displayValue: formatUnitVal(massEnergyBalance.totalDeaeratedWaterOutKgH, 'flow', unitSystem, 1),
          category: 'calculated',
          formula: '=M_INLET + M_STEAM - M_VENT',
          explanation: 'Net saturated liquid water delivered to boiler feedwater pump suction.',
        },
        { address: 'C4', row: 4, col: 'C', label: 'Unit', value: 'kg/h', displayValue: unitSystem === 'SI' ? 'kg/h' : 'lb/hr', category: 'text' },
        { address: 'D4', row: 4, col: 'D', label: 'Capacity', value: `${(massEnergyBalance.totalDeaeratedWaterOutKgH / 1000).toFixed(2)} t/h`, displayValue: `${(massEnergyBalance.totalDeaeratedWaterOutKgH / 1000).toFixed(2)} t/h`, category: 'text' },
        { address: 'E4', row: 4, col: 'E', label: 'Enthalpy', value: massEnergyBalance.operatingEnthalpyLiquidKjKg, displayValue: `${massEnergyBalance.operatingEnthalpyLiquidKjKg} kJ/kg`, category: 'text' },
        { address: 'F4', row: 4, col: 'F', label: 'Status', value: 'PASS', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);
      rows.push([
        { address: 'A5', row: 5, col: 'A', label: 'Parameter', value: 'Gross Heat Duty (Preheating + Loss)', displayValue: 'Gross Heat Duty', category: 'text' },
        {
          address: 'B5',
          row: 5,
          col: 'B',
          label: 'Value',
          value: massEnergyBalance.grossHeatDutyKw,
          displayValue: formatUnitVal(massEnergyBalance.grossHeatDutyKw, 'heatDuty', unitSystem, 1),
          category: 'calculated',
          formula: '=Q_SENS * (1 + HEAT_LOSS_PCT/100)',
          explanation: 'Total thermal heat duty transferred inside deaerator dome.',
        },
        { address: 'C5', row: 5, col: 'C', label: 'Unit', value: 'kW', displayValue: unitSystem === 'SI' ? 'kW' : 'MMBtu/hr', category: 'text' },
        { address: 'D5', row: 5, col: 'D', label: 'Sensible', value: `${massEnergyBalance.sensibleHeatKw} kW`, displayValue: `${massEnergyBalance.sensibleHeatKw} kW`, category: 'text' },
        { address: 'E5', row: 5, col: 'E', label: 'Radiation Loss', value: `${massEnergyBalance.heatLossKw} kW`, displayValue: `${massEnergyBalance.heatLossKw} kW (${inputs.heatLossPercentOfDuty}%)`, category: 'text' },
        { address: 'F5', row: 5, col: 'F', label: 'Formula', value: '=M*(h_out-h_in)+Q_rad', displayValue: '=M*(h_out-h_in)', category: 'text' },
      ]);
      rows.push([
        { address: 'A6', row: 6, col: 'A', label: 'Parameter', value: 'Mass Balance Closure Discrepancy', displayValue: 'Mass Balance Closure Discrepancy', category: 'text' },
        {
          address: 'B6',
          row: 6,
          col: 'B',
          label: 'Value',
          value: massEnergyBalance.massBalanceErrorPercent,
          displayValue: `${massEnergyBalance.massBalanceErrorPercent}%`,
          category: 'calculated',
          formula: '=|M_in - M_out| / M_in',
          explanation: 'Must be < 0.05% for certified heat balance closure.',
        },
        { address: 'C6', row: 6, col: 'C', label: 'Unit', value: '%', displayValue: '%', category: 'text' },
        { address: 'D6', row: 6, col: 'D', label: 'Limit', value: '< 0.05%', displayValue: '< 0.05%', category: 'text' },
        { address: 'E6', row: 6, col: 'E', label: 'Standard', value: 'ASME PTC 12.3', displayValue: 'ASME PTC 12.3', category: 'text' },
        { address: 'F6', row: 6, col: 'F', label: 'Status', value: massEnergyBalance.massBalanceErrorPercent < 0.05 ? 'PASS' : 'FAIL', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);
      rows.push([
        { address: 'A7', row: 7, col: 'A', label: 'Parameter', value: 'Energy Balance Closure Discrepancy', displayValue: 'Energy Balance Closure Discrepancy', category: 'text' },
        {
          address: 'B7',
          row: 7,
          col: 'B',
          label: 'Value',
          value: massEnergyBalance.energyBalanceErrorPercent,
          displayValue: `${massEnergyBalance.energyBalanceErrorPercent}%`,
          category: 'calculated',
          formula: '=|H_in - H_out| / H_in',
          explanation: 'Must be < 0.10% for complete first-law thermodynamic closure.',
        },
        { address: 'C7', row: 7, col: 'C', label: 'Unit', value: '%', displayValue: '%', category: 'text' },
        { address: 'D7', row: 7, col: 'D', label: 'Limit', value: '< 0.10%', displayValue: '< 0.10%', category: 'text' },
        { address: 'E7', row: 7, col: 'E', label: 'Standard', value: 'ASME PTC 12.3', displayValue: 'ASME PTC 12.3', category: 'text' },
        { address: 'F7', row: 7, col: 'F', label: 'Status', value: massEnergyBalance.energyBalanceErrorPercent < 0.1 ? 'PASS' : 'FAIL', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);

      addSectionHeader(8, '2. GAS STRIPPING & DEAERATION PERFORMANCE');
      rows.push([
        { address: 'A9', row: 9, col: 'A', label: 'Parameter', value: 'Weighted Inlet Dissolved O2', displayValue: 'Weighted Inlet Dissolved O2', category: 'text' },
        {
          address: 'B9',
          row: 9,
          col: 'B',
          label: 'Value',
          value: deaerationPerformance.weightedInletO2MgL,
          displayValue: `${deaerationPerformance.weightedInletO2MgL} mg/L (${deaerationPerformance.weightedInletO2Ppb} ppb)`,
          category: 'calculated',
          formula: '=SUM(Flow_i * DO_i) / M_total',
          explanation: 'Weighted mixture dissolved oxygen from incoming makeup and condensate streams.',
        },
        { address: 'C9', row: 9, col: 'C', label: 'Unit', value: 'mg/L', displayValue: 'mg/L (ppm)', category: 'text' },
        { address: 'D9', row: 9, col: 'D', label: 'Raw Gas', value: `${deaerationPerformance.totalInletO2KgH} kg/h O2`, displayValue: `${deaerationPerformance.totalInletO2KgH} kg/h O2`, category: 'text' },
        { address: 'E9', row: 9, col: 'E', label: 'Source', value: 'Inlet Mixing', displayValue: 'Feed Mix', category: 'text' },
        { address: 'F9', row: 9, col: 'F', label: 'Formula', value: '=SUMPRODUCT()', displayValue: '=SUMPRODUCT()', category: 'text' },
      ]);
      rows.push([
        { address: 'A10', row: 10, col: 'A', label: 'Parameter', value: 'Guaranteed Outlet Dissolved O2', displayValue: 'Guaranteed Outlet Dissolved O2', category: 'text' },
        {
          address: 'B10',
          row: 10,
          col: 'B',
          label: 'Value',
          value: inputs.targetOutletO2Ppb,
          displayValue: `${inputs.targetOutletO2Ppb} ppb (${deaerationPerformance.outletO2MgL} mg/L)`,
          isEditable: true,
          inputKey: 'targetOutletO2Ppb',
          category: 'input',
          formula: 'USER_INPUT',
          explanation: 'HEI maximum allowable residual oxygen for utility and industrial boilers (<= 7 ppb / 0.005 mg/L).',
        },
        { address: 'C10', row: 10, col: 'C', label: 'Unit', value: 'ppb', displayValue: 'ppb (µg/L)', category: 'text' },
        { address: 'D10', row: 10, col: 'D', label: 'Standard', value: 'HEI Standard', displayValue: '<= 7.0 ppb', category: 'text' },
        { address: 'E10', row: 10, col: 'E', label: 'Compliance', value: deaerationPerformance.heiCompliance ? 'COMPLIANT' : 'NON-COMPLIANT', displayValue: 'HEI Compliant', category: 'text' },
        { address: 'F10', row: 10, col: 'F', label: 'Status', value: deaerationPerformance.heiCompliance ? 'PASS' : 'FAIL', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);
      rows.push([
        { address: 'A11', row: 11, col: 'A', label: 'Parameter', value: 'Oxygen Removal Stripping Efficiency', displayValue: 'Oxygen Removal Stripping Efficiency', category: 'text' },
        {
          address: 'B11',
          row: 11,
          col: 'B',
          label: 'Value',
          value: deaerationPerformance.oxygenRemovalEfficiencyPercent,
          displayValue: `${deaerationPerformance.oxygenRemovalEfficiencyPercent}%`,
          category: 'calculated',
          formula: '=(DO_in - DO_out) / DO_in * 100%',
          explanation: 'Fraction of dissolved oxygen stripped by counter-current steam.',
        },
        { address: 'C11', row: 11, col: 'C', label: 'Unit', value: '%', displayValue: '%', category: 'text' },
        { address: 'D11', row: 11, col: 'D', label: 'Criterion', value: '> 99.0%', displayValue: '> 99.0%', category: 'text' },
        { address: 'E11', row: 11, col: 'E', label: 'Stripped O2', value: `${deaerationPerformance.oxygenStrippedKgH} kg/h`, displayValue: `${deaerationPerformance.oxygenStrippedKgH} kg/h`, category: 'text' },
        { address: 'F11', row: 11, col: 'F', label: 'Status', value: 'PASS', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);
    } else if (activeTab === 'internals-sizing') {
      addSectionHeader(1, '1. DEAERATOR DOME / TOWER SIZING');
      rows.push([
        { address: 'A2', row: 2, col: 'A', label: 'Parameter', value: 'Deaerator Tower Diameter', displayValue: 'Deaerator Tower Diameter', category: 'text' },
        {
          address: 'B2',
          row: 2,
          col: 'B',
          label: 'Value',
          value: vesselInternals.domeDiameterMm,
          displayValue: formatUnitVal(vesselInternals.domeDiameterMm, 'diameter', unitSystem, 0),
          category: 'calculated',
          formula: '=SQRT(4*A_REQ/PI())',
          explanation: 'Tower diameter sized to maintain vapor velocity below Souders-Brown entrainment limit.',
        },
        { address: 'C2', row: 2, col: 'C', label: 'Unit', value: 'mm', displayValue: unitSystem === 'SI' ? 'mm' : 'in', category: 'text' },
        { address: 'D2', row: 2, col: 'D', label: 'Area', value: `${vesselInternals.crossSectionAreaM2} m²`, displayValue: `${vesselInternals.crossSectionAreaM2} m²`, category: 'text' },
        { address: 'E2', row: 2, col: 'E', label: 'Code', value: 'HEI Section 3', displayValue: 'HEI Section 3', category: 'text' },
        { address: 'F2', row: 2, col: 'F', label: 'Status', value: 'PASS', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);
      rows.push([
        { address: 'A3', row: 3, col: 'A', label: 'Parameter', value: 'Deaerator Tower Height', displayValue: 'Deaerator Tower Height', category: 'text' },
        {
          address: 'B3',
          row: 3,
          col: 'B',
          label: 'Value',
          value: vesselInternals.domeHeightMm,
          displayValue: formatUnitVal(vesselInternals.domeHeightMm, 'lengthSmall', unitSystem, 0),
          category: 'calculated',
          formula: '=H_SPRAY + H_TRAYS + H_DISENGAGEMENT',
          explanation: 'Total vertical height including spray chamber, tray cascade, and steam disengagement.',
        },
        { address: 'C3', row: 3, col: 'C', label: 'Unit', value: 'mm', displayValue: unitSystem === 'SI' ? 'mm' : 'in', category: 'text' },
        { address: 'D3', row: 3, col: 'D', label: 'Volume', value: `${vesselInternals.deaerationSectionTotalVolumeM3} m³`, displayValue: `${vesselInternals.deaerationSectionTotalVolumeM3} m³`, category: 'text' },
        { address: 'E3', row: 3, col: 'E', label: 'Type', value: vesselInternals.deaeratorType.toUpperCase(), displayValue: vesselInternals.deaeratorType.toUpperCase(), category: 'text' },
        { address: 'F3', row: 3, col: 'F', label: 'Status', value: 'PASS', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);
      rows.push([
        { address: 'A4', row: 4, col: 'A', label: 'Parameter', value: 'Souders-Brown Allowable Vapor Velocity', displayValue: 'Souders-Brown Allowable Vapor Velocity', category: 'text' },
        {
          address: 'B4',
          row: 4,
          col: 'B',
          label: 'Value',
          value: vesselInternals.vaporVelocityAllowableMS,
          displayValue: formatUnitVal(vesselInternals.vaporVelocityAllowableMS, 'velocity', unitSystem, 2),
          category: 'calculated',
          formula: '=K_sb * SQRT((rho_L - rho_V) / rho_V)',
          explanation: 'Maximum allowable upward vapor velocity to prevent liquid droplet carry-over into the vent.',
        },
        { address: 'C4', row: 4, col: 'C', label: 'Unit', value: 'm/s', displayValue: unitSystem === 'SI' ? 'm/s' : 'ft/s', category: 'text' },
        { address: 'D4', row: 4, col: 'D', label: 'Actual Vel', value: `${vesselInternals.vaporVelocityActualMS} m/s`, displayValue: formatUnitVal(vesselInternals.vaporVelocityActualMS, 'velocity', unitSystem, 2), category: 'text' },
        { address: 'E4', row: 4, col: 'E', label: 'Velocity Ratio', value: `${(vesselInternals.vaporVelocityRatio * 100).toFixed(1)}%`, displayValue: `${(vesselInternals.vaporVelocityRatio * 100).toFixed(1)}% (< 80%)`, category: 'text' },
        { address: 'F4', row: 4, col: 'F', label: 'Status', value: vesselInternals.vaporVelocityRatio < 0.8 ? 'PASS' : 'WARN', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);

      addSectionHeader(5, '2. TRAY STACK & SPRAY VALVE INTERNALS');
      rows.push([
        { address: 'A6', row: 6, col: 'A', label: 'Internals', value: 'Tray Stack Active Area', displayValue: 'Tray Stack Active Area', category: 'text' },
        {
          address: 'B6',
          row: 6,
          col: 'B',
          label: 'Value',
          value: vesselInternals.trayStackAreaM2,
          displayValue: `${vesselInternals.trayStackAreaM2} m²`,
          category: 'calculated',
          formula: '=Q_WATER / HYD_LOADING',
          explanation: 'Cross-sectional area of stainless steel tray tiers.',
        },
        { address: 'C6', row: 6, col: 'C', label: 'Unit', value: 'm²', displayValue: 'm²', category: 'text' },
        { address: 'D6', row: 6, col: 'D', label: 'Dimensions', value: `${vesselInternals.trayWidthMm}mm × ${vesselInternals.trayLengthMm}mm`, displayValue: `${vesselInternals.trayWidthMm}×${vesselInternals.trayLengthMm} mm`, category: 'text' },
        { address: 'E6', row: 6, col: 'E', label: 'Tiers', value: `${vesselInternals.trayCountTiers} tiers`, displayValue: `${vesselInternals.trayCountTiers} tiers`, category: 'text' },
        { address: 'F6', row: 6, col: 'F', label: 'Status', value: 'PASS', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);
      rows.push([
        { address: 'A7', row: 7, col: 'A', label: 'Internals', value: 'Tray Hydraulic Loading Rate', displayValue: 'Tray Hydraulic Loading Rate', category: 'text' },
        {
          address: 'B7',
          row: 7,
          col: 'B',
          label: 'Value',
          value: vesselInternals.trayLoadingM3Hm2,
          displayValue: formatUnitVal(vesselInternals.trayLoadingM3Hm2, 'loading', unitSystem, 1),
          isEditable: true,
          inputKey: 'trayHydraulicLoadingM3Hm2',
          category: 'input',
          formula: 'USER_INPUT',
          explanation: 'HEI recommended range: 80 to 150 m3/(h·m2) (35 - 65 gpm/ft2) for optimal film contact.',
        },
        { address: 'C7', row: 7, col: 'C', label: 'Unit', value: 'm³/(h·m²)', displayValue: unitSystem === 'SI' ? 'm³/(h·m²)' : 'gpm/ft²', category: 'text' },
        { address: 'D7', row: 7, col: 'D', label: 'Recommended', value: '80 - 150', displayValue: '80 - 150 m³/(h·m²)', category: 'text' },
        { address: 'E7', row: 7, col: 'E', label: 'Standard', value: 'HEI Section 3.4', displayValue: 'HEI Standard', category: 'text' },
        { address: 'F7', row: 7, col: 'F', label: 'Status', value: 'PASS', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);
      rows.push([
        { address: 'A8', row: 8, col: 'A', label: 'Internals', value: 'Spray Valves Count & Flow', displayValue: 'Spray Valves Count & Flow', category: 'text' },
        {
          address: 'B8',
          row: 8,
          col: 'B',
          label: 'Value',
          value: vesselInternals.sprayValveCount,
          displayValue: `${vesselInternals.sprayValveCount} valves`,
          category: 'calculated',
          formula: '=CEILING(Q_WATER / Q_VALVE_DESIGN)',
          explanation: 'Spring-loaded variable-area spray nozzles providing atomized droplet curtain.',
        },
        { address: 'C8', row: 8, col: 'C', label: 'Unit', value: 'qty', displayValue: 'valves', category: 'text' },
        { address: 'D8', row: 8, col: 'D', label: 'Flow/Valve', value: `${vesselInternals.sprayValveFlowPerValveM3H} m³/h`, displayValue: `${vesselInternals.sprayValveFlowPerValveM3H} m³/h/valve`, category: 'text' },
        { address: 'E8', row: 8, col: 'E', label: 'Pressure Drop', value: `${vesselInternals.sprayPressureDropBar} bar`, displayValue: `${vesselInternals.sprayPressureDropBar} bar ΔP`, category: 'text' },
        { address: 'F8', row: 8, col: 'F', label: 'Status', value: 'PASS', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);
    } else if (activeTab === 'storage-mechanical') {
      addSectionHeader(1, '1. STORAGE TANK & LEVEL ELEVATIONS');
      rows.push([
        { address: 'A2', row: 2, col: 'A', label: 'Parameter', value: 'Storage Tank Internal Diameter', displayValue: 'Storage Tank Internal Diameter', category: 'text' },
        {
          address: 'B2',
          row: 2,
          col: 'B',
          label: 'Value',
          value: storageLevels.tankDiameterMm,
          displayValue: formatUnitVal(storageLevels.tankDiameterMm, 'diameter', unitSystem, 0),
          category: 'calculated',
          formula: '=((4*V_GROSS)/(PI()*L_D_RATIO))^(1/3)',
          explanation: 'Standard fabricated shell diameter based on L/D ratio and surge buffer.',
        },
        { address: 'C2', row: 2, col: 'C', label: 'Unit', value: 'mm', displayValue: unitSystem === 'SI' ? 'mm' : 'in', category: 'text' },
        { address: 'D2', row: 2, col: 'D', label: 'Length T-T', value: `${storageLevels.tankLengthTangentToTangentMm} mm`, displayValue: formatUnitVal(storageLevels.tankLengthTangentToTangentMm, 'lengthSmall', unitSystem, 0), category: 'text' },
        { address: 'E2', row: 2, col: 'E', label: 'Overall Length', value: `${storageLevels.totalTankLengthOverallMm} mm`, displayValue: formatUnitVal(storageLevels.totalTankLengthOverallMm, 'lengthSmall', unitSystem, 0), category: 'text' },
        { address: 'F2', row: 2, col: 'F', label: 'Status', value: 'PASS', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);
      rows.push([
        { address: 'A3', row: 3, col: 'A', label: 'Parameter', value: 'Residence Time Between LLL & HL', displayValue: 'Residence Time (LLL to HL)', category: 'text' },
        {
          address: 'B3',
          row: 3,
          col: 'B',
          label: 'Value',
          value: storageLevels.residenceTimeActualMin,
          displayValue: `${storageLevels.residenceTimeActualMin} minutes`,
          category: 'calculated',
          formula: '=(V_USABLE / Q_OUTLET) * 60',
          explanation: 'Feedwater surge hold-up buffer for boiler feed pumps at 100% MCR.',
        },
        { address: 'C3', row: 3, col: 'C', label: 'Unit', value: 'min', displayValue: 'minutes', category: 'text' },
        { address: 'D3', row: 3, col: 'D', label: 'Required', value: `${inputs.residenceTimeMin} min`, displayValue: `>= ${inputs.residenceTimeMin} min`, category: 'text' },
        { address: 'E3', row: 3, col: 'E', label: 'Usable Volume', value: `${storageLevels.usableVolumeM3} m³`, displayValue: formatUnitVal(storageLevels.usableVolumeM3, 'volume', unitSystem, 1), category: 'text' },
        { address: 'F3', row: 3, col: 'F', label: 'Status', value: storageLevels.residenceTimeActualMin >= inputs.residenceTimeMin ? 'PASS' : 'FAIL', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);
      rows.push([
        { address: 'A4', row: 4, col: 'A', label: 'Level', value: 'Normal Operating Level (NOL)', displayValue: 'Normal Operating Level (NOL)', category: 'text' },
        { address: 'B4', row: 4, col: 'B', label: 'Value', value: storageLevels.levels.normalOperatingLevelMm, displayValue: `${storageLevels.levels.normalOperatingLevelMm} mm (55% D)`, category: 'calculated', formula: '=0.55 * D_TANK' },
        { address: 'C4', row: 4, col: 'C', label: 'Unit', value: 'mm', displayValue: unitSystem === 'SI' ? 'mm' : 'in', category: 'text' },
        { address: 'D4', row: 4, col: 'D', label: 'Hold-up to LLL', value: `${storageLevels.holdUpTimesMin.nolToLllMin} min`, displayValue: `${storageLevels.holdUpTimesMin.nolToLllMin} min buffer`, category: 'text' },
        { address: 'E4', row: 4, col: 'E', label: 'Description', value: 'Normal boiler feed level', displayValue: 'Normal Control Setpoint', category: 'text' },
        { address: 'F4', row: 4, col: 'F', label: 'Status', value: 'PASS', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);

      addSectionHeader(5, '2. ASME BPVC SECTION VIII DIV 1 MECHANICAL DESIGN');
      rows.push([
        { address: 'A6', row: 6, col: 'A', label: 'Parameter', value: 'Storage Shell Min Required Thickness (UG-27)', displayValue: 'Storage Shell Min Thickness (UG-27)', category: 'text' },
        {
          address: 'B6',
          row: 6,
          col: 'B',
          label: 'Value',
          value: mechanicalDesign.storageShellMinThicknessMm,
          displayValue: `${mechanicalDesign.storageShellMinThicknessMm} mm`,
          category: 'calculated',
          formula: '=(P*R)/(S*E - 0.6*P) + CA',
          explanation: 'Governing ASME Section VIII Div 1 formula for internal pressure on cylindrical shell.',
        },
        { address: 'C6', row: 6, col: 'C', label: 'Unit', value: 'mm', displayValue: unitSystem === 'SI' ? 'mm' : 'in', category: 'text' },
        { address: 'D6', row: 6, col: 'D', label: 'Nominal Selected', value: `${mechanicalDesign.storageShellNominalThicknessMm} mm`, displayValue: `Nominal: ${mechanicalDesign.storageShellNominalThicknessMm} mm`, category: 'text' },
        { address: 'E6', row: 6, col: 'E', label: 'Material', value: inputs.shellMaterial, displayValue: inputs.shellMaterial, category: 'text' },
        { address: 'F6', row: 6, col: 'F', label: 'Status', value: mechanicalDesign.storageShellNominalThicknessMm >= mechanicalDesign.storageShellMinThicknessMm ? 'PASS' : 'FAIL', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);
      rows.push([
        { address: 'A7', row: 7, col: 'A', label: 'Parameter', value: 'Storage 2:1 Head Min Thickness (UG-32)', displayValue: 'Storage 2:1 Head Min Thickness (UG-32)', category: 'text' },
        {
          address: 'B7',
          row: 7,
          col: 'B',
          label: 'Value',
          value: mechanicalDesign.storageHeadMinThicknessMm,
          displayValue: `${mechanicalDesign.storageHeadMinThicknessMm} mm`,
          category: 'calculated',
          formula: '=(P*D)/(2*S*E - 0.2*P) + CA',
          explanation: 'ASME Section VIII Div 1 formula for 2:1 semi-ellipsoidal formed heads.',
        },
        { address: 'C7', row: 7, col: 'C', label: 'Unit', value: 'mm', displayValue: unitSystem === 'SI' ? 'mm' : 'in', category: 'text' },
        { address: 'D7', row: 7, col: 'D', label: 'Nominal Selected', value: `${mechanicalDesign.storageHeadNominalThicknessMm} mm`, displayValue: `Nominal: ${mechanicalDesign.storageHeadNominalThicknessMm} mm`, category: 'text' },
        { address: 'E7', row: 7, col: 'E', label: 'Code', value: 'UG-32(d)', displayValue: 'UG-32(d)', category: 'text' },
        { address: 'F7', row: 7, col: 'F', label: 'Status', value: mechanicalDesign.storageHeadNominalThicknessMm >= mechanicalDesign.storageHeadMinThicknessMm ? 'PASS' : 'FAIL', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);
      rows.push([
        { address: 'A8', row: 8, col: 'A', label: 'Parameter', value: 'Hydrostatic Test Pressure (UG-99)', displayValue: 'Hydrotest Pressure (UG-99)', category: 'text' },
        {
          address: 'B8',
          row: 8,
          col: 'B',
          label: 'Value',
          value: mechanicalDesign.hydrotestPressureBarG,
          displayValue: formatUnitVal(mechanicalDesign.hydrotestPressureBarG, 'pressureGauge', unitSystem, 2),
          category: 'calculated',
          formula: '=1.3 * MAWP * (S_amb / S_des)',
          explanation: 'Shop hydrostatic proof test pressure per ASME UG-99.',
        },
        { address: 'C8', row: 8, col: 'C', label: 'Unit', value: 'bar(g)', displayValue: unitSystem === 'SI' ? 'bar(g)' : 'psig', category: 'text' },
        { address: 'D8', row: 8, col: 'D', label: 'MAWP', value: `${mechanicalDesign.storageMawpBarG} bar(g)`, displayValue: formatUnitVal(mechanicalDesign.storageMawpBarG, 'pressureGauge', unitSystem, 2), category: 'text' },
        { address: 'E8', row: 8, col: 'E', label: 'Code Check', value: 'ASME UG-99', displayValue: '1.3 × MAWP', category: 'text' },
        { address: 'F8', row: 8, col: 'F', label: 'Status', value: 'PASS', displayValue: 'PASS', category: 'badge', status: 'PASS' },
      ]);
    } else {
      // results-validation tab
      addSectionHeader(1, '1. AUTOMATED CODE COMPLIANCE MATRIX');
      validationItems.forEach((val, idx) => {
        const rowNum = idx + 2;
        rows.push([
          { address: `A${rowNum}`, row: rowNum, col: 'A', label: 'ID', value: val.id, displayValue: val.id, category: 'text' },
          { address: `B${rowNum}`, row: rowNum, col: 'B', label: 'Parameter', value: val.parameter, displayValue: val.parameter, category: 'text' },
          { address: `C${rowNum}`, row: rowNum, col: 'C', label: 'Value', value: val.calculatedValue, displayValue: val.calculatedValue, category: 'text' },
          { address: `D${rowNum}`, row: rowNum, col: 'D', label: 'Criterion', value: val.criterion, displayValue: val.criterion, category: 'text' },
          { address: `E${rowNum}`, row: rowNum, col: 'E', label: 'Standard', value: val.governingCode, displayValue: val.governingCode, category: 'text' },
          { address: `F${rowNum}`, row: rowNum, col: 'F', label: 'Status', value: val.status, displayValue: val.status, category: 'badge', status: val.status },
        ]);
      });
    }

    return rows;
  };

  const rows = buildSheetRows();

  // Find currently selected cell object
  let activeCell: GridCell | null = null;
  for (const row of rows) {
    for (const cell of row) {
      if (cell.address === selectedCellAddress) {
        activeCell = cell;
        break;
      }
    }
  }

  const handleStartEdit = (cell: GridCell) => {
    if (!cell.isEditable || !cell.inputKey) return;
    setEditingKey(cell.inputKey);
    setEditValue(String(cell.value));
  };

  const handleSaveEdit = () => {
    if (!editingKey) return;
    const num = parseFloat(editValue);
    if (!isNaN(num)) {
      onInputChange(editingKey, num as any);
    }
    setEditingKey(null);
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      {/* EXCEL FORMULA BAR */}
      <div className="bg-slate-850 bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-3 text-xs select-none">
        {/* Active Cell Address Box */}
        <div className="w-16 h-7 bg-slate-950 border border-slate-700 rounded flex items-center justify-center font-mono font-bold text-cyan-400 shadow-inner">
          {selectedCellAddress}
        </div>

        {/* fx Icon */}
        <div className="w-7 h-7 bg-slate-800 border border-slate-700 rounded flex items-center justify-center text-slate-400 font-serif italic font-bold">
          fx
        </div>

        {/* Formula / Cell Content Display */}
        <div className="flex-1 h-7 bg-slate-950 border border-slate-700 rounded px-3 flex items-center justify-between text-slate-200 font-mono shadow-inner overflow-x-auto">
          <div className="flex items-center gap-2 truncate">
            <span className="text-slate-400 font-sans text-[11px] font-medium">
              {activeCell?.label || 'Cell'}:
            </span>
            <span className="text-white font-semibold">{activeCell?.formula || activeCell?.displayValue}</span>
          </div>
          {activeCell?.explanation && (
            <span className="text-[10px] text-slate-400 font-sans truncate max-w-md hidden md:inline">
              ℹ {activeCell.explanation}
            </span>
          )}
        </div>
      </div>

      {/* SPREADSHEET TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px] select-none">
              <th className="w-12 py-2 px-3 text-center border-r border-slate-800 bg-slate-950 text-slate-500 font-normal">
                #
              </th>
              <th className="py-2 px-3 border-r border-slate-800 font-semibold text-slate-300 w-1/4">
                A (Item / Parameter)
              </th>
              <th className="py-2 px-3 border-r border-slate-800 font-semibold text-slate-300 w-1/5">
                B (Engineering Value)
              </th>
              <th className="py-2 px-3 border-r border-slate-800 font-semibold text-slate-300 w-24">
                C (Unit)
              </th>
              <th className="py-2 px-3 border-r border-slate-800 font-semibold text-slate-300 w-1/5">
                D (Basis / Sub-value)
              </th>
              <th className="py-2 px-3 border-r border-slate-800 font-semibold text-slate-300 w-1/6">
                E (Code / Standard)
              </th>
              <th className="py-2 px-3 font-semibold text-slate-300 w-24">
                F (Formula / Status)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {rows.map((rowCells, rIdx) => {
              const rowNum = rIdx + 1;
              const isSectionHeader = rowCells[0].category === 'header';

              if (isSectionHeader) {
                return (
                  <tr key={`row-${rowNum}`} className="bg-slate-800/80 font-bold border-y border-slate-700/80">
                    <td className="py-2 px-3 text-center font-mono text-slate-500 text-[10px] bg-slate-900 border-r border-slate-800">
                      {rowNum}
                    </td>
                    <td colSpan={6} className="py-2 px-3 text-cyan-300 uppercase tracking-wider text-[11px]">
                      {rowCells[0].displayValue}
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={`row-${rowNum}`}
                  className="hover:bg-slate-800/40 transition group"
                >
                  {/* Row Number */}
                  <td className="py-2.5 px-3 text-center font-mono text-slate-500 text-[11px] bg-slate-950/60 border-r border-slate-800/80 select-none group-hover:text-cyan-400">
                    {rowNum}
                  </td>

                  {rowCells.map((cell) => {
                    const isSelected = selectedCellAddress === cell.address;
                    const isCellEditing = editingKey === cell.inputKey && cell.isEditable;

                    let bgClass = '';
                    if (cell.category === 'input') {
                      bgClass = 'bg-emerald-950/20 text-emerald-300 font-medium hover:bg-emerald-900/30';
                    } else if (cell.category === 'calculated') {
                      bgClass = 'bg-blue-950/20 text-blue-200 font-semibold';
                    } else if (cell.category === 'badge') {
                      bgClass = 'text-center';
                    }

                    return (
                      <td
                        key={cell.address}
                        onClick={() => setSelectedCellAddress(cell.address)}
                        className={`py-2 px-3 border-r border-slate-800/50 cursor-pointer transition relative ${bgClass} ${
                          isSelected ? 'ring-2 ring-cyan-400 ring-inset z-10' : ''
                        }`}
                      >
                        {isCellEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="any"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') setEditingKey(null);
                              }}
                              autoFocus
                              className="w-full bg-slate-900 border border-cyan-400 rounded px-2 py-0.5 text-white font-mono text-xs focus:outline-none"
                            />
                            <button
                              onClick={handleSaveEdit}
                              className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : cell.category === 'badge' ? (
                          <span
                            className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              cell.status === 'PASS'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : cell.status === 'WARN'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {cell.displayValue}
                          </span>
                        ) : (
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate">{cell.displayValue}</span>
                            {cell.isEditable && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCellAddress(cell.address);
                                  handleStartEdit(cell);
                                }}
                                className="text-emerald-500/60 hover:text-emerald-300 p-0.5 rounded transition"
                                title="Click to edit value"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Spreadsheet Status Bar Footer */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/60"></span>
            <span>Editable Input Cells (Click to Modify)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/30 border border-blue-500/60"></span>
            <span>Formula Calculated Cells</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Active Cell: <strong className="text-white font-mono">{selectedCellAddress}</strong></span>
          <span>•</span>
          <span>Calculation Engine: <strong className="text-emerald-400">Auto-Recalculate (Live)</strong></span>
        </div>
      </div>
    </div>
  );
};
