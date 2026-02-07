import { GameState, Theme, THEMES } from "./types.js";
import { Game, SCREEN_W, SCREEN_H, GRID_OFFSET_Y, GRID_ROWS } from "./game.js";

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scale: number;
  private buffer: HTMLCanvasElement;
  private bufCtx: CanvasRenderingContext2D;

  private dark: string = "#43523D";
  private light: string = "#C7D9A4";

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.scale = Math.min(
      Math.floor(window.innerHeight * 0.85 / SCREEN_H),
      Math.floor(window.innerWidth * 0.85 / SCREEN_W)
    );
    this.scale = Math.max(this.scale, 4);

    this.canvas.width = SCREEN_W * this.scale;
    this.canvas.height = SCREEN_H * this.scale;
    this.ctx = canvas.getContext("2d")!;
    this.ctx.imageSmoothingEnabled = false;

    this.buffer = document.createElement("canvas");
    this.buffer.width = SCREEN_W;
    this.buffer.height = SCREEN_H;
    this.bufCtx = this.buffer.getContext("2d")!;
  }

  getCanvasWidth(): number { return this.canvas.width; }
  getCanvasHeight(): number { return this.canvas.height; }

  setTheme(theme: Theme): void {
    this.dark = theme.dark;
    this.light = theme.light;
  }

  private px(x: number, y: number, on: boolean = true): void {
    this.bufCtx.fillStyle = on ? this.dark : this.light;
    this.bufCtx.fillRect(x, y, 1, 1);
  }

  private pxColor(x: number, y: number, color: string): void {
    this.bufCtx.fillStyle = color;
    this.bufCtx.fillRect(x, y, 1, 1);
  }

  private clear(): void {
    this.bufCtx.fillStyle = this.light;
    this.bufCtx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  }

  private clearColor(color: string): void {
    this.bufCtx.fillStyle = color;
    this.bufCtx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  }

  private flush(): void {
    this.ctx.drawImage(this.buffer, 0, 0, SCREEN_W, SCREEN_H, 0, 0, this.canvas.width, this.canvas.height);
  }

  private hline(x1: number, x2: number, y: number): void {
    for (let x = x1; x <= x2; x++) this.px(x, y);
  }

  // ---- Tiny 3x5 pixel font ----
  private static readonly FONT: Record<string, number[]> = {
    "0": [0b111, 0b101, 0b101, 0b101, 0b111],
    "1": [0b010, 0b110, 0b010, 0b010, 0b111],
    "2": [0b111, 0b001, 0b111, 0b100, 0b111],
    "3": [0b111, 0b001, 0b111, 0b001, 0b111],
    "4": [0b101, 0b101, 0b111, 0b001, 0b001],
    "5": [0b111, 0b100, 0b111, 0b001, 0b111],
    "6": [0b111, 0b100, 0b111, 0b101, 0b111],
    "7": [0b111, 0b001, 0b001, 0b001, 0b001],
    "8": [0b111, 0b101, 0b111, 0b101, 0b111],
    "9": [0b111, 0b101, 0b111, 0b001, 0b111],
    "S": [0b111, 0b100, 0b111, 0b001, 0b111],
    "N": [0b101, 0b111, 0b111, 0b101, 0b101],
    "A": [0b111, 0b101, 0b111, 0b101, 0b101],
    "K": [0b101, 0b110, 0b100, 0b110, 0b101],
    "E": [0b111, 0b100, 0b111, 0b100, 0b111],
    "P": [0b111, 0b101, 0b111, 0b100, 0b100],
    "R": [0b111, 0b101, 0b111, 0b110, 0b101],
    "T": [0b111, 0b010, 0b010, 0b010, 0b010],
    "O": [0b111, 0b101, 0b101, 0b101, 0b111],
    "C": [0b111, 0b100, 0b100, 0b100, 0b111],
    "G": [0b111, 0b100, 0b101, 0b101, 0b111],
    "M": [0b101, 0b111, 0b111, 0b101, 0b101],
    "V": [0b101, 0b101, 0b101, 0b101, 0b010],
    "H": [0b101, 0b101, 0b111, 0b101, 0b101],
    "I": [0b111, 0b010, 0b010, 0b010, 0b111],
    "L": [0b100, 0b100, 0b100, 0b100, 0b111],
    "D": [0b110, 0b101, 0b101, 0b101, 0b110],
    "U": [0b101, 0b101, 0b101, 0b101, 0b111],
    "W": [0b101, 0b101, 0b111, 0b111, 0b101],
    "Y": [0b101, 0b101, 0b010, 0b010, 0b010],
    "F": [0b111, 0b100, 0b111, 0b100, 0b100],
    "B": [0b110, 0b101, 0b110, 0b101, 0b110],
    "X": [0b101, 0b101, 0b010, 0b101, 0b101],
    " ": [0b000, 0b000, 0b000, 0b000, 0b000],
    ":": [0b000, 0b010, 0b000, 0b010, 0b000],
    ">": [0b100, 0b010, 0b001, 0b010, 0b100],
  };

  private drawChar(ch: string, x: number, y: number): void {
    const glyph = Renderer.FONT[ch.toUpperCase()];
    if (!glyph) return;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        if (glyph[row] & (1 << (2 - col))) {
          this.px(x + col, y + row);
        }
      }
    }
  }

  private drawCharColor(ch: string, x: number, y: number, color: string): void {
    const glyph = Renderer.FONT[ch.toUpperCase()];
    if (!glyph) return;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        if (glyph[row] & (1 << (2 - col))) {
          this.pxColor(x + col, y + row, color);
        }
      }
    }
  }

  private drawText(text: string, x: number, y: number): void {
    for (let i = 0; i < text.length; i++) {
      this.drawChar(text[i], x + i * 4, y);
    }
  }

  private drawTextColor(text: string, x: number, y: number, color: string): void {
    for (let i = 0; i < text.length; i++) {
      this.drawCharColor(text[i], x + i * 4, y, color);
    }
  }

  private drawTextCentered(text: string, y: number): void {
    const w = text.length * 4 - 1;
    const x = Math.floor((SCREEN_W - w) / 2);
    this.drawText(text, x, y);
  }

  private drawTextCenteredColor(text: string, y: number, color: string): void {
    const w = text.length * 4 - 1;
    const x = Math.floor((SCREEN_W - w) / 2);
    this.drawTextColor(text, x, y, color);
  }

  // ---- Theme selection screen (scrollable) ----

  renderThemeSelect(selectedIndex: number): void {
    this.clearColor("#1A1A2E");

    // Title
    this.drawTextCenteredColor("CHOOSE THEME", 2, "#FFFFFF");

    // Divider
    for (let x = 10; x < SCREEN_W - 10; x++) {
      this.pxColor(x, 9, "#444466");
    }

    // Scrollable viewport: show up to 3 items
    const maxVisible = 3;
    const total = THEMES.length;
    const viewStart = Math.max(0, Math.min(selectedIndex - 1, total - maxVisible));

    // Scroll-up indicator
    if (viewStart > 0) {
      this.drawTextCenteredColor("...", 11, "#555577");
    }

    const startY = 14;
    const spacing = 10;

    for (let vi = 0; vi < maxVisible && viewStart + vi < total; vi++) {
      const i = viewStart + vi;
      const theme = THEMES[i];
      const y = startY + vi * spacing;
      const isSelected = i === selectedIndex;

      if (isSelected) {
        this.bufCtx.fillStyle = "#2A2A4E";
        this.bufCtx.fillRect(4, y - 2, SCREEN_W - 8, 9);
        this.drawCharColor(">", 6, y, "#FFFFFF");
      }

      // Color preview swatch
      this.bufCtx.fillStyle = theme.dark;
      this.bufCtx.fillRect(14, y, 4, 5);

      const nameColor = isSelected ? theme.dark : "#888899";
      this.drawTextColor(theme.name, 22, y, nameColor);
    }

    // Scroll-down indicator
    if (viewStart + maxVisible < total) {
      this.drawTextCenteredColor("...", 39, "#555577");
    }

    // Footer
    this.drawTextCenteredColor("ENTER TO SELECT", 42, "#555577");

    this.flush();
  }

  // ---- Game rendering ----

  renderStart(): void {
    this.clear();
    this.drawTextCentered("SNAKE", 8);

    const cx = Math.floor(SCREEN_W / 2);
    const cy = 22;
    for (let i = 0; i < 8; i++) {
      this.px(cx - 8 + i * 2, cy);
      this.px(cx - 8 + i * 2 + 1, cy);
      this.px(cx - 8 + i * 2, cy + 1);
      this.px(cx - 8 + i * 2 + 1, cy + 1);
    }

    this.drawTextCentered("PRESS ENTER", 34);
    this.drawTextCentered("TO START", 41);
    this.flush();
  }

  renderPlaying(game: Game): void {
    this.clear();

    this.drawText("SCORE:" + game.score.toString(), 1, 1);
    this.drawText("HI:" + game.highScore.toString(), 54, 1);
    this.hline(0, SCREEN_W - 1, GRID_OFFSET_Y - 2);

    const top = GRID_OFFSET_Y - 1;
    const bottom = GRID_OFFSET_Y + GRID_ROWS * 2;
    this.hline(0, SCREEN_W - 1, top);
    this.hline(0, SCREEN_W - 1, bottom);
    for (let y = top; y <= bottom; y++) {
      this.px(0, y);
      this.px(SCREEN_W - 1, y);
    }

    const fx = 1 + game.food.x * 2;
    const fy = GRID_OFFSET_Y + game.food.y * 2;
    this.px(fx, fy);
    this.px(fx + 1, fy);
    this.px(fx, fy + 1);
    this.px(fx + 1, fy + 1);

    for (const seg of game.snake) {
      const sx = 1 + seg.x * 2;
      const sy = GRID_OFFSET_Y + seg.y * 2;
      this.px(sx, sy);
      this.px(sx + 1, sy);
      this.px(sx, sy + 1);
      this.px(sx + 1, sy + 1);
    }

    this.flush();
  }

  renderGameOver(game: Game): void {
    this.clear();
    this.drawTextCentered("GAME OVER", 8);
    this.drawTextCentered("SCORE:" + game.score.toString(), 18);
    this.drawTextCentered("HI:" + game.highScore.toString(), 26);
    this.drawTextCentered("PRESS ENTER", 36);
    this.flush();
  }

  render(state: GameState, game: Game, themeIndex?: number): void {
    switch (state) {
      case GameState.ThemeSelect:
        this.renderThemeSelect(themeIndex ?? 0);
        break;
      case GameState.Start:
        this.renderStart();
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
