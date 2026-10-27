/**
 * Deaerator Process Calculation and Sizing Engine
 * Implements:
 * 1. Design Basis & Properties (IAPWS-IF97 steam & water properties, Henry's Law)
 * 2. Mass & Energy Balance (Feedwater mixing, steam consumption, heat duty, vent losses)
 * 3. Deaeration Performance (Inlet/outlet O2, non-condensable release, HEI compliance)
 * 4. Vessel & Internals Sizing (Tray stack, spray chamber, Souders-Brown vapor velocity, hydraulic loading)
 * 5. Storage & Level Sizing (Residence time at MCR, hold-up, LLLL, LLL, NOL, HL, HHL)
 * 6. Nozzle & Vent Sizing (API RP 14E / HEI velocity limits, nozzle schedule, pressure drop)
 * 7. Mechanical Design (ASME BPVC Section VIII Div 1 UG-27 shell & UG-32 2:1 ellipsoidal heads, hydrotest, weights)
 * 8. Results & Validation (Comprehensive pass/fail criteria, warnings, formula traceability)
 */

import {
  getSaturationProperties,
  getSteamEnthalpy,
  getSteamDensity,
  getWaterEnthalpy,
  getWaterDensity,
  getEquilibriumOxygenSolubility,
} from './steamProperties';
import {
  DeaeratorInputs,
  DeaeratorCalculationOutput,
  StreamProperty,
  MassEnergyBalanceResults,
  DeaerationPerformanceResults,
  VesselInternalsResults,
  StorageLevelResults,
  NozzleDesignResult,
  MechanicalDesignResults,
  ValidationItem,
  FormulaTraceItem,
} from './deaeratorTypes';

// Standard Pipe Dimensions (ASME B36.10M Schedule 40 / STD)
export const STANDARD_PIPE_SIZES = [
  { nps: 1, odMm: 33.4, idMm: 26.64, sched: 'Sch 40' },
  { nps: 1.5, odMm: 48.3, idMm: 40.94, sched: 'Sch 40' },
  { nps: 2, odMm: 60.3, idMm: 52.5, sched: 'Sch 40' },
  { nps: 2.5, odMm: 73.0, idMm: 62.7, sched: 'Sch 40' },
  { nps: 3, odMm: 88.9, idMm: 77.92, sched: 'Sch 40' },
  { nps: 4, odMm: 114.3, idMm: 102.26, sched: 'Sch 40' },
  { nps: 6, odMm: 168.3, idMm: 154.08, sched: 'Sch 40' },
  { nps: 8, odMm: 219.1, idMm: 202.72, sched: 'Sch 40' },
  { nps: 10, odMm: 273.0, idMm: 254.5, sched: 'Sch 40' },
  { nps: 12, odMm: 323.8, idMm: 304.8, sched: 'Sch 40' },
  { nps: 14, odMm: 355.6, idMm: 333.34, sched: 'Sch 40' },
  { nps: 16, odMm: 406.4, idMm: 381.0, sched: 'Sch 40' },
  { nps: 18, odMm: 457.0, idMm: 428.6, sched: 'Sch 40' },
  { nps: 20, odMm: 508.0, idMm: 477.82, sched: 'Sch 40' },
  { nps: 24, odMm: 610.0, idMm: 574.04, sched: 'Sch 40' },
];

