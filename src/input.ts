import { Direction } from "./types.js";

export type InputCallback = (dir: Direction) => void;
export type ActionCallback = () => void;

export class Input {
  private onDirection: InputCallback;
  private onEnter: ActionCallback;

  private static readonly DIR_MAP: Record<string, Direction> = {
    up: Direction.Up,
    right: Direction.Right,
    down: Direction.Down,
    left: Direction.Left,
  };

  constructor(onDirection: InputCallback, onEnter: ActionCallback) {
    this.onDirection = onDirection;
    this.onEnter = onEnter;

    window.addEventListener("keydown", this.handleKey);

    // Touch controls
    document.querySelectorAll<HTMLButtonElement>(".ctrl-btn").forEach((btn) => {
      let lastTouchTime = 0;

      btn.addEventListener("touchstart", (e: TouchEvent) => {
        e.preventDefault();
        lastTouchTime = Date.now();
        const dir = Input.DIR_MAP[btn.dataset.dir ?? ""];
        if (dir !== undefined) {
          this.onDirection(dir);
        }
      }, { passive: false });

      btn.addEventListener("click", () => {
        // Skip if touchstart already fired recently (prevents double-fire)
        if (Date.now() - lastTouchTime < 300) return;
        const dir = Input.DIR_MAP[btn.dataset.dir ?? ""];
        if (dir !== undefined) {
          this.onDirection(dir);
        }
      });
    });
  }

  private handleKey = (e: KeyboardEvent): void => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        this.onDirection(Direction.Up);
        break;
      case "ArrowRight":
        e.preventDefault();
        this.onDirection(Direction.Right);
        break;
      case "ArrowDown":
        e.preventDefault();
        this.onDirection(Direction.Down);
        break;
      case "ArrowLeft":
        e.preventDefault();
        this.onDirection(Direction.Left);
        break;
      case "Enter":
        e.preventDefault();
        this.onEnter();
        break;
    }
  };

  destroy(): void {
    window.removeEventListener("keydown", this.handleKey);
  }
}
