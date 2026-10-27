/**
 * Deaerator Process Calculation & Sizing Tool - Data Types and Interfaces
 */

export type UnitSystem = 'SI' | 'US';

export type DeaeratorType = 'tray' | 'spray' | 'combined';

export interface DeaeratorInputs {
  // General & Type
  projectTitle: string;
  tagNumber: string;
  deaeratorType: DeaeratorType;
  unitSystem: UnitSystem;

  // Operating Conditions
  operatingPressureBarG: number; // bar(g)
  atmosphericPressureBarA: number; // bar(a), default 1.013

  // Inlet Streams
  makeupFlowKgH: number; // kg/h
  makeupTempC: number; // °C
  makeupDissolvedO2MgL: number; // mg/L (ppm)

  hpCondensateFlowKgH: number; // kg/h
  hpCondensateTempC: number; // °C
  hpCondensateDissolvedO2MgL: number; // mg/L (ppm)

  lpCondensateFlowKgH: number; // kg/h
  lpCondensateTempC: number; // °C
  lpCondensateDissolvedO2MgL: number; // mg/L (ppm)

  // Heating Steam Supply
  steamPressureBarG: number; // bar(g)
  steamTempC: number; // °C (superheated or saturated)

  // Vent & Heat Loss Assumptions
  ventLossPercentOfSteam: number; // % of inlet steam flow (typically 0.10% to 0.20%)
  heatLossPercentOfDuty: number; // % radiation loss (typically 0.5% to 1.5%)

  // Performance Target
  targetOutletO2Ppb: number; // ppb (HEI target <= 7 ppb / 0.005 mg/L)
  co2RemovalTargetPercent: number; // % (typically 95-100% free CO2)

  // Sizing Criteria & Parameters
  residenceTimeMin: number; // minutes at MCR (typically 10 to 15 min)
  trayHydraulicLoadingM3Hm2: number; // m3/(h·m2) (HEI recommends 80 - 150)
  trayWeirHeightMm: number; // mm (default 38 mm)
  sprayValveDeltaPBar: number; // bar (typical 0.15 - 0.35 bar across spring-loaded valves)
  storageTankLengthToDiaRatio: number; // L/D ratio (typically 3.0 to 5.0)

  // Nozzle Allowable Velocities (m/s)
  allowableVelocities: {
    waterInletMaxMS: number; // typical 1.5 - 2.5 m/s
    bfwSuctionMaxMS: number; // typical 0.8 - 1.5 m/s (critical for NPSHa)
    steamInletMaxMS: number; // typical 25 - 40 m/s
    ventMaxMS: number; // typical 10 - 25 m/s
    overflowMaxMS: number; // typical 1.0 - 1.8 m/s
    drainMaxMS: number; // typical 1.0 - 2.0 m/s
  };

  // Mechanical Design (ASME BPVC Sec VIII Div 1)
  designPressureBarG: number; // bar(g) (operating + margin, min 1.7 bar g / 25 psi or 10-15%)
  designTempC: number; // °C
  shellMaterial: string; // e.g. "SA-516 Gr. 70"
  allowableStressMpa: number; // MPa at design temperature
  jointEfficiency: number; // E = 0.85 (spot RT) or 1.0 (full RT)
  corrosionAllowanceMm: number; // mm (typically 1.5 to 3.0 mm)
  storageHeadType: '2:1 Ellipsoidal' | 'Torispherical' | 'Hemispherical';
}

export interface StreamProperty {
  name: string;
  massFlowKgH: number;
  temperatureC: number;
  pressureBarA: number;
  specificEnthalpyKjKg: number;
  heatContentKw: number;
  densityKgM3: number;
  volumetricFlowM3H: number;
  dissolvedO2MgL: number;
  totalO2FlowKgH: number;
}

export interface MassEnergyBalanceResults {
  // Mass Flows
  totalInletLiquidKgH: number;
  heatingSteamRequiredKgH: number;
  ventVaporLossKgH: number;
  netSteamCondensedKgH: number;
  totalDeaeratedWaterOutKgH: number;

  // Enthalpies & Temperatures
  mixedInletWaterTempC: number;
  mixedInletEnthalpyKjKg: number;
  operatingTempSatC: number;
  operatingEnthalpyLiquidKjKg: number;
  heatingSteamEnthalpyKjKg: number;
  ventVaporEnthalpyKjKg: number;

  // Heat Duty
  preheatDutyKw: number;
  sensibleHeatKw: number;
  latentHeatCondensedKw: number;
  heatLossKw: number;
  grossHeatDutyKw: number;
  heatDutyMmbtuHr: number;

  // Discrepancy & Closure
  massBalanceErrorPercent: number;
  energyBalanceErrorPercent: number;
}

export interface DeaerationPerformanceResults {
  weightedInletO2MgL: number;
  weightedInletO2Ppb: number;
  totalInletO2KgH: number;
  outletO2Ppb: number;
  outletO2MgL: number;
  totalOutletO2KgH: number;
  oxygenStrippedKgH: number;
  oxygenRemovalEfficiencyPercent: number;
  equilibriumSolubilityMgL: number;
  henryConstantBar: number;
  nonCondensablesKgH: {
    oxygenKgH: number;
    nitrogenKgH: number;
    carbonDioxideKgH: number;
    totalGasKgH: number;
    totalGasNm3H: number;
  };
  heiCompliance: boolean;
  notes: string;
}