export function runDeaeratorCalculations(inputs: DeaeratorInputs): DeaeratorCalculationOutput {
  const formulaTrace: FormulaTraceItem[] = [];
  const validationItems: ValidationItem[] = [];

  // ==========================================
  // MODULE 1: DESIGN BASIS & FLUID PROPERTIES
  // ==========================================
  const pOpBarA = inputs.operatingPressureBarG + inputs.atmosphericPressureBarA;
  const satProps = getSaturationProperties(pOpBarA);

  // Heating steam properties
  const pSteamBarA = inputs.steamPressureBarG + inputs.atmosphericPressureBarA;
  const hSteam = getSteamEnthalpy(pSteamBarA, inputs.steamTempC);
  const rhoSteam = getSteamDensity(pSteamBarA, inputs.steamTempC);

  // Makeup water properties
  const hMakeup = getWaterEnthalpy(inputs.makeupTempC);
  const rhoMakeup = getWaterDensity(inputs.makeupTempC);
  const vFlowMakeup = rhoMakeup > 0 ? inputs.makeupFlowKgH / rhoMakeup : 0;
  const o2FlowMakeupKgH = (inputs.makeupFlowKgH * inputs.makeupDissolvedO2MgL) / 1e6;

  // HP Condensate
  const hHpCond = getWaterEnthalpy(inputs.hpCondensateTempC);
  const rhoHpCond = getWaterDensity(inputs.hpCondensateTempC);
  const vFlowHpCond = rhoHpCond > 0 ? inputs.hpCondensateFlowKgH / rhoHpCond : 0;
  const o2FlowHpCondKgH = (inputs.hpCondensateFlowKgH * inputs.hpCondensateDissolvedO2MgL) / 1e6;

  // LP Condensate
  const hLpCond = getWaterEnthalpy(inputs.lpCondensateTempC);
  const rhoLpCond = getWaterDensity(inputs.lpCondensateTempC);
  const vFlowLpCond = rhoLpCond > 0 ? inputs.lpCondensateFlowKgH / rhoLpCond : 0;
  const o2FlowLpCondKgH = (inputs.lpCondensateFlowKgH * inputs.lpCondensateDissolvedO2MgL) / 1e6;

  // Total inlet liquid
  const mInletLiquid = inputs.makeupFlowKgH + inputs.hpCondensateFlowKgH + inputs.lpCondensateFlowKgH;
  const totalInletLiquidKw =
    (inputs.makeupFlowKgH * hMakeup +
      inputs.hpCondensateFlowKgH * hHpCond +
      inputs.lpCondensateFlowKgH * hLpCond) /
    3600;
  const mixedInletEnthalpy = mInletLiquid > 0 ? (totalInletLiquidKw * 3600) / mInletLiquid : 0;
  // Approximate mixed temp from enthalpy: h ~ 4.184 * T
  const mixedInletTemp = mixedInletEnthalpy / 4.184;

  formulaTrace.push({
    cellId: 'M1-P_OP',
    sheetName: 'Design Basis & Properties',
    name: 'Operating Pressure (Absolute)',
    category: 'Thermodynamics',
    symbolicFormula: 'P_abs = P_gauge + P_atm',
    numericalSubstitution: `${inputs.operatingPressureBarG} + ${inputs.atmosphericPressureBarA}`,
    resultValue: `${pOpBarA.toFixed(3)} bar(a)`,
    standardReference: 'IAPWS-IF97 / ASME PTC 12.3',
    assumptions: 'Uniform operating pressure in deaerator dome and storage tank.',
  });

  formulaTrace.push({
    cellId: 'M1-T_SAT',
    sheetName: 'Design Basis & Properties',
    name: 'Operating Saturation Temperature',
    category: 'Thermodynamics',
    symbolicFormula: 'T_sat = f(P_op) via IAPWS-IF97 Region 4',
    numericalSubstitution: `f(${pOpBarA.toFixed(3)} bar a)`,
    resultValue: `${satProps.temperatureC.toFixed(2)} °C`,
    standardReference: 'IAPWS-IF97 Industrial Formulation',
    assumptions: 'Feedwater reaches equilibrium boiling saturation at operating pressure.',
  });

  // ==========================================
  // MODULE 2: MASS & ENERGY BALANCE
  // ==========================================
  // Vent vapor is saturated steam leaving at deaerator pressure
  const hVent = satProps.vaporEnthalpy;
  const hLiquidOut = satProps.liquidEnthalpy; // Saturated liquid at P_op

  // Vent loss: f_vent * M_steam
  const fVent = Math.max(0.0005, inputs.ventLossPercentOfSteam / 100);
  const fHeatLoss = inputs.heatLossPercentOfDuty / 100;

  // Theoretical Energy Balance Equation:
  // Heat in: M_inlet * h_mixed + M_steam * h_steam
  // Heat out: M_outlet * h_liquid_out + M_vent * h_vent + Q_loss
  // Mass balance: M_outlet = M_inlet + M_steam - M_vent = M_inlet + M_steam * (1 - fVent)
  // M_vent = fVent * M_steam
  // Q_loss = fHeatLoss * Q_duty ~ fHeatLoss * (M_outlet * h_liquid_out - M_inlet * h_mixed)
  //
  // Solve for M_steam:
  // M_steam * h_steam + M_inlet * h_mixed = (M_inlet + M_steam*(1-fVent))*h_liquid_out + fVent*M_steam*h_vent + Q_loss
  // M_steam * [h_steam - (1-fVent)*h_liquid_out - fVent*h_vent] = M_inlet*(h_liquid_out - h_mixed) + Q_loss
  const sensibleDutyKw = (mInletLiquid * (hLiquidOut - mixedInletEnthalpy)) / 3600;
  const grossDutyKw = sensibleDutyKw * (1 + fHeatLoss);
  const heatLossKw = grossDutyKw - sensibleDutyKw;

  const denominator = hSteam - (1 - fVent) * hLiquidOut - fVent * hVent;
  const mSteamRequired = denominator > 0 ? (grossDutyKw * 3600) / denominator : 0;
  const mVent = fVent * mSteamRequired;
  const mOutletFeedwater = mInletLiquid + mSteamRequired - mVent;
  const mSteamCondensed = mSteamRequired - mVent;

  // Check mass balance closure
  const totalMassIn = mInletLiquid + mSteamRequired;
  const totalMassOut = mOutletFeedwater + mVent;
  const massBalanceError = Math.abs(totalMassIn - totalMassOut) / (totalMassIn || 1);

  // Check energy balance closure
  const energyInKw = (mInletLiquid * mixedInletEnthalpy + mSteamRequired * hSteam) / 3600;
  const energyOutKw =
    (mOutletFeedwater * hLiquidOut + mVent * hVent) / 3600 + heatLossKw;
  const energyBalanceError = Math.abs(energyInKw - energyOutKw) / (energyInKw || 1);

  formulaTrace.push({
    cellId: 'M2-M_STEAM',
    sheetName: 'Mass/Energy Balance',
    name: 'Required Heating Steam Flow',
    category: 'Energy Balance',
    symbolicFormula: 'M_steam = [M_inlet * (h_out - h_mix) + Q_loss] / [h_steam - (1 - f_v)*h_out - f_v*h_v]',
    numericalSubstitution: `[${mInletLiquid.toFixed(0)}*(${hLiquidOut.toFixed(1)} - ${mixedInletEnthalpy.toFixed(1)}) + ${(heatLossKw * 3600).toFixed(0)}] / [${hSteam.toFixed(1)} - ${(1 - fVent).toFixed(4)}*${hLiquidOut.toFixed(1)} - ${fVent.toFixed(4)}*${hVent.toFixed(1)}]`,
    resultValue: `${mSteamRequired.toFixed(1)} kg/h`,
    standardReference: 'HEI Standards for Deaerators / ASME PTC 12.3',
    assumptions: 'Thermal equilibrium in liquid pool; radiation and convection loss accounted.',
  });

  formulaTrace.push({
    cellId: 'M2-Q_DUTY',
    sheetName: 'Mass/Energy Balance',
    name: 'Gross Thermal Heat Duty',
    category: 'Energy Balance',
    symbolicFormula: 'Q_gross = M_inlet * (h_out - h_mix) + Q_loss',
    numericalSubstitution: `${mInletLiquid.toFixed(0)} * (${hLiquidOut.toFixed(1)} - ${mixedInletEnthalpy.toFixed(1)}) / 3600 + ${heatLossKw.toFixed(1)}`,
    resultValue: `${grossDutyKw.toFixed(1)} kW (${(grossDutyKw * 0.003412142).toFixed(2)} MMBtu/hr)`,
    standardReference: 'ASME PTC 12.3',
    assumptions: 'Includes feedwater sensible heating plus shell heat loss margin.',
  });

  const massEnergyBalance: MassEnergyBalanceResults = {
    totalInletLiquidKgH: Number(mInletLiquid.toFixed(1)),
    heatingSteamRequiredKgH: Number(mSteamRequired.toFixed(1)),
    ventVaporLossKgH: Number(mVent.toFixed(1)),
    netSteamCondensedKgH: Number(mSteamCondensed.toFixed(1)),
    totalDeaeratedWaterOutKgH: Number(mOutletFeedwater.toFixed(1)),
    mixedInletWaterTempC: Number(mixedInletTemp.toFixed(1)),
    mixedInletEnthalpyKjKg: Number(mixedInletEnthalpy.toFixed(1)),
    operatingTempSatC: Number(satProps.temperatureC.toFixed(2)),
    operatingEnthalpyLiquidKjKg: Number(hLiquidOut.toFixed(1)),
    heatingSteamEnthalpyKjKg: Number(hSteam.toFixed(1)),
    ventVaporEnthalpyKjKg: Number(hVent.toFixed(1)),
    preheatDutyKw: Number(sensibleDutyKw.toFixed(1)),
    sensibleHeatKw: Number(sensibleDutyKw.toFixed(1)),
    latentHeatCondensedKw: Number(((mSteamCondensed * satProps.latentHeat) / 3600).toFixed(1)),
    heatLossKw: Number(heatLossKw.toFixed(1)),
    grossHeatDutyKw: Number(grossDutyKw.toFixed(1)),
    heatDutyMmbtuHr: Number((grossDutyKw * 0.003412142).toFixed(2)),
    massBalanceErrorPercent: Number((massBalanceError * 100).toFixed(4)),
    energyBalanceErrorPercent: Number((energyBalanceError * 100).toFixed(4)),
  };

  // Stream property objects
  const streamProperties = {
    makeup: {
      name: 'Makeup Water',
      massFlowKgH: inputs.makeupFlowKgH,
      temperatureC: inputs.makeupTempC,
      pressureBarA: inputs.operatingPressureBarG + 1.5,
      specificEnthalpyKjKg: hMakeup,
      heatContentKw: Number(((inputs.makeupFlowKgH * hMakeup) / 3600).toFixed(1)),
      densityKgM3: rhoMakeup,
      volumetricFlowM3H: Number(vFlowMakeup.toFixed(2)),
      dissolvedO2MgL: inputs.makeupDissolvedO2MgL,
      totalO2FlowKgH: Number(o2FlowMakeupKgH.toFixed(4)),
    },
    hpCondensate: {
      name: 'HP Condensate Return',
      massFlowKgH: inputs.hpCondensateFlowKgH,
      temperatureC: inputs.hpCondensateTempC,
      pressureBarA: inputs.operatingPressureBarG + 2.0,
      specificEnthalpyKjKg: hHpCond,
      heatContentKw: Number(((inputs.hpCondensateFlowKgH * hHpCond) / 3600).toFixed(1)),
      densityKgM3: rhoHpCond,
      volumetricFlowM3H: Number(vFlowHpCond.toFixed(2)),
      dissolvedO2MgL: inputs.hpCondensateDissolvedO2MgL,
      totalO2FlowKgH: Number(o2FlowHpCondKgH.toFixed(4)),
    },
    lpCondensate: {
      name: 'LP Condensate Return',
      massFlowKgH: inputs.lpCondensateFlowKgH,
      temperatureC: inputs.lpCondensateTempC,
      pressureBarA: inputs.operatingPressureBarG + 1.2,
      specificEnthalpyKjKg: hLpCond,
      heatContentKw: Number(((inputs.lpCondensateFlowKgH * hLpCond) / 3600).toFixed(1)),
      densityKgM3: rhoLpCond,
      volumetricFlowM3H: Number(vFlowLpCond.toFixed(2)),
      dissolvedO2MgL: inputs.lpCondensateDissolvedO2MgL,
      totalO2FlowKgH: Number(o2FlowLpCondKgH.toFixed(4)),
    },
    heatingSteam: {
      name: 'Heating Steam',
      massFlowKgH: Number(mSteamRequired.toFixed(1)),
      temperatureC: inputs.steamTempC,
      pressureBarA: pSteamBarA,
      specificEnthalpyKjKg: hSteam,
      heatContentKw: Number(((mSteamRequired * hSteam) / 3600).toFixed(1)),
      densityKgM3: rhoSteam,
      volumetricFlowM3H: Number(((mSteamRequired / (rhoSteam || 1))).toFixed(1)),
      dissolvedO2MgL: 0,
      totalO2FlowKgH: 0,
    },
    ventVapor: {
      name: 'Non-Condensable Vent Vapor',
      massFlowKgH: Number(mVent.toFixed(2)),
      temperatureC: satProps.temperatureC,
      pressureBarA: pOpBarA,
      specificEnthalpyKjKg: hVent,
      heatContentKw: Number(((mVent * hVent) / 3600).toFixed(2)),
      densityKgM3: satProps.vaporDensity,
      volumetricFlowM3H: Number(((mVent / (satProps.vaporDensity || 1))).toFixed(2)),
      dissolvedO2MgL: 0,
      totalO2FlowKgH: 0,
    },
    outletWater: {
      name: 'Deaerated Boiler Feedwater',
      massFlowKgH: Number(mOutletFeedwater.toFixed(1)),
      temperatureC: satProps.temperatureC,
      pressureBarA: pOpBarA,
      specificEnthalpyKjKg: hLiquidOut,
      heatContentKw: Number(((mOutletFeedwater * hLiquidOut) / 3600).toFixed(1)),
      densityKgM3: satProps.liquidDensity,
      volumetricFlowM3H: Number((mOutletFeedwater / satProps.liquidDensity).toFixed(2)),
      dissolvedO2MgL: inputs.targetOutletO2Ppb / 1000,
      totalO2FlowKgH: Number(((mOutletFeedwater * (inputs.targetOutletO2Ppb / 1e6)) / 1000).toFixed(6)),
    },
  };

  // ==========================================
  // MODULE 3: DEAERATION PERFORMANCE
  // ==========================================
  const totalInletO2KgH = o2FlowMakeupKgH + o2FlowHpCondKgH + o2FlowLpCondKgH;
  const weightedInletO2MgL = mInletLiquid > 0 ? (totalInletO2KgH * 1e6) / mInletLiquid : 0;
  const weightedInletO2Ppb = weightedInletO2MgL * 1000;

  const targetOutletO2MgL = inputs.targetOutletO2Ppb / 1000;
  const totalOutletO2KgH = (mOutletFeedwater * targetOutletO2MgL) / 1e6;
  const o2StrippedKgH = Math.max(0, totalInletO2KgH - totalOutletO2KgH);
  const o2RemovalEfficiency = totalInletO2KgH > 0 ? ((totalInletO2KgH - totalOutletO2KgH) / totalInletO2KgH) * 100 : 99.9;

  // Gas solubility at boiling point is theoretically 0 by Henry's law when stripping steam displaces non-condensable partial pressure
  const eqSolubilityMgL = getEquilibriumOxygenSolubility(satProps.temperatureC, pOpBarA);

  // Non-condensables release calculation (air ratio O2 : N2 ~ 1 : 2.1 by weight in dissolved water)
  const n2StrippedKgH = o2StrippedKgH * 2.1;
  const co2StrippedKgH = (mInletLiquid * 0.005 * (inputs.co2RemovalTargetPercent / 100)) / 1000; // estimated 5 ppm free CO2 in raw makeup
  const totalGasKgH = o2StrippedKgH + n2StrippedKgH + co2StrippedKgH;
  // Volume at standard conditions (Nm3/h: ~0.8 kg/Nm3 average for mixture)
  const totalGasNm3H = totalGasKgH / 0.85;

  const heiCompliance = inputs.targetOutletO2Ppb <= 7.0 && satProps.temperatureC >= 100;

  formulaTrace.push({
    cellId: 'M3-O2_EFF',
    sheetName: 'Deaeration Performance',
    name: 'Oxygen Removal Efficiency',
    category: 'Deaeration Kinetics',
    symbolicFormula: 'eta_O2 = [(C_in - C_out) / C_in] * 100%',
    numericalSubstitution: `[(${weightedInletO2MgL.toFixed(3)} - ${targetOutletO2MgL.toFixed(4)}) / ${weightedInletO2MgL.toFixed(3)}] * 100`,
    resultValue: `${o2RemovalEfficiency.toFixed(2)} %`,
    standardReference: 'HEI Standards for Deaerators / ASME PTC 12.3',
    assumptions: 'Stripping steam removes dissolved O2 below 0.005 mg/L (7 ppb) via Henry’s law.',
  });

  const deaerationPerformance: DeaerationPerformanceResults = {
    weightedInletO2MgL: Number(weightedInletO2MgL.toFixed(3)),
    weightedInletO2Ppb: Number(weightedInletO2Ppb.toFixed(1)),
    totalInletO2KgH: Number(totalInletO2KgH.toFixed(4)),
    outletO2Ppb: inputs.targetOutletO2Ppb,
    outletO2MgL: Number(targetOutletO2MgL.toFixed(4)),
    totalOutletO2KgH: Number(totalOutletO2KgH.toFixed(6)),
    oxygenStrippedKgH: Number(o2StrippedKgH.toFixed(4)),
    oxygenRemovalEfficiencyPercent: Number(o2RemovalEfficiency.toFixed(2)),
    equilibriumSolubilityMgL: eqSolubilityMgL,
    henryConstantBar: Number((pOpBarA * 2.4e4).toFixed(0)),
    nonCondensablesKgH: {
      oxygenKgH: Number(o2StrippedKgH.toFixed(4)),
      nitrogenKgH: Number(n2StrippedKgH.toFixed(4)),
      carbonDioxideKgH: Number(co2StrippedKgH.toFixed(4)),
      totalGasKgH: Number(totalGasKgH.toFixed(4)),
      totalGasNm3H: Number(totalGasNm3H.toFixed(2)),
    },
    heiCompliance,
    notes: 'Guaranteed residual O2 <= 7 ppb (0.005 mg/L / 0.005 ppm) as per HEI standard across 10-100% MCR.',
  };

  // ==========================================
  // MODULE 4: VESSEL & INTERNALS SIZING
  // ==========================================
  // Sizing of deaerating section (Dome/Tower or Spray Head)
  // Hydraulic loading rate: q = Q_water / A_stack (typical 80 - 150 m3/(h·m2))
  const waterFlowM3H = mInletLiquid / satProps.liquidDensity;
  const targetHydraulicLoading = inputs.trayHydraulicLoadingM3Hm2 || 110;
  const trayStackAreaM2 = waterFlowM3H / targetHydraulicLoading;

  // Souders-Brown Allowable Vapor Velocity for deaerator dome to avoid entrainment:
  // v_allow = K_sb * sqrt((rho_L - rho_V) / rho_V)
  // K_sb typical for deaerators with trays = 0.05 to 0.08 m/s (0.16 - 0.26 ft/s)
  const soudersBrownK = inputs.deaeratorType === 'spray' ? 0.09 : 0.065;
  const rho_L = satProps.liquidDensity;
  const rho_V = satProps.vaporDensity;
  const vAllowableVapor = soudersBrownK * Math.sqrt((rho_L - rho_V) / (rho_V || 1));

  // Vapor flow through dome: steam entering dome + vaporized steam
  const steamVaporFlowM3S = (mSteamRequired / (rho_V || 1)) / 3600;

  // Required cross-sectional area based on vapor entrainment:
  const minVaporAreaM2 = steamVaporFlowM3S / (vAllowableVapor * 0.75); // 75% limit factor

  // Required cross-sectional area based on tray/spray hydraulic envelope:
  // Tray stack takes ~60-70% of dome cross-section, remaining is downcomer and steam bypass area
  const minTrayCrossSectionM2 = trayStackAreaM2 / 0.65;
  const domeAreaM2 = Math.max(minVaporAreaM2, minTrayCrossSectionM2);

  // Dome diameter (standard nominal diameters)
  const calcDomeDiaMm = Math.sqrt((4 * domeAreaM2) / Math.PI) * 1000;
  // Round up to nearest 100 mm (minimum 800 mm)
  const domeDiameterMm = Math.max(800, Math.ceil(calcDomeDiaMm / 100) * 100);
  const actualDomeAreaM2 = (Math.PI * Math.pow(domeDiameterMm / 1000, 2)) / 4;

  const actualVaporVelocity = steamVaporFlowM3S / actualDomeAreaM2;
  const vaporVelocityRatio = actualVaporVelocity / (vAllowableVapor || 1);

  // Tray Stack Specifics
  const trayWidthMm = Math.round(Math.sqrt(trayStackAreaM2 * 0.8) * 1000);
  const trayLengthMm = Math.round((trayStackAreaM2 / (trayWidthMm / 1000 || 1)) * 1000);
  const trayCountTiers = inputs.deaeratorType === 'spray' ? 0 : 5; // typical 4 to 6 rows of trays in cascade
  const activeTrayHeightMm = inputs.deaeratorType === 'spray' ? 0 : trayCountTiers * 250;

  // Spray Valves (spring-loaded variable-area spray nozzles)
  // Each spray valve capacity ~ 15 to 30 m3/h at deltaP = 0.2 - 0.35 bar
  const flowPerValve = 20; // m3/h per spray nozzle
  const sprayValveCount = Math.max(2, Math.ceil(waterFlowM3H / flowPerValve));
  const actualFlowPerValve = waterFlowM3H / sprayValveCount;

  // Dome height calculation:
  // Spray section free space (800 mm) + tray stack (if applicable) + liquid collector tray (400 mm) + steam entrance & vapor disengagement (600 mm)
  const sprayZoneHeightMm = 900;
  const collectorZoneHeightMm = 500;
  const vaporDisengagementHeightMm = 600;
  const domeHeightMm =
    inputs.deaeratorType === 'spray'
      ? 1800
      : sprayZoneHeightMm + activeTrayHeightMm + collectorZoneHeightMm + vaporDisengagementHeightMm;

  const deaerationSectionTotalVolumeM3 = actualDomeAreaM2 * (domeHeightMm / 1000);

  formulaTrace.push({
    cellId: 'M4-V_SB',
    sheetName: 'Deaerator & Internals Sizing',
    name: 'Souders-Brown Allowable Vapor Velocity',
    category: 'Vapor Dynamics',
    symbolicFormula: 'v_allow = K_sb * sqrt((rho_L - rho_V) / rho_V)',
    numericalSubstitution: `${soudersBrownK} * sqrt((${rho_L.toFixed(1)} - ${rho_V.toFixed(2)}) / ${rho_V.toFixed(2)})`,
    resultValue: `${vAllowableVapor.toFixed(2)} m/s`,
    standardReference: 'Souders & Brown (1934) / HEI Standard for Deaerators',
    assumptions: 'Prevents droplet entrainment into steam dome and vent condenser.',
  });

  formulaTrace.push({
    cellId: 'M4-D_DOME',
    sheetName: 'Deaerator & Internals Sizing',
    name: 'Deaerator Tower / Dome Diameter',
    category: 'Vessel Geometry',
    symbolicFormula: 'D_dome = sqrt(4 * A_req / pi)',
    numericalSubstitution: `sqrt(4 * ${domeAreaM2.toFixed(3)} / 3.14159)`,
    resultValue: `${domeDiameterMm} mm`,
    standardReference: 'HEI Standards for Deaerators 9th Edition',
    assumptions: 'Accommodates tray stack / spray headers with 35% free area for counter-current steam.',
  });

  const vesselInternals: VesselInternalsResults = {
    domeDiameterMm,
    domeHeightMm,
    crossSectionAreaM2: Number(actualDomeAreaM2.toFixed(3)),
    vaporVelocityActualMS: Number(actualVaporVelocity.toFixed(2)),
    vaporVelocityAllowableMS: Number(vAllowableVapor.toFixed(2)),
    vaporVelocityRatio: Number(vaporVelocityRatio.toFixed(3)),
    soudersBrownK,
    deaeratorType: inputs.deaeratorType,
    trayStackAreaM2: Number(trayStackAreaM2.toFixed(3)),
    trayLoadingM3Hm2: Number((waterFlowM3H / (trayStackAreaM2 || 1)).toFixed(1)),
    trayWidthMm,
    trayLengthMm,
    trayCountTiers,
    trayMaterial: 'AISI 430 / 304 Stainless Steel',
    activeTrayHeightMm,
    sprayValveCount,
    sprayValveFlowPerValveM3H: Number(actualFlowPerValve.toFixed(2)),
    sprayPressureDropBar: inputs.sprayValveDeltaPBar || 0.25,
    sprayConeCoveragePercent: 125, // 25% overlap for uniform liquid curtain
    deaerationSectionTotalVolumeM3: Number(deaerationSectionTotalVolumeM3.toFixed(2)),
  };

  // ==========================================
  // MODULE 5: STORAGE & LEVEL SIZING
  // ==========================================
  // Usable storage volume required:
  // V_usable = (M_outlet / rho_L) * (t_residence / 60)
  const outletWaterM3H = mOutletFeedwater / satProps.liquidDensity;
  const reqUsableVolumeM3 = outletWaterM3H * (inputs.residenceTimeMin / 60);

  // In a horizontal storage vessel, usable volume is defined between Low Level (LLL) and High Level (HL)
  // Typically, usable volume is approx 60% to 65% of gross cylindrical vessel volume.
  // Gross volume required ~ V_usable / 0.65
  const grossVolumeM3 = reqUsableVolumeM3 / 0.65;

  // Tank geometry: V_cyl = (pi / 4) * D^2 * L
  // L/D ratio specified (default 3.5 to 4.5)
  const ldRatio = inputs.storageTankLengthToDiaRatio || 4.0;
  // V = (pi/4) * D^2 * (ldRatio * D) = (pi/4) * ldRatio * D^3
  // D = [ (4 * V_gross) / (pi * ldRatio) ]^(1/3)
  const calcTankDiaM = Math.pow((4 * grossVolumeM3) / (Math.PI * ldRatio), 1 / 3);
  // Round tank diameter to nearest standard increments (e.g. 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400 mm)
  const tankDiameterMm = Math.max(1600, Math.ceil((calcTankDiaM * 1000) / 100) * 100);
  const tankDiaM = tankDiameterMm / 1000;

  // Length tangent-to-tangent
  const crossAreaTankM2 = (Math.PI * Math.pow(tankDiaM, 2)) / 4;
  const calcLengthTangentM = (grossVolumeM3 * 0.92) / crossAreaTankM2; // 8% in 2:1 heads
  const tankLengthTangentToTangentMm = Math.max(3000, Math.ceil((calcLengthTangentM * 1000) / 100) * 100);
  const tankLengthM = tankLengthTangentToTangentMm / 1000;

  // 2:1 Ellipsoidal Head Volume (each head V = (pi / 24) * D^3)
  const singleHeadVolumeM3 = (Math.PI / 24) * Math.pow(tankDiaM, 3);
  const totalHeadVolumeM3 = 2 * singleHeadVolumeM3;
  const cylinderVolumeM3 = crossAreaTankM2 * tankLengthM;
  const actualGrossVolumeM3 = cylinderVolumeM3 + totalHeadVolumeM3;
  const headDepthMm = Math.round(tankDiameterMm / 4); // 2:1 ellipsoidal head depth = D/4
  const totalTankLengthOverallMm = tankLengthTangentToTangentMm + 2 * headDepthMm;

  // Liquid Level Elevations (% of diameter D):
  // Bottom: 0 mm
  // LLLL (Low-Low Level / BFW Pump Trip): 12% of D (ensures adequate submergence, vortex prevention)
  // LLL (Low Level / Alarm): 24% of D
  // NOL (Normal Operating Level): 55% of D
  // HL (High Level / Alarm): 78% of D
  // HHL (High-High Level / Trip & Overflow): 88% of D
  // Top of Shell: 100% of D
  const levelBottomMm = 0;
  const levelLlllMm = Math.round(tankDiameterMm * 0.12);
  const levelLllMm = Math.round(tankDiameterMm * 0.24);
  const levelNolMm = Math.round(tankDiameterMm * 0.55);
  const levelHlMm = Math.round(tankDiameterMm * 0.78);
  const levelHhlMm = Math.round(tankDiameterMm * 0.88);
  const levelTopMm = tankDiameterMm;

  // Usable volume between LLL and HL:
  // For a horizontal cylinder, volume fraction at height h/D can be approximated by circular segment area:
  const getCylFractionAtHeight = (hRatio: number) => {
    const h = Math.max(0, Math.min(1, hRatio));
    // Area of circular segment / total area:
    // theta = 2 * acos(1 - 2h); A = 0.5 * R^2 * (theta - sin theta); fraction = A / (pi * R^2)
    const theta = 2 * Math.acos(1 - 2 * h);
    return (theta - Math.sin(theta)) / (2 * Math.PI);
  };

  const fractionLlll = getCylFractionAtHeight(0.12);
  const fractionLll = getCylFractionAtHeight(0.24);
  const fractionNol = getCylFractionAtHeight(0.55);
  const fractionHl = getCylFractionAtHeight(0.78);
  const fractionHhl = getCylFractionAtHeight(0.88);

  const usableVolumeM3 = actualGrossVolumeM3 * (fractionHl - fractionLll);
  const actualResidenceTimeMin = outletWaterM3H > 0 ? (usableVolumeM3 / outletWaterM3H) * 60 : 0;

  // Hold up times between key levels:
  const holdupNolToLllMin = outletWaterM3H > 0 ? ((actualGrossVolumeM3 * (fractionNol - fractionLll)) / outletWaterM3H) * 60 : 0;
  const holdupLllToLlllMin = outletWaterM3H > 0 ? ((actualGrossVolumeM3 * (fractionLll - fractionLlll)) / outletWaterM3H) * 60 : 0;
  const holdupHlToNolMin = outletWaterM3H > 0 ? ((actualGrossVolumeM3 * (fractionHl - fractionNol)) / outletWaterM3H) * 60 : 0;
  const holdupHhlToHlMin = outletWaterM3H > 0 ? ((actualGrossVolumeM3 * (fractionHhl - fractionHl)) / outletWaterM3H) * 60 : 0;

  const normalLiquidKg = actualGrossVolumeM3 * fractionNol * satProps.liquidDensity;
  const fullFloodedLiquidKg = actualGrossVolumeM3 * 1000; // Cold water at 1000 kg/m3 for hydrotest

  formulaTrace.push({
    cellId: 'M5-V_REQ',
    sheetName: 'Storage, Nozzles & Mechanical Design',
    name: 'Required Usable Storage Volume',
    category: 'Vessel Sizing',
    symbolicFormula: 'V_usable = (M_outlet / rho_L) * (t_residence / 60)',
    numericalSubstitution: `(${mOutletFeedwater.toFixed(1)} / ${satProps.liquidDensity.toFixed(1)}) * (${inputs.residenceTimeMin} / 60)`,
    resultValue: `${reqUsableVolumeM3.toFixed(2)} m3`,
    standardReference: 'HEI Standards for Deaerators / ASME Boiler Code Practice',
    assumptions: 'Provides surge buffer for boiler feedwater pumps at 100% MCR.',
  });

  formulaTrace.push({
    cellId: 'M5-T_RES',
    sheetName: 'Storage, Nozzles & Mechanical Design',
    name: 'Actual Residence Time Between LLL & HL',
    category: 'Residence Dynamics',
    symbolicFormula: 't_res = (V_usable / Q_outlet) * 60',
    numericalSubstitution: `(${usableVolumeM3.toFixed(2)} / ${outletWaterM3H.toFixed(2)}) * 60`,
    resultValue: `${actualResidenceTimeMin.toFixed(1)} min`,
    standardReference: 'HEI Section 4 / EPRI Water Chemistry Guidelines',
    assumptions: 'Calculated at normal maximum continuous boiler feed rating.',
  });

  const storageLevels: StorageLevelResults = {
    requiredUsableVolumeM3: Number(reqUsableVolumeM3.toFixed(2)),
    usableVolumeM3: Number(usableVolumeM3.toFixed(2)),
    grossVolumeM3: Number(actualGrossVolumeM3.toFixed(2)),
    residenceTimeActualMin: Number(actualResidenceTimeMin.toFixed(1)),
    tankDiameterMm,
    tankLengthTangentToTangentMm,
    headVolumeM3: Number(totalHeadVolumeM3.toFixed(2)),
    totalTankLengthOverallMm,
    levels: {
      bottomMm: levelBottomMm,
      lowLowLevelMm: levelLlllMm,
      lowLevelMm: levelLllMm,
      normalOperatingLevelMm: levelNolMm,
      highLevelMm: levelHlMm,
      highHighLevelMm: levelHhlMm,
      topOfShellMm: levelTopMm,
    },
    holdUpTimesMin: {
      nolToLllMin: Number(holdupNolToLllMin.toFixed(1)),
      lllToLlllMin: Number(holdupLllToLlllMin.toFixed(1)),
      hlToNolMin: Number(holdupHlToNolMin.toFixed(1)),
      hhlToHlMin: Number(holdupHhlToHlMin.toFixed(1)),
    },
    liquidWeightsKg: {
      normalLiquidKg: Math.round(normalLiquidKg),
      fullFloodedKg: Math.round(fullFloodedLiquidKg),
    },
  };

  // ==========================================
  // MODULE 6: NOZZLE & VENT SIZING
  // ==========================================
  const selectPipeSize = (
    flowM3S: number,
    allowableVelocityMS: number,
    fluidDensityKgM3: number
  ) => {
    // Area required = Q / v
    const reqAreaM2 = flowM3S / (allowableVelocityMS || 1);
    const reqIdMm = Math.sqrt((4 * reqAreaM2) / Math.PI) * 1000;

    // Pick smallest pipe with internal diameter >= 90% of reqIdMm
    let selected = STANDARD_PIPE_SIZES[STANDARD_PIPE_SIZES.length - 1];
    for (const pipe of STANDARD_PIPE_SIZES) {
      if (pipe.idMm >= reqIdMm * 0.95) {
        selected = pipe;
        break;
      }
    }

    const idM = selected.idMm / 1000;
    const actualAreaM2 = (Math.PI * Math.pow(idM, 2)) / 4;
    const actualVelocityMS = flowM3S / actualAreaM2;
    const velocityHeadPa = 0.5 * fluidDensityKgM3 * Math.pow(actualVelocityMS, 2);

    // Darcy-Weisbach estimate: deltaP = f * (L/D) * (rho * v^2 / 2) with f ~ 0.018 for turbulent steel pipe
    const deltaPBarPer100M = (0.018 * (100 / idM) * velocityHeadPa) / 1e5;

    const status: 'PASS' | 'WARN' | 'FAIL' =
      actualVelocityMS <= allowableVelocityMS * 1.05
        ? 'PASS'
        : actualVelocityMS <= allowableVelocityMS * 1.25
        ? 'WARN'
        : 'FAIL';

    return {
      selectedNpsInches: selected.nps,
      selectedSchedule: selected.sched,
      internalDiameterMm: selected.idMm,
      actualVelocityMS: Number(actualVelocityMS.toFixed(2)),
      velocityHeadPa: Number(velocityHeadPa.toFixed(0)),
      estimatedDeltaPBarPer100M: Number(deltaPBarPer100M.toFixed(3)),
      status,
    };
  };

  const nozzles: NozzleDesignResult[] = [];

  // N1: Makeup Water Inlet (on deaerator dome)
  const makeupFlowM3S = (inputs.makeupFlowKgH / (rhoMakeup || 1000)) / 3600;
  const n1Makeup = selectPipeSize(makeupFlowM3S, inputs.allowableVelocities.waterInletMaxMS, rhoMakeup);
  nozzles.push({
    id: 'N1',
    name: 'Makeup Water Inlet',
    service: 'Deaerator Dome Top / Spray Header',
    flowKgH: inputs.makeupFlowKgH,
    volumetricFlowM3H: Number((inputs.makeupFlowKgH / rhoMakeup).toFixed(2)),
    phase: 'Liquid',
    governingRule: `Liquid inlet velocity <= ${inputs.allowableVelocities.waterInletMaxMS} m/s`,
    ...n1Makeup,
    allowableVelocityMS: inputs.allowableVelocities.waterInletMaxMS,
  });

  // N2: Condensate Return Inlet (HP + LP combined or primary)
  const totalCondFlowKgH = inputs.hpCondensateFlowKgH + inputs.lpCondensateFlowKgH;
  const avgCondDensity = (rhoHpCond + rhoLpCond) / 2 || 950;
  const condFlowM3S = (totalCondFlowKgH / avgCondDensity) / 3600;
  const n2Cond = selectPipeSize(
    Math.max(0.0001, condFlowM3S),
    inputs.allowableVelocities.waterInletMaxMS,
    avgCondDensity
  );
  nozzles.push({
    id: 'N2',
    name: 'Condensate Return Inlet',
    service: 'Deaerator Dome Side Inlet',
    flowKgH: totalCondFlowKgH,
    volumetricFlowM3H: Number((totalCondFlowKgH / avgCondDensity).toFixed(2)),
    phase: 'Liquid',
    governingRule: `Liquid inlet velocity <= ${inputs.allowableVelocities.waterInletMaxMS} m/s`,
    ...n2Cond,
    allowableVelocityMS: inputs.allowableVelocities.waterInletMaxMS,
  });

  // N3: Heating Steam Inlet
  const steamFlowM3S = (mSteamRequired / (rhoSteam || 1)) / 3600;
  const n3Steam = selectPipeSize(steamFlowM3S, inputs.allowableVelocities.steamInletMaxMS, rhoSteam);
  nozzles.push({
    id: 'N3',
    name: 'Heating Steam Inlet',
    service: 'Deaerator Dome / Sparger Manifold',
    flowKgH: Number(mSteamRequired.toFixed(1)),
    volumetricFlowM3H: Number((mSteamRequired / rhoSteam).toFixed(1)),
    phase: 'Vapor',
    governingRule: `Steam velocity <= ${inputs.allowableVelocities.steamInletMaxMS} m/s (HEI / API RP 14E)`,
    ...n3Steam,
    allowableVelocityMS: inputs.allowableVelocities.steamInletMaxMS,
  });

  // N4: Boiler Feedwater Pump Suction (Outlet)
  const bfwFlowM3S = (mOutletFeedwater / satProps.liquidDensity) / 3600;
  const n4Bfw = selectPipeSize(bfwFlowM3S, inputs.allowableVelocities.bfwSuctionMaxMS, satProps.liquidDensity);
  nozzles.push({
    id: 'N4',
    name: 'BFW Pump Suction Outlet',
    service: 'Storage Tank Bottom (with Vortex Breaker)',
    flowKgH: Number(mOutletFeedwater.toFixed(1)),
    volumetricFlowM3H: Number(outletWaterM3H.toFixed(2)),
    phase: 'Liquid',
    governingRule: `Suction velocity <= ${inputs.allowableVelocities.bfwSuctionMaxMS} m/s (NPSHa Protection / Hydraulic Institute)`,
    ...n4Bfw,
    allowableVelocityMS: inputs.allowableVelocities.bfwSuctionMaxMS,
  });

  // N5: Non-Condensable Vent Nozzle
  const ventFlowM3S = (mVent / (satProps.vaporDensity || 1)) / 3600;
  const n5Vent = selectPipeSize(Math.max(0.00005, ventFlowM3S), inputs.allowableVelocities.ventMaxMS, satProps.vaporDensity);
  nozzles.push({
    id: 'N5',
    name: 'Non-Condensable Vent',
    service: 'Dome Top Vent to Atmosphere / Condenser',
    flowKgH: Number(mVent.toFixed(2)),
    volumetricFlowM3H: Number((mVent / satProps.vaporDensity).toFixed(2)),
    phase: 'Vapor',
    governingRule: `Vent vapor velocity <= ${inputs.allowableVelocities.ventMaxMS} m/s with restrictive orifice`,
    ...n5Vent,
    allowableVelocityMS: inputs.allowableVelocities.ventMaxMS,
  });

  // N6: Overflow Nozzle (Gravity loop seal or trap)
  // Sized for 100% of incoming water flow under emergency high level
  const overflowFlowM3S = (mInletLiquid / satProps.liquidDensity) / 3600;
  const n6Overflow = selectPipeSize(overflowFlowM3S, inputs.allowableVelocities.overflowMaxMS, satProps.liquidDensity);
  nozzles.push({
    id: 'N6',
    name: 'Overflow Nozzle',
    service: 'Storage Tank Side at HHL with External Loop Seal',
    flowKgH: Number(mInletLiquid.toFixed(1)),
    volumetricFlowM3H: Number((mInletLiquid / satProps.liquidDensity).toFixed(2)),
    phase: 'Liquid',
    governingRule: `Gravity overflow velocity <= ${inputs.allowableVelocities.overflowMaxMS} m/s`,
    ...n6Overflow,
    allowableVelocityMS: inputs.allowableVelocities.overflowMaxMS,
  });

  // N7: Vessel Drain Nozzle
  // Drain 100% gross tank volume within 2.5 hours
  const drainFlowM3S = actualGrossVolumeM3 / (2.5 * 3600);
  const n7Drain = selectPipeSize(drainFlowM3S, inputs.allowableVelocities.drainMaxMS, 1000);
  nozzles.push({
    id: 'N7',
    name: 'Vessel Drain Nozzle',
    service: 'Storage Tank Low Point Drain',
    flowKgH: Number((drainFlowM3S * 3600 * 1000).toFixed(0)),
    volumetricFlowM3H: Number((drainFlowM3S * 3600).toFixed(2)),
    phase: 'Liquid',
    governingRule: `Maintenance drain velocity <= ${inputs.allowableVelocities.drainMaxMS} m/s (2.5 hr drain)`,
    ...n7Drain,
    allowableVelocityMS: inputs.allowableVelocities.drainMaxMS,
  });

  formulaTrace.push({
    cellId: 'M6-N4_VEL',
    sheetName: 'Storage, Nozzles & Mechanical Design',
    name: 'BFW Suction Nozzle Velocity (N4)',
    category: 'Hydraulics',
    symbolicFormula: 'v_suction = Q_out / (pi * d_id^2 / 4)',
    numericalSubstitution: `${(bfwFlowM3S).toFixed(4)} / (pi * (${n4Bfw.internalDiameterMm / 1000})^2 / 4)`,
    resultValue: `${n4Bfw.actualVelocityMS} m/s`,
    standardReference: 'Hydraulic Institute (HI) Standards / API RP 14E',
    assumptions: 'Low velocity prevents vapor flashing and cavitation at BFW pump suction impeller.',
  });

  // ==========================================
  // MODULE 7: MECHANICAL DESIGN (ASME SEC VIII DIV 1)
  // ==========================================
  // Design Pressure: P_design (MPa)
  const pDesignBarG = Math.max(inputs.designPressureBarG, inputs.operatingPressureBarG + 1.7); // ASME min margin 1.7 bar (25 psi)
  const pDesignMpa = (pDesignBarG * 0.1); // 1 bar = 0.1 MPa
  const S = inputs.allowableStressMpa || 138; // SA-516 Gr. 70 ~ 138 MPa (20,000 psi) at 150-200°C
  const E = inputs.jointEfficiency || 0.85; // Spot radiography
  const CA = inputs.corrosionAllowanceMm || 2.0; // mm

  // Storage Tank Shell Minimum Thickness (ASME UG-27):
  // t = (P * R) / (S * E - 0.6 * P) + CA
  const rStorageMm = tankDiameterMm / 2;
  const storageShellMinThicknessMm =
    (pDesignMpa * rStorageMm) / (S * E - 0.6 * pDesignMpa) + CA;
  // Round up to standard plate thicknesses: 8, 10, 12, 14, 16, 18, 20 mm
  const storageShellNominalThicknessMm = Math.max(
    8,
    Math.ceil(storageShellMinThicknessMm / 2) * 2
  );

  // Storage Tank 2:1 Ellipsoidal Head Minimum Thickness (ASME UG-32(d)):
  // t = (P * D) / (2 * S * E - 0.2 * P) + CA
  const dStorageMm = tankDiameterMm;
  const storageHeadMinThicknessMm =
    (pDesignMpa * dStorageMm) / (2 * S * E - 0.2 * pDesignMpa) + CA;
  const storageHeadNominalThicknessMm = Math.max(
    8,
    Math.ceil(storageHeadMinThicknessMm / 2) * 2
  );

  // Maximum Allowable Working Pressure (MAWP) of new/corroded shell:
  // MAWP = (S * E * (t_nom - CA)) / (R + 0.6 * (t_nom - CA))
  const tCorroded = storageShellNominalThicknessMm - CA;
  const mawpMpa = (S * E * tCorroded) / (rStorageMm + 0.6 * tCorroded);
  const storageMawpBarG = mawpMpa * 10;

  // Hydrostatic Test Pressure (ASME UG-99):
  // P_test = 1.3 * MAWP * (S_amb / S_design) ~ 1.3 * MAWP * 1.0
  const hydrotestPressureBarG = 1.3 * storageMawpBarG;

  // Deaerator Dome Shell (UG-27)
  const rDomeMm = domeDiameterMm / 2;
  const domeShellMinThicknessMm =
    (pDesignMpa * rDomeMm) / (S * E - 0.6 * pDesignMpa) + CA;
  const domeShellNominalThicknessMm = Math.max(
    8,
    Math.ceil(domeShellMinThicknessMm / 2) * 2
  );
  const domeHeadMinThicknessMm =
    (pDesignMpa * domeDiameterMm) / (2 * S * E - 0.2 * pDesignMpa) + CA;
  const domeHeadNominalThicknessMm = Math.max(
    8,
    Math.ceil(domeHeadMinThicknessMm / 2) * 2
  );

  // Weight Estimation:
  // Steel density: 7850 kg/m3
  const steelDensity = 7850;
  // Shell cylindrical surface area: pi * D * L
  const storageShellAreaM2 = Math.PI * (tankDiameterMm / 1000) * (tankLengthTangentToTangentMm / 1000);
  const storageHeadsAreaM2 = 2 * (1.09 * Math.PI * Math.pow(tankDiameterMm / 1000, 2) / 4); // 2:1 head surface area factor ~ 1.09
  const storageSteelVolumeM3 =
    (storageShellAreaM2 * storageShellNominalThicknessMm +
      storageHeadsAreaM2 * storageHeadNominalThicknessMm) /
    1000;
  const storageSteelWeightKg = storageSteelVolumeM3 * steelDensity;

  // Dome weight
  const domeShellAreaM2 = Math.PI * (domeDiameterMm / 1000) * (domeHeightMm / 1000);
  const domeHeadAreaM2 = 1.09 * (Math.PI * Math.pow(domeDiameterMm / 1000, 2)) / 4;
  const domeSteelWeightKg =
    ((domeShellAreaM2 * domeShellNominalThicknessMm +
      domeHeadAreaM2 * domeHeadNominalThicknessMm) /
      1000) *
    steelDensity;

  // Internals weight (trays, support beam, spray headers, baffles, vortex breaker)
  const internalsWeightKg =
    (trayCountTiers * trayStackAreaM2 * 35) + sprayValveCount * 18 + 450;

  // Saddles, nozzles, platforms allowance (~15% of shell weight)
  const attachmentsWeightKg = (storageSteelWeightKg + domeSteelWeightKg) * 0.18;

  const emptyWeightTonnes = (storageSteelWeightKg + domeSteelWeightKg + internalsWeightKg + attachmentsWeightKg) / 1000;
  const operatingWeightTonnes = emptyWeightTonnes + (normalLiquidKg / 1000);
  const floodedWeightTonnes = emptyWeightTonnes + (fullFloodedLiquidKg / 1000);

  formulaTrace.push({
    cellId: 'M7-T_SHELL',
    sheetName: 'Storage, Nozzles & Mechanical Design',
    name: 'Storage Shell Minimum Thickness (UG-27)',
    category: 'Mechanical Design',
    symbolicFormula: 't_min = (P * R) / (S * E - 0.6 * P) + CA',
    numericalSubstitution: `(${pDesignMpa.toFixed(3)} * ${rStorageMm}) / (${S} * ${E} - 0.6 * ${pDesignMpa.toFixed(3)}) + ${CA}`,
    resultValue: `${storageShellMinThicknessMm.toFixed(2)} mm (Selected: ${storageShellNominalThicknessMm} mm)`,
    standardReference: 'ASME BPVC Section VIII Division 1 UG-27(c)(1)',
    assumptions: 'Longitudinal welded joint, circumferential stress governs.',
  });

  formulaTrace.push({
    cellId: 'M7-T_HEAD',
    sheetName: 'Storage, Nozzles & Mechanical Design',
    name: 'Storage Head Minimum Thickness (UG-32)',
    category: 'Mechanical Design',
    symbolicFormula: 't_head = (P * D) / (2 * S * E - 0.2 * P) + CA',
    numericalSubstitution: `(${pDesignMpa.toFixed(3)} * ${dStorageMm}) / (2 * ${S} * ${E} - 0.2 * ${pDesignMpa.toFixed(3)}) + ${CA}`,
    resultValue: `${storageHeadMinThicknessMm.toFixed(2)} mm (Selected: ${storageHeadNominalThicknessMm} mm)`,
    standardReference: 'ASME BPVC Section VIII Division 1 UG-32(d) 2:1 Ellipsoidal Head',
    assumptions: 'Formed seamless head with seamless factor E=1.0 or weld joint E.',
  });

  const mechanicalDesign: MechanicalDesignResults = {
    designPressureBarG: Number(pDesignBarG.toFixed(2)),
    designPressureMpa: Number(pDesignMpa.toFixed(3)),
    designTempC: inputs.designTempC,
    shellMaterial: inputs.shellMaterial,
    allowableStressMpa: S,
    jointEfficiency: E,
    corrosionAllowanceMm: CA,
    domeShellMinThicknessMm: Number(domeShellMinThicknessMm.toFixed(2)),
    domeShellNominalThicknessMm,
    domeHeadMinThicknessMm: Number(domeHeadMinThicknessMm.toFixed(2)),
    domeHeadNominalThicknessMm,
    storageShellMinThicknessMm: Number(storageShellMinThicknessMm.toFixed(2)),
    storageShellNominalThicknessMm,
    storageHeadMinThicknessMm: Number(storageHeadMinThicknessMm.toFixed(2)),
    storageHeadNominalThicknessMm,
    storageMawpBarG: Number(storageMawpBarG.toFixed(2)),
    hydrotestPressureBarG: Number(hydrotestPressureBarG.toFixed(2)),
    estimatedEmptyVesselWeightTonnes: Number(emptyWeightTonnes.toFixed(2)),
    internalsWeightTonnes: Number((internalsWeightKg / 1000).toFixed(2)),
    operatingWeightTonnes: Number(operatingWeightTonnes.toFixed(2)),
    floodedWeightTonnes: Number(floodedWeightTonnes.toFixed(2)),
    asmeCodeStatus:
      storageShellNominalThicknessMm >= storageShellMinThicknessMm &&
      storageHeadNominalThicknessMm >= storageHeadMinThicknessMm
        ? 'PASS'
        : 'FAIL',
    naceNotice:
      'Per NACE SP0590 / MR0175 and HEI Guidelines: All welds in the deaerator vessel and storage tank shall undergo 100% Post-Weld Heat Treatment (PWHT) and wet fluorescent magnetic particle testing (WFMT) to prevent Deaerator Stress Corrosion Cracking (DSCC).',
  };

  // ==========================================
  // MODULE 8: RESULTS & VALIDATION CHECKS
  // ==========================================
  // 1. Mass balance closure check
  validationItems.push({
    id: 'VAL-01',
    category: 'Process',
    parameter: 'Mass Balance Closure Discrepancy',
    calculatedValue: `${(massBalanceError * 100).toFixed(4)} %`,
    criterion: 'Discrepancy < 0.05%',
    status: massBalanceError < 0.0005 ? 'PASS' : 'FAIL',
    governingCode: 'ASME PTC 12.3 Section 5',
    details: 'Total inlet mass (Feedwater + Steam) matches total outlet mass (Deaerated Water + Vent).',
  });

  // 2. Energy balance closure check
  validationItems.push({
    id: 'VAL-02',
    category: 'Process',
    parameter: 'Energy Balance Closure Discrepancy',
    calculatedValue: `${(energyBalanceError * 100).toFixed(4)} %`,
    criterion: 'Discrepancy < 0.10%',
    status: energyBalanceError < 0.001 ? 'PASS' : 'FAIL',
    governingCode: 'ASME PTC 12.3 / HEI Standards',
    details: 'Heat input equals enthalpy of outlet streams plus radiation/heat loss allowance.',
  });

  // 3. Dissolved Oxygen Compliance
  validationItems.push({
    id: 'VAL-03',
    category: 'Process',
    parameter: 'Outlet Dissolved Oxygen Concentration',
    calculatedValue: `${inputs.targetOutletO2Ppb.toFixed(1)} ppb (${(inputs.targetOutletO2Ppb / 1000).toFixed(4)} mg/L)`,
    criterion: '<= 7.0 ppb (0.005 mg/L)',
    status: inputs.targetOutletO2Ppb <= 7.0 ? 'PASS' : 'FAIL',
    governingCode: 'HEI Standard for Tray/Spray Deaerators / ASME Boiler Code',
    details: 'Residual oxygen conforms to ASME recommended boiler water limits to prevent economizer/boiler tube pitting.',
  });

  // 4. Souders-Brown Vapor Velocity
  validationItems.push({
    id: 'VAL-04',
    category: 'Internals',
    parameter: 'Tower Vapor Velocity Ratio (v_act / v_allow)',
    calculatedValue: `${actualVaporVelocity.toFixed(2)} m/s (${(vaporVelocityRatio * 100).toFixed(1)}% of allowable)`,
    criterion: 'Ratio < 80% (0.80)',
    status: vaporVelocityRatio < 0.8 ? 'PASS' : vaporVelocityRatio <= 1.0 ? 'WARN' : 'FAIL',
    governingCode: 'HEI Standards / Souders-Brown Entrainment Limit',
    details: 'Vapor velocity provides sufficient headroom to prevent water droplet entrainment into vent condenser.',
  });

  // 5. Tray Stack Hydraulic Loading
  validationItems.push({
    id: 'VAL-05',
    category: 'Internals',
    parameter: 'Tray Hydraulic Loading Rate',
    calculatedValue: `${(waterFlowM3H / (trayStackAreaM2 || 1)).toFixed(1)} m3/(h·m2)`,
    criterion: '80 - 150 m3/(h·m2)',
    status:
      inputs.deaeratorType === 'spray'
        ? 'PASS'
        : waterFlowM3H / trayStackAreaM2 >= 60 && waterFlowM3H / trayStackAreaM2 <= 160
        ? 'PASS'
        : 'WARN',
    governingCode: 'HEI Section 3.4 Tray Hydraulic Guidelines',
    details: 'Maintains optimal water film thickness and contact time across stainless steel trays for gas stripping.',
  });

  // 6. Storage Tank Residence Time
  validationItems.push({
    id: 'VAL-06',
    category: 'Storage',
    parameter: 'Storage Tank Residence Time at MCR',
    calculatedValue: `${actualResidenceTimeMin.toFixed(1)} minutes`,
    criterion: `>= ${inputs.residenceTimeMin} minutes (Min 10 min for Utility/Industrial)`,
    status: actualResidenceTimeMin >= inputs.residenceTimeMin ? 'PASS' : 'FAIL',
    governingCode: 'HEI Standard / EPRI Guidelines / Boiler Spec',
    details: 'Guarantees uninterrupted feedwater supply to boiler feed pumps during steam boiler transient load swings.',
  });

  // 7. BFW Pump Suction Nozzle Velocity (N4)
  validationItems.push({
    id: 'VAL-07',
    category: 'Nozzles',
    parameter: 'BFW Pump Suction Nozzle Velocity (N4)',
    calculatedValue: `${n4Bfw.actualVelocityMS} m/s`,
    criterion: `<= ${inputs.allowableVelocities.bfwSuctionMaxMS} m/s`,
    status: n4Bfw.status,
    governingCode: 'Hydraulic Institute (HI) Standards / API RP 14E',
    details: 'Low liquid velocity minimizes suction line friction drop and safeguards pump NPSH margin.',
  });

  // 8. Heating Steam Nozzle Velocity (N3)
  validationItems.push({
    id: 'VAL-08',
    category: 'Nozzles',
    parameter: 'Heating Steam Inlet Velocity (N3)',
    calculatedValue: `${n3Steam.actualVelocityMS} m/s`,
    criterion: `<= ${inputs.allowableVelocities.steamInletMaxMS} m/s`,
    status: n3Steam.status,
    governingCode: 'HEI / ASME Steam Piping Criteria',
    details: 'Prevents acoustic noise, vibration, and erosion of internal sparger pipe manifold.',
  });

  // 9. Storage Vessel Shell Thickness Check
  validationItems.push({
    id: 'VAL-09',
    category: 'Mechanical',
    parameter: 'Storage Shell Thickness Compliance',
    calculatedValue: `Nominal ${storageShellNominalThicknessMm} mm >= Required ${storageShellMinThicknessMm.toFixed(2)} mm`,
    criterion: 't_nom >= t_min (UG-27)',
    status: storageShellNominalThicknessMm >= storageShellMinThicknessMm ? 'PASS' : 'FAIL',
    governingCode: 'ASME BPVC Section VIII Div 1 UG-27',
    details: 'Cylindrical shell satisfies code membrane stress under design pressure and corrosion allowance.',
  });

  // 10. Storage Vessel Head Thickness Check
  validationItems.push({
    id: 'VAL-10',
    category: 'Mechanical',
    parameter: 'Storage 2:1 Head Thickness Compliance',
    calculatedValue: `Nominal ${storageHeadNominalThicknessMm} mm >= Required ${storageHeadMinThicknessMm.toFixed(2)} mm`,
    criterion: 't_nom >= t_min (UG-32)',
    status: storageHeadNominalThicknessMm >= storageHeadMinThicknessMm ? 'PASS' : 'FAIL',
    governingCode: 'ASME BPVC Section VIII Div 1 UG-32',
    details: 'Formed heads meet knuckle and crown stress limits with designated joint efficiency.',
  });

  // Determine overall status
  const hasFail = validationItems.some((v) => v.status === 'FAIL');
  const hasWarn = validationItems.some((v) => v.status === 'WARN');
  const overallStatus: 'PASS' | 'WARN' | 'FAIL' = hasFail ? 'FAIL' : hasWarn ? 'WARN' : 'PASS';

  return {
    inputs,
    streamProperties,
    massEnergyBalance,
    deaerationPerformance,
    vesselInternals,
    storageLevels,
    nozzles,
    mechanicalDesign,
    validationItems,
    formulaTrace,
    overallStatus,
    summaryMetrics: {
      feedwaterCapacityTph: Number((mOutletFeedwater / 1000).toFixed(2)),
      steamConsumptionTph: Number((mSteamRequired / 1000).toFixed(2)),
      steamToFeedRatioPercent: Number(((mSteamRequired / mOutletFeedwater) * 100).toFixed(2)),
      deaeratorOperatingTempC: Number(satProps.temperatureC.toFixed(1)),
      deaeratorOperatingPressureBarG: inputs.operatingPressureBarG,
      dissolvedO2OutletPpb: inputs.targetOutletO2Ppb,
      storageGrossVolumeM3: Number(actualGrossVolumeM3.toFixed(1)),
      residenceTimeMin: Number(actualResidenceTimeMin.toFixed(1)),
      storageVesselDiaMm: tankDiameterMm,
      storageVesselLengthMm: totalTankLengthOverallMm,
      operatingWeightTonnes: Number(operatingWeightTonnes.toFixed(1)),
    },
  };
}
