export var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Right"] = 1] = "Right";
    Direction[Direction["Down"] = 2] = "Down";
    Direction[Direction["Left"] = 3] = "Left";
})(Direction || (Direction = {}));
export var GameState;
(function (GameState) {
    GameState[GameState["ThemeSelect"] = 0] = "ThemeSelect";
    GameState[GameState["Start"] = 1] = "Start";
    GameState[GameState["Playing"] = 2] = "Playing";
    GameState[GameState["GameOver"] = 3] = "GameOver";
})(GameState || (GameState = {}));
export const THEMES = [
    { name: "CLASSIC", dark: "#43523D", light: "#C7D9A4" },
    { name: "PINK", dark: "#FF1493", light: "#FFE4E1" },
    { name: "GOLD", dark: "#DAA520", light: "#E0E8F8" },
    { name: "FANCY", dark: "#FF6B6B", light: "#4ECDC4", fancy: true },
];
//# sourceMappingURL=types.js.map