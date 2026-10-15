import { ColorBand, E24Result, WattageRating } from '../types';

export const E24_MANTISSAS = [
  10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51,
  56, 62, 68, 75, 82, 91,
];

export const COLOR_MAP: Record<number | string, ColorBand> = {
  0: { name: "Black", color: "#1a1a1a", textDark: false },
  1: { name: "Brown", color: "#795548", textDark: false },
  2: { name: "Red", color: "#e53935", textDark: false },
  3: { name: "Orange", color: "#ff9800", textDark: true },
  4: { name: "Yellow", color: "#fdd835", textDark: true },
  5: { name: "Green", color: "#4caf50", textDark: false },
  6: { name: "Blue", color: "#1e88e5", textDark: false },
  7: { name: "Violet", color: "#8e24aa", textDark: false },
  8: { name: "Grey", color: "#8e8e8e", textDark: false },
  9: { name: "White", color: "#f5f5f5", textDark: true },
  "-1": { name: "Gold (x0.1)", color: "#d4af37", textDark: true },
  "-2": { name: "Silver (x0.01)", color: "#c0c0c0", textDark: true },
};

export const WATTAGE_RATINGS: WattageRating[] = [
  { name: "1/8 W", watts: 0.125 },
  { name: "1/4 W", watts: 0.25 },
  { name: "1/2 W", watts: 0.5 },
  { name: "1 W", watts: 1.0 },
  { name: "2 W", watts: 2.0 },
  { name: "5 W", watts: 5.0 },
  { name: "10 W", watts: 10.0 },
  { name: "25 W", watts: 25.0 },
];

export function getNearestE24(ohms: number): E24Result {
  if (ohms <= 0 || !isFinite(ohms)) return { value: 0, mantissa: 0, exp: 0 };
  const exp = Math.floor(Math.log10(ohms)) - 1;
  const mantissa = ohms / Math.pow(10, exp);
  let closest = E24_MANTISSAS[0];
  let minDiff = Math.abs(mantissa - closest);

  for (let i = 1; i < E24_MANTISSAS.length; i++) {
    const diff = Math.abs(mantissa - E24_MANTISSAS[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = E24_MANTISSAS[i];
    }
  }

  const e24Value = closest * Math.pow(10, exp);
  return {
    value: Math.round(e24Value * 100) / 100,
    mantissa: closest,
    exp: exp,
  };
}

export function getColorBands(e24: E24Result): ColorBand[] {
  if (!e24 || e24.value <= 0) {
    return [COLOR_MAP[0], COLOR_MAP[0], COLOR_MAP[0], COLOR_MAP["-1"]];
  }
  const mantStr = e24.mantissa.toString();
  const digit1 = parseInt(mantStr[0], 10);
  const digit2 = parseInt(mantStr[1], 10);
  const multExp = e24.exp;

  const band1 = COLOR_MAP[digit1] || COLOR_MAP[0];
  const band2 = COLOR_MAP[digit2] || COLOR_MAP[0];
  const band3 = COLOR_MAP[multExp] || COLOR_MAP[0];
  const band4: ColorBand = { name: "Gold (±5%)", color: "#d4af37", textDark: true };

  return [band1, band2, band3, band4];
}

export function formatResistance(ohms: number): string {
  if (ohms < 0 || !isFinite(ohms)) return "—";
  if (ohms >= 1e6) return (ohms / 1e6).toFixed(2) + " MΩ";
  if (ohms >= 1e3) return (ohms / 1e3).toFixed(2) + " kΩ";
  return ohms.toFixed(1) + " Ω";
}
