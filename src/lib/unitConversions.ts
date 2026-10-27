import { UnitSystem } from './deaeratorTypes';

export interface UnitLabelSet {
  flow: string;
  flowSmall: string;
  temp: string;
  pressureGauge: string;
  pressureAbs: string;
  pressureDrop: string;
  length: string;
  lengthSmall: string;
  diameter: string;
  thickness: string;
  volume: string;
  volFlow: string;
  heatDuty: string;
  specificEnthalpy: string;
  density: string;
  velocity: string;
  stress: string;
  weight: string;
  loading: string;
  concentration: string;
}

export const UNIT_LABELS: Record<UnitSystem, UnitLabelSet> = {
  SI: {
    flow: 'kg/h',
    flowSmall: 'kg/h',
    temp: '°C',
    pressureGauge: 'bar(g)',
    pressureAbs: 'bar(a)',
    pressureDrop: 'bar',
    length: 'm',
    lengthSmall: 'mm',
    diameter: 'mm',
    thickness: 'mm',
    volume: 'm³',
    volFlow: 'm³/h',
    heatDuty: 'kW',
    specificEnthalpy: 'kJ/kg',
    density: 'kg/m³',
    velocity: 'm/s',
    stress: 'MPa',
    weight: 'tonnes',
    loading: 'm³/(h·m²)',
    concentration: 'ppb',
  },
  US: {
    flow: 'lb/hr',
    flowSmall: 'lb/hr',
    temp: '°F',
    pressureGauge: 'psig',
    pressureAbs: 'psia',
    pressureDrop: 'psi',
    length: 'ft',
    lengthSmall: 'in',
    diameter: 'in',
    thickness: 'in',
    volume: 'gal',
    volFlow: 'gpm',
    heatDuty: 'MMBtu/hr',
    specificEnthalpy: 'Btu/lb',
    density: 'lb/ft³',
    velocity: 'ft/s',
    stress: 'ksi',
    weight: 'tons',
    loading: 'gpm/ft²',
    concentration: 'ppb',
  },
};

export function convertVal(val: number, type: keyof UnitLabelSet, toUnit: UnitSystem): number {
  if (toUnit === 'SI') return val;

  // Convert from SI to US
  switch (type) {
    case 'flow':
    case 'flowSmall':
      return val * 2.20462262; // kg/h -> lb/hr
    case 'temp':
      return val * 1.8 + 32; // °C -> °F
    case 'pressureGauge':
    case 'pressureAbs':
    case 'pressureDrop':
      return val * 14.50377; // bar -> psi
    case 'length':
      return val * 3.28084; // m -> ft
    case 'lengthSmall':
    case 'diameter':
    case 'thickness':
      return val * 0.0393701; // mm -> in
    case 'volume':
      return val * 264.172; // m3 -> US gallons
    case 'volFlow':
      return val * 4.402868; // m3/h -> US gpm
    case 'heatDuty':
      return val * 0.003412142; // kW -> MMBtu/hr
    case 'specificEnthalpy':
      return val * 0.4299226; // kJ/kg -> Btu/lb
    case 'density':
      return val * 0.06242796; // kg/m3 -> lb/ft3
    case 'velocity':
      return val * 3.28084; // m/s -> ft/s
    case 'stress':
      return val * 0.1450377; // MPa -> ksi
    case 'weight':
      return val * 1.10231; // metric tonne -> US short ton
    case 'loading':
      return val * 0.4087; // m3/(h·m2) -> gpm/ft2
    case 'concentration':
      return val; // ppb stays ppb
    default:
      return val;
  }
}

export function formatUnitVal(val: number, type: keyof UnitLabelSet, unit: UnitSystem, decimals = 2): string {
  const converted = convertVal(val, type, unit);
  const formattedNum = Number(converted.toFixed(decimals)).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${formattedNum} ${UNIT_LABELS[unit][type]}`;
}
