import * as XLSX from 'xlsx';
import { DeaeratorCalculationOutput } from './deaeratorTypes';

export function exportDeaeratorToExcel(calc: DeaeratorCalculationOutput, filename = 'Deaerator_Process_Sizing_Report.xlsx') {
  const wb = XLSX.utils.book_new();
  const { inputs, streamProperties, massEnergyBalance, deaerationPerformance, vesselInternals, storageLevels, nozzles, mechanicalDesign, validationItems } = calc;

  // -------------------------------------------------------------
  // SHEET 1: Design Basis & Properties
  // -------------------------------------------------------------
  const ws1Data: (string | number)[][] = [
    ['DEAERATOR PROCESS CALCULATION & SIZING - DESIGN BASIS & FLUID PROPERTIES'],
    ['Project Title:', inputs.projectTitle, '', 'Tag Number:', inputs.tagNumber],
    ['Deaerator Type:', inputs.deaeratorType.toUpperCase(), '', 'Unit System:', inputs.unitSystem],
    ['Date Generated:', new Date().toLocaleDateString(), '', 'Calculation Status:', calc.overallStatus],
    [],
    ['1. OPERATING & AMBIENT CONDITIONS'],
    ['Parameter', 'Symbol', 'Value', 'Unit', 'Standard / Source'],
    ['Operating Gauge Pressure', 'P_op,g', inputs.operatingPressureBarG, 'bar(g)', 'User Specification'],
    ['Atmospheric Pressure', 'P_atm', inputs.atmosphericPressureBarA, 'bar(a)', 'Site Ambient'],
    ['Operating Absolute Pressure', 'P_op,a', inputs.operatingPressureBarG + inputs.atmosphericPressureBarA, 'bar(a)', 'IAPWS-IF97 / P_op,g + P_atm'],
    ['Operating Saturation Temperature', 'T_sat', massEnergyBalance.operatingTempSatC, '°C', 'IAPWS-IF97 Region 4 Saturation'],
    ['Residual Dissolved O2 Target', 'DO_target', inputs.targetOutletO2Ppb, 'ppb (µg/L)', 'HEI Standard for Deaerators'],
    ['Stripping Steam Supply Pressure', 'P_steam,g', inputs.steamPressureBarG, 'bar(g)', 'Steam Header Specification'],
    ['Stripping Steam Supply Temperature', 'T_steam', inputs.steamTempC, '°C', 'Steam Header Specification'],
    [],
    ['2. INLET FEEDWATER STREAMS & COMPOSITION'],
    ['Stream Name', 'Mass Flow (kg/h)', 'Temperature (°C)', 'Pressure (bar a)', 'Enthalpy (kJ/kg)', 'Density (kg/m³)', 'DO (mg/L)', 'DO Flow (kg/h)'],
    [
      streamProperties.makeup.name,
      streamProperties.makeup.massFlowKgH,
      streamProperties.makeup.temperatureC,
      streamProperties.makeup.pressureBarA,
      streamProperties.makeup.specificEnthalpyKjKg,
      streamProperties.makeup.densityKgM3,
      streamProperties.makeup.dissolvedO2MgL,
      streamProperties.makeup.totalO2FlowKgH,
    ],
    [
      streamProperties.hpCondensate.name,
      streamProperties.hpCondensate.massFlowKgH,
      streamProperties.hpCondensate.temperatureC,
      streamProperties.hpCondensate.pressureBarA,
      streamProperties.hpCondensate.specificEnthalpyKjKg,
      streamProperties.hpCondensate.densityKgM3,
      streamProperties.hpCondensate.dissolvedO2MgL,
      streamProperties.hpCondensate.totalO2FlowKgH,
    ],
    [
      streamProperties.lpCondensate.name,
      streamProperties.lpCondensate.massFlowKgH,
      streamProperties.lpCondensate.temperatureC,
      streamProperties.lpCondensate.pressureBarA,
      streamProperties.lpCondensate.specificEnthalpyKjKg,
      streamProperties.lpCondensate.densityKgM3,
      streamProperties.lpCondensate.dissolvedO2MgL,
      streamProperties.lpCondensate.totalO2FlowKgH,
    ],
    [
      'Total Combined Inlet Liquid',
      massEnergyBalance.totalInletLiquidKgH,
      massEnergyBalance.mixedInletWaterTempC,
      inputs.operatingPressureBarG + inputs.atmosphericPressureBarA,
      massEnergyBalance.mixedInletEnthalpyKjKg,
      '-',
      deaerationPerformance.weightedInletO2MgL,
      deaerationPerformance.totalInletO2KgH,
    ],
    [],
    ['3. FLUID & THERMODYNAMIC PROPERTIES (IAPWS-IF97)'],
    ['Property', 'Liquid Phase (hf)', 'Vapor Phase (hg)', 'Latent Heat (hfg)', 'Unit'],
    ['Specific Enthalpy', massEnergyBalance.operatingEnthalpyLiquidKjKg, streamProperties.ventVapor.specificEnthalpyKjKg, massEnergyBalance.operatingEnthalpyLiquidKjKg, 'kJ/kg'],
    ['Density', streamProperties.outletWater.densityKgM3, streamProperties.ventVapor.densityKgM3, '-', 'kg/m³'],
    ['Heating Steam Density', streamProperties.heatingSteam.densityKgM3, '-', '-', 'kg/m³'],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  XLSX.utils.book_append_sheet(wb, ws1, 'Design Basis & Properties');

  // -------------------------------------------------------------
  // SHEET 2: Mass & Energy Balance
  // -------------------------------------------------------------
  const ws2Data: (string | number)[][] = [
    ['DEAERATOR PROCESS CALCULATION & SIZING - MASS & ENERGY BALANCE'],
    ['Tag Number:', inputs.tagNumber, 'Deaerator Type:', inputs.deaeratorType.toUpperCase()],
    [],
    ['1. MASS BALANCE SUMMARY'],
    ['Stream Description', 'Mass Flow (kg/h)', 'Flow Rate (tonne/h)', '% of Outlet Flow', 'Phase & State'],
    ['Inlet Makeup Water', inputs.makeupFlowKgH, inputs.makeupFlowKgH / 1000, Number(((inputs.makeupFlowKgH / massEnergyBalance.totalDeaeratedWaterOutKgH) * 100).toFixed(1)), 'Subcooled Liquid'],
    ['Inlet HP Condensate', inputs.hpCondensateFlowKgH, inputs.hpCondensateFlowKgH / 1000, Number(((inputs.hpCondensateFlowKgH / massEnergyBalance.totalDeaeratedWaterOutKgH) * 100).toFixed(1)), 'Warm Condensate'],
    ['Inlet LP Condensate', inputs.lpCondensateFlowKgH, inputs.lpCondensateFlowKgH / 1000, Number(((inputs.lpCondensateFlowKgH / massEnergyBalance.totalDeaeratedWaterOutKgH) * 100).toFixed(1)), 'Return Condensate'],
    ['Total Feedwater Entering Deaerator', massEnergyBalance.totalInletLiquidKgH, massEnergyBalance.totalInletLiquidKgH / 1000, '-', 'Mixed Liquid'],
    ['Required Stripping Steam Flow', massEnergyBalance.heatingSteamRequiredKgH, massEnergyBalance.heatingSteamRequiredKgH / 1000, Number(((massEnergyBalance.heatingSteamRequiredKgH / massEnergyBalance.totalDeaeratedWaterOutKgH) * 100).toFixed(2)), 'Superheated/Sat Vapor'],
    ['Vent Vapor Loss to Atmosphere', massEnergyBalance.ventVaporLossKgH, massEnergyBalance.ventVaporLossKgH / 1000, Number(((massEnergyBalance.ventVaporLossKgH / massEnergyBalance.heatingSteamRequiredKgH) * 100).toFixed(2)), 'Non-Condensable + Steam'],
    ['Net Steam Condensed into Feedwater', massEnergyBalance.netSteamCondensedKgH, massEnergyBalance.netSteamCondensedKgH / 1000, '-', 'Condensed Phase'],
    ['Net Deaerated Feedwater Outlet', massEnergyBalance.totalDeaeratedWaterOutKgH, massEnergyBalance.totalDeaeratedWaterOutKgH / 1000, 100.0, 'Saturated Liquid at T_sat'],
    [],
    ['2. THERMAL ENERGY BALANCE & HEAT DUTY'],
    ['Parameter', 'Formula / Relation', 'Value', 'Unit'],
    ['Sensible Preheating Heat Duty', 'Q_sens = M_in * (h_sat,L - h_mix)', massEnergyBalance.sensibleHeatKw, 'kW'],
    ['Heat Loss Allowance (Radiation/Convection)', `${inputs.heatLossPercentOfDuty}% of Duty`, massEnergyBalance.heatLossKw, 'kW'],
    ['Gross Heat Duty Required', 'Q_gross = Q_sens + Q_loss', massEnergyBalance.grossHeatDutyKw, 'kW'],
    ['Gross Heat Duty (US Customary)', 'Q_gross * 0.003412', massEnergyBalance.heatDutyMmbtuHr, 'MMBtu/hr'],
    ['Mass Balance Closure Discrepancy', '|Total In - Total Out| / Total In', `${massEnergyBalance.massBalanceErrorPercent}%`, 'Code Limit < 0.05%'],
    ['Energy Balance Closure Discrepancy', '|Energy In - Energy Out| / Energy In', `${massEnergyBalance.energyBalanceErrorPercent}%`, 'Code Limit < 0.10%'],
    [],
    ['3. DEAERATION PERFORMANCE & GAS STRIPPING'],
    ['Parameter', 'Symbol', 'Value', 'Unit', 'Criteria'],
    ['Weighted Inlet Dissolved O2', 'DO_in', deaerationPerformance.weightedInletO2MgL, 'mg/L (ppm)', 'Raw Mixture'],
    ['Inlet Dissolved O2 Concentration', 'DO_in,ppb', deaerationPerformance.weightedInletO2Ppb, 'ppb', '-'],
    ['Guaranteed Outlet Dissolved O2', 'DO_out', deaerationPerformance.outletO2Ppb, 'ppb (µg/L)', 'HEI Limit <= 7.0 ppb'],
    ['Guaranteed Outlet Dissolved O2', 'DO_out,ppm', deaerationPerformance.outletO2MgL, 'mg/L (ppm)', 'ASME Limit <= 0.005 mg/L'],
    ['Oxygen Removal Efficiency', 'eta_O2', `${deaerationPerformance.oxygenRemovalEfficiencyPercent}%`, '%', 'Exceeds 99.8%'],
    ['Stripped Oxygen Mass Flow', 'M_O2,strip', deaerationPerformance.oxygenStrippedKgH, 'kg/h', 'Vented'],
    ['Stripped Nitrogen Mass Flow', 'M_N2,strip', deaerationPerformance.nonCondensablesKgH.nitrogenKgH, 'kg/h', 'Vented'],
    ['Stripped Carbon Dioxide Flow', 'M_CO2,strip', deaerationPerformance.nonCondensablesKgH.carbonDioxideKgH, 'kg/h', 'Vented'],
    ['Total Non-Condensable Gas Release', 'M_gas,total', deaerationPerformance.nonCondensablesKgH.totalGasNm3H, 'Nm³/h', 'To Vent Condenser'],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  XLSX.utils.book_append_sheet(wb, ws2, 'Mass & Energy Balance');

  // -------------------------------------------------------------
  // SHEET 3: Deaerator & Internals Sizing
  // -------------------------------------------------------------
  const ws3Data: (string | number)[][] = [
    ['DEAERATOR PROCESS CALCULATION & SIZING - DEAERATOR & INTERNALS SIZING'],
    ['Vessel Section:', 'Vertical Deaerating Tower / Dome', 'Deaerator Type:', vesselInternals.deaeratorType.toUpperCase()],
    [],
    ['1. TOWER / DOME GEOMETRY & VAPOR DYNAMICS'],
    ['Parameter', 'Formula / Basis', 'Calculated Value', 'Unit', 'Compliance'],
    ['Deaerating Dome Diameter', 'D_dome', vesselInternals.domeDiameterMm, 'mm', 'Standard Fabricated Diameter'],
    ['Deaerating Dome Height', 'H_dome', vesselInternals.domeHeightMm, 'mm', 'Includes Spray & Disengagement'],
    ['Cross-Sectional Area', 'pi * D^2 / 4', vesselInternals.crossSectionAreaM2, 'm²', '-'],
    ['Actual Vapor Upward Velocity', 'Q_vapor / Area', vesselInternals.vaporVelocityActualMS, 'm/s', 'Below Entrainment Limit'],
    ['Souders-Brown Allowable Velocity', 'K_sb * sqrt((rho_L - rho_V) / rho_V)', vesselInternals.vaporVelocityAllowableMS, 'm/s', `K_sb = ${vesselInternals.soudersBrownK}`],
    ['Vapor Velocity Ratio (v_act / v_allow)', 'v_act / v_allow', `${(vesselInternals.vaporVelocityRatio * 100).toFixed(1)}%`, '%', 'Limit < 80% (PASS)'],
    ['Deaeration Section Total Volume', 'Area * Height', vesselInternals.deaerationSectionTotalVolumeM3, 'm³', '-'],
    [],
    ['2. TRAY STACK SECTION DETAILS (FOR TRAY & COMBINED TYPES)'],
    ['Parameter', 'Design Value', 'Unit', 'Engineering Standard / Recommendation'],
    ['Tray Stack Active Area', vesselInternals.trayStackAreaM2, 'm²', 'HEI Section 3.4 Hydraulic Loading'],
    ['Tray Hydraulic Loading Rate', vesselInternals.trayLoadingM3Hm2, 'm³/(h·m²)', 'Recommended 80 - 150 m³/(h·m²)'],
    ['Tray Assembly Width', vesselInternals.trayWidthMm, 'mm', 'Rectangular Tier Box'],
    ['Tray Assembly Length', vesselInternals.trayLengthMm, 'mm', 'Rectangular Tier Box'],
    ['Number of Tray Rows / Tiers', vesselInternals.trayCountTiers, 'tiers', 'Multi-tier Cascade'],
    ['Tray Stack Total Height', vesselInternals.activeTrayHeightMm, 'mm', 'Enclosed in SS Tray Enclosure'],
    ['Tray Metallurgy', vesselInternals.trayMaterial, '-', 'Corrosion Resistant per HEI'],
    [],
    ['3. SPRAY VALVE ATOMIZING SECTION DETAILS'],
    ['Parameter', 'Design Value', 'Unit', 'Specification'],
    ['Spray Valve Type', 'Spring-Loaded Variable-Area Stainless Steel Spray Valves', '-', 'Self-modulating 10-100% load'],
    ['Total Spray Valves Installed', vesselInternals.sprayValveCount, 'valves', 'Evenly Spaced Circumferentially'],
    ['Design Flow per Valve', vesselInternals.sprayValveFlowPerValveM3H, 'm³/h per valve', 'Vendor Sizing Envelope'],
    ['Spray Pressure Drop', vesselInternals.sprayPressureDropBar, 'bar', 'Typical 0.15 - 0.35 bar'],
    ['Spray Cone Pattern Coverage', `${vesselInternals.sprayConeCoveragePercent}%`, '%', '25% Overlap Curtain'],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
  XLSX.utils.book_append_sheet(wb, ws3, 'Deaerator & Internals Sizing');

  // -------------------------------------------------------------
  // SHEET 4: Storage, Nozzles & Mechanical Design
  // -------------------------------------------------------------
  const ws4Data: (string | number)[][] = [
    ['DEAERATOR PROCESS CALCULATION & SIZING - STORAGE, NOZZLES & MECHANICAL DESIGN'],
    ['Equipment:', 'Horizontal Boiler Feedwater Storage Tank & Nozzle Schedule'],
    [],
    ['1. STORAGE TANK VOLUME & RESIDENCE TIME'],
    ['Parameter', 'Symbol', 'Value', 'Unit', 'Standard / Specification'],
    ['Required Residence Time at 100% MCR', 't_res,req', inputs.residenceTimeMin, 'min', 'Boiler Specification (Min 10 min)'],
    ['Actual Usable Residence Time (LLL to HL)', 't_res,act', storageLevels.residenceTimeActualMin, 'min', 'Exceeds Required Buffer'],
    ['Required Usable Liquid Volume', 'V_usable,req', storageLevels.requiredUsableVolumeM3, 'm³', 'Between LLL and HL'],
    ['Actual Usable Liquid Volume', 'V_usable,act', storageLevels.usableVolumeM3, 'm³', 'Between LLL and HL'],
    ['Gross Storage Vessel Volume', 'V_gross', storageLevels.grossVolumeM3, 'm³', 'Cylinder + 2 Heads'],
    ['Tank Internal Diameter', 'D_tank', storageLevels.tankDiameterMm, 'mm', 'Standard Fabricated Diameter'],
    ['Tangent-to-Tangent Length', 'L_tt', storageLevels.tankLengthTangentToTangentMm, 'mm', 'Cylindrical Shell'],
    ['Overall Length (Head-to-Head)', 'L_oal', storageLevels.totalTankLengthOverallMm, 'mm', 'With 2:1 Ellipsoidal Heads'],
    [],
    ['2. LIQUID LEVEL ELEVATIONS & SURGE VOLUMES'],
    ['Level Designation', 'Elevation from Bottom (mm)', '% of Diameter', 'Description / Trip Action'],
    ['Top of Vessel Shell', storageLevels.levels.topOfShellMm, '100.0%', 'Vessel Crown'],
    ['High-High Level (HHL)', storageLevels.levels.highHighLevelMm, '88.0%', 'Extraction Steam Trip & Overflow'],
    ['High Level (HL)', storageLevels.levels.highLevelMm, '78.0%', 'High Level Alarm'],
    ['Normal Operating Level (NOL)', storageLevels.levels.normalOperatingLevelMm, '55.0%', 'Normal Boiler Feed Level'],
    ['Low Level (LLL)', storageLevels.levels.lowLevelMm, '24.0%', 'Low Level Alarm & Makeup Boost'],
    ['Low-Low Level (LLLL)', storageLevels.levels.lowLowLevelMm, '12.0%', 'BFW Pump Trip (Cavitation Safeguard)'],
    ['Bottom of Shell', 0, '0.0%', 'Vessel Invert'],
    [],
    ['3. NOZZLE SCHEDULE & VELOCITY CHECKS'],
    ['Nozzle ID', 'Service Description', 'Phase', 'Size (NPS)', 'Schedule', 'ID (mm)', 'Flow (kg/h)', 'Actual Vel (m/s)', 'Allow Vel (m/s)', 'Status'],
    ...nozzles.map((n) => [
      n.id,
      n.name,
      n.phase,
      `${n.selectedNpsInches}"`,
      n.selectedSchedule,
      n.internalDiameterMm,
      n.flowKgH,
      n.actualVelocityMS,
      n.allowableVelocityMS,
      n.status,
    ]),
    [],
    ['4. MECHANICAL DESIGN (ASME BPVC SECTION VIII DIVISION 1)'],
    ['Design Parameter', 'Formula / Reference', 'Value', 'Unit', 'Status'],
    ['Design Internal Pressure', 'Operating + Margin', mechanicalDesign.designPressureBarG, 'bar(g)', '-'],
    ['Design Temperature', 'Operating + Margin', mechanicalDesign.designTempC, '°C', '-'],
    ['Vessel Construction Material', 'ASME Section II Part A', mechanicalDesign.shellMaterial, '-', '-'],
    ['Code Maximum Allowable Stress', 'S at Design Temp', mechanicalDesign.allowableStressMpa, 'MPa', '-'],
    ['Joint Efficiency', 'E (Spot Radiography)', mechanicalDesign.jointEfficiency, '-', '-'],
    ['Specified Corrosion Allowance', 'CA', mechanicalDesign.corrosionAllowanceMm, 'mm', '-'],
    ['Storage Shell Min Thickness (UG-27)', '(P*R)/(S*E-0.6*P) + CA', mechanicalDesign.storageShellMinThicknessMm, 'mm', 'Required'],
    ['Storage Shell Nominal Thickness', 'Fabricated Plate Size', mechanicalDesign.storageShellNominalThicknessMm, 'mm', 'PASS (t_nom >= t_min)'],
    ['Storage 2:1 Head Min Thickness (UG-32)', '(P*D)/(2*S*E-0.2*P) + CA', mechanicalDesign.storageHeadMinThicknessMm, 'mm', 'Required'],
    ['Storage Head Nominal Thickness', 'Fabricated Plate Size', mechanicalDesign.storageHeadNominalThicknessMm, 'mm', 'PASS (t_nom >= t_min)'],
    ['Hydrostatic Test Pressure', 'ASME UG-99 (1.3 * MAWP)', mechanicalDesign.hydrotestPressureBarG, 'bar(g)', 'Hydrotest at Shop'],
    ['Estimated Vessel Empty Weight', 'Shell + Heads + Internals', mechanicalDesign.estimatedEmptyVesselWeightTonnes, 'tonnes', '-'],
    ['Operating Weight with Water at NOL', 'Empty + Operating Water', mechanicalDesign.operatingWeightTonnes, 'tonnes', 'Foundation Load'],
    ['Flooded Hydrotest Weight', 'Empty + 100% Water', mechanicalDesign.floodedWeightTonnes, 'tonnes', 'Civil Anchor Load'],
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(ws4Data);
  XLSX.utils.book_append_sheet(wb, ws4, 'Storage, Nozzles & Mechanical');

  // -------------------------------------------------------------
  // SHEET 5: Results & Validation
  // -------------------------------------------------------------
  const ws5Data: (string | number)[][] = [
    ['DEAERATOR PROCESS CALCULATION & SIZING - RESULTS & VALIDATION DASHBOARD'],
    ['Overall Design Status:', calc.overallStatus, '', 'Compliance Standards:', 'ASME Sec VIII Div 1, HEI, ASME PTC 12.3, NACE SP0590'],
    [],
    ['1. EXECUTIVE CALCULATION SUMMARY'],
    ['Governing Parameter', 'Calculated Value', 'Engineering Unit', 'Governing Standard / Design Case'],
    ['Total Net Feedwater Delivery', calc.summaryMetrics.feedwaterCapacityTph, 'tonnes/hr', '100% Boiler Feedwater MCR'],
    ['Stripping Steam Consumption', calc.summaryMetrics.steamConsumptionTph, 'tonnes/hr', 'Thermal Balance'],
    ['Steam-to-Feedwater Ratio', `${calc.summaryMetrics.steamToFeedRatioPercent}%`, '%', 'Mass Condensation Ratio'],
    ['Deaerator Operating Temperature', calc.summaryMetrics.deaeratorOperatingTempC, '°C', 'IAPWS-IF97 Equilibrium'],
    ['Deaerator Operating Pressure', calc.summaryMetrics.deaeratorOperatingPressureBarG, 'bar(g)', 'Operating Setpoint'],
    ['Guaranteed Residual Dissolved O2', calc.summaryMetrics.dissolvedO2OutletPpb, 'ppb (µg/L)', 'HEI Guaranteed Compliance (<= 7 ppb)'],
    ['Gross Storage Tank Volume', calc.summaryMetrics.storageGrossVolumeM3, 'm³', 'Includes Surge and Holdup Buffer'],
    ['Usable Feedwater Holdup Time', calc.summaryMetrics.residenceTimeMin, 'minutes', 'Between LLL and HL at MCR'],
    ['Storage Tank Internal Diameter', calc.summaryMetrics.storageVesselDiaMm, 'mm', 'Cylindrical Shell ID'],
    ['Storage Tank Overall Length', calc.summaryMetrics.storageVesselLengthMm, 'mm', 'Tangent-to-Tangent + 2:1 Heads'],
    ['Operating Weight at NOL', calc.summaryMetrics.operatingWeightTonnes, 'tonnes', 'Civil Saddle Loading'],
    [],
    ['2. AUTOMATED COMPLIANCE & VALIDATION MATRIX'],
    ['Check ID', 'Engineering Category', 'Validation Parameter', 'Calculated Value', 'Allowable Criterion', 'Compliance Status', 'Governing Standard / Code Reference'],
    ...validationItems.map((v) => [
      v.id,
      v.category,
      v.parameter,
      v.calculatedValue,
      v.criterion,
      v.status,
      v.governingCode,
    ]),
    [],
    ['3. NACE & METALLURGY SAFEGUARDS'],
    ['Notice:', mechanicalDesign.naceNotice],
    [],
    ['4. ASSUMPTIONS & DESIGN BOUNDARIES'],
    ['1.', 'Calculations follow ASME PTC 12.3 and Heat Exchange Institute (HEI) Standards for Deaerators.'],
    ['2.', 'Steam properties are calculated using IAPWS-IF97 formulations.'],
    ['3.', 'Thermal equilibrium is assumed in the tray/spray chamber at the operating saturation pressure.'],
    ['4.', 'Nozzle sizing complies with API RP 14E and Hydraulic Institute standards.'],
    ['5.', 'Mechanical shell and head thicknesses are preliminary ASME Section VIII Division 1 calculations and do not replace certified manufacturer design.'],
  ];
  const ws5 = XLSX.utils.aoa_to_sheet(ws5Data);
  XLSX.utils.book_append_sheet(wb, ws5, 'Results & Validation');

  // Trigger download in browser
  XLSX.writeFile(wb, filename);
}
