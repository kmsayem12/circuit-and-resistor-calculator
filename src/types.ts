export interface ColorBand {
  name: string;
  color: string;
  textDark: boolean;
}

export interface E24Result {
  value: number;
  mantissa: number;
  exp: number;
}

export interface WattageRating {
  name: string;
  watts: number;
}

export interface SeriesState {
  vInput: number;
  vTarget: number;
  currentmA: number;
}
