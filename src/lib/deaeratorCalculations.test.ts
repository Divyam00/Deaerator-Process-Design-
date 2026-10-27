import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSaturationProperties,
  getSaturationTempFromPressure,
  getEquilibriumOxygenSolubility,
} from './steamProperties';
import { runDeaeratorCalculations } from './deaeratorCalculations';
import { PRESET_CASES } from './presets';

test('Thermodynamics: IAPWS-IF97 saturation temperature and properties', () => {
  // At 1.01325 bar (atmospheric), water boils at ~100.0 °C
  const tSat1atm = getSaturationTempFromPressure(1.01325);
  assert.ok(Math.abs(tSat1atm - 100.0) < 0.5, `Expected ~100.0 °C, got ${tSat1atm}`);

  // At 1.5 bar(a) (~0.5 bar g), saturation temp should be around 111.4 °C
  const props1_5 = getSaturationProperties(1.5);
  assert.ok(props1_5.temperatureC >= 110 && props1_5.temperatureC <= 113);
  assert.ok(props1_5.latentHeat > 2200 && props1_5.latentHeat < 2250);
  assert.ok(props1_5.liquidDensity > 945 && props1_5.liquidDensity < 955);
  assert.ok(props1_5.vaporDensity > 0.8 && props1_5.vaporDensity < 1.0);
});

test('Thermodynamics: Dissolved oxygen solubility approaches zero near boiling point', () => {
  const o2At20C = getEquilibriumOxygenSolubility(20, 1.01325);
  assert.ok(o2At20C > 8.0 && o2At20C < 10.0, `Expected ~9 mg/L at 20°C, got ${o2At20C}`);

  const o2AtBoiling = getEquilibriumOxygenSolubility(105, 1.01325);
  assert.ok(o2AtBoiling <= 0.005, `Expected near zero at boiling, got ${o2AtBoiling}`);
});

test('Mass & Energy Balance: Closure discrepancy is below 0.05%', () => {
  const ccppCase = PRESET_CASES[0].inputs;
  const result = runDeaeratorCalculations(ccppCase);

  // Mass balance closure
  assert.ok(
    result.massEnergyBalance.massBalanceErrorPercent < 0.05,
    `Mass balance error ${result.massEnergyBalance.massBalanceErrorPercent}% exceeded 0.05%`
  );

  // Energy balance closure
  assert.ok(
    result.massEnergyBalance.energyBalanceErrorPercent < 0.1,
    `Energy balance error ${result.massEnergyBalance.energyBalanceErrorPercent}% exceeded 0.10%`
  );

  // Total outlet flow must exceed inlet water flow due to steam condensation
  assert.ok(result.massEnergyBalance.totalDeaeratedWaterOutKgH > result.massEnergyBalance.totalInletLiquidKgH);
  assert.ok(result.massEnergyBalance.heatingSteamRequiredKgH > 5000);
});

test('Deaeration Performance: Residual O2 conforms to HEI <= 7 ppb limit', () => {
  const ccppCase = PRESET_CASES[0].inputs;
  const result = runDeaeratorCalculations(ccppCase);

  assert.equal(result.deaerationPerformance.outletO2Ppb, 5.0);
  assert.ok(result.deaerationPerformance.oxygenRemovalEfficiencyPercent >= 99.0);
  assert.equal(result.deaerationPerformance.heiCompliance, true);
});

test('Vessel & Internals Sizing: Souders-Brown velocity and tray hydraulics', () => {
  const ccppCase = PRESET_CASES[0].inputs;
  const result = runDeaeratorCalculations(ccppCase);

  // Vapor velocity ratio must be less than 80% (0.8)
  assert.ok(
    result.vesselInternals.vaporVelocityRatio < 0.8,
    `Vapor velocity ratio ${result.vesselInternals.vaporVelocityRatio} is too high`
  );

  // Dome diameter reasonable for 150 t/h (e.g. 1.4 m to 2.8 m)
  assert.ok(
    result.vesselInternals.domeDiameterMm >= 1200 && result.vesselInternals.domeDiameterMm <= 3000,
    `Dome diameter ${result.vesselInternals.domeDiameterMm} out of expected range`
  );
});

test('Storage Sizing: Residence time at MCR meets required threshold', () => {
  const ccppCase = PRESET_CASES[0].inputs;
  const result = runDeaeratorCalculations(ccppCase);

  assert.ok(
    result.storageLevels.residenceTimeActualMin >= ccppCase.residenceTimeMin,
    `Actual residence time ${result.storageLevels.residenceTimeActualMin} min is less than required ${ccppCase.residenceTimeMin} min`
  );
  assert.ok(result.storageLevels.tankDiameterMm >= 1800);
  assert.ok(result.storageLevels.tankLengthTangentToTangentMm >= 6000);
});

test('Mechanical Design: ASME UG-27 and UG-32 calculations', () => {
  const ccppCase = PRESET_CASES[0].inputs;
  const result = runDeaeratorCalculations(ccppCase);

  assert.ok(result.mechanicalDesign.storageShellNominalThicknessMm >= result.mechanicalDesign.storageShellMinThicknessMm);
  assert.ok(result.mechanicalDesign.storageHeadNominalThicknessMm >= result.mechanicalDesign.storageHeadMinThicknessMm);
  assert.equal(result.mechanicalDesign.asmeCodeStatus, 'PASS');
  assert.ok(result.mechanicalDesign.hydrotestPressureBarG > result.mechanicalDesign.designPressureBarG);
});

test('Automated Validation: Preset cases pass all governing checks', () => {
  for (const preset of PRESET_CASES) {
    const res = runDeaeratorCalculations(preset.inputs);
    assert.notEqual(res.overallStatus, 'FAIL', `Preset ${preset.name} failed validation`);
  }
});
