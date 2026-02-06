import { Direction, GameState, THEMES } from "./types.js";
import { Game } from "./game.js";
import { Renderer } from "./renderer.js";
import { Input } from "./input.js";
import { Sound } from "./sound.js";
class App {
    constructor() {
        this.state = GameState.ThemeSelect;
        this.themeIndex = 0;
        this.lastTick = 0;
        this.animFrame = 0;
        this.loop = (now) => {
            if (this.state !== GameState.Playing)
                return;
            const elapsed = now - this.lastTick;
            if (elapsed >= this.game.speed) {
                this.lastTick = now;
                const result = this.game.update();
                if (result.died) {
                    this.sound.die();
                    this.state = GameState.GameOver;
                    // Brief delay to show the death state before game over screen
                    setTimeout(() => {
                        this.renderer.render(this.state, this.game);
                    }, 800);
                    this.renderer.render(GameState.Playing, this.game);
                    return;
                }
                if (result.ate) {
                    this.sound.eat();
                }
                this.renderer.render(this.state, this.game);
            }
            this.animFrame = requestAnimationFrame(this.loop);
        };
        const canvas = document.getElementById("game");
        this.game = new Game();
        this.renderer = new Renderer(canvas);
        this.sound = new Sound();
        new Input((dir) => this.onDirection(dir), () => this.onEnter());
        this.renderer.render(this.state, this.game, this.themeIndex);
    }
    onDirection(dir) {
        if (this.state === GameState.ThemeSelect) {
            if (dir === Direction.Up) {
                this.themeIndex = (this.themeIndex - 1 + THEMES.length) % THEMES.length;
                this.sound.navigate();
                this.renderer.render(this.state, this.game, this.themeIndex);
            }
            else if (dir === Direction.Down) {
                this.themeIndex = (this.themeIndex + 1) % THEMES.length;
                this.sound.navigate();
                this.renderer.render(this.state, this.game, this.themeIndex);
            }
        }
        else if (this.state === GameState.Playing) {
            this.game.setDirection(dir);
        }
    }
    onEnter() {
        switch (this.state) {
            case GameState.ThemeSelect:
                this.renderer.setTheme(THEMES[this.themeIndex]);
                this.state = GameState.Start;
                this.renderer.render(this.state, this.game);
                break;
            case GameState.Start:
                this.startGame();
                break;
            case GameState.GameOver:
                this.state = GameState.ThemeSelect;
                this.renderer.render(this.state, this.game, this.themeIndex);
                break;
        }
    }
    startGame() {
        this.game.reset();
        this.state = GameState.Playing;
        this.sound.start();
        this.lastTick = performance.now();
        this.loop(this.lastTick);
    }
}
// Boot
new App();
//# sourceMappingURL=main.js.map