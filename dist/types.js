export var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Right"] = 1] = "Right";
    Direction[Direction["Down"] = 2] = "Down";
    Direction[Direction["Left"] = 3] = "Left";
})(Direction || (Direction = {}));
export var GameState;
(function (GameState) {
    GameState[GameState["Start"] = 0] = "Start";
    GameState[GameState["Playing"] = 1] = "Playing";
    GameState[GameState["GameOver"] = 2] = "GameOver";
})(GameState || (GameState = {}));
//# sourceMappingURL=types.js.map