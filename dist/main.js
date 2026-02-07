import { Direction, GameState, THEMES } from "./types.js";
import { Game, GRID_COLS, GRID_ROWS } from "./game.js";
import { Renderer } from "./renderer.js";
import { FancyRenderer } from "./fancy.js";
import { Input } from "./input.js";
import { Sound, Music } from "./sound.js";
class App {
    constructor() {
        this.fancyRenderer = null;
        this.state = GameState.ThemeSelect;
        this.themeIndex = 0;
        this.isFancy = false;
        this.lastTick = 0;
        this.animFrame = 0;
        this.themeAnimFrame = 0;
        this.themeSelectLoop = (now) => {
            if (this.state !== GameState.ThemeSelect)
                return;
            this.renderer.render(this.state, this.game, this.themeIndex, now);
            this.themeAnimFrame = requestAnimationFrame(this.themeSelectLoop);
        };
        this.loop = (now) => {
            if (this.state !== GameState.Playing)
                return;
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
        this.canvas = document.getElementById("game");
        this.game = new Game();
        this.renderer = new Renderer(this.canvas);
        this.sound = new Sound();
        this.music = new Music();
        new Input((dir) => this.onDirection(dir), () => this.onEnter());
        this.startThemeSelectLoop();
    }
    onDirection(dir) {
        if (this.state === GameState.ThemeSelect) {
            if (dir === Direction.Up) {
                this.themeIndex = (this.themeIndex - 1 + THEMES.length) % THEMES.length;
                this.sound.navigate();
            }
            else if (dir === Direction.Down) {
                this.themeIndex = (this.themeIndex + 1) % THEMES.length;
                this.sound.navigate();
            }
            else if (dir === Direction.Right) {
                this.onEnter();
            }
        }
        else if (this.state === GameState.Playing) {
            this.game.setDirection(dir);
        }
        else if (this.state === GameState.Start || this.state === GameState.GameOver) {
            if (dir === Direction.Right) {
                this.onEnter();
            }
        }
    }
    onEnter() {
        switch (this.state) {
            case GameState.ThemeSelect: {
                cancelAnimationFrame(this.themeAnimFrame);
                const theme = THEMES[this.themeIndex];
                this.isFancy = !!theme.fancy;
                if (this.isFancy) {
                    if (!this.fancyRenderer) {
                        this.fancyRenderer = new FancyRenderer(this.canvas);
                    }
                    this.game.configure(this.fancyRenderer.cols, this.fancyRenderer.rows);
                    this.fancyRenderer.render(GameState.Start, this.game);
                }
                else {
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
                this.startThemeSelectLoop();
                break;
        }
    }
    startThemeSelectLoop() {
        cancelAnimationFrame(this.themeAnimFrame);
        this.themeAnimFrame = requestAnimationFrame(this.themeSelectLoop);
    }
    startGame() {
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
    renderCurrent(state) {
        if (this.isFancy && this.fancyRenderer) {
            this.fancyRenderer.render(state, this.game);
        }
        else {
            this.renderer.render(state, this.game);
        }
    }
}
// Boot
new App();
//# sourceMappingURL=main.js.map