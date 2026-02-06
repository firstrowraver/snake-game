import { Direction } from "./types.js";
// Nokia 3310 screen: 84x48 pixels
// Snake game grid uses 2x2 pixel cells for each tile
// Playable area: top area reserved for score display
// Grid: 42 columns x 19 rows (leaving ~10px top for score bar)
export const SCREEN_W = 84;
export const SCREEN_H = 48;
export const GRID_COLS = 41;
export const GRID_ROWS = 18;
export const GRID_OFFSET_Y = 10; // pixels from top for score area
const DIRECTION_VECTORS = {
    [Direction.Up]: { x: 0, y: -1 },
    [Direction.Right]: { x: 1, y: 0 },
    [Direction.Down]: { x: 0, y: 1 },
    [Direction.Left]: { x: -1, y: 0 },
};
export class Game {
    constructor() {
        this.snake = [];
        this.direction = Direction.Right;
        this.nextDirection = Direction.Right;
        this.food = { x: 0, y: 0 };
        this.score = 0;
        this.highScore = 0;
        this.isAlive = true;
        this.reset();
    }
    reset() {
        // Start snake in the middle, length 3
        const startX = Math.floor(GRID_COLS / 2);
        const startY = Math.floor(GRID_ROWS / 2);
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
    setDirection(dir) {
        // Prevent 180-degree turns
        const opposite = (dir === Direction.Up && this.direction === Direction.Down) ||
            (dir === Direction.Down && this.direction === Direction.Up) ||
            (dir === Direction.Left && this.direction === Direction.Right) ||
            (dir === Direction.Right && this.direction === Direction.Left);
        if (!opposite) {
            this.nextDirection = dir;
        }
    }
    update() {
        if (!this.isAlive)
            return { ate: false, died: false };
        this.direction = this.nextDirection;
        const vec = DIRECTION_VECTORS[this.direction];
        const head = this.snake[0];
        const newHead = { x: head.x + vec.x, y: head.y + vec.y };
        // Wall collision
        if (newHead.x < 0 ||
            newHead.x >= GRID_COLS ||
            newHead.y < 0 ||
            newHead.y >= GRID_ROWS) {
            this.isAlive = false;
            return { ate: false, died: true };
        }
        // Self collision (check against all body segments except the tail,
        // which will move away — unless we just ate)
        for (let i = 0; i < this.snake.length - 1; i++) {
            if (this.snake[i].x === newHead.x && this.snake[i].y === newHead.y) {
                this.isAlive = false;
                return { ate: false, died: true };
            }
        }
        this.snake.unshift(newHead);
        // Check food
        const ate = newHead.x === this.food.x && newHead.y === this.food.y;
        if (ate) {
            this.score++;
            if (this.score > this.highScore) {
                this.highScore = this.score;
            }
            this.spawnFood();
        }
        else {
            this.snake.pop();
        }
        return { ate, died: false };
    }
    spawnFood() {
        // Build set of occupied cells
        const occupied = new Set();
        for (const seg of this.snake) {
            occupied.add(`${seg.x},${seg.y}`);
        }
        // Find all free cells
        const free = [];
        for (let y = 0; y < GRID_ROWS; y++) {
            for (let x = 0; x < GRID_COLS; x++) {
                if (!occupied.has(`${x},${y}`)) {
                    free.push({ x, y });
                }
            }
        }
        if (free.length > 0) {
            this.food = free[Math.floor(Math.random() * free.length)];
        }
    }
    /** Current game speed in ms per tick — gets faster as score increases */
    get speed() {
        // Original Nokia Snake started around 400ms and sped up
        const base = 350;
        const min = 100;
        const reduction = this.score * 8;
        return Math.max(min, base - reduction);
    }
}
//# sourceMappingURL=game.js.map