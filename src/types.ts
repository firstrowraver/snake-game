export interface Point {
  x: number;
  y: number;
}

export enum Direction {
  Up = 0,
  Right = 1,
  Down = 2,
  Left = 3,
}

export enum GameState {
  ThemeSelect,
  Start,
  Playing,
  GameOver,
}

export interface Theme {
  name: string;
  dark: string;   // foreground / "on" pixel color
  light: string;  // background / "off" pixel color
  fancy?: boolean;
}

export const THEMES: Theme[] = [
  { name: "CLASSIC", dark: "#43523D", light: "#C7D9A4" },
  { name: "FANCY",   dark: "#FF6B6B", light: "#4ECDC4", fancy: true },
  { name: "PINK",    dark: "#FF1493", light: "#FFE4E1" },
  { name: "GOLD",    dark: "#DAA520", light: "#E0E8F8" },
];
