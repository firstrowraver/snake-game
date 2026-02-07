import { Direction, GameState, THEMES } from "./types.js";
import { Game, GRID_COLS, GRID_ROWS } from "./game.js";
import { Renderer } from "./renderer.js";
import { FancyRenderer } from "./fancy.js";
import { Input } from "./input.js";
import { Sound, Music } from "./sound.js";

class App {
  private canvas: HTMLCanvasElement;
  private game: Game;
  private renderer: Renderer;
  private fancyRenderer: FancyRenderer | null = null;
  private sound: Sound;
  private music: Music;
  private state: GameState = GameState.ThemeSelect;
  private themeIndex: number = 0;
  private isFancy: boolean = false;
  private lastTick: number = 0;
  private animFrame: number = 0;

  constructor() {
    this.canvas = document.getElementById("game") as HTMLCanvasElement;
    this.game = new Game();
    this.renderer = new Renderer(this.canvas);
    this.sound = new Sound();
    this.music = new Music();

    new Input(
      (dir: Direction) => this.onDirection(dir),
      () => this.onEnter()
    );

    this.renderer.render(this.state, this.game, this.themeIndex);
  }

  private onDirection(dir: Direction): void {
    if (this.state === GameState.ThemeSelect) {
      if (dir === Direction.Up) {
        this.themeIndex = (this.themeIndex - 1 + THEMES.length) % THEMES.length;
        this.sound.navigate();
        this.renderer.render(this.state, this.game, this.themeIndex);
      } else if (dir === Direction.Down) {
        this.themeIndex = (this.themeIndex + 1) % THEMES.length;
        this.sound.navigate();
        this.renderer.render(this.state, this.game, this.themeIndex);
      }
    } else if (this.state === GameState.Playing) {
      this.game.setDirection(dir);
    }
  }

  private onEnter(): void {
    switch (this.state) {
      case GameState.ThemeSelect: {
        const theme = THEMES[this.themeIndex];
        this.isFancy = !!theme.fancy;

        if (this.isFancy) {
          if (!this.fancyRenderer) {
            this.fancyRenderer = new FancyRenderer(this.canvas);
          }
          this.game.configure(this.fancyRenderer.cols, this.fancyRenderer.rows);
          this.fancyRenderer.render(GameState.Start, this.game);
        } else {
          this.game.configure(GRID_COLS, GRID_ROWS);
          this.renderer.setTheme(theme);
          this.renderer.render(GameState.Start, this.game);
        }
        this.state = GameState.Start;
        break;
      }
      case GameState.Start:
        this.startGame();
        break;
      case GameState.GameOver:
        this.music.stopMusic();
        this.state = GameState.ThemeSelect;
        this.renderer.render(this.state, this.game, this.themeIndex);
        break;
    }
  }

  private startGame(): void {
    this.game.reset();
    this.state = GameState.Playing;
    this.sound.start();

    if (this.isFancy) {
      // Start 8-bit music after a short delay so the start jingle plays first
      setTimeout(() => {
        if (this.state === GameState.Playing) {
          this.music.startMusic();
        }
      }, 300);
    }

    this.lastTick = performance.now();
    this.loop(this.lastTick);
  }

  private renderCurrent(state: GameState): void {
    if (this.isFancy && this.fancyRenderer) {
      this.fancyRenderer.render(state, this.game);
    } else {
      this.renderer.render(state, this.game);
    }
  }

  private loop = (now: number): void => {
    if (this.state !== GameState.Playing) return;

    const elapsed = now - this.lastTick;
    if (elapsed >= this.game.speed) {
      this.lastTick = now;
      const result = this.game.update();

      if (result.died) {
        this.sound.die();
        this.music.stopMusic();
        this.state = GameState.GameOver;
        // Brief delay to show the death state before game over screen
        setTimeout(() => {
          this.renderCurrent(this.state);
        }, 800);
        this.renderCurrent(GameState.Playing);
        return;
      }

      if (result.ate) {
        this.sound.eat();
      }

      this.renderCurrent(this.state);
    }

    this.animFrame = requestAnimationFrame(this.loop);
  };
}

// Boot
new App();
