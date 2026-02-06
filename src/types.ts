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
  Start,
  Playing,
  GameOver,
}
