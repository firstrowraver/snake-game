import { Direction } from "./types.js";

export type InputCallback = (dir: Direction) => void;
export type ActionCallback = () => void;

export class Input {
  private onDirection: InputCallback;
  private onEnter: ActionCallback;

  constructor(onDirection: InputCallback, onEnter: ActionCallback) {
    this.onDirection = onDirection;
    this.onEnter = onEnter;

    window.addEventListener("keydown", this.handleKey);
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
