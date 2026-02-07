import { Point, Direction } from "./types.js";

// Nokia 3310 screen: 84x48 pixels
export const SCREEN_W = 84;
export const SCREEN_H = 48;
export const GRID_COLS = 41;
export const GRID_ROWS = 18;
export const GRID_OFFSET_Y = 10; // pixels from top for score area

const DIRECTION_VECTORS: Record<Direction, Point> = {
  [Direction.Up]: { x: 0, y: -1 },
  [Direction.Right]: { x: 1, y: 0 },
  [Direction.Down]: { x: 0, y: 1 },
  [Direction.Left]: { x: -1, y: 0 },
};

export class Game {
  snake: Point[] = [];
  direction: Direction = Direction.Right;
  nextDirection: Direction = Direction.Right;
  food: Point = { x: 0, y: 0 };
  score: number = 0;
  highScore: number = 0;
  isAlive: boolean = true;

  private cols: number = GRID_COLS;
  private rows: number = GRID_ROWS;

  constructor() {
    this.reset();
  }

  configure(cols: number, rows: number): void {
    this.cols = cols;
    this.rows = rows;
  }

  reset(): void {
    const startX = Math.floor(this.cols / 2);
    const startY = Math.floor(this.rows / 2);
    this.snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];
    this.direction = Direction.Right;
    this.nextDirection = Direction.Right;
    this.score = 0;
    this.isAlive = true;
    this.spawnFood();
  }

  setDirection(dir: Direction): void {
    const opposite =
      (dir === Direction.Up && this.direction === Direction.Down) ||
      (dir === Direction.Down && this.direction === Direction.Up) ||
      (dir === Direction.Left && this.direction === Direction.Right) ||
      (dir === Direction.Right && this.direction === Direction.Left);
    if (!opposite) {
      this.nextDirection = dir;
    }
  }

  update(): { ate: boolean; died: boolean } {
    if (!this.isAlive) return { ate: false, died: false };

    this.direction = this.nextDirection;
    const vec = DIRECTION_VECTORS[this.direction];
    const head = this.snake[0];
    const newHead: Point = { x: head.x + vec.x, y: head.y + vec.y };

    // Wall collision
    if (
      newHead.x < 0 ||
      newHead.x >= this.cols ||
      newHead.y < 0 ||
      newHead.y >= this.rows
    ) {
      this.isAlive = false;
      return { ate: false, died: true };
    }

    // Self collision
    for (let i = 0; i < this.snake.length - 1; i++) {
      if (this.snake[i].x === newHead.x && this.snake[i].y === newHead.y) {
        this.isAlive = false;
        return { ate: false, died: true };
      }
    }

    this.snake.unshift(newHead);

    const ate = newHead.x === this.food.x && newHead.y === this.food.y;
    if (ate) {
      this.score++;
      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
      this.spawnFood();
    } else {
      this.snake.pop();
    }

    return { ate, died: false };
  }

  private spawnFood(): void {
    const occupied = new Set<string>();
    for (const seg of this.snake) {
      occupied.add(`${seg.x},${seg.y}`);
    }

    const free: Point[] = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (!occupied.has(`${x},${y}`)) {
          free.push({ x, y });
        }
      }
    }

    if (free.length > 0) {
      this.food = free[Math.floor(Math.random() * free.length)];
    }
  }

  get speed(): number {
    const base = 350;
    const min = 100;
    const reduction = this.score * 8;
    return Math.max(min, base - reduction);
  }
}