export interface VesselInternalsResults {
  // Tower / Dome Dimensioning
  domeDiameterMm: number;
  domeHeightMm: number;
  crossSectionAreaM2: number;
  vaporVelocityActualMS: number;
  vaporVelocityAllowableMS: number; // Souders-Brown
  vaporVelocityRatio: number;
  soudersBrownK: number;

  // Tray / Spray Specifics
  deaeratorType: DeaeratorType;
  trayStackAreaM2: number;
  trayLoadingM3Hm2: number;
  trayWidthMm: number;
  trayLengthMm: number;
  trayCountTiers: number;
  trayMaterial: string;
  activeTrayHeightMm: number;

  sprayValveCount: number;
  sprayValveFlowPerValveM3H: number;
  sprayPressureDropBar: number;
  sprayConeCoveragePercent: number;

  deaerationSectionTotalVolumeM3: number;
}

export interface StorageLevelResults {
  requiredUsableVolumeM3: number;
  usableVolumeM3: number;
  grossVolumeM3: number;
  residenceTimeActualMin: number;

  tankDiameterMm: number;
  tankLengthTangentToTangentMm: number;
  headVolumeM3: number;
  totalTankLengthOverallMm: number;

  levels: {
    bottomMm: number;
    lowLowLevelMm: number; // LLLL (Pump trip)
    lowLevelMm: number; // LLL (Alarm)
    normalOperatingLevelMm: number; // NOL
    highLevelMm: number; // HL (Alarm)
    highHighLevelMm: number; // HHL (Overflow / extraction trip)
    topOfShellMm: number;
  };

  holdUpTimesMin: {
    nolToLllMin: number;
    lllToLlllMin: number;
    hlToNolMin: number;
    hhlToHlMin: number;
  };

  liquidWeightsKg: {
    normalLiquidKg: number;
    fullFloodedKg: number;
  };
}

export interface NozzleDesignResult {
  id: string;
  name: string;
  service: string;
  flowKgH: number;
  volumetricFlowM3H: number;
  phase: 'Liquid' | 'Vapor' | 'Two-Phase';
  selectedNpsInches: number;
  selectedSchedule: string;
  internalDiameterMm: number;
  actualVelocityMS: number;
  allowableVelocityMS: number;
  velocityHeadPa: number;
  estimatedDeltaPBarPer100M: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  governingRule: string;
}

export interface MechanicalDesignResults {
  designPressureBarG: number;
  designPressureMpa: number;
  designTempC: number;
  shellMaterial: string;
  allowableStressMpa: number;
  jointEfficiency: number;
  corrosionAllowanceMm: number;

  // Dome Tower Mechanical
  domeShellMinThicknessMm: number;
  domeShellNominalThicknessMm: number;
  domeHeadMinThicknessMm: number;
  domeHeadNominalThicknessMm: number;

  // Storage Vessel Mechanical (ASME UG-27 & UG-32)
  storageShellMinThicknessMm: number;
  storageShellNominalThicknessMm: number;
  storageHeadMinThicknessMm: number;
  storageHeadNominalThicknessMm: number;
  storageMawpBarG: number;
  hydrotestPressureBarG: number;

  // Weights Estimation
  estimatedEmptyVesselWeightTonnes: number;
  internalsWeightTonnes: number;
  operatingWeightTonnes: number;
  floodedWeightTonnes: number;

  asmeCodeStatus: 'PASS' | 'FAIL';
  naceNotice: string;
}

export interface ValidationItem {
  id: string;
  category: 'Process' | 'Internals' | 'Storage' | 'Nozzles' | 'Mechanical';
  parameter: string;
  calculatedValue: string;
  criterion: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  governingCode: string;
  details: string;
}

export interface FormulaTraceItem {
  cellId: string;
  sheetName: string;
  name: string;
  category: string;
  symbolicFormula: string;
  numericalSubstitution: string;
  resultValue: string;
  standardReference: string;
  assumptions: string;
}

export interface DeaeratorCalculationOutput {
  inputs: DeaeratorInputs;
  streamProperties: {
    makeup: StreamProperty;
    hpCondensate: StreamProperty;
    lpCondensate: StreamProperty;
    heatingSteam: StreamProperty;
    ventVapor: StreamProperty;
    outletWater: StreamProperty;
  };
  massEnergyBalance: MassEnergyBalanceResults;
  deaerationPerformance: DeaerationPerformanceResults;
  vesselInternals: VesselInternalsResults;
  storageLevels: StorageLevelResults;
  nozzles: NozzleDesignResult[];
  mechanicalDesign: MechanicalDesignResults;
  validationItems: ValidationItem[];
  formulaTrace: FormulaTraceItem[];
  overallStatus: 'PASS' | 'WARN' | 'FAIL';
  summaryMetrics: {
    feedwaterCapacityTph: number;
    steamConsumptionTph: number;
    steamToFeedRatioPercent: number;
    deaeratorOperatingTempC: number;
    deaeratorOperatingPressureBarG: number;
    dissolvedO2OutletPpb: number;
    storageGrossVolumeM3: number;
    residenceTimeMin: number;
    storageVesselDiaMm: number;
    storageVesselLengthMm: number;
    operatingWeightTonnes: number;
  };
}
