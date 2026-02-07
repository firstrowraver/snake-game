import { Direction, GameState } from "./types.js";
import { Game } from "./game.js";

const TILE = 20;
const SCORE_H = 32;
const WALL_W = TILE;

export class FancyRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private canvasW: number;
  private canvasH: number;

  // Grid dimensions (computed from canvas size)
  cols: number;
  rows: number;

  // Play area position
  private playX: number;
  private playY: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvasW = canvas.width;
    this.canvasH = canvas.height;
    this.ctx = canvas.getContext("2d")!;

    // Calculate grid that fits the canvas
    const availW = this.canvasW - 2 * WALL_W;
    const availH = this.canvasH - SCORE_H - 2 * WALL_W;
    this.cols = Math.floor(availW / TILE);
    this.rows = Math.floor(availH / TILE);

    // Center the play area
    this.playX = Math.floor((this.canvasW - this.cols * TILE) / 2);
    this.playY = SCORE_H + WALL_W;
  }

  // ---- Drawing helpers ----

  private tileX(gx: number): number { return this.playX + gx * TILE; }
  private tileY(gy: number): number { return this.playY + gy * TILE; }

  private drawBrickWall(): void {
    const ctx = this.ctx;
    const brickColor1 = "#8B4513";
    const brickColor2 = "#A0522D";
    const mortarColor = "#D2B48C";

    const brickW = 20;
    const brickH = 10;

    const wallLeft = this.playX - WALL_W;
    const wallTop = this.playY - WALL_W;
    const wallRight = this.playX + this.cols * TILE;
    const wallBottom = this.playY + this.rows * TILE;
    const totalW = wallRight + WALL_W - wallLeft;
    const totalH = wallBottom + WALL_W - wallTop;

    // Draw brick pattern helper
    const drawBricks = (rx: number, ry: number, rw: number, rh: number) => {
      ctx.fillStyle = mortarColor;
      ctx.fillRect(rx, ry, rw, rh);

      for (let row = 0; row * brickH < rh; row++) {
        const offset = (row % 2) * (brickW / 2);
        for (let col = -1; col * brickW < rw + brickW; col++) {
          const bx = rx + col * brickW + offset;
          const by = ry + row * brickH;

          // Clip to region
          const cx = Math.max(bx + 1, rx);
          const cy = Math.max(by + 1, ry);
          const cw = Math.min(bx + brickW - 1, rx + rw) - cx;
          const ch = Math.min(by + brickH - 1, ry + rh) - cy;

          if (cw > 0 && ch > 0) {
            ctx.fillStyle = (row + col) % 2 === 0 ? brickColor1 : brickColor2;
            ctx.fillRect(cx, cy, cw, ch);
          }
        }
      }
    };

    // Top wall
    drawBricks(wallLeft, wallTop, totalW, WALL_W);
    // Bottom wall
    drawBricks(wallLeft, wallBottom, totalW, WALL_W);
    // Left wall
    drawBricks(wallLeft, wallTop + WALL_W, WALL_W, totalH - 2 * WALL_W);
    // Right wall
    drawBricks(wallRight, wallTop + WALL_W, WALL_W, totalH - 2 * WALL_W);
  }

  private drawSnakeHead(gx: number, gy: number, dir: Direction): void {
    const ctx = this.ctx;
    const x = this.tileX(gx);
    const y = this.tileY(gy);

    // Body (rounded black rectangle)
    ctx.fillStyle = "#1A1A1A";
    this.roundRect(x + 1, y + 1, TILE - 2, TILE - 2, 5);

    // Eyes based on direction
    ctx.fillStyle = "#FFFFFF";
    let eye1x: number, eye1y: number, eye2x: number, eye2y: number;
    let pupil1x: number, pupil1y: number, pupil2x: number, pupil2y: number;

    switch (dir) {
      case Direction.Right:
        eye1x = x + 12; eye1y = y + 4;
        eye2x = x + 12; eye2y = y + 12;
        pupil1x = x + 14; pupil1y = y + 5;
        pupil2x = x + 14; pupil2y = y + 13;
        break;
      case Direction.Left:
        eye1x = x + 6; eye1y = y + 4;
        eye2x = x + 6; eye2y = y + 12;
        pupil1x = x + 5; pupil1y = y + 5;
        pupil2x = x + 5; pupil2y = y + 13;
        break;
      case Direction.Up:
        eye1x = x + 4; eye1y = y + 6;
        eye2x = x + 12; eye2y = y + 6;
        pupil1x = x + 5; pupil1y = y + 5;
        pupil2x = x + 13; pupil2y = y + 5;
        break;
      case Direction.Down:
        eye1x = x + 4; eye1y = y + 12;
        eye2x = x + 12; eye2y = y + 12;
        pupil1x = x + 5; pupil1y = y + 14;
        pupil2x = x + 13; pupil2y = y + 14;
        break;
    }

    // White of eyes
    ctx.beginPath();
    ctx.arc(eye1x, eye1y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eye2x, eye2y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(pupil1x, pupil1y, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pupil2x, pupil2y, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Tongue (red, forked, extends from mouth side)
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 1.5;
    let tongueStartX: number, tongueStartY: number;
    switch (dir) {
      case Direction.Right:
        tongueStartX = x + TILE; tongueStartY = y + TILE / 2;
        ctx.beginPath();
        ctx.moveTo(tongueStartX, tongueStartY);
        ctx.lineTo(tongueStartX + 4, tongueStartY);
        ctx.lineTo(tongueStartX + 6, tongueStartY - 2);
        ctx.moveTo(tongueStartX + 4, tongueStartY);
        ctx.lineTo(tongueStartX + 6, tongueStartY + 2);
        ctx.stroke();
        break;
      case Direction.Left:
        tongueStartX = x; tongueStartY = y + TILE / 2;
        ctx.beginPath();
        ctx.moveTo(tongueStartX, tongueStartY);
        ctx.lineTo(tongueStartX - 4, tongueStartY);
        ctx.lineTo(tongueStartX - 6, tongueStartY - 2);
        ctx.moveTo(tongueStartX - 4, tongueStartY);
        ctx.lineTo(tongueStartX - 6, tongueStartY + 2);
        ctx.stroke();
        break;
      case Direction.Up:
        tongueStartX = x + TILE / 2; tongueStartY = y;
        ctx.beginPath();
        ctx.moveTo(tongueStartX, tongueStartY);
        ctx.lineTo(tongueStartX, tongueStartY - 4);
        ctx.lineTo(tongueStartX - 2, tongueStartY - 6);
        ctx.moveTo(tongueStartX, tongueStartY - 4);
        ctx.lineTo(tongueStartX + 2, tongueStartY - 6);
        ctx.stroke();
        break;
      case Direction.Down:
        tongueStartX = x + TILE / 2; tongueStartY = y + TILE;
        ctx.beginPath();
        ctx.moveTo(tongueStartX, tongueStartY);
        ctx.lineTo(tongueStartX, tongueStartY + 4);
        ctx.lineTo(tongueStartX - 2, tongueStartY + 6);
        ctx.moveTo(tongueStartX, tongueStartY + 4);
        ctx.lineTo(tongueStartX + 2, tongueStartY + 6);
        ctx.stroke();
        break;
    }
  }

  private drawSnakeBody(gx: number, gy: number): void {
    const ctx = this.ctx;
    const x = this.tileX(gx);
    const y = this.tileY(gy);

    // Black body
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);

    // Red dots pattern
    ctx.fillStyle = "#CC0000";
    ctx.beginPath();
    ctx.arc(x + 6, y + 6, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 14, y + 10, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 7, y + 14, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawSnakeTail(gx: number, gy: number, prevGx: number, prevGy: number): void {
    const ctx = this.ctx;
    const x = this.tileX(gx);
    const y = this.tileY(gy);
    const cx = x + TILE / 2;
    const cy = y + TILE / 2;

    // Direction from tail toward previous segment (where the body connects)
    const dx = prevGx - gx;
    const dy = prevGy - gy;

    ctx.fillStyle = "#1A1A1A";
    ctx.beginPath();

    if (dx === 1) {
      // Tail points left, body is to the right
      ctx.moveTo(x + 2, cy);             // tip
      ctx.lineTo(x + TILE - 1, y + 2);   // top-right
      ctx.lineTo(x + TILE - 1, y + TILE - 2); // bottom-right
    } else if (dx === -1) {
      // Tail points right
      ctx.moveTo(x + TILE - 2, cy);
      ctx.lineTo(x + 1, y + 2);
      ctx.lineTo(x + 1, y + TILE - 2);
    } else if (dy === 1) {
      // Tail points up
      ctx.moveTo(cx, y + 2);
      ctx.lineTo(x + 2, y + TILE - 1);
      ctx.lineTo(x + TILE - 2, y + TILE - 1);
    } else {
      // Tail points down
      ctx.moveTo(cx, y + TILE - 2);
      ctx.lineTo(x + 2, y + 1);
      ctx.lineTo(x + TILE - 2, y + 1);
    }

    ctx.closePath();
    ctx.fill();

    // Small red dot on the tail
    ctx.fillStyle = "#CC0000";
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPineapple(gx: number, gy: number): void {
    const ctx = this.ctx;
    const x = this.tileX(gx);
    const y = this.tileY(gy);

    // Body (golden oval)
    const bodyX = x + TILE / 2;
    const bodyTop = y + 6;
    const bodyH = 13;
    const bodyW = 6;

    ctx.fillStyle = "#DAA520";
    ctx.beginPath();
    ctx.ellipse(bodyX, bodyTop + bodyH / 2, bodyW, bodyH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cross-hatch pattern on body
    ctx.strokeStyle = "#8B6914";
    ctx.lineWidth = 0.8;
    for (let i = -2; i <= 2; i++) {
      const ly = bodyTop + bodyH / 2 + i * 3;
      ctx.beginPath();
      ctx.moveTo(bodyX - bodyW + 1, ly);
      ctx.lineTo(bodyX + bodyW - 1, ly);
      ctx.stroke();
    }
    for (let i = -1; i <= 1; i++) {
      const lx = bodyX + i * 3;
      ctx.beginPath();
      ctx.moveTo(lx, bodyTop + 1);
      ctx.lineTo(lx, bodyTop + bodyH - 1);
      ctx.stroke();
    }

    // Crown / leaves (green spiky top)
    ctx.fillStyle = "#228B22";
    // Center leaf
    ctx.beginPath();
    ctx.moveTo(bodyX, bodyTop - 1);
    ctx.lineTo(bodyX - 2, y);
    ctx.lineTo(bodyX, bodyTop - 5);
    ctx.lineTo(bodyX + 2, y);
    ctx.closePath();
    ctx.fill();
    // Left leaf
    ctx.beginPath();
    ctx.moveTo(bodyX - 2, bodyTop);
    ctx.lineTo(bodyX - 5, y + 1);
    ctx.lineTo(bodyX - 1, bodyTop - 3);
    ctx.closePath();
    ctx.fill();
    // Right leaf
    ctx.beginPath();
    ctx.moveTo(bodyX + 2, bodyTop);
    ctx.lineTo(bodyX + 5, y + 1);
    ctx.lineTo(bodyX + 1, bodyTop - 3);
    ctx.closePath();
    ctx.fill();
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  private drawBackground(): void {
    const ctx = this.ctx;

    // Sky gradient for the full canvas
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH);
    grad.addColorStop(0, "#87CEEB");
    grad.addColorStop(1, "#E0F0FF");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvasW, this.canvasH);

    // Grass play area
    const grassGrad = ctx.createLinearGradient(0, this.playY, 0, this.playY + this.rows * TILE);
    grassGrad.addColorStop(0, "#7EC850");
    grassGrad.addColorStop(1, "#5DAE3B");
    ctx.fillStyle = grassGrad;
    ctx.fillRect(this.playX, this.playY, this.cols * TILE, this.rows * TILE);

    // Subtle grid lines on grass
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 0.5;
    for (let gx = 0; gx <= this.cols; gx++) {
      const lx = this.playX + gx * TILE;
      ctx.beginPath();
      ctx.moveTo(lx, this.playY);
      ctx.lineTo(lx, this.playY + this.rows * TILE);
      ctx.stroke();
    }
    for (let gy = 0; gy <= this.rows; gy++) {
      const ly = this.playY + gy * TILE;
      ctx.beginPath();
      ctx.moveTo(this.playX, ly);
      ctx.lineTo(this.playX + this.cols * TILE, ly);
      ctx.stroke();
    }
  }

  private drawScoreBar(game: Game): void {
    const ctx = this.ctx;

    // Dark bar
    ctx.fillStyle = "#1A1A3E";
    ctx.fillRect(0, 0, this.canvasW, SCORE_H);

    // Score text
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 18px monospace";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${game.score}`, 12, SCORE_H / 2);

    ctx.textAlign = "right";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`HI: ${game.highScore}`, this.canvasW - 12, SCORE_H / 2);
  }

  // ---- Public render methods ----

  renderStart(game: Game): void {
    const ctx = this.ctx;

    // Colorful background
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvasH);
    grad.addColorStop(0, "#1A1A3E");
    grad.addColorStop(0.5, "#2D1B69");
    grad.addColorStop(1, "#1A1A3E");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvasW, this.canvasH);

    // Title
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 36px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SNAKE", this.canvasW / 2, this.canvasH * 0.3);

    // Decorative snake
    ctx.fillStyle = "#1A1A1A";
    const snakeY = this.canvasH * 0.48;
    for (let i = 0; i < 6; i++) {
      const sx = this.canvasW / 2 - 60 + i * 20;
      ctx.fillRect(sx + 1, snakeY, 18, 16);
      // Red dots
      ctx.fillStyle = "#CC0000";
      ctx.beginPath();
      ctx.arc(sx + 8, snakeY + 5, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + 14, snakeY + 11, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1A1A1A";
    }

    // Eyes on head (last segment)
    const headX = this.canvasW / 2 - 60 + 5 * 20;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(headX + 13, snakeY + 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + 13, snakeY + 12, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(headX + 15, snakeY + 5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + 15, snakeY + 13, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Instructions
    ctx.fillStyle = "#AAAACC";
    ctx.font = "16px monospace";
    ctx.fillText("PRESS ENTER TO START", this.canvasW / 2, this.canvasH * 0.72);

    ctx.fillStyle = "#666688";
    ctx.font = "12px monospace";
    ctx.fillText("ARROW KEYS TO MOVE", this.canvasW / 2, this.canvasH * 0.82);
  }

  renderPlaying(game: Game): void {
    this.drawBackground();
    this.drawBrickWall();
    this.drawScoreBar(game);

    // Draw food (pineapple)
    this.drawPineapple(game.food.x, game.food.y);

    // Draw snake
    const snake = game.snake;
    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      if (i === 0) {
        this.drawSnakeHead(seg.x, seg.y, game.direction);
      } else if (i === snake.length - 1 && snake.length > 1) {
        this.drawSnakeTail(seg.x, seg.y, snake[i - 1].x, snake[i - 1].y);
      } else {
        this.drawSnakeBody(seg.x, seg.y);
      }
    }
  }

  renderGameOver(game: Game): void {
    const ctx = this.ctx;

    // Dim the play field
    this.renderPlaying(game);
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, 0, this.canvasW, this.canvasH);

    // Game over box
    const boxW = 280;
    const boxH = 160;
    const boxX = (this.canvasW - boxW) / 2;
    const boxY = (this.canvasH - boxH) / 2;

    ctx.fillStyle = "#1A1A3E";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#FF4444";
    ctx.font = "bold 28px monospace";
    ctx.fillText("GAME OVER", this.canvasW / 2, boxY + 35);

    ctx.fillStyle = "#FFD700";
    ctx.font = "18px monospace";
    ctx.fillText(`SCORE: ${game.score}`, this.canvasW / 2, boxY + 75);

    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`HIGH: ${game.highScore}`, this.canvasW / 2, boxY + 100);

    ctx.fillStyle = "#AAAACC";
    ctx.font = "14px monospace";
    ctx.fillText("PRESS ENTER", this.canvasW / 2, boxY + 135);
  }

  render(state: GameState, game: Game): void {
    switch (state) {
      case GameState.Start:
        this.renderStart(game);
        break;
      case GameState.Playing:
        this.renderPlaying(game);
        break;
      case GameState.GameOver:
        this.renderGameOver(game);
        break;
    }
  }
}
