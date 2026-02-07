import { Direction } from "./types.js";
export class Input {
    constructor(onDirection, onEnter) {
        this.handleKey = (e) => {
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
        this.onDirection = onDirection;
        this.onEnter = onEnter;
        window.addEventListener("keydown", this.handleKey);
        // Touch controls
        const dirMap = { up: Direction.Up, right: Direction.Right, down: Direction.Down, left: Direction.Left };
        document.querySelectorAll(".ctrl-btn").forEach((btn) => {
            btn.addEventListener("touchstart", (e) => {
                e.preventDefault();
                const dir = dirMap[btn.dataset.dir];
                if (dir !== undefined) {
                    this.onDirection(dir);
                }
            }, { passive: false });
        });
    }
    destroy() {
        window.removeEventListener("keydown", this.handleKey);
    }
}
//# sourceMappingURL=input.js.map